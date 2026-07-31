import re

with open('method.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_section = """<section class="method-grid-layout" style="display: grid; gap: 24px; padding: 40px 5vw; max-width: 1200px; margin: 0 auto;">
  <style>
    .method-grid-layout { grid-template-columns: 1fr 1fr; }
    @media (max-width: 768px) { .method-grid-layout { grid-template-columns: 1fr; } }
    
    .method-flip-card { aspect-ratio: auto; min-height: 240px; cursor: pointer; perspective: 1000px; width: 100%; max-width: none; }
    .method-flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
    .method-flip-card:hover .method-flip-inner { transform: rotateY(180deg); }
    @media (hover: none) {
      .method-flip-card.is-flipped .method-flip-inner { transform: rotateY(180deg); }
    }
    
    .method-flip-front, .method-flip-back {
      position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
      background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      padding: 10px; display: flex; flex-direction: column;
    }
    .method-flip-back { transform: rotateY(180deg); }
    
    .method-inner-box {
      flex: 1; border-radius: 6px; padding: 24px; display: flex; flex-direction: column; justify-content: center;
    }
    
    /* LEFT COLUMN (ODD CARDS) -> Inner Box GREEN, Border YELLOW */
    .method-flip-card:nth-child(odd) .method-flip-front { border-left: 8px solid var(--yellow); }
    .method-flip-card:nth-child(odd) .method-flip-front .method-inner-box { background: var(--green); color: #fff; }
    
    /* LEFT COLUMN BACK */
    .method-flip-card:nth-child(odd) .method-flip-back { border-left: 8px solid var(--yellow); }
    .method-flip-card:nth-child(odd) .method-flip-back .method-inner-box { background: #fff; border: 2px solid var(--green); color: var(--ink); align-items: center; text-align: center; }
    .method-flip-card:nth-child(odd) .method-flip-back .method-title { color: var(--green); }
    
    /* RIGHT COLUMN (EVEN CARDS) -> Inner Box YELLOW, Border GREEN */
    .method-flip-card:nth-child(even) .method-flip-front { border-left: 8px solid var(--green); }
    .method-flip-card:nth-child(even) .method-flip-front .method-inner-box { background: var(--yellow); color: var(--ink); }
    
    /* RIGHT COLUMN BACK */
    .method-flip-card:nth-child(even) .method-flip-back { border-left: 8px solid var(--green); }
    .method-flip-card:nth-child(even) .method-flip-back .method-inner-box { background: #fff; border: 2px solid var(--yellow); color: var(--ink); align-items: center; text-align: center; }
    .method-flip-card:nth-child(even) .method-flip-back .method-title { color: var(--yellow); }
    
    .method-num { font-size: 14px; font-weight: 800; margin-bottom: 8px; display: block; opacity: 0.9; }
    .method-title { font-size: 22px; font-weight: 900; margin-bottom: 12px; text-transform: uppercase; line-height: 1.1; font-family: 'Acumin Variable Concept', 'Acumin Pro Condensed', Montserrat, sans-serif; letter-spacing: 0.5px; word-wrap: normal; word-break: keep-all; }
    .method-desc { font-size: 14px; opacity: 0.95; line-height: 1.5; margin: 0; font-weight: 500; font-family: Montserrat, sans-serif; }
    
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
  <article class="method-flip-card">
    <div class="method-flip-inner">
      <!-- Front -->
      <div class="method-flip-front">
        <div class="method-inner-box">
          <span class="method-num">{num}</span>
          <h2 class="method-title">{title}</h2>
          <p class="method-desc">{short_desc}</p>
        </div>
      </div>
      <!-- Back -->
      <div class="method-flip-back">
        <div class="method-inner-box">
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
  document.querySelectorAll('.method-flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
</script>
'''

# Replace from <section class="method-list" ... to </script>
pattern = re.compile(r'<section class="method-list".*?</section>(\s*<script>.*?</script>)?', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(new_section, content)
else:
    print("Could not find section. It might already be renamed to method-grid-layout.")
    # Try finding method-grid-layout instead in case script was run twice
    pattern2 = re.compile(r'<section class="method-grid-layout".*?</section>(\s*<script>.*?</script>)?', re.DOTALL)
    if pattern2.search(content):
         content = pattern2.sub(new_section, content)

with open('method.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated classes to avoid site.css conflicts.")
