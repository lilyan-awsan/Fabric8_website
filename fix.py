
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace wrapper to be fixed size
html = html.replace('<div style=\"position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;\"', 
                    '<div style=\"width: 220px; height: 120px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;\"')

# Replace image styles
html = re.sub(r'style=\"height: \d+px; object-fit: contain; transition: transform 0.3s ease;\"', 
              'style=\"width: 100%; height: 100%; max-height: 90px; object-fit: contain; transition: transform 0.3s ease;\"', html)

# Remove the text tooltips since the logos now have text in them!
html = re.sub(r'<span style=\"position: absolute; bottom: -40px;.*?</span>\n\s*', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

