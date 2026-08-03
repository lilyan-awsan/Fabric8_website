/**
 * Fabric8 Standalone Interactive Product Customization & Branding Engine
 * Built From Scratch - Clean, modular, and commercial-grade implementation
 */

(function () {
  'use strict';

  // State initialization
  let state = {
    product: {
      sku: "F8-001",
      name: "Polo Shirt",
      color: "American Blue",
      size: "L",
      qty: 50,
      image: "assets/products/Polo American Blue 3.jpg",
      category: "Top Wear",
      capability: "Both", // "DTF Only", "Embroidery Only", "Both", "None"
      supportedFinishes: ["Embroidery", "DTF"],
      placements: [
        { name: "Left Chest", x: 65, y: 36, w: 18, h: 18, r: 0 },
        { name: "Right Chest", x: 35, y: 36, w: 18, h: 18, r: 0 },
        { name: "Full Back", x: 50, y: 45, w: 45, h: 45, r: 0 },
        { name: "Upper Left Sleeve", x: 84, y: 34, w: 13, h: 13, r: 6 },
        { name: "Upper Right Sleeve", x: 16, y: 34, w: 13, h: 13, r: -6 }
      ]
    },
    currentMode: "logo", // "logo" or "text"
    currentFinish: "Embroidery", // "Embroidery" or "DTF"
    selectedPlacement: null,
    artwork: {
      rawImage: null,
      processedImage: null, // After auto-background removal
      fileName: ""
    },
    text: {
      line1: "",
      line2: "",
      line3: "",
      fontStyle: "Block", // "Block", "Serif", "Script"
      fontFamily: "'Acumin Variable Concept', system-ui, sans-serif",
      swatchName: "Classic Black",
      swatchHex: "#111111"
    },
    garmentImgObj: null
  };

  // Realistic commercial thread swatches
  const THREAD_SWATCHES = [
    { name: "Classic Black", hex: "#111111" },
    { name: "Crisp White", hex: "#ffffff", border: true },
    { name: "Royal Navy", hex: "#1c2a44" },
    { name: "Sterling Silver", hex: "#c0c0c0" },
    { name: "Metallic Gold", hex: "#d4af37" },
    { name: "Crimson Red", hex: "#a81c1c" },
    { name: "Forest Green", hex: "#1e4620" },
    { name: "Charcoal Grey", hex: "#383838" },
    { name: "Olive Drab", hex: "#4b5320" },
    { name: "Burgundy Wine", hex: "#660033" },
    { name: "American Blue", hex: "#243f6c" },
    { name: "Sunflower Yellow", hex: "#f0c808" }
  ];

  // DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    initializeState();
    setupUI();
    loadGarmentImage();
    renderSwatches();
  });

  // Load customizer state from localStorage or fallback query params
  function initializeState() {
    let savedState = null;
    try {
      const raw = localStorage.getItem("fabric8_customizer_state");
      if (raw) savedState = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse fabric8_customizer_state", e);
    }

    if (savedState && savedState.sku) {
      state.product = Object.assign(state.product, savedState);
    } else {
      // Check URL params
      const params = new URLSearchParams(window.location.search);
      if (params.get("sku")) state.product.sku = params.get("sku");
      if (params.get("name")) state.product.name = params.get("name");
      if (params.get("color")) state.product.color = params.get("color");
      if (params.get("size")) state.product.size = params.get("size");
      if (params.get("qty")) state.product.qty = parseInt(params.get("qty")) || 50;
      if (params.get("img")) state.product.image = params.get("img");
      if (params.get("cust")) state.product.capability = params.get("cust");
    }

    // Default selected placement
    if (state.product.placements && state.product.placements.length > 0) {
      state.selectedPlacement = state.product.placements[0];
    } else {
      state.selectedPlacement = { name: "Left Chest", x: 65, y: 36, w: 18, h: 18, r: 0 };
    }
  }

  // Set up Header, Rules Matrix, and Placement Dropdown
  function setupUI() {
    // Populate header context
    document.getElementById("headerProdImg").src = state.product.image;
    document.getElementById("headerProdName").textContent = state.product.name;
    document.getElementById("headerProdSku").textContent = `SKU: ${state.product.sku}`;
    document.getElementById("headerProdColor").textContent = `Color: ${state.product.color}`;
    document.getElementById("headerProdSize").textContent = `Size: ${state.product.size}`;
    document.getElementById("headerProdQty").textContent = `Qty: ${state.product.qty} Pcs`;
    
    const backLink = document.getElementById("headerBackLink");
    if (backLink) backLink.href = `product.html?sku=${state.product.sku}`;

    // Enforce Placement & Method Rules Matrix (Per SKU)
    const cap = (state.product.capability || "both").toLowerCase();
    const tabText = document.getElementById("tabTextBtn");
    const finishEmbBtn = document.getElementById("finishEmbroideryBtn");
    const finishDtfBtn = document.getElementById("finishDtfBtn");

    if (cap === "none" || cap === "n/a") {
      alert("This product does not support customization. Returning to catalog.");
      window.location.href = "shop.html";
      return;
    }

    if (cap === "dtf_only" || cap === "dtf" || cap === "dtf only") {
      // Hide Text Embroidery tab and Embroidery button
      if (tabText) tabText.style.display = "none";
      if (finishEmbBtn) finishEmbBtn.style.display = "none";
      selectFinish("DTF");
    } else if (cap === "embroidery_only" || cap === "embroidery" || cap === "embroidery only") {
      // Hide DTF button in Logo tab
      if (finishDtfBtn) finishDtfBtn.style.display = "none";
      selectFinish("Embroidery");
    } else {
      // Both supported
      selectFinish("Embroidery");
    }

    // Populate Placement Dropdown
    const selector = document.getElementById("placementSelector");
    selector.innerHTML = "";
    const placements = state.product.placements || [];
    placements.forEach((p, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = p.name || `Zone ${idx + 1}`;
      selector.appendChild(opt);
    });

    selector.addEventListener("change", function (e) {
      const idx = parseInt(e.target.value);
      state.selectedPlacement = placements[idx];
      drawCanvas();
    });

    // File Upload Handler with Auto-Background Removal
    const fileInput = document.getElementById("logoFileInput");
    fileInput.addEventListener("change", handleLogoUpload);

    // Text input event listeners
    ["textLine1", "textLine2", "textLine3"].forEach(id => {
      document.getElementById(id).addEventListener("input", function (e) {
        state.text[id.replace("text", "").toLowerCase()] = e.target.value;
        drawCanvas();
      });
    });
  }

  // Mode Switcher
  window.switchCustomizerMode = function (mode) {
    state.currentMode = mode;
    const tabLogo = document.getElementById("tabLogoBtn");
    const tabText = document.getElementById("tabTextBtn");
    const panelLogo = document.getElementById("panelLogoUpload");
    const panelText = document.getElementById("panelTextEmbroidery");

    if (mode === "logo") {
      tabLogo.classList.add("active");
      tabText.classList.remove("active");
      panelLogo.style.display = "block";
      panelText.style.display = "none";
      if (state.currentFinish !== "Embroidery" && state.currentFinish !== "DTF") {
        state.currentFinish = "Embroidery";
      }
    } else {
      tabText.classList.add("active");
      tabLogo.classList.remove("active");
      panelText.style.display = "block";
      panelLogo.style.display = "none";
      state.currentFinish = "Embroidery"; // Text mode is Embroidery only
    }
    drawCanvas();
  };

  // Finish Technique Toggle Button selection
  window.selectFinish = function (technique) {
    state.currentFinish = technique;
    const embBtn = document.getElementById("finishEmbroideryBtn");
    const dtfBtn = document.getElementById("finishDtfBtn");
    
    if (technique === "Embroidery") {
      if (embBtn) embBtn.classList.add("active");
      if (dtfBtn) dtfBtn.classList.remove("active");
    } else {
      if (dtfBtn) dtfBtn.classList.add("active");
      if (embBtn) embBtn.classList.remove("active");
    }
    drawCanvas();
  };

  // Typography selection toggle
  window.selectFont = function (styleName, btnEl) {
    state.text.fontStyle = styleName;
    document.querySelectorAll(".font-toggle-grid .font-btn").forEach(btn => btn.classList.remove("active"));
    btnEl.classList.add("active");

    if (styleName === "Block") state.text.fontFamily = "'Acumin Variable Concept', system-ui, sans-serif";
    else if (styleName === "Serif") state.text.fontFamily = "'Times New Roman', serif";
    else if (styleName === "Script") state.text.fontFamily = "'Brush Script MT', cursive";

    drawCanvas();
  };

  // Render realistic thread swatches
  function renderSwatches() {
    const container = document.getElementById("swatchesContainer");
    container.innerHTML = "";

    THREAD_SWATCHES.forEach((swatch, idx) => {
      const dot = document.createElement("div");
      dot.className = "thread-swatch" + (idx === 0 ? " active" : "");
      dot.style.backgroundColor = swatch.hex;
      if (swatch.border) dot.style.borderColor = "#cccccc";
      dot.title = swatch.name;

      dot.addEventListener("click", () => {
        document.querySelectorAll(".thread-swatch").forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
        state.text.swatchName = swatch.name;
        state.text.swatchHex = swatch.hex;
        document.getElementById("selectedSwatchName").textContent = swatch.name;
        drawCanvas();
      });

      container.appendChild(dot);
    });
  }

  // Handle Logo Upload and trigger Auto-Background Removal
  function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    state.artwork.fileName = file.name;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        state.artwork.rawImage = img;
        removeWhiteBackground(img, function (processedImg) {
          state.artwork.processedImage = processedImg;
          drawCanvas();
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Auto-Background Removal Engine: Treat all white/near-white backgrounds as transparent
  function removeWhiteBackground(img, callback) {
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");
    offCanvas.width = img.width;
    offCanvas.height = img.height;

    offCtx.drawImage(img, 0, 0);
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;

    // Luminance and color uniformity thresholding for white background removal
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Treat near pure white as transparent (R>240, G>240, B>240)
      if (r > 238 && g > 238 && b > 238) {
        data[i + 3] = 0; // Set Alpha to 0
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    const resultImg = new Image();
    resultImg.onload = function () {
      callback(resultImg);
    };
    resultImg.src = offCanvas.toDataURL("image/png");
  }

  // Load Base Garment Image
  function loadGarmentImage() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      state.garmentImgObj = img;
      drawCanvas();
    };
    img.onerror = function () {
      // Fallback if cross-origin or load fail
      img.src = "assets/fabric8_logo_noneedle_cropped.png";
    };
    img.src = state.product.image || "assets/products/Polo American Blue 3.jpg";
  }

  // Main Real-Time Canvas Preview Engine
  function drawCanvas() {
    const canvas = document.getElementById("renderCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Garment Backdrop
    if (state.garmentImgObj && state.garmentImgObj.complete) {
      // Proportional fit centered on canvas
      const imgW = state.garmentImgObj.width;
      const imgH = state.garmentImgObj.height;
      const scale = Math.min((w * 0.85) / imgW, (h * 0.85) / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = (w - drawW) / 2;
      const offsetY = (h - drawH) / 2;

      ctx.drawImage(state.garmentImgObj, offsetX, offsetY, drawW, drawH);
    } else {
      ctx.fillStyle = "#f5f5f0";
      ctx.fillRect(0, 0, w, h);
    }

    // Get active placement bounds
    const p = state.selectedPlacement || { name: "Left Chest", x: 65, y: 36, w: 18, h: 18, r: 0 };
    const anchorX = (p.x / 100) * w;
    const anchorY = (p.y / 100) * h;
    const rotDeg = p.r || 0;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    if (rotDeg !== 0) {
      ctx.rotate((rotDeg * Math.PI) / 180);
    }

    if (state.currentMode === "logo" && state.artwork.processedImage) {
      // MODE A: Fixed Placement Sizing Metrics (No user size sliders)
      let targetWRatio = 0.18; // Default chest ~18%
      const pName = p.name ? p.name.toLowerCase() : "";

      if (pName.includes("center") || pName.includes("back") || pName.includes("full") || pName.includes("front center")) {
        targetWRatio = 0.46; // 10" - 12" width
      } else if (pName.includes("sleeve") || pName.includes("cuff") || pName.includes("pocket") || pName.includes("beret")) {
        targetWRatio = 0.13; // 2.5" width
      } else if (pName.includes("chest") || pName.includes("panel")) {
        targetWRatio = 0.19; // 3.5" - 4.0" width
      }

      const logoW = w * targetWRatio;
      const aspect = state.artwork.processedImage.height / state.artwork.processedImage.width;
      const logoH = logoW * aspect;

      // Draw centered on anchor
      ctx.drawImage(state.artwork.processedImage, -logoW / 2, -logoH / 2, logoW, logoH);

    } else if (state.currentMode === "text") {
      // MODE B: Text Embroidery Workflow - Strict sizing & straight line lock
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Thread shadow texture effect
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;

      ctx.fillStyle = state.text.swatchHex;

      const l1 = state.text.line1.trim();
      const l2 = state.text.line2.trim();
      const l3 = state.text.line3.trim();

      // Line 1: Fixed at 14px scale ratio (~28px canvas)
      let currentOffsetY = 0;
      if (l1) {
        ctx.font = `900 28px ${state.text.fontFamily}`;
        if (state.text.fontStyle === "Block") {
          ctx.fillText(l1.toUpperCase(), 0, currentOffsetY);
        } else {
          ctx.fillText(l1, 0, currentOffsetY);
        }
        currentOffsetY += 32;
      }

      // Lines 2 & 3: Fixed at 12px scale ratio (~24px canvas)
      if (l2) {
        ctx.font = `800 24px ${state.text.fontFamily}`;
        if (state.text.fontStyle === "Block") {
          ctx.fillText(l2.toUpperCase(), 0, currentOffsetY);
        } else {
          ctx.fillText(l2, 0, currentOffsetY);
        }
        currentOffsetY += 28;
      }

      if (l3) {
        ctx.font = `800 24px ${state.text.fontFamily}`;
        if (state.text.fontStyle === "Block") {
          ctx.fillText(l3.toUpperCase(), 0, currentOffsetY);
        } else {
          ctx.fillText(l3, 0, currentOffsetY);
        }
      }
    }

    ctx.restore();
  }

  // Summary Modal controls
  window.openSummaryModal = function () {
    const canvas = document.getElementById("renderCanvas");
    const previewUrl = canvas.toDataURL("image/png");

    document.getElementById("modalPreviewImg").src = previewUrl;
    document.getElementById("modalProductMeta").textContent = `${state.product.name} - ${state.product.color} (Size: ${state.product.size}, Qty: ${state.product.qty})`;
    document.getElementById("modalCustomizationType").textContent = state.currentMode === "logo" ? `Artwork Upload (${state.artwork.fileName || 'Standard Prototype'})` : `Text Embroidery (${state.text.fontStyle} Typography, ${state.text.swatchName} Thread)`;
    document.getElementById("modalFinishTechnique").textContent = state.currentFinish;
    document.getElementById("modalPlacementLocation").textContent = state.selectedPlacement ? state.selectedPlacement.name : "Standard Zone";

    const modal = document.getElementById("summaryModalOverlay");
    modal.style.display = "grid";
  };

  window.closeSummaryModal = function () {
    const modal = document.getElementById("summaryModalOverlay");
    modal.style.display = "none";
  };

  // Add to Cart Handler
  window.confirmAndAddToCart = function () {
    const canvas = document.getElementById("renderCanvas");
    const previewUrl = canvas.toDataURL("image/png");

    const cartItem = {
      id: "F8-CUST-" + Date.now(),
      sku: state.product.sku,
      name: `${state.product.name} [Customized]`,
      color: state.product.color,
      size: state.product.size,
      qty: state.product.qty,
      price: "Custom Quotation",
      image: previewUrl || state.product.image,
      customization: {
        type: state.currentMode === "logo" ? "Logo Upload" : "Text Embroidery",
        finish: state.currentFinish,
        placement: state.selectedPlacement ? state.selectedPlacement.name : "Default",
        artworkFile: state.currentMode === "logo" ? state.artwork.fileName : "N/A",
        textDetails: state.currentMode === "text" ? {
          line1: state.text.line1,
          line2: state.text.line2,
          line3: state.text.line3,
          font: state.text.fontStyle,
          threadColor: state.text.swatchName
        } : null
      }
    };

    // Push into localStorage cart array
    let currentCart = [];
    try {
      const existing = localStorage.getItem("fabric8_cart") || localStorage.getItem("cart");
      if (existing) currentCart = JSON.parse(existing);
      if (!Array.isArray(currentCart)) currentCart = [];
    } catch (e) {
      currentCart = [];
    }

    currentCart.push(cartItem);

    try {
      localStorage.setItem("fabric8_cart", JSON.stringify(currentCart));
      localStorage.setItem("cart", JSON.stringify(currentCart)); // Legacy support
    } catch (e) {
      console.warn("Failed to update cart in localStorage", e);
    }

    // Non-blocking user feedback
    if (typeof window.showToast === "function") {
      window.showToast("🎉 Customized Prototype added to cart! Redirecting to checkout...", "success");
    }

    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 700);
  };

})();
