import os
import shutil
import json

src_dir = r"assets/needs/Commercial Pictures - Categories"
dest_dir = r"assets/products"
json_path = "data/products.json"

with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# Build a map of filename (without extension) -> path in src_dir for .png files
png_map = {}
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.lower().endswith('.png'):
            base_name = os.path.splitext(f)[0]
            png_map[base_name] = os.path.join(root, f)

def replace_with_png(img_path):
    # e.g. "assets/products/Polo Navy 3.jpg"
    base = os.path.basename(img_path)
    name_without_ext = os.path.splitext(base)[0]
    
    # Check if a PNG exists
    if name_without_ext in png_map:
        src_png = png_map[name_without_ext]
        dest_png = os.path.join(dest_dir, name_without_ext + ".png")
        
        # Copy to assets/products
        if not os.path.exists(dest_png):
            shutil.copy2(src_png, dest_png)
            print(f"Copied {src_png} to {dest_png}")
            
        return "assets/products/" + name_without_ext + ".png"
    return img_path

for p in products:
    if p.get('image'):
        p['image'] = replace_with_png(p['image'])
    
    if p.get('images'):
        new_images = []
        for img in p['images']:
            new_images.append(replace_with_png(img))
        p['images'] = new_images

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print("Finished updating all catalog images to PNGs!")
