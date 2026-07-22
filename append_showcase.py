code = """
// Dynamic Homepage Showcase
document.addEventListener('DOMContentLoaded', async () => {
  const showcase = document.getElementById('dynamicShowcase');
  if (showcase) {
    try {
      const response = await fetch('data/products.json');
      const products = await response.json();
      const shuffled = products.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      showcase.innerHTML = selected.map(p => `
        <article class="product-card" style="text-align: left;">
          <a href="product.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; border-radius: 8px; margin-bottom: 15px; background: #f4f4f4; object-fit: contain; aspect-ratio: 4/5;" />
            <p style="font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; margin: 0;">${p.category || 'Apparel'}</p>
            <h3 style="margin: 5px 0; font-size: 16px; font-weight: 800; color: var(--ink);">${p.name}</h3>
          </a>
        </article>
      `).join('');
    } catch (e) { console.error('Error loading showcase:', e); }
  }
});
"""

with open('site.js', 'a', encoding='utf-8') as f:
    f.write(code)

print("Appended dynamic showcase to site.js")
