import os
html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'assets/favicon.png?v=2' in content:
        content = content.replace('assets/favicon.png?v=2', 'assets/favicon2.png?v=3')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
print('Updated favicons')
