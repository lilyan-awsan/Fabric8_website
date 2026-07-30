import re

with open('method.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the new method list HTML
cards_data = [
    {
        "num": "01",
        "title": "Knowledge Allocation",
        "short": "Needs, pain points, brand identity, and operational environment are mapped first.",
        "long": "We begin by listening: Your needs, pain-points, brand identity requirements, and operational environment are mapped before any solution is proposed.",
        "color": "var(--green)"
    },
    {
        "num": "02",
        "title": "Consultation",
        "short": "Garment and textile solutions are tailored to role profile, climate, and budget.",
        "long": "We advise on garment and textile solutions tailored to your role profile, climate, and budget. There is always the right fabric for the right job.",
        "color": "var(--yellow)"
    },
    {
        "num": "03",
        "title": "Budget Management",
        "short": "Quantity, item selection, and distribution are optimized for maximum value.",
        "long": "We optimize quantity, item selection, and distribution to get maximum value within your approved budget and no surprises.",
        "color": "var(--green)"
    },
    {
        "num": "04",
        "title": "Order Deliberation",
        "short": "Alterations, edits, and specifications are locked before production.",
        "long": "During the PO stage we manage alterations, edits, and problem-solving so your specification is locked and correct before production begins.",
        "color": "var(--yellow)"
    },
    {
        "num": "05",
        "title": "Branding",
        "short": "Embroidery, printing, and finishing transform garments into brand assets.",
        "long": "Embroidery, printing, and finishing transform each garment into a brand asset: consistent, professional, and identity-aligned.",
        "color": "var(--green)"
    },
    {
        "num": "06",
        "title": "Manufacturing",
        "short": "Production follows agreed specifications with quality control checkpoints.",
        "long": "Production is executed by agreed specifications, with quality control checkpoints and compliance with applicable health and safety standards throughout.",
        "color": "var(--yellow)"
    },
    {
        "num": "07",
        "title": "Logistics & Delivery",
        "short": "Freight and final-mile delivery are coordinated and tracked to required orders.",
        "long": "Coordinated freight and final-mile delivery to your sites, tracked and confirmed using critical path method for required orders.",
        "color": "var(--green)"
    },
    {
        "num": "08",
        "title": "After-Sales",
        "short": "Guidance, reorders, support, and lifecycle planning continue after delivery.",
        "long": "Our relationship does not end at delivery. We handle guidance, problem solving, re-orders, and ongoing support for the lifecycle of your uniform planning.",
        "color": "var(--yellow)"
    }
]

new_list = '<section class="method-list" style="perspective: 1000px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; padding: 40px 5vw; max-width: 1200px; margin: 0 auto;">\n'

for c in cards_data:
    txt_color = "var(--ink)" if c['color'] == "var(--yellow)" else "#fff"
    new_list += f"""      <article class="flip-card" style="aspect-ratio: 1; cursor: pointer; position: relative;">
        <div class="flip-card-inner" style="width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d;">
          <!-- Front -->
          <div class="flip-card-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: {c['color']}; padding: 32px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; border-radius: 12px; color: {txt_color}; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
            <span style="font-size: 48px; font-weight: 900; opacity: 0.8; margin-bottom: 16px;">{c['num']}</span>
            <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 12px; line-height: 1.2;">{c['title']}</h2>
            <p style="font-size: 14px; opacity: 0.9; line-height: 1.5; margin: 0;">{c['short']}</p>
          </div>
          <!-- Back -->
          <div class="flip-card-back" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: #fff; border: 2px solid {c['color']}; padding: 32px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 12px; color: var(--ink); transform: rotateY(180deg); box-shadow: 0 8px 24px rgba(0,0,0,0.06); text-align: center;">
            <h2 style="font-size: 18px; font-weight: 900; margin-bottom: 16px; color: {c['color']};">{c['title']}</h2>
            <p style="font-size: 14px; font-weight: 500; line-height: 1.6; margin: 0;">{c['long']}</p>
          </div>
        </div>
      </article>\n"""

new_list += '    </section>\n'
new_list += """
    <style>
      .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
      @media (hover: none) {
        .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
      }
    </style>
    <script>
      // For mobile tap-to-flip
      document.querySelectorAll('.flip-card').forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('is-flipped');
        });
      });
    </script>
"""

# Replace the existing section
pattern = re.compile(r'<section class="method-list">.*?</section>', re.DOTALL)
html = pattern.sub(new_list, html)

with open('method.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated method.html with flip cards.")
