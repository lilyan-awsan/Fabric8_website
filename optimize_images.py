
import os
import glob
from PIL import Image

files = glob.glob('assets/products/*')
MAX_SIZE = (800, 800)

for f in files:
    if not (f.endswith('.png') or f.endswith('.jpg')):
        continue
    try:
        img = Image.open(f)
        # Check if resize is needed
        if img.width > MAX_SIZE[0] or img.height > MAX_SIZE[1]:
            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            
            if f.endswith('.png'):
                img.save(f, 'PNG', optimize=True)
            else:
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                img.save(f, 'JPEG', quality=80, optimize=True)
            print(f'Optimized {f}')
    except Exception as e:
        print(f'Error on {f}: {e}')

print('Optimization complete.')

