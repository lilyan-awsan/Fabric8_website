import os
import shutil
import re

src_dir = r"assets/needs/Commercial Pictures - Categories"
dest_dir = r"assets/products"

files_to_copy = [
    ("Polo Shirt/Polo White Front.jpg", "Polo White Front.jpg"),
    ("Hoodie/Hoodie White Front.jpg", "Hoodie White Front.jpg"),
    ("Chef Jacket/Chef jacket white.jpg", "Chef jacket white.jpg"),
    ("Scrub/Scrub Navy.jpg", "Scrub Navy.jpg"),
    ("Cap/Cap Black.jpg", "Cap Black.jpg")
]

for src_rel, dest_rel in files_to_copy:
    src = os.path.join(src_dir, src_rel)
    dst = os.path.join(dest_dir, dest_rel)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {src_rel} directly without resizing")
    else:
        print(f"NOT FOUND: {src}")

# Increment cache buster to ?v=4 so they see the direct copies
for filename in ['branding-studio.html', 'site.js', 'product-customizer.js']:
    filepath = os.path.join(r"c:\Users\lilya\Downloads\Compressed\Fabric8_websitee\Fabric8_website", filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(r'(\?v=)[0-9]+', r'\g<1>4', content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cache busted {filename} to v=4")
