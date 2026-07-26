
import os
import shutil
import json

side_dir = r'assets/needs/Picture from the SIDE'
back_dir = r'assets/needs/Pictures from the BACK'
prod_dir = r'assets/products'

mapping = {
    'cargo beige trousers': 'F8-008',
    'cargo vest': 'F8-003',
    'chef bandana': 'F8-006',
    'chef jacket': 'F8-011',
    'dri fit polo': 'F8-021',
    'dri fit tshirt': 'F8-020',
    'full apron': 'F8-014',
    'half apron': 'F8-016',
    'zip up': 'F8-024',
    'hoodie': 'F8-023',
    'lab coat': 'F8-007',
    'oversize tshirt': 'F8-019',
    'puff jacket': 'F8-025',
    'scrub': 'F8-012',
    't-shirt': 'F8-018',
    'polo': 'F8-001',
    'trousers': 'F8-009',
    'vest': 'F8-002',
    'shirt': 'F8-022',
    'cap': 'F8-010'
}

# Load JSON
with open('data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for source_dir in [side_dir, back_dir]:
    if not os.path.exists(source_dir):
        continue
    for filename in os.listdir(source_dir):
        if not (filename.endswith('.jpg') or filename.endswith('.png')):
            continue
            
        source_path = os.path.join(source_dir, filename)
        dest_path = os.path.join(prod_dir, filename)
        
        # Copy file to assets/products
        shutil.copy2(source_path, dest_path)
        
        rel_path = 'assets/products/' + filename
        
        # Find SKU
        matched_sku = None
        lower_name = filename.lower()
        for key, sku in mapping.items():
            if key in lower_name:
                matched_sku = sku
                break
                
        if matched_sku:
            for p in products:
                if p['sku'] == matched_sku:
                    if 'images' not in p:
                        p['images'] = []
                    if rel_path not in p['images']:
                        p['images'].append(rel_path)
                    break

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print('Done processing images')

