import os
import shutil
import json
import re

src_dir = r"assets/needs/Commercial Pictures - Categories"
dest_dir = r"assets/products"

# The user explicitly wants the PNG files
files_to_copy = [
    ("Polo Shirt/Polo White Front.png", "Polo White Front.png"),
    ("Hoodie/Hoodie White Front.png", "Hoodie White Front.png"),
    ("Chef Jacket/Chef jacket white.png", "Chef jacket white.png"),
    ("Scrubs/Scrub Navy.png", "Scrub Navy.png"),
    ("CAPS/Cap Black.png", "Cap Black.png")
]

for src_rel, dest_rel in files_to_copy:
    src = os.path.join(src_dir, src_rel)
    dst = os.path.join(dest_dir, dest_rel)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {src_rel} to {dst}")
    else:
        print(f"NOT FOUND: {src}")

# Now we need to update products.json to replace .jpg with .png for these 5 images
json_path = "data/products.json"
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    if p.get('image'):
        for _, dest_name in files_to_copy:
            if p['image'].endswith(dest_name.replace('.png', '.jpg')):
                p['image'] = p['image'].replace('.jpg', '.png')
    
    if p.get('images'):
        new_images = []
        for img in p['images']:
            new_img = img
            for _, dest_name in files_to_copy:
                if img.endswith(dest_name.replace('.png', '.jpg')):
                    new_img = img.replace('.jpg', '.png')
            new_images.append(new_img)
        p['images'] = new_images

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)
print("Updated products.json")

# Update cache buster in JS/HTML
for filename in ['branding-studio.html', 'site.js', 'product-customizer.js', 'data/products.json']:
    filepath = os.path.join(r"c:\Users\lilya\Downloads\Compressed\Fabric8_websitee\Fabric8_website", filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if filename != 'data/products.json':
        new_content = re.sub(r'(\?v=)[0-9]+', r'\g<1>5', content)
    else:
        new_content = content
        
    # Also explicitly replace the .jpg references in JS files
    new_content = new_content.replace('Polo White Front.jpg', 'Polo White Front.png')
    new_content = new_content.replace('Hoodie White Front.jpg', 'Hoodie White Front.png')
    new_content = new_content.replace('Chef jacket white.jpg', 'Chef jacket white.png')
    new_content = new_content.replace('Scrub Navy.jpg', 'Scrub Navy.png')
    new_content = new_content.replace('Cap Black.jpg', 'Cap Black.png')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
