import os
html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'href="shop.html#quote"' in content:
        content = content.replace('href="shop.html#quote"', 'href="checkout.html"')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
print('Updated cart links to checkout.html')
