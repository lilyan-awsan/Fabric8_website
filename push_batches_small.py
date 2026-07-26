
import os
import subprocess
import glob

# Find all untracked or modified images in assets/products
status = subprocess.check_output(['git', 'status', '--porcelain']).decode('utf-8')
images = []
for line in status.splitlines():
    if line.endswith('.png') or line.endswith('.jpg'):
        # Extract filename (e.g. ' M assets/products/...' or '?? assets/products/...')
        file_path = line[3:]
        if file_path.startswith('assets/products/'):
            images.append(file_path)

if not images:
    print('No images to push!')
    exit(0)

print(f'Found {len(images)} images to push.')

batch_size = 2

for i in range(0, len(images), batch_size):
    batch = images[i:i+batch_size]
    for img in batch:
        # Need to handle paths with spaces carefully in subprocess
        subprocess.run(['git', 'add', img])
    
    subprocess.run(['git', 'commit', '-m', f'Add product images batch {i//batch_size + 1}'])
    print(f'Pushing batch {i//batch_size + 1}...')
    res = subprocess.run(['git', 'push'])
    if res.returncode != 0:
        print(f'Failed to push batch {i//batch_size + 1}')
        break
    else:
        print(f'Successfully pushed batch {i//batch_size + 1}')

print('Done')

