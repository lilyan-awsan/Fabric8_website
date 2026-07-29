import re

def process_branding_studio():
    with open('branding-studio.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update Finish UI to buttons
    finish_ui = """
            <div>
              <label class="form-label">Finish Choice:</label>
              <div id="dtfFinishButtons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="garment-pill active" onclick="setFinish('Embroidery', this)">Embroidery</button>
                <button type="button" class="garment-pill" onclick="setFinish('Direct To Fabric (DTF) Printing', this)">Direct To Fabric (DTF) Printing</button>
              </div>
              <p id="finishSubtext" style="font-size: 11px; margin-top: 8px; line-height: 1.4; color: var(--muted);"></p>
              <input type="hidden" id="dtfFinishSelect" value="Embroidery" />
            </div>
"""
    # Replace the old finish select
    html = re.sub(r'<div>\s*<label class="form-label">Transfer Finish Method:</label>\s*<select id="dtfFinishSelect".*?</select>\s*</div>', finish_ui, html, flags=re.DOTALL)

    # 2. Delete scale slider
    html = re.sub(r'<div class="form-group" style="margin-bottom: 28px;">\s*<label class="form-label" id="scaleLabel".*?</label>\s*<input type="range" id="logoScaleSlider".*?/>\s*</div>', '', html, flags=re.DOTALL)

    # 3. CTA Update
    html = html.replace('Confirm Prototype &amp; Add To Quote Cart', 'ADD TO CART')
    
    # 4. JS Updates for sizing, transparency, and finish
    js_additions = """
    function setFinish(val, btnEl) {
      document.getElementById('dtfFinishSelect').value = val;
      const btns = document.getElementById('dtfFinishButtons').querySelectorAll('button');
      btns.forEach(b => b.classList.remove('active'));
      btnEl.classList.add('active');
      
      const sub = document.getElementById('finishSubtext');
      if (val === 'Embroidery') {
        sub.textContent = "Embroidery is recommended for structured, smaller logos (chest, sleeve, caps, pockets) and holds up best on woven/heavier fabrics.";
      } else {
        sub.textContent = "Direct-to-fabric (DTF) printing is recommended for larger, multi-color, or photo-realistic designs, and works best on flatter areas like full front/back placements on t-shirts and hoodies.";
      }
    }
    
    // Call on load
    window.addEventListener('DOMContentLoaded', () => {
       const btn = document.querySelector('#dtfFinishButtons button');
       if(btn) setFinish('Embroidery', btn);
    });

    const placementRules = {
      "place-left-chest": { label: "Left Chest (3.5\\"-4\\")", scale: 22, angle: 1 },
      "place-right-chest": { label: "Right Chest (3.5\\"-4\\")", scale: 22, angle: -1 },
      "place-center-back": { label: "Center Back (10\\"-12\\")", scale: 50, angle: 0 },
      "place-upper-sleeve": { label: "Upper Sleeve (2.5\\")", scale: 16, angle: -10 },
      "place-pocket": { label: "Pocket/Bib (3.5\\"-4\\")", scale: 22, angle: 0 }
    };
    
    const origUpdatePlacement = updatePlacement;
    updatePlacement = function(className) {
      origUpdatePlacement(className);
      const rule = placementRules[className];
      if (rule) {
        const img = document.getElementById("logoPreviewImg");
        img.style.maxWidth = rule.scale + "%";
        img.style.maxHeight = rule.scale + "%";
        // Counteract the container rotation so logo stays upright
        img.style.transform = "rotate(" + rule.angle + "deg)";
      }
    };
    
    // Auto Transparency Logic
    function processTransparentImage(imgUrl, callback) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            
            // Assume top-left pixel is the background color
            const r = data[0], g = data[1], b = data[2];
            // If it's somewhat uniform background (white/black), remove it
            for (let i = 0; i < data.length; i += 4) {
                if (Math.abs(data[i] - r) < 20 && Math.abs(data[i+1] - g) < 20 && Math.abs(data[i+2] - b) < 20) {
                    data[i+3] = 0; // Set alpha to 0
                }
            }
            ctx.putImageData(imgData, 0, 0);
            callback(canvas.toDataURL("image/png"));
        };
        img.src = imgUrl;
    }
    
    const origHandleLogoUpload = handleLogoUpload;
    handleLogoUpload = function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          processTransparentImage(ev.target.result, function(transparentDataUrl) {
              document.getElementById("logoPreviewImg").src = transparentDataUrl;
              customLogoBase64 = transparentDataUrl;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    """
    
    html = html.replace('function switchStudioMode(mode)', js_additions + '\n    function switchStudioMode(mode)')
    
    with open('branding-studio.html', 'w', encoding='utf-8') as f:
        f.write(html)

def process_product_js():
    with open('site.js', 'r', encoding='utf-8') as f:
        js = f.read()
        
    # In site.js for product.html, the finish choice is generated dynamically.
    # We need to change the radio group to use Buttons and inject subtext.
    # Lines 1417-1422
    
    js = js.replace('const allowedFinishes = custType === "dtf_only" ? ["Direct To Fabric (DTF) Printing"] : \n                              custType === "embroidery_only" ? ["Embroidery"] : \n                              ["Embroidery", "Direct To Fabric (DTF) Printing"];', 'const allowedFinishes = ["Embroidery", "Direct To Fabric (DTF) Printing"];')
    
    # We also need to inject transparency processor into site.js for pageLogoUpload
    auto_trans_js = """
    function autoRemoveBackground(src, callback) {
      const img = new Image();
      img.onload = function() {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const c = cvs.getContext('2d');
        c.drawImage(img,0,0);
        const d = c.getImageData(0,0,cvs.width,cvs.height);
        const bg = [d.data[0], d.data[1], d.data[2]];
        for(let i=0; i<d.data.length; i+=4) {
           if(Math.abs(d.data[i]-bg[0])<25 && Math.abs(d.data[i+1]-bg[1])<25 && Math.abs(d.data[i+2]-bg[2])<25) {
               d.data[i+3] = 0;
           }
        }
        c.putImageData(d,0,0);
        callback(cvs.toDataURL('image/png'));
      };
      img.src = src;
    }
    """
    if "autoRemoveBackground(" not in js:
        js += auto_trans_js
        
    # Replace the logo upload handler in site.js to use autoRemoveBackground
    # Search for reader.readAsDataURL(file); in the upload handler...
    
    js = re.sub(
        r'reader\.onload = \(ev\) => \{\s*pageLogoPreviewImg\.src = ev\.target\.result;\s*pageLogoPreviewImg\.style\.display = "block";\s*pageLogoPreview\.style\.display = "block";\s*\}', 
        r'''reader.onload = (ev) => {
            if (typeof autoRemoveBackground !== 'undefined') {
                autoRemoveBackground(ev.target.result, (transSrc) => {
                    pageLogoPreviewImg.src = transSrc;
                    pageLogoPreviewImg.style.display = "block";
                    pageLogoPreview.style.display = "block";
                });
            } else {
                pageLogoPreviewImg.src = ev.target.result;
                pageLogoPreviewImg.style.display = "block";
                pageLogoPreview.style.display = "block";
            }
        }''', 
        js, flags=re.DOTALL
    )
    
    # Update Finish Subtext logic
    js = js.replace('const updateFinishHelper = () => {', 'const updateFinishHelper = () => {\n      const helper = document.getElementById("finishHelperText");\n      const sel = document.querySelector(\'input[name="pageLogoFinish"]:checked\');\n      if(sel && helper) {\n        helper.style.display = "block";\n        if(sel.value === "Embroidery") helper.textContent = "Embroidery is recommended for structured, smaller logos (chest, sleeve, caps, pockets) and holds up best on woven/heavier fabrics.";\n        else helper.textContent = "Direct-to-fabric (DTF) printing is recommended for larger, multi-color, or photo-realistic designs, and works best on flatter areas like full front/back placements on t-shirts and hoodies.";\n      }\n')

    with open('site.js', 'w', encoding='utf-8') as f:
        f.write(js)

def process_product_html():
    with open('product.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # CTA update
    html = html.replace('ADD TO CART', 'ADD TO CART') # It's already ADD TO CART, but just in case
    
    with open('product.html', 'w', encoding='utf-8') as f:
        f.write(html)

process_branding_studio()
process_product_js()
process_product_html()
print("Applied client requirements to branding-studio.html, site.js, and product.html")
