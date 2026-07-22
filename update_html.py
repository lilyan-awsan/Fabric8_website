import os
import re

dir_path = r"c:\Users\lilya\Downloads\Compressed\Fabric8_websitee\Fabric8_website"
index_path = os.path.join(dir_path, "index.html")

with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Extract blocks
topline_match = re.search(r'<div class="topline">.*?</div>', index_content, re.DOTALL)
header_match = re.search(r'<header class="header">.*?</header>', index_content, re.DOTALL)
footer_match = re.search(r'<footer.*?>.*?</footer>', index_content, re.DOTALL)

if topline_match and header_match and footer_match:
    topline_base = topline_match.group(0)
    header_raw = header_match.group(0)
    footer = footer_match.group(0)
    
    html_files = [f for f in os.listdir(dir_path) if f.endswith(".html") and f != "index.html"]
    
    for filename in html_files:
        filepath = os.path.join(dir_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Inject active class into header
        header = header_raw
        if filename in ["shop.html", "services.html", "sectors.html", "method.html", "about.html"]:
            header = header.replace(f'href="{filename}"', f'href="{filename}" class="active"')
        
        # Dynamic topline
        new_topline = topline_base
        if filename == "shop.html":
            new_topline = '<div class="topline"><a href="shop.html" style="color: var(--yellow, #ffd700);">BRING YOUR IDENTITY TO LIFE.</a></div>'
        elif filename == "services.html":
            new_topline = '<div class="topline"><a href="contact.html" style="color: var(--yellow, #ffd700);">DISCOVER HOW WE CAN HELP &gt;</a></div>'
        elif filename == "sectors.html":
            new_topline = '<div class="topline"><a href="sectors.html" style="color: var(--yellow, #ffd700);">EXPLORE OUR SECTOR CAPABILITIES</a></div>'
        elif filename == "method.html":
            new_topline = '<div class="topline"><a href="Fabric 8 _Leaflet.pdf" target="_blank" style="color: var(--yellow, #ffd700);">READ MORE ABOUT OUR 8 STEPS METHOD.</a></div>'
        elif filename == "about.html":
            new_topline = '<div class="topline"><a href="Fabric 8_Company Profile.pdf" target="_blank" style="color: var(--yellow, #ffd700);">DOWNLOAD COMPANY PROFILE</a></div>'

        # Replace
        content = re.sub(r'<div class="topline">.*?</div>', new_topline, content, flags=re.DOTALL)
        content = re.sub(r'<header class="header">.*?</header>', header, content, flags=re.DOTALL)
        content = re.sub(r'<footer.*?>.*?</footer>', footer, content, flags=re.DOTALL)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
    print("Done updating headers and footers.")
else:
    print("Could not extract blocks from index.html")
