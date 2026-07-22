import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = re.sub(r'<h2 style="color: #fff; margin: 0; font-size: 22px; font-weight: 900;">', r'<h2 style="margin: 0; font-size: 22px; font-weight: 900;">', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print("Updated logo text color in html files")
