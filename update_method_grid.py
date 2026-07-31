import re

with open('method.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new grid HTML
new_section = """<section class="method-list" style="display: grid; gap: 24px; padding: 40px 5vw; max-width: 1200px; margin: 0 auto;">
  <style>
    .method-list { grid-template-columns: 1fr 1fr; }
    @media (max-width: 768px) { .method-list { grid-template-columns: 1fr; } }
    .method-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      padding: 12px;
      display: flex;
      flex-direction: column;
    }
    .method-inner {
      flex: 1;
      border-radius: 6px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .method-card:nth-child(odd) {
      border-left: 8px solid var(--yellow);
    }
    .method-card:nth-child(odd) .method-inner {
      background: var(--green);
      color: #fff;
    }
    .method-card:nth-child(even) {
      border-left: 8px solid var(--green);
    }
    .method-card:nth-child(even) .method-inner {
      background: var(--yellow);
      color: var(--ink);
    }
    .method-num { font-size: 42px; font-weight: 900; opacity: 0.9; margin-bottom: 12px; }
    .method-title { font-size: 22px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase; line-height: 1.2; }
    .method-desc { font-size: 15px; opacity: 0.9; line-height: 1.6; margin: 0; font-weight: 500; }
  </style>
  
  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">01</span>
      <h2 class="method-title">Knowledge Allocation</h2>
      <p class="method-desc">Needs, pain points, brand identity, and operational environment are mapped first.</p>
    </div>
  </article>
  
  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">02</span>
      <h2 class="method-title">Consultation</h2>
      <p class="method-desc">Garment and textile solutions are tailored to role profile, climate, and budget.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">03</span>
      <h2 class="method-title">Budget Management</h2>
      <p class="method-desc">Quantity, item selection, and distribution are optimized for maximum value.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">04</span>
      <h2 class="method-title">Order Deliberation</h2>
      <p class="method-desc">Alterations, edits, and specifications are locked before production.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">05</span>
      <h2 class="method-title">Branding</h2>
      <p class="method-desc">Embroidery, printing, and finishing transform garments into brand assets.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">06</span>
      <h2 class="method-title">Manufacturing</h2>
      <p class="method-desc">Production follows agreed specifications with quality control checkpoints.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">07</span>
      <h2 class="method-title">Logistics & Delivery</h2>
      <p class="method-desc">Freight and final-mile delivery are coordinated and tracked to required orders.</p>
    </div>
  </article>

  <article class="method-card">
    <div class="method-inner">
      <span class="method-num">08</span>
      <h2 class="method-title">After-Sales</h2>
      <p class="method-desc">Guidance, reorders, support, and lifecycle planning continue after delivery.</p>
    </div>
  </article>
</section>"""

pattern = re.compile(r'<section class="method-list".*?</section>.*?<style>.*?\.flip-card:hover.*?</style>.*?<script>.*?</script>', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(new_section, content)
else:
    print("Could not find full pattern, trying just the section.")
    pattern2 = re.compile(r'<section class="method-list".*?</section>', re.DOTALL)
    content = pattern2.sub(new_section, content)

with open('method.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated method.html")
