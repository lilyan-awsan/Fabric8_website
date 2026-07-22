import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html']
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'favicon.png' not in content:
        content = re.sub(r'(<link rel="stylesheet" href="site\.css".*?>)', r'<link rel="icon" type="image/png" href="assets/favicon.png" />\n    \1', content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
print("Injected favicon into html files")
