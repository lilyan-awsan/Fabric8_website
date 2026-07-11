import subprocess
import json
import re

# Get the old site.js content
result = subprocess.run(['git', 'show', 'HEAD^:site.js'], capture_output=True, text=True, encoding='utf-8')
content = result.stdout

# Find the products array
start_idx = content.find('const products = [') + len('const products = ')
end_idx = content.find('].map(p => ({') + 1

array_str = content[start_idx:end_idx]

# This is a JS object array, not strictly JSON (missing quotes around keys).
# Let's fix the keys using regex
array_str = re.sub(r'(\w+):', r'"\1":', array_str)
# Handle single quotes if any
array_str = array_str.replace("'", '"')

products = json.loads(array_str)

# Apply the map logic
final_products = []
for p in products:
    p['fabric'] = "Premium Poly-Cotton Blend"
    p['gsm'] = "180-220 GSM"
    p['moq'] = "50 pieces"
    p['leadTime'] = "14-21 Business Days"
    p['care'] = "Machine wash cold, do not bleach."
    p['branding'] = "Embroidery, Screen Print, Heat Transfer"
    p['availability'] = "In Stock"
    p['image'] = p.get('image', "White Polo Shirt.png")
    p['colors'] = p.get('colors', ["Black", "White"])
    # We should add an id or something? The sku is a good unique ID.
    p['id'] = p['sku']
    final_products.append(p)

import os
if not os.path.exists('data'):
    os.makedirs('data')

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2)

print("Generated data/products.json successfully.")
