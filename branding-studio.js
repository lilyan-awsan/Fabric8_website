/**
 * Fabric8 Standalone Branding Discovery Studio Engine
 * Provides interactive logo & text customization across prototype garments with size selection.
 */
(function() {
  "use strict";

  const THREAD_SWATCHES = [
    { name: "Classic Black", hex: "#111111" },
    { name: "Pure White", hex: "#ffffff" },
    { name: "Royal Navy", hex: "#1b263b" },
    { name: "Industrial Charcoal", hex: "#3f4244" },
    { name: "Crimson Red", hex: "#85144b" },
    { name: "Forest Green", hex: "#28532f" },
    { name: "Metallic Gold", hex: "#d4af37" },
    { name: "Sterling Silver", hex: "#a7a7a7" }
  ];

  // Central State Engine
  const state = {
    product: {
      sku: "F8-PROTO-POLO",
      name: "Corporate Dri-Fit Polo",
      color: "White",
      size: "Standard Spec (Assorted M/L/XL)",
      qty: 50,
      image: "assets/products/Polo White Front.jpg",
      placements: [
        { name: "Left Chest", x: 63, y: 44, w: 18, h: 18, r: 0 },
        { name: "Right Chest", x: 37, y: 44, w: 18, h: 18, r: 0 },
        { name: "Full Back / Center Front", x: 50, y: 52, w: 42, h: 42, r: 0 },
        { name: "Upper Sleeve", x: 76, y: 48, w: 14, h: 14, r: 8 }
      ]
    },
    selectedPlacement: null,
    currentMode: "logo",
    currentFinish: "Thread Embroidery",
    artwork: {
      imageObj: null,
      sampleImg: null,
      fileName: "",
      x: 63,
      y: 44,
      scale: 1,
      rotation: 0
    },
    text: {
      line1: "FABRIC 8 ATELIER",
      line2: "",
      line3: "",
      fontStyle: "'Acumin Variable Concept', system-ui, sans-serif",
      swatchName: "Classic Black",
      swatchHex: "#111111",
      x: 63,
      y: 44
    },
    canvas: {
      ctx: null,
      baseImage: null,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    state.selectedPlacement = state.product.placements[0];
    initCanvas();
    buildThreadSwatches();
    setupEventListeners();
    setupGarmentSwitcher();
    initializeBrandingStudioParams();
    renderPlacementOptions();
    syncStudioUIWithState();
    drawCanvas();
  });

  function syncStudioUIWithState() {
    const btnLogo = document.getElementById("tabLogoBtn");
    const btnText = document.getElementById("tabTextBtn");
    const panelLogo = document.getElementById("panelLogoUpload");
    const panelText = document.getElementById("panelTextEmbroidery");
    if (state.currentMode === "text") {
      if (btnLogo) btnLogo.classList.remove("active");
      if (btnText) btnText.classList.add("active");
      if (panelLogo) panelLogo.style.display = "none";
      if (panelText) panelText.style.display = "block";
    } else {
      if (btnLogo) btnLogo.classList.add("active");
      if (btnText) btnText.classList.remove("active");
      if (panelLogo) panelLogo.style.display = "block";
      if (panelText) panelText.style.display = "none";
    }

    ["line1", "line2", "line3"].forEach(key => {
      const num = key.replace("line", "");
      const inp = document.getElementById("textLine" + num);
      if (inp) inp.value = state.text[key] || "";
    });

    if (state.text.fontStyle) {
      document.querySelectorAll(".font-btn").forEach(btn => {
        if (btn.dataset.font === state.text.fontStyle || btn.textContent.trim().toLowerCase().includes(state.text.fontStyle.toLowerCase())) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    if (state.text.swatchName) {
      document.querySelectorAll(".thread-swatch").forEach(dot => {
        if (dot.dataset.swatchName === state.text.swatchName || dot.title === state.text.swatchName) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    const sizeSel = document.getElementById("sizeSelector");
    if (sizeSel && state.product.size) sizeSel.value = state.product.size;

    const qtyInp = document.getElementById("qtyInput");
    if (qtyInp && state.product.qty) qtyInp.value = state.product.qty;

    if (state.artwork.scale) {
      const scaleInp = document.getElementById("logoScaleInput");
      const scaleVal = document.getElementById("logoScaleValue");
      if (scaleInp) scaleInp.value = Math.round(state.artwork.scale * 100);
      if (scaleVal) scaleVal.textContent = `${Math.round(state.artwork.scale * 100)}%`;
    }

    drawCanvas();
  }

  function initializeBrandingStudioParams() {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get("sku");
    const color = params.get("color");
    const size = params.get("size");
    const qty = params.get("qty");
    const editIdx = params.get("editCartIndex");

    if (editIdx !== null) {
      try {
        const rawCart = localStorage.getItem("fabric8QuoteCart") || localStorage.getItem("fabric8_cart") || localStorage.getItem("cart");
        if (rawCart) {
          const parsedCart = JSON.parse(rawCart);
          const cartItem = parsedCart[parseInt(editIdx)];
          if (cartItem) {
            if (cartItem.sku) state.product.sku = cartItem.sku;
            if (cartItem.name) state.product.name = cartItem.name;
            if (cartItem.color) state.product.color = cartItem.color;
            if (cartItem.size) state.product.size = cartItem.size;
            if (cartItem.quantity || cartItem.qty) state.product.qty = cartItem.quantity || cartItem.qty;
            
            if (cartItem.baseGarmentImage && !cartItem.baseGarmentImage.startsWith("data:")) {
              state.product.baseGarmentImage = cartItem.baseGarmentImage;
              state.product.image = cartItem.baseGarmentImage;
            } else if (cartItem.image && !cartItem.image.startsWith("data:")) {
              state.product.baseGarmentImage = cartItem.image;
              state.product.image = cartItem.image;
            }
            if (cartItem.customPos) {
              state.artwork.x = cartItem.customPos.x;
              state.artwork.y = cartItem.customPos.y;
              state.text.x = cartItem.customPos.x;
              state.text.y = cartItem.customPos.y;
            }
            if (cartItem.scale) {
              state.artwork.scale = cartItem.scale;
            }
            if (cartItem.artworkSrc) {
              state.artwork.src = cartItem.artworkSrc;
              state.artwork.fileName = cartItem.customization?.artworkFile || cartItem.logoData?.fileName || "artwork.png";
              const img = new Image();
              img.onload = () => {
                state.artwork.imageObj = img;
                drawCanvas();
              };
              img.src = cartItem.artworkSrc;
            }

            if (cartItem.embroideryData) {
              state.currentMode = "text";
              state.text.line1 = cartItem.embroideryData.textLines?.line1 || "";
              state.text.line2 = cartItem.embroideryData.textLines?.line2 || "";
              state.text.line3 = cartItem.embroideryData.textLines?.line3 || "";
              state.text.fontStyle = cartItem.embroideryData.fontStyle || "Block";
              state.text.swatchName = cartItem.embroideryData.threadColor || "Classic Black";
            }

            if (cartItem.customization) {
              if (cartItem.customization.type === "Text Embroidery" || cartItem.customizationType === "text_embroidery") {
                state.currentMode = "text";
                if (cartItem.customization.textDetails) {
                  state.text.line1 = cartItem.customization.textDetails.line1 || state.text.line1;
                  state.text.line2 = cartItem.customization.textDetails.line2 || state.text.line2;
                  state.text.line3 = cartItem.customization.textDetails.line3 || state.text.line3;
                  state.text.fontStyle = cartItem.customization.textDetails.font || state.text.fontStyle;
                  state.text.swatchName = cartItem.customization.textDetails.threadColor || state.text.swatchName;
                }
              } else {
                state.currentMode = "logo";
              }
              state.currentFinish = cartItem.customization.finish || "Embroidery";
            }
          }
        }
      } catch(e) {
        console.warn("Error reading editCartIndex in branding studio", e);
      }

      const submitBtn = document.getElementById("mainAddToCartBtn");
      if (submitBtn) submitBtn.textContent = "UPDATE CART ITEM";
      const confirmBtn = document.getElementById("confirmAddToCartBtn");
      if (confirmBtn) confirmBtn.textContent = "SAVE & UPDATE CART ITEM";
    } else {
      if (sku) {
        state.product.sku = sku;
        const loadCatalogItem = (catalog) => {
          if (!Array.isArray(catalog)) return;
          const item = catalog.find(p => p.sku === sku);
          if (item) {
            state.product.name = item.name;
            if (!color && item.colors && item.colors.length > 0) state.product.color = item.colors[0];
            if (item.image) state.product.image = item.image;
            const nameEl = document.getElementById("headerProdName");
            const imgEl = document.getElementById("headerProdImg");
            if (nameEl) nameEl.textContent = state.product.name;
            if (imgEl && state.product.image) imgEl.src = state.product.image;
          }
        };

        try {
          const cached = localStorage.getItem("fabric8_products_cache");
          if (cached) loadCatalogItem(JSON.parse(cached));
        } catch (e) {}

        fetch('data/products.json?t=' + Date.now()).then(r => r.json()).then(catalog => {
          loadCatalogItem(catalog);
        }).catch(e => console.warn(e));
      }
      if (params.get("name")) state.product.name = params.get("name");
      if (params.get("img")) state.product.image = params.get("img");
      if (color) state.product.color = color;
      if (size) state.product.size = size;
      if (qty) state.product.qty = parseInt(qty) || 50;
    }

    const garmentBtns = document.querySelectorAll(".garment-btn");
    garmentBtns.forEach(btn => {
      if (btn.dataset.sku === state.product.sku || btn.dataset.color === state.product.color) {
        garmentBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (btn.dataset.name) state.product.name = btn.dataset.name;
        if (btn.dataset.img) state.product.image = btn.dataset.img;
      }
    });

    const nameEl = document.getElementById("headerProdName");
    const imgEl = document.getElementById("headerProdImg");
    const skuEl = document.getElementById("headerProdSku");
    const colorEl = document.getElementById("headerProdColor");
    const sizeEl = document.getElementById("headerProdSize");
    const qtyEl = document.getElementById("headerProdQty");

    if (nameEl) nameEl.textContent = state.product.name;
    if (imgEl && state.product.image) imgEl.src = state.product.image;
    if (skuEl) skuEl.textContent = `SKU: ${state.product.sku}`;
    if (colorEl) colorEl.textContent = `Color: ${state.product.color}`;
    if (sizeEl && state.product.size) sizeEl.textContent = `Size: ${state.product.size}`;
    if (qtyEl && state.product.qty) qtyEl.textContent = `Qty: ${state.product.qty} Pcs`;
  }

  function setupGarmentSwitcher() {
    const garmentBtns = document.querySelectorAll(".garment-btn");
    garmentBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        garmentBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const protoType = btn.dataset.proto;
        state.product.sku = btn.dataset.sku;
        state.product.name = btn.dataset.name;
        state.product.color = btn.dataset.color;
        state.product.image = btn.dataset.img;

        // Update top header badges
        document.getElementById("headerProdName").textContent = state.product.name;
        document.getElementById("headerProdImg").src = state.product.image;
        document.getElementById("headerProdSku").textContent = `SKU: ${state.product.sku}`;
        document.getElementById("headerProdColor").textContent = `Color: ${state.product.color}`;

        if (state.artwork.sampleImg) {
          if (protoType === "cap" || protoType === "scrub") {
            state.artwork.sampleImg.src = "assets/fabric8_logo_white.png";
          } else {
            state.artwork.sampleImg.src = "assets/fabric8_logo_noneedle_cropped.png";
          }
        }

        // Recalibrate placement zones based on garment category
        if (protoType === "cap") {
          state.product.placements = [
            { name: "Front Center Panel", x: 55, y: 58, w: 22, h: 22, r: 3 },
            { name: "Side Panel", x: 33, y: 56, w: 16, h: 16, r: -12 }
          ];
        } else if (protoType === "chef") {
          state.product.placements = [
            { name: "Left Chest Pocket", x: 64, y: 46, w: 16, h: 16, r: 0 },
            { name: "Right Collar / Collar Tip", x: 44, y: 36, w: 12, h: 12, r: 0 },
            { name: "Full Back", x: 50, y: 52, w: 42, h: 42, r: 0 }
          ];
        } else {
          state.product.placements = [
            { name: "Left Chest", x: 63, y: 44, w: 18, h: 18, r: 0 },
            { name: "Right Chest", x: 37, y: 44, w: 18, h: 18, r: 0 },
            { name: "Full Back / Center Front", x: 50, y: 52, w: 42, h: 42, r: 0 },
            { name: "Upper Sleeve", x: 76, y: 48, w: 14, h: 14, r: 8 }
          ];
        }

        state.selectedPlacement = state.product.placements[0];
        state.artwork.x = state.selectedPlacement.x;
        state.artwork.y = state.selectedPlacement.y;
        state.artwork.rotation = state.selectedPlacement.r || 0;
        state.text.x = state.selectedPlacement.x;
        state.text.y = state.selectedPlacement.y;

        renderPlacementOptions();
        loadBaseImage();
      });
    });
  }

  function buildThreadSwatches() {
    const container = document.getElementById("swatchesContainer");
    if (!container) return;
    container.innerHTML = "";

    THREAD_SWATCHES.forEach((swatch, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thread-swatch" + (index === 0 ? " active" : "");
      btn.style.backgroundColor = swatch.hex;
      if (swatch.hex.toLowerCase() === "#ffffff") {
        btn.style.borderColor = "#cccccc";
      }
      btn.title = swatch.name;

      btn.addEventListener("click", () => {
        container.querySelectorAll(".thread-swatch").forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        state.text.swatchName = swatch.name;
        state.text.swatchHex = swatch.hex;
        const lbl = document.getElementById("selectedSwatchName");
        if (lbl) lbl.textContent = swatch.name;
        drawCanvas();
      });

      container.appendChild(btn);
    });
  }

  function renderPlacementOptions() {
    const sel = document.getElementById("placementSelector");
    if (!sel || !state.product) return;
    sel.innerHTML = "";
    const allPlacements = state.product.placements || [];
    const isDtf = (state.currentFinish || "").toLowerCase().includes("dtf");
    const allowedNames = isDtf 
      ? (state.product.dtfPlacements || allPlacements.map(p => p.name))
      : (state.product.embroideryPlacements || allPlacements.map(p => p.name));

    const validPlacements = allPlacements.filter(p => allowedNames.includes(p.name));
    const displayList = validPlacements.length > 0 ? validPlacements : allPlacements;

    // Prioritize "Front" placement if available for Embroidery
    let defaultIdx = 0;
    if (!isDtf) {
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
      sel.selectedIndex = defaultIdx;
      state.selectedPlacement = allPlacements[parseInt(sel.value)] || displayList[defaultIdx] || displayList[0];
    }
  }

  function initCanvas() {
    const canvasEl = document.getElementById("renderCanvas");
    if (!canvasEl) return;
    state.canvas.ctx = canvasEl.getContext("2d");

    canvasEl.addEventListener("mousedown", handleMouseDown);
    canvasEl.addEventListener("mousemove", handleMouseMove);
    canvasEl.addEventListener("mouseup", handleMouseUp);
    canvasEl.addEventListener("mouseleave", handleMouseUp);
    canvasEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvasEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasEl.addEventListener("touchend", handleMouseUp);

    state.artwork.sampleImg = new Image();
    state.artwork.sampleImg.onload = drawCanvas;
    state.artwork.sampleImg.src = "assets/fabric8_logo_noneedle_cropped.png";

    loadBaseImage();
  }

  function loadBaseImage() {
    state.canvas.baseImage = new Image();
    if (state.product.image && state.product.image.startsWith("http") && !state.product.image.includes(window.location.hostname)) {
      state.canvas.baseImage.crossOrigin = "anonymous";
    }
    state.canvas.baseImage.onload = drawCanvas;
    state.canvas.baseImage.onerror = () => {
      console.warn("Could not load base image:", state.product.image);
      drawCanvas();
    };
    state.canvas.baseImage.src = state.product.image;
  }

  function drawCanvas() {
    const ctx = state.canvas.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, 800, 800);

    // Draw background garment image proportionally
    if (state.canvas.baseImage && state.canvas.baseImage.complete) {
      const img = state.canvas.baseImage;
      const canvasW = 800;
      const canvasH = 800;
      const ratio = Math.min(canvasW / img.width, canvasH / img.height);
      const newW = img.width * ratio;
      const newH = img.height * ratio;
      const offsetX = (canvasW - newW) / 2;
      const offsetY = (canvasH - newH) / 2;
      ctx.drawImage(img, offsetX, offsetY, newW, newH);
    } else {
      ctx.fillStyle = "#f0efe9";
      ctx.fillRect(0, 0, 800, 800);
      ctx.fillStyle = "#888";
      ctx.font = "bold 20px Century Gothic";
      ctx.fillText("Loading Prototype Garment...", 260, 400);
    }

    if (state.currentMode === "logo") {
      drawLogo();
    } else {
      drawText();
    }
  }

  function drawLogo() {
    const ctx = state.canvas.ctx;
    const img = state.artwork.imageObj;
    if (!img) {
      drawPlacementGuide(true);
      return;
    }

    const xPx = (state.artwork.x / 100) * 800;
    const yPx = (state.artwork.y / 100) * 800;
    const boxW = ((state.selectedPlacement ? state.selectedPlacement.w : 20) / 100) * 800 * 0.9;
    const aspect = img.naturalWidth / img.naturalHeight || 1;
    let drawW = boxW * state.artwork.scale;
    let drawH = drawW / aspect;

    ctx.save();
    ctx.translate(xPx, yPx);
    ctx.rotate((state.artwork.rotation * Math.PI) / 180);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  function drawText() {
    const ctx = state.canvas.ctx;
    const l1 = (state.text.line1 || "").trim();
    const l2 = (state.text.line2 || "").trim();
    const l3 = (state.text.line3 || "").trim();

    if (!l1 && !l2 && !l3) {
      drawPlacementGuide(false);
      return;
    }

    const xPx = (state.text.x / 100) * 800;
    const yPx = (state.text.y / 100) * 800;

    ctx.save();
    ctx.translate(xPx, yPx);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = state.text.swatchHex || "#111111";

    let currentOffsetY = -30;
    if (l1) {
      ctx.font = `900 28px ${state.text.fontStyle || "'Century Gothic', sans-serif"}`;
      ctx.fillText(l1, 0, currentOffsetY);
      currentOffsetY += 32;
    }
    if (l2) {
      ctx.font = `800 24px ${state.text.fontStyle || "'Century Gothic', sans-serif"}`;
      ctx.fillText(l2, 0, currentOffsetY);
      currentOffsetY += 26;
    }
    if (l3) {
      ctx.font = `800 20px ${state.text.fontStyle || "'Century Gothic', sans-serif"}`;
      ctx.fillText(l3, 0, currentOffsetY);
    }

    ctx.restore();
  }

  function drawPlacementGuide(withSampleLogo) {
    const ctx = state.canvas.ctx;
    if (!state.selectedPlacement) return;

    const xPx = (state.selectedPlacement.x / 100) * 800;
    const yPx = (state.selectedPlacement.y / 100) * 800;
    const wPx = (state.selectedPlacement.w / 100) * 800 * 0.9;
    const hPx = (state.selectedPlacement.h / 100) * 800 * 0.9;

    ctx.save();
    ctx.translate(xPx, yPx);
    ctx.rotate(((state.selectedPlacement.r || 0) * Math.PI) / 180);

    if (withSampleLogo && state.artwork.sampleImg && state.artwork.sampleImg.complete) {
      const sImg = state.artwork.sampleImg;
      const aspect = sImg.naturalWidth / sImg.naturalHeight || 1;
      let sW = wPx * 0.8 * (state.artwork.scale || 1);
      let sH = sW / aspect;
      if (sH > hPx * 0.7 * (state.artwork.scale || 1)) {
        sH = hPx * 0.7 * (state.artwork.scale || 1);
        sW = sH * aspect;
      }
      ctx.drawImage(sImg, -sW / 2, -sH / 2, sW, sH);
    }

    ctx.restore();
  }

  // Interaction handlers
  function getCanvasCoords(clientX, clientY) {
    const el = document.getElementById("renderCanvas");
    const rect = el.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 800 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  let dragStartX = 0;
  let dragStartY = 0;
  let startArtX = 0;
  let startArtY = 0;
  let startTextX = 0;
  let startTextY = 0;

  function handleMouseDown(e) {
    e.preventDefault();
    const pos = getCanvasCoords(e.clientX, e.clientY);
    startDrag(pos.x, pos.y);
  }

  function handleMouseMove(e) {
    if (!state.canvas.isDragging) return;
    const pos = getCanvasCoords(e.clientX, e.clientY);
    dragTo(pos.x, pos.y);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      const pos = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      startDrag(pos.x, pos.y);
    }
  }

  function handleTouchMove(e) {
    if (!state.canvas.isDragging) return;
    e.preventDefault();
    const pos = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    dragTo(pos.x, pos.y);
  }

  function startDrag(xPx, yPx) {
    state.canvas.isDragging = true;
    dragStartX = xPx;
    dragStartY = yPx;
    startArtX = state.artwork.x;
    startArtY = state.artwork.y;
    startTextX = state.text.x;
    startTextY = state.text.y;
    const canvasEl = document.getElementById("renderCanvas");
    if (canvasEl) canvasEl.style.cursor = "grabbing";
  }

  function dragTo(xPx, yPx) {
    if (!state.canvas.isDragging) return;
    const dxPct = ((xPx - dragStartX) / 800) * 100;
    const dyPct = ((yPx - dragStartY) / 800) * 100;

    state.artwork.x = startArtX + dxPct;
    state.artwork.y = startArtY + dyPct;
    state.text.x = startTextX + dxPct;
    state.text.y = startTextY + dyPct;

    drawCanvas();
  }

  function handleMouseUp() {
    state.canvas.isDragging = false;
    const canvasEl = document.getElementById("renderCanvas");
    if (canvasEl) canvasEl.style.cursor = "grab";
  }

  function setupEventListeners() {
    // Size & Quantity listeners
    const sizeSel = document.getElementById("sizeSelector");
    const qtyInp = document.getElementById("qtyInput");
    if (sizeSel) {
      sizeSel.addEventListener("change", (e) => {
        state.product.size = e.target.value;
        const sizeBadge = document.getElementById("headerProdSize");
        if (sizeBadge) sizeBadge.textContent = `Size: ${state.product.size}`;
      });
    }
    if (qtyInp) {
      qtyInp.addEventListener("input", (e) => {
        let val = parseInt(e.target.value) || 50;
        state.product.qty = val;
        const qtyBadge = document.getElementById("headerProdQty");
        if (qtyBadge) qtyBadge.textContent = `Qty: ${val} Pcs`;
      });
    }

    // Logo scale controls setup
    const scaleInput = document.getElementById("logoScaleInput");
    const scaleValText = document.getElementById("logoScaleValue");
    const btnScaleDown = document.getElementById("btnScaleDown");
    const btnScaleUp = document.getElementById("btnScaleUp");

    function updateStudioScale(val) {
      const clampedScale = Math.min(Math.max(0.4, val), 2.5);
      state.artwork.scale = clampedScale;
      const pct = Math.round(clampedScale * 100);
      if (scaleInput) scaleInput.value = pct;
      if (scaleValText) scaleValText.textContent = `${pct}%`;
      drawCanvas();
    }

    if (scaleInput) {
      scaleInput.addEventListener("input", (e) => updateStudioScale(parseFloat(e.target.value) / 100));
    }
    if (btnScaleDown) {
      btnScaleDown.addEventListener("click", () => updateStudioScale((state.artwork.scale || 1.0) - 0.1));
    }
    if (btnScaleUp) {
      btnScaleUp.addEventListener("click", () => updateStudioScale((state.artwork.scale || 1.0) + 0.1));
    }

    // Mode switcher
    const btnLogo = document.getElementById("tabLogoBtn");
    const btnText = document.getElementById("tabTextBtn");
    const pLogo = document.getElementById("panelLogoUpload");
    const pText = document.getElementById("panelTextEmbroidery");

    if (btnLogo && btnText) {
      btnLogo.addEventListener("click", () => {
        btnLogo.classList.add("active");
        btnText.classList.remove("active");
        pLogo.style.display = "block";
        pText.style.display = "none";
        state.currentMode = "logo";
        drawCanvas();
      });

      btnText.addEventListener("click", () => {
        btnText.classList.add("active");
        btnLogo.classList.remove("active");
        pText.style.display = "block";
        pLogo.style.display = "none";
        state.currentMode = "text";
        drawCanvas();
      });
    }

    // Placement selector
    const placeSel = document.getElementById("placementSelector");
    if (placeSel) {
      placeSel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.value) || 0;
        state.selectedPlacement = state.product.placements[idx];
        if (state.selectedPlacement) {
          state.artwork.x = state.selectedPlacement.x;
          state.artwork.y = state.selectedPlacement.y;
          state.artwork.rotation = state.selectedPlacement.r || 0;
          state.text.x = state.selectedPlacement.x;
          state.text.y = state.selectedPlacement.y;
          drawCanvas();
        }
      });
    }

    // Logo Upload
    const logoInp = document.getElementById("logoFileInput");
    if (logoInp) {
      logoInp.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleFileRead(file);
      });
    }

    function handleFileRead(file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        state.artwork.src = evt.target.result;
        const img = new Image();
        img.onload = () => {
          state.artwork.imageObj = img;
          state.artwork.fileName = file.name;
          const statusEl = document.getElementById("fileStatus");
          if (statusEl) {
            statusEl.style.display = "block";
            document.getElementById("fileName").textContent = file.name;
          }
          drawCanvas();
        };
        img.src = evt.target.result;
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

    // Finish selection
    document.querySelectorAll(".toggle-btn").forEach(opt => {
      opt.addEventListener("click", () => {
        document.querySelectorAll(".toggle-btn").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        state.currentFinish = opt.dataset.finish || opt.textContent.trim();
        renderPlacementOptions();
        drawCanvas();
      });
    });

    // Font toggle selection
    document.querySelectorAll(".font-btn").forEach(fBtn => {
      fBtn.addEventListener("click", () => {
        document.querySelectorAll(".font-btn").forEach(b => b.classList.remove("active"));
        fBtn.classList.add("active");
        state.text.fontStyle = fBtn.dataset.font;
        drawCanvas();
      });
    });

    // Text input synchronization
    ["textLine1", "textLine2", "textLine3"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          state.text.line1 = document.getElementById("textLine1").value;
          state.text.line2 = document.getElementById("textLine2").value;
          state.text.line3 = document.getElementById("textLine3").value;
          drawCanvas();
        });
      }
    });


    // Order Review Modal triggers
    const btnReview = document.getElementById("mainAddToCartBtn");
    const modal = document.getElementById("summaryModalOverlay");
    const btnClose = document.getElementById("closeModalBtn");
    const btnModify = document.getElementById("btnModifyModal");
    const btnConfirm = document.getElementById("confirmAddToCartBtn");

    if (btnReview && modal) {
      btnReview.addEventListener("click", () => {
        // MOQ check
        const qVal = parseInt(document.getElementById("qtyInput")?.value || state.product.qty);
        if (qVal < 50) {
          alert("Minimum Order Quantity is 50 pcs. Please enter a quantity of at least 50.");
          return;
        }
        state.product.qty = qVal;

        if (state.currentMode === "logo" && !state.artwork.imageObj) {
          alert("Please upload an artwork logo file first or switch to Text Embroidery.");
          return;
        }

        document.getElementById("modalProductMeta").textContent = `${state.product.name} (Size: ${state.product.size}) - ${state.product.qty} Pcs`;
        document.getElementById("modalPlacementLocation").textContent = state.selectedPlacement ? state.selectedPlacement.name : "Custom Zone";
        document.getElementById("modalFinishTechnique").textContent = state.currentFinish;

        if (state.currentMode === "logo") {
          document.getElementById("modalCustomizationType").textContent = `Logo Artwork Upload (${state.artwork.fileName})`;
        } else {
          const lines = [state.text.line1, state.text.line2, state.text.line3].filter(Boolean).join(" / ");
          document.getElementById("modalCustomizationType").textContent = `Text Embroidery: "${lines}" (${state.text.swatchName})`;
        }

        // Snapshot preview
        const dataUrl = document.getElementById("renderCanvas").toDataURL();
        document.getElementById("modalPreviewImg").src = dataUrl;

        modal.style.display = "grid";
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
    if (btnModify && modal) {
      btnModify.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    if (btnConfirm) {
      btnConfirm.addEventListener("click", handleAddToCart);
    }
  }

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

  function handleAddToCart() {
    drawCanvas();
    const previewUrl = getCartPreviewThumbnail();
    const placementName = state.selectedPlacement ? state.selectedPlacement.name : "Custom";
    let brandingDesc = state.currentMode === "logo" 
      ? `Custom Logo: ${state.artwork.fileName || "Uploaded"} (${state.currentFinish} - ${placementName})`
      : `Text Embroidery: "${state.text.line1}" (${state.text.swatchName} - ${placementName})`;

    let cleanGarment = state.product.baseGarmentImage;
    if (!cleanGarment || cleanGarment.startsWith("data:")) {
      cleanGarment = state.product.image;
    }
    if (!cleanGarment || cleanGarment.startsWith("data:")) {
      cleanGarment = "assets/products/Polo White Front.webp?v=5";
    }

    const cartItem = {
      id: "BS-" + Date.now(),
      sku: state.product.sku,
      name: state.product.name.includes("[Customized]") ? state.product.name : `${state.product.name} [Customized]`,
      size: state.product.size,
      color: state.product.color,
      quantity: state.product.qty || 50,
      qty: state.product.qty || 50,
      price: "Custom Quotation",
      originStudio: "Branding Studio",
      isBrandingStudio: true,
      branding: brandingDesc,
      baseGarmentImage: cleanGarment,
      image: previewUrl || cleanGarment,
      customizedImage: previewUrl || cleanGarment,
      artworkSrc: state.artwork.src || null,
      customPos: { x: state.artwork.x, y: state.artwork.y },
      scale: state.artwork.scale || 1.0,
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
      localStorage.setItem("cart", JSON.stringify(currentCart));
    } catch (e) {
      console.warn("Error updating localStorage cart", e);
    }

    if (typeof window.showToast === "function") {
      window.showToast("🎉 Cart item updated successfully! Redirecting to checkout...", "success");
    }

    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 500);
  }

})();
