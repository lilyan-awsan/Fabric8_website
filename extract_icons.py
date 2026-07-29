import glob
from PIL import Image
import os

files = sorted(glob.glob('assets/needs/values1-*.png'))
out_names = ['partnership', 'precision', 'transparency', 'reliability', 'quality', 'sustainability']

for i, f in enumerate(files):
    if i >= len(out_names): break
    
    img = Image.open(f).convert("RGBA")
    width, height = img.size
    
    # 1. First, let's find the card's background color.
    # The image might have a white border. Let's sample the center-left pixel to get the card color.
    card_bg = img.getpixel((width // 10, height // 2))
    if card_bg[0] > 240 and card_bg[1] > 240 and card_bg[2] > 240:
        # If it's still white, sample further in
        card_bg = img.getpixel((width // 4, height // 2))
        
    print(f"Card {out_names[i]} bg color: {card_bg}")
    
    # 2. Extract the icon from the middle third vertically
    # Let's say y from 25% to 65%
    min_y = int(height * 0.20)
    max_y = int(height * 0.70)
    min_x = int(width * 0.15)
    max_x = int(width * 0.85)
    
    # Isolate dark pixels in this region
    icon_pixels = []
    
    # Let's create a new transparent image of the same size
    icon_img = Image.new("RGBA", (width, height), (0,0,0,0))
    pixels = img.load()
    icon_p = icon_img.load()
    
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            p = pixels[x, y]
            # Check if pixel is dark (different from card_bg)
            # A simple way: if it's much darker than the background
            if (card_bg[0] - p[0]) > 40 or (card_bg[1] - p[1]) > 40 or (card_bg[2] - p[2]) > 40:
                # It's part of the icon. 
                # Let's make it dark grey/black
                # Or better, just keep the original pixel but remove the background by blending
                # Actually, the icons in the user image are #222222 or similar. Let's just output #222222 with alpha based on darkness
                # Luminance of pixel
                lum = (p[0]*0.3 + p[1]*0.59 + p[2]*0.11)
                bg_lum = (card_bg[0]*0.3 + card_bg[1]*0.59 + card_bg[2]*0.11)
                
                if lum < bg_lum - 20:
                    # Calculate alpha: darker = more opaque
                    alpha = int(255 * (1 - (lum / bg_lum)))
                    icon_p[x, y] = (30, 30, 30, alpha)

    # Crop to bounding box of the non-transparent pixels
    bbox = icon_img.getbbox()
    if bbox:
        icon_img = icon_img.crop(bbox)
        out_path = f"assets/icon_{out_names[i]}.png"
        icon_img.save(out_path, "PNG")
        print(f"Extracted icon {out_names[i]} to {out_path} with size {icon_img.size}")
    else:
        print(f"Could not find icon in {out_names[i]}")
