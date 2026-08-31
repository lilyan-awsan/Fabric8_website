import os
import re

directory = r"c:\Users\lilya\Downloads\Compressed\Fabric8_websitee\Fabric8_website"

# We want to replace the style attribute of the search input in all HTML files.
# The search input looks like: <input type="search" placeholder="Search..." style="...">
# We can match <input type="search" [^>]*style="([^"]*)"
# And replace the style contents.

new_style = "min-height: 36px; width: 140px; padding: 4px 0; font-size: 13px; font-weight: 300; border: none; border-bottom: 1px solid var(--ink); border-radius: 0; background: transparent; outline: none; color: var(--ink);"

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Regex to find the search input and its style attribute
        # We need to handle potential newlines inside the tag, but usually they are on one line.
        def replace_style(match):
            prefix = match.group(1)
            return f'{prefix}style="{new_style}"'
            
        new_content = re.sub(r'(<input[^>]*type="search"[^>]*?)style="[^"]*"', replace_style, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
