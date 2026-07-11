import sys

with open('site.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

end_idx = 0
for i, line in enumerate(lines):
    if line.startswith('}));') and "image: p.image ||" in lines[i-2]:
        end_idx = i
        break

new_head = """let products = [];

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyB4o7k3og4IkpN-1hWLCm0swSKfep2bX3Q",
    authDomain: "fabric8-backend.firebaseapp.com",
    databaseURL: "https://fabric8-backend-default-rtdb.firebaseio.com",
    projectId: "fabric8-backend",
    storageBucket: "fabric8-backend.firebasestorage.app",
    messagingSenderId: "218171330798",
    appId: "1:218171330798:web:567df110bd198a60a123ff"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  db.ref("products").once("value", (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        products.push(data[key]);
      }
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    initSite();
  });
} else {
  initSite();
}

"""

new_lines = [new_head] + lines[end_idx+1:]

# Now replace the bottom three lines
bottom_str = "".join(new_lines)
bottom_str = bottom_str.replace("renderProducts();\nrenderCart();\nsetupStudio();", "function initSite() {\n  if (typeof renderProducts === 'function') renderProducts();\n  if (typeof renderCart === 'function') renderCart();\n  if (typeof setupStudio === 'function') setupStudio();\n}")

with open('site.js', 'w', encoding='utf-8') as f:
    f.write(bottom_str)

print("site.js rewritten successfully.")
