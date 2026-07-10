import os
from PIL import Image

assets_dir = 'assets'
for filename in os.listdir(assets_dir):
    if filename.lower().endswith('.png'):
        png_path = os.path.join(assets_dir, filename)
        webp_filename = os.path.splitext(filename)[0] + '.webp'
        webp_path = os.path.join(assets_dir, webp_filename)
        
        try:
            with Image.open(png_path) as img:
                # Convert to RGB if necessary (WEBP supports RGBA, so it's usually fine)
                img.save(webp_path, 'WEBP', quality=75)
                original_size = os.path.getsize(png_path)
                new_size = os.path.getsize(webp_path)
                print(f"Converted {filename}: {original_size/1024:.1f} KB -> {new_size/1024:.1f} KB")
            
            # Remove original PNG
            os.remove(png_path)
        except Exception as e:
            print(f"Error converting {filename}: {e}")
