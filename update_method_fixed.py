import re

with open('method.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_section = """<section class="method-list" style="display: grid; gap: 24px; padding: 40px 5vw; max-width: 1200px; margin: 0 auto;">
  <style>
    .method-list { grid-template-columns: 1fr 1fr; }
    @media (max-width: 768px) { .method-list { grid-template-columns: 1fr; } }
    
    .flip-card { aspect-ratio: 1.5; min-height: 280px; cursor: pointer; perspective: 1000px; }
    .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
    @media (hover: none) {
      .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
    }
    
    .flip-card-front, .flip-card-back {
      position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
      background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      padding: 16px; display: flex; flex-direction: column;
    }
    .flip-card-back { transform: rotateY(180deg); }
    
    .card-inner-box {
      flex: 1; border-radius: 6px; padding: 32px 40px; display: flex; flex-direction: column; justify-content: center;
    }
    
    /* LEFT COLUMN (ODD CARDS: 1, 3, 5, 7) -> Inner Box GREEN */
    .flip-card:nth-child(odd) .flip-card-front, .flip-card:nth-child(odd) .flip-card-back { border-left: 10px solid var(--yellow); }
    .flip-card:nth-child(odd) .flip-card-front .card-inner-box { background: var(--green); color: #fff; }
    
    /* LEFT COLUMN BACK */
    .flip-card:nth-child(odd) .flip-card-back .card-inner-box { background: var(--green); color: #fff; }
    
    /* RIGHT COLUMN (EVEN CARDS: 2, 4, 6, 8) -> Inner Box YELLOW */
    .flip-card:nth-child(even) .flip-card-front, .flip-card:nth-child(even) .flip-card-back { border-left: 10px solid var(--green); }
    .flip-card:nth-child(even) .flip-card-front .card-inner-box { background: var(--yellow); color: var(--ink); }
    
    /* RIGHT COLUMN BACK */
    .flip-card:nth-child(even) .flip-card-back .card-inner-box { background: var(--yellow); color: var(--ink); }
    
    .method-num { font-size: 16px; font-weight: 800; margin-bottom: 12px; display: block; opacity: 0.9; }
    .method-title { font-size: 24px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase; line-height: 1.1; font-family: 'Acumin Variable Concept', 'Acumin Pro Condensed', Montserrat, sans-serif; letter-spacing: 0.5px; word-wrap: break-word; hyphens: auto; }
    .method-desc { font-size: 15px; opacity: 0.95; line-height: 1.5; margin: 0; font-weight: 500; font-family: Montserrat, sans-serif; }
    
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
        <div class="card-inner-box">
          <span class="method-num">{num}</span>
          <h2 class="method-title">{title}</h2>
          <p class="method-desc">{short_desc}</p>
        </div>
      </div>
      <!-- Back -->
      <div class="flip-card-back">
        <div class="card-inner-box">
          <h2 class="method-title">{title}</h2>
          <p class="method-desc">{long_desc}</p>
        </div>
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
print("Updated method.html with white borders, swapped colors, fixed contrast, and larger sizes")
