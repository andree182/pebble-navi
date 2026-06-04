# Implementation Plan

## Goal: Menu system with destination selection and save location
- Add log statements to strategic places that can be disabled like the debug_png switches
  - We must be able to debug the app using the statements

### 1. Move the png code to a new file
- Move the png display code in the main.c into a naviagtion.c file

### 2. Add + and - zoom icons to the map view
- Draw black "+" text near the up-button area (top-right) on the map layer
- Draw black "-" text near the down-button area (bottom-right) on the map layer

### 3. Add new Pebble message keys
Add `SAVE_CURRENT_LOCATION` and `DEST_NAMES_TOTAL` to `package.json` messageKeys

### 4. Implement menu state machine in `main.c`
- Three modes: `MODE_MAP`, `MODE_MAIN_MENU`, `MODE_DEST_LIST`
- Main menu has 2 items: "Select Destination" and "Save Location"
- Up/down buttons navigate menu; select button confirms
- Back button closes menu / goes to previous menu level

### 5. Implement menu overlay rendering in `main.c`
- Create `s_menu_layer` (a Layer) on top of the map
- Draw a black background with white text items
- Highlight the selected item with inverted colors (white fill, black text)

### 6. Handle destination name protocol in `main.c`
- When "Select Destination" is picked: send `REQUEST_DESTINATIONS` to JS
- JS sends `DEST_NAMES_TOTAL` first, then each name via `SELECTED_DEST_INDEX` + `NEXT_STEP_NAME`
- C collects names into a static array; when all received, show destination list menu
- When user picks a destination: send `SELECTED_DEST_INDEX` to JS, return to map view

### 7. Handle "Save Location" in `main.c`
- Send `SAVE_CURRENT_LOCATION` message to JS
- Return to map view

### 8. Update JS side (`index.ts`)
- Handle `SAVE_CURRENT_LOCATION`: save current pipeline position as "Saved Location"
  - Overwrite existing "Saved Location" entry in destinations, or add a new one
- Add `DEST_NAMES_TOTAL` to `sendDestinationsToWatch()` so C knows list size
