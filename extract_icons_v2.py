import glob
from PIL import Image
import os

files = sorted(glob.glob('assets/needs/values1-*.png'))
out_names = ['partnership', 'precision', 'transparency', 'reliability', 'quality', 'sustainability']

for i, f in enumerate(files):
    if i >= len(out_names): break
    
    img = Image.open(f).convert("RGBA")
    width, height = img.size
    
    # 1. Get the card's background color
    card_bg = img.getpixel((width // 10, height // 2))
    if card_bg[0] > 240 and card_bg[1] > 240 and card_bg[2] > 240:
        card_bg = img.getpixel((width // 4, height // 2))
        
    print(f"Card {out_names[i]} bg color: {card_bg}")
    
    # 2. Extract the icon from the middle section
    # The text is at the top (0-30%) and bottom (65-100%)
    # So the icon is safely between 30% and 65%
    min_y = int(height * 0.28)
    max_y = int(height * 0.62)
    min_x = int(width * 0.15)
    max_x = int(width * 0.85)
    
    icon_img = Image.new("RGBA", (width, height), (0,0,0,0))
    pixels = img.load()
    icon_p = icon_img.load()
    
    # Let's extract any pixel that is substantially different from the background
    # and turn the background into transparency, keeping the foreground pixel color!
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            p = pixels[x, y]
            diff = abs(p[0] - card_bg[0]) + abs(p[1] - card_bg[1]) + abs(p[2] - card_bg[2])
            if diff > 60:
                # Keep the pixel, but apply some transparency blending based on difference
                # Actually, simplest is just to keep the pixel exactly as is, if it's different enough
                icon_p[x, y] = p
                
    # Crop to bounding box
    bbox = icon_img.getbbox()
    if bbox:
        icon_img = icon_img.crop(bbox)
        # Because we want these icons to be perfectly sharp and use CSS to color them (or just keep their native white/black),
        # Wait, the native white/black might have hard edges. That's okay for now.
        out_path = f"assets/icon_{out_names[i]}.png"
        icon_img.save(out_path, "PNG")
        print(f"Extracted icon {out_names[i]} to {out_path} with size {icon_img.size}")
    else:
        print(f"Could not find icon in {out_names[i]}")
