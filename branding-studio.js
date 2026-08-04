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
    renderPlacementOptions();
    drawCanvas();
  });

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
    if (!sel) return;
    sel.innerHTML = "";
    state.product.placements.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
    sel.value = 0;
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
    state.artwork.sampleImg.crossOrigin = "anonymous";
    state.artwork.sampleImg.onload = drawCanvas;
    state.artwork.sampleImg.src = "assets/fabric8_logo_noneedle_cropped.png";

    loadBaseImage();
  }

  function loadBaseImage() {
    state.canvas.baseImage = new Image();
    state.canvas.baseImage.crossOrigin = "anonymous";
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

    // Draw background garment image
    if (state.canvas.baseImage && state.canvas.baseImage.complete) {
      ctx.drawImage(state.canvas.baseImage, 0, 0, 800, 800);
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
    const boxW = ((state.selectedPlacement ? state.selectedPlacement.w : 20) / 100) * 800;
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
    if (!state.text.line1 && !state.text.line2 && !state.text.line3) {
      drawPlacementGuide(false);
      return;
    }

    const xPx = (state.text.x / 100) * 800;
    const yPx = (state.text.y / 100) * 800;
    const baseSize = 22;

    ctx.save();
    ctx.translate(xPx, yPx);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = [state.text.line1, state.text.line2, state.text.line3].filter(Boolean);
    const lineSpacing = baseSize * 1.35;
    const totalHeight = (lines.length - 1) * lineSpacing;
    let startY = -totalHeight / 2;

    ctx.font = `900 ${baseSize}px ${state.text.fontStyle || "'Century Gothic', sans-serif"}`;
    ctx.fillStyle = state.text.swatchHex || "#111111";

    lines.forEach(l => {
      ctx.fillText(l.toUpperCase(), 0, startY);
      startY += lineSpacing;
    });

    ctx.restore();
  }

  function drawPlacementGuide(withSampleLogo) {
    const ctx = state.canvas.ctx;
    if (!state.selectedPlacement) return;

    const xPx = (state.selectedPlacement.x / 100) * 800;
    const yPx = (state.selectedPlacement.y / 100) * 800;
    const wPx = (state.selectedPlacement.w / 100) * 800;
    const hPx = (state.selectedPlacement.h / 100) * 800;

    ctx.save();
    ctx.translate(xPx, yPx);
    ctx.rotate(((state.selectedPlacement.r || 0) * Math.PI) / 180);

    ctx.strokeStyle = "#3e8e42";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(-wPx / 2, -hPx / 2, wPx, hPx);

    if (withSampleLogo && state.artwork.sampleImg && state.artwork.sampleImg.complete) {
      const sImg = state.artwork.sampleImg;
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
    const targetX = state.currentMode === "logo" ? (state.artwork.x / 100) * 800 : (state.text.x / 100) * 800;
    const targetY = state.currentMode === "logo" ? (state.artwork.y / 100) * 800 : (state.text.y / 100) * 800;
    const dist = Math.hypot(xPx - targetX, yPx - targetY);

    if (dist < 180) {
      state.canvas.isDragging = true;
      state.canvas.dragOffsetX = xPx - targetX;
      state.canvas.dragOffsetY = yPx - targetY;
    }
  }

  function dragTo(xPx, yPx) {
    const newX = Math.max(0, Math.min(800, xPx - state.canvas.dragOffsetX));
    const newY = Math.max(0, Math.min(800, yPx - state.canvas.dragOffsetY));

    if (state.currentMode === "logo") {
      state.artwork.x = (newX / 800) * 100;
      state.artwork.y = (newY / 800) * 100;
    } else {
      state.text.x = (newX / 800) * 100;
      state.text.y = (newY / 800) * 100;
    }
    drawCanvas();
  }

  function handleMouseUp() {
    state.canvas.isDragging = false;
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
        const img = new Image();
        img.onload = () => {
          removeWhiteBackground(img, function (processedImg) {
            state.artwork.imageObj = processedImg;
            state.artwork.fileName = file.name;
            const statusEl = document.getElementById("fileStatus");
            const nameEl = document.getElementById("fileName");
            if (statusEl && nameEl) {
              nameEl.textContent = file.name;
              statusEl.style.display = "block";
            }
            drawCanvas();
          });
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

  function handleAddToCart() {
    const previewUrl = document.getElementById("renderCanvas").toDataURL();
    const placementName = state.selectedPlacement ? state.selectedPlacement.name : "Custom";
    let brandingDesc = state.currentMode === "logo" 
      ? `Custom Logo: ${state.artwork.fileName || "Uploaded"} (${state.currentFinish} - ${placementName})`
      : `Text Embroidery: "${state.text.line1}" (${state.text.swatchName} - ${placementName})`;

    const cartItem = {
      sku: state.product.sku,
      name: state.product.name,
      size: state.product.size,
      color: state.product.color,
      quantity: state.product.qty || 50,
      price: "Custom Quotation",
      branding: brandingDesc,
      image: previewUrl || state.product.image,
      customization: {
        type: state.currentMode === "logo" ? "Logo Upload" : "Text Embroidery",
        finish: state.currentFinish,
        placement: placementName,
        artworkFile: state.currentMode === "logo" ? state.artwork.fileName : "N/A"
      }
    };

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
      localStorage.setItem("cart", JSON.stringify(currentCart));
    } catch (e) {
      console.warn("Error updating localStorage cart", e);
    }

    if (typeof window.showToast === "function") {
      window.showToast("🎉 Customized prototype added to cart! Redirecting to checkout...", "success");
    }

    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 600);
  }

})();
