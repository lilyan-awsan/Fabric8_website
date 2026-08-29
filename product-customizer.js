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
      image: "assets/products/Polo American Blue 3.png?v=5",
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
      fontFamily: "'Century Gothic', Arial, sans-serif",
      swatchName: "Classic Black",
      swatchHex: "#111111"
    },
    garmentImgObj: null,
    customPos: null,
    scale: 1.0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    posStart: { x: 0, y: 0 }
  };

  function getCartPreviewThumbnail() {
    try {
      const canvas = document.getElementById("renderCanvas");
      if (!canvas) return "";
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 300;
      thumbCanvas.height = 300;
      const tCtx = thumbCanvas.getContext("2d");
      tCtx.drawImage(canvas, 0, 0, 300, 300);
      return thumbCanvas.toDataURL("image/jpeg", 0.85);
    } catch (e) {
      const canvas = document.getElementById("renderCanvas");
      return canvas ? canvas.toDataURL("image/png") : "";
    }
  }

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
  document.addEventListener("DOMContentLoaded", async function () {
    await initializeState();
    setupUI();
    loadGarmentImage();
    renderSwatches();
    syncUIWithState();
  });

  // Sync DOM controls to current state (used when restoring editCartIndex item)
  function syncUIWithState() {
    renderSwatches();
    if (typeof window.switchCustomizerMode === "function") {
      window.switchCustomizerMode(state.currentMode || "logo");
    }
    
    // Sync text inputs
    ["line1", "line2", "line3"].forEach(key => {
      const num = key.replace("line", "");
      const inp = document.getElementById("textLine" + num);
      if (inp) inp.value = state.text[key] || "";
    });

    // Sync font style buttons
    if (state.text.fontStyle) {
      document.querySelectorAll(".font-toggle-grid .font-btn").forEach(btn => {
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText.includes(state.text.fontStyle.toLowerCase())) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    // Sync thread swatches
    if (state.text.swatchName) {
      document.querySelectorAll("#swatchesContainer .thread-swatch").forEach(dot => {
        if (dot.title && dot.title.toLowerCase() === state.text.swatchName.toLowerCase()) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
      const swatchLbl = document.getElementById("selectedSwatchName");
      if (swatchLbl) swatchLbl.textContent = state.text.swatchName;
    }

    // Sync scale UI
    if (state.scale) {
      const scaleInp = document.getElementById("logoScaleInput");
      const scaleVal = document.getElementById("logoScaleValue");
      if (scaleInp) scaleInp.value = Math.round(state.scale * 100);
      if (scaleVal) scaleVal.textContent = `${Math.round(state.scale * 100)}%`;
    }

    // Sync finish
    if (typeof window.selectFinish === "function" && state.currentFinish) {
      window.selectFinish(state.currentFinish);
    }

    drawCanvas();
  }

  // Load customizer state from localStorage or fallback query params
  async function initializeState() {
    let savedState = null;
    try {
      const raw = localStorage.getItem("fabric8_customizer_state");
      if (raw) savedState = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse fabric8_customizer_state", e);
    }

    const params = new URLSearchParams(window.location.search);
    const paramSku = params.get("sku");
    const editIdx = params.get("editCartIndex");

    let targetSku = paramSku;
    if (!targetSku && editIdx !== null) {
      try {
        const rawCart = localStorage.getItem("fabric8QuoteCart") || localStorage.getItem("fabric8_cart") || localStorage.getItem("cart");
        if (rawCart) {
          const parsedCart = JSON.parse(rawCart);
          const cartItem = parsedCart[parseInt(editIdx)];
          if (cartItem && cartItem.sku) targetSku = cartItem.sku;
        }
      } catch (e) {}
    }
    if (!targetSku && savedState && savedState.sku) targetSku = savedState.sku;
    if (!targetSku) targetSku = "F8-001";

    // Fetch full catalog product details from data/products.json
    let catalogProduct = null;
    try {
      const res = await fetch('data/products.json?t=' + Date.now());
      if (res.ok) {
        const catalog = await res.json();
        catalogProduct = catalog.find(p => p.sku === targetSku);
      }
    } catch (err) {
      console.warn("Could not fetch data/products.json in customizer", err);
    }

    if (catalogProduct) {
      state.product.sku = catalogProduct.sku;
      state.product.name = catalogProduct.name;
      state.product.color = catalogProduct.colors ? catalogProduct.colors[0] : "Standard";
      state.product.image = catalogProduct.image || (catalogProduct.images ? catalogProduct.images[0] : "");
      state.product.category = catalogProduct.category || "General";
      state.product.capability = catalogProduct.customizationCapability || catalogProduct.customizationPermissions || "Both";
      if (catalogProduct.placements && catalogProduct.placements.length > 0) {
        state.product.placements = catalogProduct.placements;
      }
    }

    if (savedState && savedState.sku && savedState.sku === targetSku && editIdx === null) {
      state.product = Object.assign(state.product, savedState);
    }

    if (params.get("sku")) state.product.sku = params.get("sku");
    if (params.get("name")) state.product.name = params.get("name");
    if (params.get("color")) state.product.color = params.get("color");
    if (params.get("size")) state.product.size = params.get("size");
    if (params.get("qty")) state.product.qty = parseInt(params.get("qty")) || 50;
    if (params.get("img")) state.product.image = params.get("img");
    if (params.get("cust")) state.product.capability = params.get("cust");

    if (editIdx !== null) {
        try {
          const rawCart = localStorage.getItem("fabric8QuoteCart") || localStorage.getItem("fabric8_cart") || localStorage.getItem("cart");
          if (rawCart) {
            const parsedCart = JSON.parse(rawCart);
            const cartItem = parsedCart[parseInt(editIdx)];
            if (cartItem) {
              state.product.sku = cartItem.sku || state.product.sku;
              state.product.name = (cartItem.name || state.product.name).replace(" [Customized]", "");
              state.product.color = cartItem.color || state.product.color;
              state.product.size = cartItem.size || state.product.size;
              state.product.qty = cartItem.qty || cartItem.quantity || 50;

              // Base garment image MUST be clean garment (never base64 DataURL preview)
              if (cartItem.baseGarmentImage && !cartItem.baseGarmentImage.startsWith("data:")) {
                state.product.baseGarmentImage = cartItem.baseGarmentImage;
                state.product.image = cartItem.baseGarmentImage;
              } else if (cartItem.image && !cartItem.image.startsWith("data:")) {
                state.product.baseGarmentImage = cartItem.image;
                state.product.image = cartItem.image;
              } else if (catalogProduct && catalogProduct.image) {
                state.product.baseGarmentImage = catalogProduct.image;
                state.product.image = catalogProduct.image;
              } else if (params.get("img")) {
                state.product.baseGarmentImage = params.get("img");
                state.product.image = params.get("img");
              }

              // Restore custom logo drag position & scale multiplier
              if (cartItem.customPos) {
                state.customPos = { ...cartItem.customPos };
              }
              if (cartItem.scale) {
                state.scale = cartItem.scale;
              }

              // Restore artwork image if uploaded
              if (cartItem.artworkSrc) {
                state.artwork.src = cartItem.artworkSrc;
                state.artwork.fileName = cartItem.customization?.artworkFile || cartItem.logoData?.fileName || "artwork.png";
                const img = new Image();
                img.onload = () => {
                  state.artwork.rawImage = img;
                  state.artwork.processedImage = img;
                  drawCanvas();
                };
                img.src = cartItem.artworkSrc;
              }

              // Restore text embroidery data if present (from site.js Text Wizard)
              if (cartItem.embroideryData) {
                state.currentMode = "text";
                state.text.line1 = cartItem.embroideryData.textLines?.line1 || "";
                state.text.line2 = cartItem.embroideryData.textLines?.line2 || "";
                state.text.line3 = cartItem.embroideryData.textLines?.line3 || "";
                state.text.fontStyle = cartItem.embroideryData.fontStyle || "Block";
                state.text.swatchName = cartItem.embroideryData.threadColor || "Classic Black";
                const sw = THREAD_SWATCHES.find(s => s.name.toLowerCase() === state.text.swatchName.toLowerCase());
                if (sw) state.text.swatchHex = sw.hex;
              }

              // Restore customization object if present
              if (cartItem.customization) {
                if (cartItem.customization.type === "Text Embroidery" || cartItem.customizationType === "text_embroidery") {
                  state.currentMode = "text";
                  if (cartItem.customization.textDetails) {
                    state.text.line1 = cartItem.customization.textDetails.line1 || state.text.line1;
                    state.text.line2 = cartItem.customization.textDetails.line2 || state.text.line2;
                    state.text.line3 = cartItem.customization.textDetails.line3 || state.text.line3;
                    state.text.fontStyle = cartItem.customization.textDetails.font || state.text.fontStyle;
                    state.text.swatchName = cartItem.customization.textDetails.threadColor || state.text.swatchName;
                    const sw = THREAD_SWATCHES.find(s => s.name.toLowerCase() === state.text.swatchName.toLowerCase());
                    if (sw) state.text.swatchHex = sw.hex;
                  }
                } else {
                  state.currentMode = "logo";
                }
                state.currentFinish = cartItem.customization.finish || "Embroidery";
              }

              if (cartItem.selectedPlacement) {
                state.selectedPlacement = cartItem.selectedPlacement;
              }
            }
          }
        } catch(e) {
          console.warn("Failed loading editCartIndex item", e);
        }
      }

    if (catalogProduct && catalogProduct.images && state.product.color) {
      const matchCol = catalogProduct.images.find(img => img.toLowerCase().includes(state.product.color.toLowerCase()));
      if (matchCol) state.product.image = matchCol;
    }

    function calibratePlacement(p) {
      if (!p || !p.name) return p;
      const lower = p.name.toLowerCase();
      
      // Automatically enforce accurate anatomical placement coordinates on the garment image (scaled 10% smaller)
      if (lower.includes("left hip")) {
        return { ...p, x: 62, y: 26, w: 13.5, h: 13.5, r: 0 };
      } else if (lower.includes("right hip")) {
        return { ...p, x: 38, y: 26, w: 13.5, h: 13.5, r: 0 };
      } else if (lower.includes("left cargo")) {
        return { ...p, x: 65, y: 48, w: 14.4, h: 14.4, r: 0 };
      } else if (lower.includes("right cargo")) {
        return { ...p, x: 35, y: 48, w: 14.4, h: 14.4, r: 0 };
      } else if (lower.includes("front center panel") || (lower.includes("cap") && lower.includes("front"))) {
        return { ...p, x: 55, y: 58, w: 19.8, h: 19.8, r: 3 };
      } else if (lower.includes("side panel") || (lower.includes("cap") && lower.includes("side"))) {
        return { ...p, x: 33, y: 56, w: 14.4, h: 14.4, r: -12 };
      } else if (lower.includes("left chest pocket") || lower.includes("chest pocket")) {
        return { ...p, x: 64, y: 46, w: 14.4, h: 14.4, r: 0 };
      } else if (lower.includes("left chest")) {
        return { ...p, x: 63, y: 44, w: 16.2, h: 16.2, r: 0 };
      } else if (lower.includes("right chest")) {
        return { ...p, x: 37, y: 44, w: 16.2, h: 16.2, r: 0 };
      } else if (lower.includes("back") || lower.includes("center")) {
        return { ...p, x: 50, y: 52, w: 37.8, h: 37.8, r: 0 };
      } else if (lower.includes("left sleeve") || lower.includes("upper sleeve") || (lower.includes("sleeve") && !lower.includes("right"))) {
        return { ...p, x: 76, y: 48, w: 12.6, h: 12.6, r: 8 };
      } else if (lower.includes("right sleeve")) {
        return { ...p, x: 24, y: 48, w: 12.6, h: 12.6, r: -8 };
      } else if (lower.includes("collar") || lower.includes("neck")) {
        return { ...p, x: 50, y: 34, w: 18, h: 10.8, r: 0 };
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
          { name: "Left Hip Pocket", x: 62, y: 26, w: 13.5, h: 13.5, r: 0 },
          { name: "Right Hip Pocket", x: 38, y: 26, w: 13.5, h: 13.5, r: 0 },
          { name: "Left Cargo Pocket / Leg", x: 65, y: 48, w: 14.4, h: 14.4, r: 0 },
          { name: "Right Cargo Pocket / Leg", x: 35, y: 48, w: 14.4, h: 14.4, r: 0 }
        ];
      } else if (cat.includes("head") || name.includes("cap") || name.includes("hat") || name.includes("beanie") || name.includes("beret")) {
        state.product.placements = [
          { name: "Front Center Panel", x: 55, y: 58, w: 19.8, h: 19.8, r: 3 },
          { name: "Side Panel", x: 33, y: 56, w: 14.4, h: 14.4, r: -12 }
        ];
      } else {
        state.product.placements = [
          { name: "Left Chest", x: 63, y: 44, w: 16.2, h: 16.2, r: 0 },
          { name: "Right Chest", x: 37, y: 44, w: 16.2, h: 16.2, r: 0 },
          { name: "Full Back", x: 50, y: 52, w: 37.8, h: 37.8, r: 0 },
          { name: "Upper Sleeve", x: 76, y: 48, w: 12.6, h: 12.6, r: 8 }
        ];
      }
    }

    // Default placement: prioritize "Front" if available
    const frontPlacement = state.product.placements.find(p => p.name && p.name.toLowerCase().includes("front"));
    state.selectedPlacement = frontPlacement || state.product.placements[0];
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

      // If Embroidery is active, prioritize "Front" placement if available
      let defaultIdx = 0;
      if (state.currentFinish === "Embroidery") {
        const frontIdx = displayList.findIndex(p => p.name && p.name.toLowerCase().includes("front"));
        if (frontIdx !== -1) defaultIdx = frontIdx;
      }

      displayList.forEach((p, idx) => {
        const opt = document.createElement("option");
        opt.value = allPlacements.indexOf(p);
        opt.textContent = p.name || "Placement Zone";
        if (idx === defaultIdx && (!state.selectedPlacement || !displayList.find(x => x.name === state.selectedPlacement.name))) {
          opt.selected = true;
          state.selectedPlacement = p;
        } else if (state.selectedPlacement && state.selectedPlacement.name === p.name) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      });

      if (!state.selectedPlacement || !displayList.find(p => p.name === state.selectedPlacement.name)) {
        state.selectedPlacement = displayList[defaultIdx] || displayList[0];
        if (sel.options.length > defaultIdx) sel.options[defaultIdx].selected = true;
      }
    };
    updatePlacementDropdown();

    const selector = document.getElementById("placementSelector");
    if (selector) {
      selector.addEventListener("change", function (e) {
        const idx = parseInt(e.target.value);
        const placements = state.product.placements || [];
        state.selectedPlacement = placements[idx];
        state.customPos = null; // Reset custom drag position when dropdown zone changes
        drawCanvas();
      });
    }

    // Logo upload input listener
    const logoFileInp = document.getElementById("logoFileInput");
    if (logoFileInp) {
      logoFileInp.addEventListener("change", handleLogoUpload);
    }

    // Text inputs listeners
    ["line1", "line2", "line3"].forEach((lineKey, index) => {
      const inp = document.getElementById(`textLine${index + 1}`);
      if (inp) {
        inp.addEventListener("input", (e) => {
          state.text[lineKey] = e.target.value;
          drawCanvas();
        });
      }
    });

    // Logo scale controls setup
    const scaleInput = document.getElementById("logoScaleInput");
    const scaleValText = document.getElementById("logoScaleValue");
    const btnScaleDown = document.getElementById("btnScaleDown");
    const btnScaleUp = document.getElementById("btnScaleUp");

    function updateScale(newVal) {
      const clamped = Math.min(Math.max(40, newVal), 250);
      state.scale = clamped / 100;
      if (scaleInput) scaleInput.value = clamped;
      if (scaleValText) scaleValText.textContent = `${clamped}%`;
      drawCanvas();
    }

    if (scaleInput) {
      scaleInput.addEventListener("input", (e) => updateScale(parseInt(e.target.value) || 100));
    }
    if (btnScaleDown) {
      btnScaleDown.addEventListener("click", () => updateScale(Math.round(state.scale * 100) - 10));
    }
    if (btnScaleUp) {
      btnScaleUp.addEventListener("click", () => updateScale(Math.round(state.scale * 100) + 10));
    }

    // Interactive Drag & Drop + Wheel Resize Canvas Engine
    const canvas = document.getElementById("renderCanvas");
    if (canvas) {
      canvas.style.cursor = "grab";

      function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (canvas.width / rect.width),
          y: (clientY - rect.top) * (canvas.height / rect.height)
        };
      }

      function startDrag(e) {
        const coords = getCanvasCoords(e);
        state.isDragging = true;
        state.dragStart = coords;

        const p = state.selectedPlacement || { x: 50, y: 44 };
        const defaultX = (p.x / 100) * canvas.width;
        const defaultY = (p.y / 100) * canvas.height;

        state.posStart = {
          x: state.customPos ? state.customPos.x : defaultX,
          y: state.customPos ? state.customPos.y : defaultY
        };
        canvas.style.cursor = "grabbing";
      }

      function doDrag(e) {
        if (!state.isDragging) return;
        if (e.cancelable) e.preventDefault();
        const coords = getCanvasCoords(e);
        const dx = coords.x - state.dragStart.x;
        const dy = coords.y - state.dragStart.y;

        state.customPos = {
          x: state.posStart.x + dx,
          y: state.posStart.y + dy
        };
        drawCanvas();
      }

      function stopDrag() {
        state.isDragging = false;
        canvas.style.cursor = "grab";
      }

      canvas.addEventListener("mousedown", startDrag);
      canvas.addEventListener("mousemove", doDrag);
      canvas.addEventListener("mouseup", stopDrag);
      canvas.addEventListener("mouseleave", stopDrag);

      canvas.addEventListener("touchstart", startDrag, { passive: false });
      canvas.addEventListener("touchmove", doDrag, { passive: false });
      canvas.addEventListener("touchend", stopDrag);

      canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 10 : -10;
        updateScale(Math.round(state.scale * 100) + delta);
      }, { passive: false });
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

    if (styleName === "Block") state.text.fontFamily = "'Century Gothic', Arial, sans-serif";
    else if (styleName === "Serif") state.text.fontFamily = "'Times New Roman', Georgia, serif";
    else if (styleName === "Script") state.text.fontFamily = "'Brush Script MT', cursive, sans-serif";

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
      state.artwork.src = e.target.result;
      const img = new Image();
      img.onload = function () {
        state.artwork.rawImage = img;
        state.artwork.processedImage = img;
        drawCanvas();
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
    img.src = state.product.image || "assets/products/Polo American Blue 3.png?v=5";
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
    const defaultAnchorX = (p.x / 100) * w;
    const defaultAnchorY = (p.y / 100) * h;
    const anchorX = state.customPos ? state.customPos.x : defaultAnchorX;
    const anchorY = state.customPos ? state.customPos.y : defaultAnchorY;
    const rotDeg = p.r || 0;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    if (rotDeg !== 0) {
      ctx.rotate((rotDeg * Math.PI) / 180);
    }

    const isLogoMode = state.currentMode === "logo";
    const isTextMode = state.currentMode === "text";
    const isLogoEmpty = isLogoMode && !state.artwork.processedImage;
    const isTextEmpty = isTextMode && !state.text.line1.trim() && !state.text.line2.trim() && !state.text.line3.trim();
    const currentScale = state.scale || 1.0;

    if (isLogoMode && isLogoEmpty) {
      const wPx = ((p.w || 20) / 100) * w;
      const hPx = ((p.h || 20) / 100) * h;

      if (state.sampleLogoImg && state.sampleLogoImg.complete) {
        const sImg = state.sampleLogoImg;
        const aspect = sImg.naturalWidth / sImg.naturalHeight || 1;
        let sW = wPx * 0.8 * currentScale;
        let sH = (sW / aspect);
        if (sH > hPx * 0.7 * currentScale && !state.customPos) {
          sH = hPx * 0.7 * currentScale;
          sW = sH * aspect;
        }
        ctx.drawImage(sImg, -sW / 2, -sH / 2, sW, sH);
      }
    } else if (isLogoMode && state.artwork.processedImage) {
      let targetWRatio = 0.18; // Default chest ~18%
      const pName = p.name ? p.name.toLowerCase() : "";

      if (pName.includes("center") || pName.includes("back") || pName.includes("full") || pName.includes("front center")) {
        targetWRatio = 0.46; // 10" - 12" width
      } else if (pName.includes("sleeve") || pName.includes("cuff") || pName.includes("pocket") || pName.includes("beret")) {
        targetWRatio = 0.13; // 2.5" width
      } else if (pName.includes("chest") || pName.includes("panel")) {
        targetWRatio = 0.19; // 3.5" - 4.0" width
      }

      const logoW = w * targetWRatio * currentScale;
      const aspect = state.artwork.processedImage.height / state.artwork.processedImage.width;
      const logoH = logoW * aspect;

      // Draw centered on anchor
      ctx.drawImage(state.artwork.processedImage, -logoW / 2, -logoH / 2, logoW, logoH);

    } else if (isTextMode) {
      // MODE B: Text Embroidery Workflow - Strict sizing & straight line lock
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;

      ctx.fillStyle = state.text.swatchHex || "#111111";

      const l1 = (state.text.line1 || "").trim();
      const l2 = (state.text.line2 || "").trim();
      const l3 = (state.text.line3 || "").trim();

      if (!l1 && !l2 && !l3) {
        ctx.font = `bold ${Math.round(24 * currentScale)}px 'Century Gothic', Arial, sans-serif`;
        ctx.fillStyle = "rgba(80, 80, 80, 0.55)";
        ctx.fillText("[ YOUR TEXT HERE ]", 0, 0);
      } else {
        let currentOffsetY = 0;
        const fontFam = state.text.fontFamily || "'Century Gothic', Arial, sans-serif";
        if (l1) {
          ctx.font = `900 ${Math.round(28 * currentScale)}px ${fontFam}`;
          ctx.fillText(l1, 0, currentOffsetY);
          currentOffsetY += Math.round(32 * currentScale);
        }

        if (l2) {
          ctx.font = `800 ${Math.round(24 * currentScale)}px ${fontFam}`;
          ctx.fillText(l2, 0, currentOffsetY);
          currentOffsetY += Math.round(28 * currentScale);
        }

        if (l3) {
          ctx.font = `800 ${Math.round(20 * currentScale)}px ${fontFam}`;
          ctx.fillText(l3, 0, currentOffsetY);
        }
      }
    }

    ctx.restore();
  }

  // Summary Modal controls
  window.openSummaryModal = function () {
    drawCanvas();
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
    drawCanvas();
    const previewUrl = getCartPreviewThumbnail();
    const placementName = state.selectedPlacement ? state.selectedPlacement.name : "Default";

    const brandingDesc = state.currentMode === "logo" 
      ? `Custom Logo (${state.currentFinish} on ${placementName})`
      : `Text Embroidery (${state.text.fontStyle} font, ${state.text.swatchName} thread on ${placementName})`;

    // Determine clean base garment image
    let cleanGarment = state.product.baseGarmentImage;
    if (!cleanGarment || cleanGarment.startsWith("data:")) {
      cleanGarment = state.product.image;
    }
    if (!cleanGarment || cleanGarment.startsWith("data:")) {
      cleanGarment = "assets/products/Polo White Front.png?v=5";
    }

    const cartItem = {
      id: "F8-CUST-" + Date.now(),
      sku: state.product.sku,
      name: state.product.name.includes("[Customized]") ? state.product.name : `${state.product.name} [Customized]`,
      color: state.product.color,
      size: state.product.size,
      qty: parseInt(state.product.qty || 50),
      quantity: parseInt(state.product.qty || 50),
      price: "Custom Quotation",
      originStudio: "Product Customizer",
      branding: brandingDesc,
      baseGarmentImage: cleanGarment,
      image: previewUrl || cleanGarment,
      customizedImage: previewUrl || cleanGarment,
      artworkSrc: state.artwork.src || null,
      customPos: state.customPos ? { ...state.customPos } : null,
      scale: state.scale || 1.0,
      selectedPlacement: state.selectedPlacement || null,
      customizationType: state.currentMode === "logo" ? "upload_logo" : "text_embroidery",
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
      },
      embroideryData: state.currentMode === "text" ? {
        type: "embroidery",
        size: state.product.size,
        fontStyle: state.text.fontStyle,
        threadColor: state.text.swatchName,
        lineCount: (state.text.line3 ? 3 : (state.text.line2 ? 2 : 1)),
        selectedStyleSku: "",
        position: placementName,
        textLines: {
          line1: state.text.line1,
          line2: state.text.line2,
          line3: state.text.line3
        }
      } : null,
      logoData: state.currentMode === "logo" ? {
        placement: placementName,
        size: "4",
        finish: state.currentFinish,
        imageSrc: state.artwork.src || previewUrl || ""
      } : null
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

    const editCartIdx = new URLSearchParams(window.location.search).get("editCartIndex");
    if (editCartIdx !== null && !isNaN(parseInt(editCartIdx)) && parseInt(editCartIdx) >= 0 && parseInt(editCartIdx) < currentCart.length) {
      currentCart[parseInt(editCartIdx)] = cartItem;
    } else {
      currentCart.push(cartItem);
    }

    try {
      localStorage.setItem("fabric8QuoteCart", JSON.stringify(currentCart));
      localStorage.setItem("fabric8_cart", JSON.stringify(currentCart));
      localStorage.setItem("cart", JSON.stringify(currentCart)); // Legacy support
    } catch (e) {
      console.warn("Failed to update cart in localStorage", e);
    }

    // Non-blocking user feedback
    if (typeof window.showToast === "function") {
      window.showToast("🎉 Cart item updated successfully! Redirecting to checkout...", "success");
    } else {
      console.log("Customized Prototype added to cart! Redirecting to checkout...");
    }

    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 500);
  };

})();
