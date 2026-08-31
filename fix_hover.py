
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the JS event handlers for the now-deleted span
html = re.sub(r' onmouseover=\"this\.querySelector\(\'span\'\).*?\"', '', html)
html = re.sub(r' onmouseout=\"this\.querySelector\(\'span\'\).*?\"', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

