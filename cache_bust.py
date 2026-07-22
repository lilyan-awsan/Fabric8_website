import glob
for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'href="assets/favicon.png"' in content:
        content = content.replace('href="assets/favicon.png"', 'href="assets/favicon.png?v=2"')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
