import glob
from PIL import Image
import os

files = ['assets/needs/values1-20.png', 'assets/needs/values1-25.png']
out_names = ['partnership', 'sustainability']

for i, f in enumerate(files):
    img = Image.open(f).convert("RGBA")
    width, height = img.size
    
    card_bg = img.getpixel((width // 10, height // 2))
    if card_bg[0] > 240 and card_bg[1] > 240 and card_bg[2] > 240:
        card_bg = img.getpixel((width // 4, height // 2))
        
    min_y = int(height * 0.28)
    max_y = int(height * 0.62)
    min_x = int(width * 0.15)
    max_x = int(width * 0.85)
    
    icon_img = Image.new("RGBA", (width, height), (0,0,0,0))
    pixels = img.load()
    icon_p = icon_img.load()
    
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            p = pixels[x, y]
            diff = abs(p[0] - card_bg[0]) + abs(p[1] - card_bg[1]) + abs(p[2] - card_bg[2])
            if diff > 40:
                icon_p[x, y] = p
                
    bbox = icon_img.getbbox()
    if bbox:
        icon_img = icon_img.crop(bbox)
        out_path = f"assets/icon_{out_names[i]}.png"
        icon_img.save(out_path, "PNG")
        print(f"Extracted icon {out_names[i]} to {out_path} with size {icon_img.size}")
