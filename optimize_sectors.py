import os
from PIL import Image

assets_dir = 'assets/sector-logos'
for filename in os.listdir(assets_dir):
    if filename.lower().endswith('.png'):
        png_path = os.path.join(assets_dir, filename)
        webp_filename = os.path.splitext(filename)[0] + '.webp'
        webp_path = os.path.join(assets_dir, webp_filename)
        
        try:
            with Image.open(png_path) as img:
                img.save(webp_path, 'WEBP', quality=75)
            os.remove(png_path)
        except Exception as e:
            print(f"Error converting {filename}: {e}")

import re
for filename in os.listdir('.'):
    if filename.endswith(('.html', '.css', '.js')):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace assets/*.png with assets/*.webp
        new_content = re.sub(r'assets/([a-zA-Z0-9_-]+)\.png', r'assets/\1.webp', content)
        new_content = re.sub(r'assets/sector-logos/([a-zA-Z0-9_-]+)\.png', r'assets/sector-logos/\1.webp', new_content)
        
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
