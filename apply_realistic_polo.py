from PIL import Image
import os

src = "White Polo Shirt.png"
dst_jpg = "assets/products/Polo White Front.jpg"
dst_png = "assets/products/Polo White Front.png"
dst_webp = "assets/products/Polo White Front.webp"

with Image.open(src) as img:
    # Resize to 597x800, keep transparency
    resized = img.resize((597, 800), Image.Resampling.LANCZOS)
    
    # Save as PNG
    resized.save(dst_png)
    
    # Save as JPG (composite over white background)
    white_bg = Image.new("RGB", resized.size, (255, 255, 255))
    if resized.mode == 'RGBA':
        white_bg.paste(resized, mask=resized.split()[3]) # 3 is the alpha channel
    else:
        white_bg.paste(resized)
    white_bg.save(dst_jpg)
    
    # Save as WEBP
    resized.save(dst_webp, format="WEBP")

print("Done resizing White Polo Shirt.png")
