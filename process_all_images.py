
import os
import shutil
import json

base_dir = r'assets/needs/Commercial Pictures - Categories'
prod_dir = r'assets/products'

mapping = {
    'Beret Chef hat': 'F8-005',
    'CAPS': 'F8-010',
    'Cargo Pants': 'F8-008',
    'Cargo Vest': 'F8-003',
    'Chef Bandana': 'F8-006',
    'Chef Hat': 'F8-004',
    'Chef Jacket': 'F8-011',
    'Chef pants': 'F8-013',
    'Dri Fit Polo': 'F8-021',
    'Dri Fit T-Shirt': 'F8-020',
    'Full Apron': 'F8-014',
    'Full Apron W Pocket': 'F8-015',
    'Half Apron': 'F8-016',
    'Half Apron W Pocket': 'F8-017',
    'Hoodie': 'F8-023',
    'Labcoat': 'F8-007',
    'Oversized Shirt': 'F8-019',
    'Polo Shirt': 'F8-001',
    'Puffer Jacket': 'F8-025',
    'Scrubs': 'F8-012',
    'Shirts': 'F8-022',
    'T-Shirt': 'F8-018',
    'Waiter Vest': 'F8-002',
    'Workwear Trousers': 'F8-009',
    'Zip up Hoodie': 'F8-024'
}

with open('data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for folder, sku in mapping.items():
    folder_path = os.path.join(base_dir, folder)
    if not os.path.exists(folder_path):
        continue
        
    for filename in os.listdir(folder_path):
        if not (filename.lower().endswith('.jpg') or filename.lower().endswith('.png')):
            continue
            
        source_path = os.path.join(folder_path, filename)
        dest_path = os.path.join(prod_dir, filename)
        
        # Move image to assets/products
        if not os.path.exists(dest_path):
            shutil.copy2(source_path, dest_path)
            
        rel_path = 'assets/products/' + filename
        
        # Update JSON
        for p in products:
            if p['sku'] == sku:
                if 'images' not in p:
                    p['images'] = []
                if rel_path not in p['images']:
                    p['images'].append(rel_path)
                    
                # If main image is placeholder, replace it
                if p.get('image', '').endswith('White Polo Shirt.png') or p.get('image') == '':
                    p['image'] = rel_path
                break

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print('Successfully processed all categories!')

