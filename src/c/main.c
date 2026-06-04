#include <pebble.h>

#define CHUNK_SIZE            8000
#define MAX_BITMAP_DATA_SIZE  50000

#define DEBUG_PNG

static Window* s_main_window;
static Layer* s_map_layer;
static TextLayer* s_route_summary_layer;
static TextLayer* s_next_step_layer;

static uint8_t s_bitmap_data[MAX_BITMAP_DATA_SIZE];
static GBitmap* s_bitmap;
static int s_chunks_received = 0;

#if defined(PBL_PLATFORM_EMERY)
#define SCREEN_W 200
#define SCREEN_H 228
#elif defined(PBL_PLATFORM_CHALK)
#define SCREEN_W 180
#define SCREEN_H 180
#else
#define SCREEN_W 144
#define SCREEN_H 168
#endif

static int s_bitmap_width = SCREEN_W;
static int s_bitmap_height = SCREEN_H;
static int s_bitmap_data_size = SCREEN_W * SCREEN_H;
static uint16_t s_palette_rgb565[64];
static int s_palette_received = 0;

static void apply_palette(GBitmap* bmp)
{
    GColor8* pal = (GColor8*)malloc(64 * sizeof(GColor8));
    if (!pal) return;
    if (s_palette_received)
    {
        for (int i = 0; i < 64; i++)
        {
            uint16_t rgb = s_palette_rgb565[i];
            uint8_t r5 = (rgb >> 11) & 0x1f;
            uint8_t g6 = (rgb >> 5) & 0x3f;
            uint8_t b5 = rgb & 0x1f;
            uint8_t r2 = (r5 * 3 + 15) / 31;
            uint8_t g2 = (g6 * 3 + 31) / 63;
            uint8_t b2 = (b5 * 3 + 15) / 31;
            uint8_t avg = (r2 + g2 + b2) / 3;
            if (r2 > avg && r2 < 3) r2++;
            else if (r2 < avg && r2 > 0) r2--;
            if (g2 > avg && g2 < 3) g2++;
            else if (g2 < avg && g2 > 0) g2--;
            if (b2 > avg && b2 < 3) b2++;
            else if (b2 < avg && b2 > 0) b2--;
            pal[i].argb = 0xC0 | (r2 << 4) | (g2 << 2) | b2;
        }
    }
    else
    {
        for (int i = 0; i < 64; i++) pal[i].argb = 0xC0 | i;
    }
    gbitmap_set_palette(bmp, pal, true);
}

static void inbox_received(DictionaryIterator* iter, void* ctx)
{
    Tuple* palette = dict_find(iter, MESSAGE_KEY_IMAGE_PALETTE);
    Tuple* idx = dict_find(iter, MESSAGE_KEY_IMAGE_CHUNK_INDEX);
    Tuple* total = dict_find(iter, MESSAGE_KEY_IMAGE_CHUNKS_TOTAL);
    Tuple* data = dict_find(iter, MESSAGE_KEY_IMAGE_CHUNK_DATA);

    if (palette)
    {
        s_chunks_received = 0;
        if (palette->length == 128)
        {
            s_palette_received = 1;
            for (int i = 0; i < 64; i++)
            {
                s_palette_rgb565[i] = palette->value->data[i * 2] | (palette->value->data[i * 2 + 1] << 8);
            }
            APP_LOG(APP_LOG_LEVEL_INFO, "Palette stored (%d bytes)", palette->length);
        }
        else
        {
            APP_LOG(APP_LOG_LEVEL_INFO, "Palette msg ignored (wrong size %d)", palette->length);
        }
        return;
    }

    if (idx && total && data)
    {
        if (idx->value->uint32 == 0)
        {
            s_chunks_received = 0;
#ifdef DEBUG_PNG
            APP_LOG(APP_LOG_LEVEL_INFO, "Bitmap transfer starting, total=%lu", total->value->uint32);
#endif
        }
        int chunk_index = idx->value->uint32;
#ifdef DEBUG_PNG
        APP_LOG(APP_LOG_LEVEL_INFO, "Chunk %d/%lu (%d bytes)", chunk_index, total->value->uint32, data->length);
#endif

        memcpy(&s_bitmap_data[chunk_index * CHUNK_SIZE],
               data->value->data, data->length);
        s_chunks_received++;

        if (s_chunks_received >= (int)total->value->uint32)
        {
#ifdef DEBUG_PNG
            APP_LOG(APP_LOG_LEVEL_INFO, "All %d chunks received, updating bitmap", s_chunks_received);
#endif

            if (!s_bitmap)
            {
                s_bitmap = gbitmap_create_blank(GSize(s_bitmap_width, s_bitmap_height), GBitmapFormat8Bit);
                if (!s_bitmap)
                {
                    APP_LOG(APP_LOG_LEVEL_ERROR, "Failed to create GBitmap!");
                    return;
                }
            }
            uint8_t* raw = gbitmap_get_data(s_bitmap);
            if (raw)
            {
                memcpy(raw, s_bitmap_data, s_bitmap_data_size);
#ifdef DEBUG_PNG
                APP_LOG(APP_LOG_LEVEL_INFO, "Bitmap data copied (%d bytes)", s_bitmap_data_size);
#endif
            }
            apply_palette(s_bitmap);
            layer_mark_dirty(s_map_layer);
#ifdef DEBUG_PNG
            APP_LOG(APP_LOG_LEVEL_INFO, "Layer marked dirty");
#endif
        }
        return;
    }

    Tuple* dist = dict_find(iter, MESSAGE_KEY_ROUTE_DISTANCE);
    Tuple* dur = dict_find(iter, MESSAGE_KEY_ROUTE_DURATION);
    if (dist && dur)
    {
        static char summary[32];
        int d = dist->value->int32;
        int m = dur->value->int32;
        if (d >= 1000)
        {
            snprintf(summary, sizeof(summary), "%.1f km  %d min", d / 1000.0, m);
        }
        else
        {
            snprintf(summary, sizeof(summary), "%d m  %d min", d, m);
        }
        text_layer_set_text(s_route_summary_layer, summary);
    }

    Tuple* ns_type = dict_find(iter, MESSAGE_KEY_NEXT_STEP_TYPE);
    Tuple* ns_mod = dict_find(iter, MESSAGE_KEY_NEXT_STEP_MODIFIER);
    Tuple* ns_name = dict_find(iter, MESSAGE_KEY_NEXT_STEP_NAME);
    Tuple* ns_dist = dict_find(iter, MESSAGE_KEY_NEXT_STEP_DISTANCE);
    if (ns_type)
    {
        static char next_step[64];
        const char* mod = ns_mod ? ns_mod->value->cstring : "";
        const char* name = ns_name ? ns_name->value->cstring : "";
        int nd = ns_dist ? ns_dist->value->int32 : 0;
        if (nd > 0)
        {
            snprintf(next_step, sizeof(next_step), "%s %s (%d m)", mod, name, nd);
        }
        else
        {
            text_layer_set_text(s_next_step_layer, "");
        }
        text_layer_set_text(s_next_step_layer, next_step);
    }
}

static void inbox_dropped(AppMessageResult reason, void* ctx)
{
    APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped! reason=%d", reason);
}

static void outbox_failed(DictionaryIterator* iterator, AppMessageResult reason, void* context)
{
    APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent(DictionaryIterator* iterator, void* context)
{
    APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

static void send_zoom_dir(int dir)
{
    DictionaryIterator* iter;
    AppMessageResult result = app_message_outbox_begin(&iter);
    if (result != APP_MSG_OK) return;
    dict_write_uint8(iter, MESSAGE_KEY_ZOOM_DIR, dir);
    app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void* context)
{
    DictionaryIterator* iter;
    AppMessageResult result = app_message_outbox_begin(&iter);
    if (result != APP_MSG_OK) return;
    dict_write_uint8(iter, MESSAGE_KEY_REQUEST_DESTINATIONS, 1);
    app_message_outbox_send();
}

static void up_click_handler(ClickRecognizerRef recognizer, void* context)
{
    send_zoom_dir(1);
}

static void down_click_handler(ClickRecognizerRef recognizer, void* context)
{
    send_zoom_dir(0);
}

static void click_config_provider(void* context)
{
    window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
    window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
    window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void map_update_proc(Layer* layer, GContext* ctx)
{
    if (s_bitmap)
    {
        graphics_draw_bitmap_in_rect(ctx, s_bitmap, layer_get_bounds(layer));
    }
}

static void main_window_load(Window* window)
{
    Layer* window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);

    s_bitmap_width = bounds.size.w;
    s_bitmap_height = bounds.size.h;
    s_bitmap_data_size = s_bitmap_width * s_bitmap_height;

    s_map_layer = layer_create(bounds);
    layer_set_update_proc(s_map_layer, map_update_proc);
    layer_add_child(window_layer, s_map_layer);

    s_route_summary_layer = text_layer_create(GRect(0, bounds.size.h - 36, bounds.size.w, 18));
    text_layer_set_background_color(s_route_summary_layer, GColorBlack);
    text_layer_set_text_color(s_route_summary_layer, GColorWhite);
    text_layer_set_font(s_route_summary_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
    text_layer_set_text_alignment(s_route_summary_layer, GTextAlignmentCenter);
    layer_add_child(window_layer, text_layer_get_layer(s_route_summary_layer));

    s_next_step_layer = text_layer_create(GRect(0, bounds.size.h - 18, bounds.size.w, 18));
    text_layer_set_background_color(s_next_step_layer, GColorBlack);
    text_layer_set_text_color(s_next_step_layer, GColorWhite);
    text_layer_set_font(s_next_step_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));
    text_layer_set_text_alignment(s_next_step_layer, GTextAlignmentCenter);
    layer_add_child(window_layer, text_layer_get_layer(s_next_step_layer));

    window_set_click_config_provider(window, click_config_provider);
}

static void main_window_unload(Window* window)
{
    if (s_bitmap) gbitmap_destroy(s_bitmap);
    layer_destroy(s_map_layer);
    text_layer_destroy(s_route_summary_layer);
    text_layer_destroy(s_next_step_layer);
}

static void init()
{
    s_main_window = window_create();
    APP_LOG(APP_LOG_LEVEL_INFO, "Windows Created");


    window_set_background_color(s_main_window, GColorBlack);
    window_set_window_handlers(s_main_window, (WindowHandlers)
    {
        .load = main_window_load,
        .unload = main_window_unload,
    });
    window_stack_push(s_main_window, true);

    app_message_register_inbox_received(inbox_received);
    app_message_register_inbox_dropped(inbox_dropped);
    app_message_register_outbox_failed(outbox_failed);
    app_message_register_outbox_sent(outbox_sent);

    app_message_open(8192, 2048);
}

static void deinit()
{
    window_destroy(s_main_window);
}

int main(void)
{
    init();
    app_event_loop();
    deinit();
}
