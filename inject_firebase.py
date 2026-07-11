import os
import glob

html_files = glob.glob("*.html")
firebase_scripts = """    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore-compat.js"></script>
    <script src="site.js"></script>"""

for file in html_files:
    if file in ["admin.html", "migrate.html"]:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "firebase-app-compat" not in content:
        content = content.replace('<script src="site.js"></script>', firebase_scripts)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
