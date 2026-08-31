import os
from PIL import Image
from glob import glob

src_dir = r"assets/needs/Commercial Pictures - Categories"
dest_dir = r"assets/products"

for ext in ('**/*.jpg', '**/*.png', '**/*.webp'):
    for src_path in glob(os.path.join(src_dir, ext), recursive=True):
        if not os.path.isfile(src_path):
            continue
            
        filename = os.path.basename(src_path)
        dest_path = os.path.join(dest_dir, filename)
        
        if os.path.exists(dest_path):
            try:
                with Image.open(dest_path) as current_img:
                    target_size = current_img.size
                
                with Image.open(src_path) as new_img:
                    resized_img = new_img.resize(target_size, Image.Resampling.LANCZOS)
                    # Use original format of the destination or infer from extension
                    resized_img.save(dest_path)
                    print(f"Replaced {filename} with size {target_size}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
