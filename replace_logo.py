import glob

old_logo = '<h2 style="margin: 0; font-size: 22px; font-weight: 900;">Fabric 8</h2>'
new_logo = '<img src="assets/fabric8_logo_white.png" alt="Fabric8 Logo" style="height: 36px; filter: invert(1);" />'

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_logo in content:
        content = content.replace(old_logo, new_logo)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
