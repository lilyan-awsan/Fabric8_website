import re

with open('method.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_section = """<section class="method-list" style="display: grid; gap: 24px; padding: 40px 5vw; max-width: 1200px; margin: 0 auto;">
  <style>
    .method-list { grid-template-columns: 1fr 1fr; }
    @media (max-width: 768px) { .method-list { grid-template-columns: 1fr; } }
    
    .flip-card { min-height: 240px; cursor: pointer; perspective: 1000px; }
    .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
    @media (hover: none) {
      .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
    }
    
    .flip-card-front, .flip-card-back {
      position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      padding: 32px; display: flex; flex-direction: column; justify-content: center;
    }
    .flip-card-back { transform: rotateY(180deg); text-align: center; align-items: center; }
    
    /* ODD CARDS FRONT (LEFT) - GREEN */
    .flip-card:nth-child(odd) .flip-card-front { background: var(--green); color: #fff; }
    
    /* ODD CARDS BACK - WHITE W/ GREEN BORDER */
    .flip-card:nth-child(odd) .flip-card-back { background: #fff; border: 2px solid var(--green); color: var(--ink); }
    .flip-card:nth-child(odd) .flip-card-back .method-title { color: var(--green); }
    
    /* EVEN CARDS FRONT (RIGHT) - YELLOW */
    .flip-card:nth-child(even) .flip-card-front { background: var(--yellow); color: var(--ink); }
    
    /* EVEN CARDS BACK - WHITE W/ YELLOW BORDER */
    .flip-card:nth-child(even) .flip-card-back { background: #fff; border: 2px solid var(--yellow); color: var(--ink); }
    .flip-card:nth-child(even) .flip-card-back .method-title { color: var(--yellow); }
    
    .method-num { font-size: 16px; font-weight: 900; margin-bottom: 12px; display: block; opacity: 0.8; }
    .method-title { font-size: 20px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; line-height: 1.2; font-family: 'Acumin Variable Concept', 'Acumin Pro Condensed', Montserrat, sans-serif; }
    .method-desc { font-size: 14px; opacity: 0.9; line-height: 1.5; margin: 0; font-weight: 500; }
  </style>
"""

data = [
    ("01", "Knowledge Allocation", "Needs, pain points, brand identity, and operational environment are mapped first.", "We begin by listening: Your needs, pain-points, brand identity requirements, and operational environment are mapped before any solution is proposed."),
    ("02", "Consultation", "Garment and textile solutions are tailored to role profile, climate, and budget.", "We advise on garment and textile solutions tailored to your role profile, climate, and budget. There is always the right fabric for the right job."),
    ("03", "Budget Management", "Quantity, item selection, and distribution are optimized for maximum value.", "We optimize quantity, item selection, and distribution to get maximum value within your approved budget and no surprises."),
    ("04", "Order Deliberation", "Alterations, edits, and specifications are locked before production.", "During the PO stage we manage alterations, edits, and problem-solving so your specification is locked and correct before production begins."),
    ("05", "Branding", "Embroidery, printing, and finishing transform garments into brand assets.", "Embroidery, printing, and finishing transform each garment into a brand asset: consistent, professional, and identity-aligned."),
    ("06", "Manufacturing", "Production follows agreed specifications with quality control checkpoints.", "Production is executed by agreed specifications, with quality control checkpoints and compliance with applicable health and safety standards throughout."),
    ("07", "Logistics & Delivery", "Freight and final-mile delivery are coordinated and tracked to required orders.", "Coordinated freight and final-mile delivery to your sites, tracked and confirmed using critical path method for required orders."),
    ("08", "After-Sales", "Guidance, reorders, support, and lifecycle planning continue after delivery.", "Our relationship does not end at delivery. We handle guidance, problem solving, re-orders, and ongoing support for the lifecycle of your uniform planning.")
]

for num, title, short_desc, long_desc in data:
    new_section += f'''
  <article class="flip-card">
    <div class="flip-card-inner">
      <!-- Front -->
      <div class="flip-card-front">
        <span class="method-num">{num}</span>
        <h2 class="method-title">{title}</h2>
        <p class="method-desc">{short_desc}</p>
      </div>
      <!-- Back -->
      <div class="flip-card-back">
        <h2 class="method-title">{title}</h2>
        <p class="method-desc">{long_desc}</p>
      </div>
    </div>
  </article>'''

new_section += '''
</section>
<script>
  // For mobile tap-to-flip
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
</script>
'''

# Find everything from <section class="method-list" ... to the end of the script block if it exists, or just the section
pattern = re.compile(r'<section class="method-list".*?</section>(\s*<script>.*?</script>)?', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(new_section, content)
else:
    print("Could not find section")

with open('method.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated method.html with professional premium styling")
