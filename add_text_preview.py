import sys

with open('site.js', 'r', encoding='utf-8') as f:
    js = f.read()

text_preview_code = """
  // --- Live Text Embroidery Preview ---
  const textPreviewWrap = document.getElementById("pageTextPreview");
  const textPreviewContent = document.getElementById("pageTextPreviewContent");
  const tInput1 = document.getElementById("pageTextInput1");
  const tInput2 = document.getElementById("pageTextInput2");
  const tInput3 = document.getElementById("pageTextInput3");

  const updateLiveTextPreview = () => {
    if (!textPreviewWrap || !textPreviewContent || !tInput1) return;
    const l1 = tInput1.value.trim();
    const l2 = tInput2 ? tInput2.value.trim() : "";
    const l3 = tInput3 ? tInput3.value.trim() : "";
    
    if (!l1 && !l2 && !l3) {
      textPreviewWrap.style.display = "none";
      return;
    }
    
    textPreviewWrap.style.display = "block";
    let html = l1;
    if (l2) html += "<br>" + l2;
    if (l3) html += "<br>" + l3;
    textPreviewContent.innerHTML = html;
    
    // Get Font
    const font = document.querySelector('input[name="pageTextFont"]:checked')?.value || "block";
    if (font === "script") textPreviewContent.style.fontFamily = "'Brush Script MT', 'Lucida Calligraphy', cursive";
    else if (font === "serif") textPreviewContent.style.fontFamily = "'Times New Roman', serif";
    else textPreviewContent.style.fontFamily = "'Montserrat', sans-serif";
    
    // Get Color
    const activeColorDot = document.querySelector("#pageTextThreadColors .color-dot.active");
    if (activeColorDot) {
      const hex = activeColorDot.style.backgroundColor;
      textPreviewContent.style.color = hex;
      // Special handling for white/light thread to keep it visible
      if (hex === "rgb(255, 255, 255)" || hex === "white" || hex === "#ffffff") {
        textPreviewContent.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)";
      } else {
        textPreviewContent.style.textShadow = "1px 1px 2px rgba(255,255,255,0.8)";
      }
    }
  };

  if (tInput1) tInput1.addEventListener("input", updateLiveTextPreview);
  if (tInput2) tInput2.addEventListener("input", updateLiveTextPreview);
  if (tInput3) tInput3.addEventListener("input", updateLiveTextPreview);
  
  document.querySelectorAll('input[name="pageTextFont"]').forEach(radio => {
    radio.addEventListener("change", updateLiveTextPreview);
  });
  
  if (threadColorDiv) {
    threadColorDiv.addEventListener("click", (e) => {
      if (e.target.classList.contains("color-dot")) {
        // Small timeout to allow the other click listener to add 'active' class
        setTimeout(updateLiveTextPreview, 10);
      }
    });
  }
  
  // Drag logic for text preview
  if (textPreviewWrap) {
    let isTDragging = false;
    let currTX, currTY, initTX, initTY, txOff = 0, tyOff = 0;
    textPreviewWrap.onmousedown = (e) => {
      initTX = e.clientX - txOff;
      initTY = e.clientY - tyOff;
      isTDragging = true;
    };
    document.addEventListener("mouseup", () => { isTDragging = false; });
    document.addEventListener("mousemove", (e) => {
      if (isTDragging) {
        e.preventDefault();
        currTX = e.clientX - initTX;
        currTY = e.clientY - initTY;
        txOff = currTX; tyOff = currTY;
        textPreviewWrap.style.transform = `translate(${currTX}px, ${currTY}px)`;
      }
    });
  }
  // --- End Live Text Embroidery Preview ---

  // Add to Cart"""

js = js.replace("  // Add to Cart", text_preview_code)

with open('site.js', 'w', encoding='utf-8') as f:
    f.write(js)
    
print("Updated site.js with live text preview logic.")
