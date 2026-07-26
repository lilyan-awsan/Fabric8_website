
import os
import glob
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
files = glob.glob('assets/products/*')
MAX_SIZE = (800, 800)

for f in files:
    if not (f.endswith('.png') or f.endswith('.jpg')):
        continue
    try:
        size_before = os.path.getsize(f)
        if size_before < 500 * 1024:
            continue
        
        img = Image.open(f)
        if img.width > MAX_SIZE[0] or img.height > MAX_SIZE[1]:
            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            
            if f.endswith('.png'):
                img.save(f, 'PNG', optimize=True)
            else:
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                img.save(f, 'JPEG', quality=80, optimize=True)
            print(f'Optimized {f} ({size_before//1024}KB -> {os.path.getsize(f)//1024}KB)')
    except Exception as e:
        print(f'Error on {f}: {e}')

print('Optimization complete.')

