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
      image: "assets/products/Polo American Blue 3.jpg?v=2",
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

    function calibratePlacement(p) {
      if (!p || !p.name) return p;
      const lower = p.name.toLowerCase();
      
      // Automatically enforce accurate anatomical placement coordinates on the garment image
      if (lower.includes("left hip")) {
        return { ...p, x: 62, y: 26, w: 15, h: 15, r: 0 };
      } else if (lower.includes("right hip")) {
        return { ...p, x: 38, y: 26, w: 15, h: 15, r: 0 };
      } else if (lower.includes("left cargo")) {
        return { ...p, x: 65, y: 48, w: 16, h: 16, r: 0 };
      } else if (lower.includes("right cargo")) {
        return { ...p, x: 35, y: 48, w: 16, h: 16, r: 0 };
      } else if (lower.includes("front center panel") || (lower.includes("cap") && lower.includes("front"))) {
        return { ...p, x: 55, y: 58, w: 22, h: 22, r: 3 };
      } else if (lower.includes("side panel") || (lower.includes("cap") && lower.includes("side"))) {
        return { ...p, x: 33, y: 56, w: 16, h: 16, r: -12 };
      } else if (lower.includes("left chest pocket") || lower.includes("chest pocket")) {
        return { ...p, x: 64, y: 46, w: 16, h: 16, r: 0 };
      } else if (lower.includes("left chest")) {
        return { ...p, x: 63, y: 44, w: 18, h: 18, r: 0 };
      } else if (lower.includes("right chest")) {
        return { ...p, x: 37, y: 44, w: 18, h: 18, r: 0 };
      } else if (lower.includes("back") || lower.includes("center")) {
        return { ...p, x: 50, y: 52, w: 42, h: 42, r: 0 };
      } else if (lower.includes("left sleeve") || lower.includes("upper sleeve") || (lower.includes("sleeve") && !lower.includes("right"))) {
        return { ...p, x: 76, y: 48, w: 14, h: 14, r: 8 };
      } else if (lower.includes("right sleeve")) {
        return { ...p, x: 24, y: 48, w: 14, h: 14, r: -8 };
      } else if (lower.includes("collar") || lower.includes("neck")) {
        return { ...p, x: 50, y: 34, w: 20, h: 12, r: 0 };
      }
      return p;
    }

    state.product.placements = (state.product.placements || []).map(calibratePlacement);

    // Guarantee default placement options based on garment category or name if none exist in product record
    if (!state.product.placements || state.product.placements.length === 0) {
      const cat = (state.product.category || "").toLowerCase();
      const name = (state.product.name || "").toLowerCase();
      if (cat.includes("bottom") || name.includes("pant") || name.includes("trouser") || name.includes("short") || name.includes("skirt")) {
        state.product.placements = [
          { name: "Left Hip Pocket", x: 62, y: 26, w: 15, h: 15, r: 0 },
          { name: "Right Hip Pocket", x: 38, y: 26, w: 15, h: 15, r: 0 },
          { name: "Left Cargo Pocket / Leg", x: 65, y: 48, w: 16, h: 16, r: 0 },
          { name: "Right Cargo Pocket / Leg", x: 35, y: 48, w: 16, h: 16, r: 0 }
        ];
      } else if (cat.includes("head") || name.includes("cap") || name.includes("hat") || name.includes("beanie") || name.includes("beret")) {
        state.product.placements = [
          { name: "Front Center Panel", x: 55, y: 58, w: 22, h: 22, r: 3 },
          { name: "Side Panel", x: 33, y: 56, w: 16, h: 16, r: -12 }
        ];
      } else {
        state.product.placements = [
          { name: "Left Chest", x: 63, y: 44, w: 18, h: 18, r: 0 },
          { name: "Right Chest", x: 37, y: 44, w: 18, h: 18, r: 0 },
          { name: "Full Back", x: 50, y: 52, w: 42, h: 42, r: 0 },
          { name: "Upper Sleeve", x: 76, y: 48, w: 14, h: 14, r: 8 }
        ];
      }
    }

    state.selectedPlacement = state.product.placements[0];
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

    // Populate Placement Dropdown based on finish technique & product placement matrix
    window.updatePlacementDropdown = function() {
      const sel = document.getElementById("placementSelector");
      if (!sel || !state.product) return;
      sel.innerHTML = "";
      const allPlacements = state.product.placements || [];
      const allowedNames = state.currentFinish === "DTF" 
        ? (state.product.dtfPlacements || allPlacements.map(p => p.name))
        : (state.product.embroideryPlacements || allPlacements.map(p => p.name));

      const validPlacements = allPlacements.filter(p => allowedNames.includes(p.name));
      const displayList = validPlacements.length > 0 ? validPlacements : allPlacements;

      displayList.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = allPlacements.indexOf(p);
        opt.textContent = p.name || "Placement Zone";
        if (state.selectedPlacement && state.selectedPlacement.name === p.name) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      });

      if (!state.selectedPlacement || !displayList.find(p => p.name === state.selectedPlacement.name)) {
        state.selectedPlacement = displayList[0];
        if (sel.options.length > 0) sel.options[0].selected = true;
      }
    };
    updatePlacementDropdown();

    const selector = document.getElementById("placementSelector");
    if (selector) {
      selector.addEventListener("change", function (e) {
        const idx = parseInt(e.target.value);
        const placements = state.product.placements || [];
        state.selectedPlacement = placements[idx];
        drawCanvas();
      });
    }

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

    // Interactive Canvas Drag & Drop positioning
    const canvas = document.getElementById("renderCanvas");
    let isDragging = false;

    function handleDragStart(e) {
      if (!state.selectedPlacement) return;
      isDragging = true;
      canvas.style.cursor = "grabbing";
      updatePositionFromEvent(e);
    }

    function handleDragMove(e) {
      if (!isDragging || !state.selectedPlacement) return;
      updatePositionFromEvent(e);
    }

    function handleDragEnd() {
      isDragging = false;
      if (canvas) canvas.style.cursor = "grab";
    }

    function updatePositionFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      state.selectedPlacement.x = Math.max(10, Math.min(90, x));
      state.selectedPlacement.y = Math.max(10, Math.min(90, y));
      drawCanvas();
    }

    if (canvas) {
      canvas.style.cursor = "grab";
      canvas.addEventListener("mousedown", handleDragStart);
      canvas.addEventListener("mousemove", handleDragMove);
      canvas.addEventListener("mouseup", handleDragEnd);
      canvas.addEventListener("mouseleave", handleDragEnd);

      canvas.addEventListener("touchstart", handleDragStart, { passive: true });
      canvas.addEventListener("touchmove", handleDragMove, { passive: true });
      canvas.addEventListener("touchend", handleDragEnd);
    }
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
    if (typeof window.updatePlacementDropdown === "function") window.updatePlacementDropdown();
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

  // Universal Auto-Background Removal Engine: Detects and strips any solid, white, off-white, or neutral box background
  function removeWhiteBackground(img, callback) {
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");
    const W = img.width;
    const H = img.height;
    offCanvas.width = W;
    offCanvas.height = H;

    offCtx.drawImage(img, 0, 0);
    const imgData = offCtx.getImageData(0, 0, W, H);
    const data = imgData.data;

    // Sample primary background reference colors from the image corners
    const tlR = data[0], tlG = data[1], tlB = data[2];
    const trIdx = (W - 1) * 4;
    const trR = data[trIdx], trG = data[trIdx + 1], trB = data[trIdx + 2];
    const blIdx = ((H - 1) * W) * 4;
    const blR = data[blIdx], blG = data[blIdx + 1], blB = data[blIdx + 2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 1. Detect any light-neutral/off-white/cream/grey screenshot box background
      const isNeutralLight = (r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35 && Math.abs(r - b) < 35);

      // 2. Calculate Euclidean color distance to the perimeter corner background colors
      const distTL = Math.hypot(r - tlR, g - tlG, b - tlB);
      const distTR = Math.hypot(r - trR, g - trG, b - trB);
      const distBL = Math.hypot(r - blR, g - blG, b - blB);

      // If the pixel matches any corner background color within tolerance, or is neutral light grey/white, remove it!
      if (isNeutralLight || distTL < 55 || distTR < 55 || distBL < 55) {
        data[i + 3] = 0; // Turn alpha to transparent
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    const resultImg = new Image();
    resultImg.onload = function () {
      callback(resultImg);
    };
    resultImg.src = offCanvas.toDataURL("image/png");
  }

  function loadGarmentImage() {
    state.sampleLogoImg = new Image();
    state.sampleLogoImg.crossOrigin = "anonymous";
    state.sampleLogoImg.onload = function() { drawCanvas(); };
    const pColor = (state.product.color || "").toLowerCase();
    if (pColor.includes("navy") || pColor.includes("black") || pColor.includes("dark") || pColor.includes("charcoal")) {
      state.sampleLogoImg.src = "assets/fabric8_logo_white.png";
    } else {
      state.sampleLogoImg.src = "assets/fabric8_logo_noneedle_cropped.png";
    }

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
    img.src = state.product.image || "assets/products/Polo American Blue 3.jpg?v=2";
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

    const isLogoEmpty = state.currentMode === "logo" && !state.artwork.processedImage;
    const isTextEmpty = state.currentMode === "text" && !state.text.line1.trim() && !state.text.line2.trim() && !state.text.line3.trim();

    if (isLogoEmpty || isTextEmpty) {
      const wPx = ((p.w || 20) / 100) * w;
      const hPx = ((p.h || 20) / 100) * h;
      ctx.strokeStyle = "#3e8e42";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(-wPx / 2, -hPx / 2, wPx, hPx);

      if (isLogoEmpty && state.sampleLogoImg && state.sampleLogoImg.complete) {
        const sImg = state.sampleLogoImg;
        const aspect = sImg.naturalWidth / sImg.naturalHeight || 1;
        let sW = wPx * 0.8;
        let sH = sW / aspect;
        if (sH > hPx * 0.7) {
          sH = hPx * 0.7;
          sW = sH * aspect;
        }
        ctx.drawImage(sImg, -sW / 2, -sH / 2, sW, sH);

        ctx.fillStyle = "#3e8e42";
        ctx.font = "bold 11px 'Century Gothic', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📍 BRANDING ZONE (SAMPLE LOGO)", 0, hPx / 2 + 16);
      } else {
        ctx.fillStyle = "#3e8e42";
        ctx.font = "bold 13px 'Century Gothic', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📍 BRANDING ZONE", 0, 0);
      }
    } else if (state.currentMode === "logo" && state.artwork.processedImage) {
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

  window.confirmAndAddToCart = function () {
    const canvas = document.getElementById("renderCanvas");
    const previewUrl = canvas.toDataURL("image/png");
    const placementName = state.selectedPlacement ? state.selectedPlacement.name : "Default";

    const brandingDesc = state.currentMode === "logo" 
      ? `Custom Logo (${state.currentFinish} on ${placementName})`
      : `Text Embroidery (${state.text.fontStyle} font, ${state.text.swatchName} thread on ${placementName})`;

    const cartItem = {
      id: "F8-CUST-" + Date.now(),
      sku: state.product.sku,
      name: `${state.product.name} [Customized]`,
      color: state.product.color,
      size: state.product.size,
      qty: parseInt(state.product.qty || 50),
      quantity: parseInt(state.product.qty || 50),
      price: "Custom Quotation",
      branding: brandingDesc,
      image: previewUrl || state.product.image,
      customization: {
        type: state.currentMode === "logo" ? "Logo Upload" : "Text Embroidery",
        finish: state.currentFinish,
        placement: placementName,
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

    // Push into localStorage cart array (syncing across fabric8QuoteCart, fabric8_cart, and legacy cart)
    let currentCart = [];
    try {
      const existing = localStorage.getItem("fabric8QuoteCart") || localStorage.getItem("fabric8_cart") || localStorage.getItem("cart");
      if (existing) currentCart = JSON.parse(existing);
      if (!Array.isArray(currentCart)) currentCart = [];
    } catch (e) {
      currentCart = [];
    }

    currentCart.push(cartItem);

    try {
      localStorage.setItem("fabric8QuoteCart", JSON.stringify(currentCart));
      localStorage.setItem("fabric8_cart", JSON.stringify(currentCart));
      localStorage.setItem("cart", JSON.stringify(currentCart)); // Legacy support
    } catch (e) {
      console.warn("Failed to update cart in localStorage", e);
    }

    // Non-blocking user feedback
    if (typeof window.showToast === "function") {
      window.showToast("🎉 Customized Prototype added to cart! Redirecting to checkout...", "success");
    } else {
      console.log("Customized Prototype added to cart! Redirecting to checkout...");
    }

    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 600);
  };

})();
