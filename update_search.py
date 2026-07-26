import os
import glob

old_string = '<input type="search" placeholder="Search..." style="min-height: 36px; width: 140px; padding: 4px 12px; font-size: 12px; border-radius: 20px; border: 1px solid var(--line);" />'
new_string = '<input type="search" placeholder="Search..." style="min-height: 36px; width: 140px; padding: 4px 16px; font-size: 13px; font-weight: 300; border-radius: 20px; border: 2px solid var(--ink); background: transparent; outline: none; color: var(--ink);" />'

count = 0
for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_string in content:
        content = content.replace(old_string, new_string)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'Updated {filepath}')

print(f'Total files updated: {count}')
