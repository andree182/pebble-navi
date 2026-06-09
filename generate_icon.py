from PIL import Image, ImageDraw
import math

SIZE = 25
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

cx, cy = SIZE // 2, SIZE // 2
bg = (0, 0, 0, 0)
fg = (0, 0, 0, 255)

# Center circle radius
cr = 4
draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=fg)

# Triangle directions: (angle_degrees, length, width_at_base)
# Cardinal (12, 3, 6, 9): bigger
# Diagonal: smaller
triangles = [
    (90,  12, 2),   # 12 o'clock - big
    (45,  8,  1),   # 1:30 - small
    (0,   12, 2),   # 3 o'clock - big
    (315, 8,  1),   # 4:30 - small
    (270, 12, 2),   # 6 o'clock - big
    (225, 8,  1),   # 7:30 - small
    (180, 12, 2),   # 9 o'clock - big
    (135, 8,  1),   # 10:30 - small
]

for angle_deg, length, half_width in triangles:
    angle = math.radians(angle_deg)
    # Tip of triangle (radiating outward)
    tip_x = cx + math.cos(angle) * (cr + length)
    tip_y = cy - math.sin(angle) * (cr + length)
    # Perpendicular direction for base points
    perp = angle + math.pi / 2
    # Base is at radius cr from center
    base_cx = cx + math.cos(angle) * cr
    base_cy = cy - math.sin(angle) * cr
    b1_x = base_cx + math.cos(perp) * half_width
    b1_y = base_cy - math.sin(perp) * half_width
    b2_x = base_cx - math.cos(perp) * half_width
    b2_y = base_cy + math.sin(perp) * half_width
    draw.polygon([tip_x, tip_y, b1_x, b1_y, b2_x, b2_y], fill=fg)

img.save("resources/images/appicon.png")
print("Icon generated: resources/images/appicon.png")
