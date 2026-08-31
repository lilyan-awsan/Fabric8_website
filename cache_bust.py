import os
import re

for filename in ['branding-studio.html', 'site.js', 'product-customizer.js', 'product.html']:
    filepath = os.path.join(r"c:\Users\lilya\Downloads\Compressed\Fabric8_websitee\Fabric8_website", filename)
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # add ?v=2 to cache bust
    new_content = re.sub(r'(assets/products/[^"\']+\.(?:jpg|png|webp))(?!\?v=)', r'\1?v=2', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
