
import os
import subprocess
import glob

# 1. Reset and push code only
subprocess.run(['git', 'reset', 'origin/main'])
subprocess.run(['git', 'add', 'site.js', 'site.css', 'data/products.json'] + glob.glob('*.html'))
subprocess.run(['git', 'commit', '-m', 'Update core logic and styles'])
subprocess.run(['git', 'push'])

# 2. Find all untracked images
images = glob.glob('assets/products/*')
batch_size = 20

for i in range(0, len(images), batch_size):
    batch = images[i:i+batch_size]
    for img in batch:
        subprocess.run(['git', 'add', img])
    
    subprocess.run(['git', 'commit', '-m', f'Add product images batch {i//batch_size + 1}'])
    res = subprocess.run(['git', 'push'])
    if res.returncode != 0:
        print(f'Failed to push batch {i//batch_size + 1}')
        break
    else:
        print(f'Successfully pushed batch {i//batch_size + 1}')

print('Done')

