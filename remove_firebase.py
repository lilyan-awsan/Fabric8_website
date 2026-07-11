import glob
import re

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all lines containing firebasejs
    new_lines = []
    for line in content.split('\n'):
        if 'firebasejs' not in line:
            new_lines.append(line)
            
    new_content = '\n'.join(new_lines)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Removed Firebase from {file}')

print('Done.')
