let products = [];

async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error("Failed to load products");
    products = await res.json();
    products.sort((a, b) => a.name.localeCompare(b.name));
    initSite();
  } catch (err) {
    console.error("Error loading products:", err);
    // Even if it fails, try to init the site to not leave it blank
    initSite();
  }
}

// Start loading
loadProducts();


const cart = JSON.parse(localStorage.getItem("fabric8QuoteCart") || "[]");
const $ = (selector) => document.querySelector(selector);
let activeCatalogColor = "all";
let activeStudioColor = "White";
let selectedProductSku = "F8-001";

const colorMap = {
  Black: "#111111",
  White: "#ffffff",
  Navy: "#17233f",
  Grey: "#9a9a96",
  "Light Grey": "#d3d3d3",
  Green: "#2f873d",
  "Olive Green": "#556b2f",
  "Army Green": "#4b5320",
  Red: "#b7342b",
  Burgundy: "#6e1f32",
  Beige: "#cbb99d",
  Charcoal: "#3a3d3d",
  Blue: "#2f6fb3",
  "Baby Blue": "#89cff0",
  "Turquoise Blue": "#00b5e2",
  "Ocean Blue": "#0077be",
  "American Blue": "#3b3b6d",
  Pink: "#ffc0cb",
  Brown: "#5c4033",
  Orange: "#ffa500",
  Yellow: "#ffd700",
  Purple: "#800080",
  Striped: "linear-gradient(45deg,#111 0 20%,#fff 20% 40%,#111 40% 60%,#fff 60% 80%,#111 80%)",
  "Custom Colors": "linear-gradient(135deg,#2f873d,#75aee0,#e79aa3,#d3d116)"
};

function saveCart() {
  localStorage.setItem("fabric8QuoteCart", JSON.stringify(cart));
}


let activeCategoryFilter = "All";
let activeSearchTerm = "";
let activeSortTerm = "featured";

function renderFilters() {
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const container = $("#categoryFilterContainer");
  if (!container) return;
  
  let html = `<button type="button" class="category-btn ${activeCategoryFilter === 'All' ? 'active' : ''}" data-cat="All">All Categories</button>`;
  categories.forEach(cat => {
    html += `<button type="button" class="category-btn ${activeCategoryFilter === cat ? 'active' : ''}" data-cat="${cat}">${cat}</button>`;
  });
  container.innerHTML = html;
  
  container.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCategoryFilter = e.target.dataset.cat;
      renderFilters(); // re-render to update active class
      renderProducts();
    });
  });
}

function renderProducts() {
  renderFilters();
  const grid = $("#productGrid");
  if (!grid) return;

  activeSearchTerm = $("#productSearch")?.value.toLowerCase() || "";
  activeSortTerm = $("#sortFilter")?.value || "featured";

  let filtered = products;

  if (activeCategoryFilter !== "All") {
    filtered = filtered.filter(p => p.category === activeCategoryFilter);
  }

  if (activeSearchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(activeSearchTerm) || p.sku.toLowerCase().includes(activeSearchTerm));
  }

  if (activeSortTerm === "A-Z") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (activeSortTerm === "Z-A") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (filtered.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--muted); padding: 40px;'>No products found matching your filters.</p>";
    return;
  }

  grid.innerHTML = filtered.map(p => {
    let mainImg = p.image || 'White Polo Shirt.png';
    if (p.images && p.images.length > 0) mainImg = p.images[0];
    const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
    
    let imagesHtml = '';
    if (p.images && p.images.length > 0) {
      imagesHtml = p.images.map(img => `<img src="${img}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; flex-shrink: 0;">`).join('');
    } else {
      imagesHtml = `<img src="${imgSrc}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; flex-shrink: 0;">`;
    }

    return `
      <div class="product-card" onclick="openProductModal('${p.sku}')">
        <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 4px; overflow: hidden;" ${(p.images && p.images.length > 1) ? `onmouseenter="window.startSlideshow('${p.sku}')" onmouseleave="window.stopSlideshow('${p.sku}')"` : ''}>
          <div id="track-${p.sku}" data-index="0" style="display: flex; width: 100%; height: 100%; transition: transform 0.4s ease-in-out; transform: translateX(0%);">
            ${imagesHtml}
          </div>
        </div>
        <div class="product-card-info">
          <span class="product-card-category">${p.category}</span>
          <h3 class="product-card-title">${p.name}</h3>
          <button class="product-card-btn" type="button">View Details</button>
        </div>
      </div>
    `;
  }).join("");
}

window.slideshowTimers = {};

window.startSlideshow = function(sku) {
  if (window.slideshowTimers[sku]) clearInterval(window.slideshowTimers[sku]);
  window.nextImage(sku, 1); // Instantly change to the next image on hover
  window.slideshowTimers[sku] = setInterval(() => {
    window.nextImage(sku, 1);
  }, 800); // Change image every 0.8 seconds
};

window.stopSlideshow = function(sku) {
  if (window.slideshowTimers[sku]) {
    clearInterval(window.slideshowTimers[sku]);
    window.slideshowTimers[sku] = null;
  }
  // Reset to first image smoothly
  const p = products.find(x => x.sku === sku);
  const trackEl = document.getElementById(`track-${sku}`);
  if (p && trackEl && p.images && p.images.length > 0) {
    trackEl.dataset.index = "0";
    trackEl.style.transform = `translateX(0%)`;
  }
};

window.nextImage = function(sku, direction) {
  const p = products.find(x => x.sku === sku);
  if (!p || !p.images || p.images.length <= 1) return;
  const trackEl = document.getElementById(`track-${sku}`);
  if (!trackEl) return;
  let currentIndex = parseInt(trackEl.dataset.index || "0");
  currentIndex += direction;
  
  // If we reach the end, instantly snap back to 0 without transition, then slide
  if (currentIndex >= p.images.length) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = p.images.length - 1;
  }
  
  trackEl.dataset.index = currentIndex;
  trackEl.style.transform = `translateX(-${currentIndex * 100}%)`;
};

function openProductModal(sku) {
  const selected = products.find(p => p.sku === sku);
  if (!selected) return;
  
  selectedProductSku = sku;
  if (!selected.colors.includes(activeCatalogColor)) activeCatalogColor = selected.colors[0];

  let mainImg = selected.image || 'White Polo Shirt.png';
  if (selected.images && selected.images.length > 0) mainImg = selected.images[0];
  const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
  $("#modalProductImage").src = imgSrc;
  
  const thumbnailsContainer = $("#modalThumbnails");
  if (thumbnailsContainer) {
    if (selected.images && selected.images.length > 1) {
      thumbnailsContainer.style.display = "flex";
      thumbnailsContainer.innerHTML = selected.images.map(img => {
        return `<img src="${img}" alt="Thumbnail" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid var(--line);" onclick="document.getElementById('modalProductImage').src='${img}'">`;
      }).join("");
    } else {
      thumbnailsContainer.style.display = "none";
      thumbnailsContainer.innerHTML = "";
    }
  }
  $("#modalProductName").textContent = selected.name;
  $("#modalProductCategory").textContent = selected.category;
  $("#modalProductSku").textContent = `SKU: ${selected.sku}`;
  $("#modalProductDesc").textContent = selected.long || selected.short;
  
  $("#modalProductFabric").textContent = selected.fabric || "N/A";
  $("#modalProductGsm").textContent = selected.gsm || "N/A";
  $("#modalProductMoq").textContent = selected.moq || "N/A";
  $("#minQtyLabel").textContent = selected.moq ? selected.moq.replace(/[^0-9]/g, '') || "50" : "50";
  $("#modalProductQuantity").min = $("#minQtyLabel").textContent;
  $("#modalProductQuantity").value = $("#minQtyLabel").textContent;

  $("#modalProductLeadTime").textContent = selected.leadTime || "N/A";
  $("#modalProductAvailability").textContent = selected.availability || "N/A";
  $("#modalProductSizesList").textContent = selected.sizes?.join(", ") || "N/A";

  // Sizes
  const sizeSelect = $("#modalSizeSelect");
  sizeSelect.innerHTML = '<option value="">Select a size...</option>';
  if (selected.sizes && Array.isArray(selected.sizes)) {
    selected.sizes.forEach(size => {
      sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
    });
  }

  // Colors
  const colorFilter = $("#modalColorFilter");
  colorFilter.innerHTML = selected.colors.map(c => colorButton(c)).join("");
  const activeBtn = colorFilter.querySelector(`[data-color="${CSS.escape(activeCatalogColor)}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  $("#productModal").style.display = "flex";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "productModal" || e.target.id === "closeProductModal") {
    $("#productModal").style.display = "none";
  }
});


function colorStyle(color) {
  return colorMap[color] || "#d8d2c5";
}

function colorSwatch(color) {
  return `<span class="mini-swatch" title="${color}" style="background:${colorStyle(color)}"></span>`;
}

function colorButton(color) {
  return `<button class="color-dot" type="button" data-color="${color}" title="${color}" style="--swatch:${colorStyle(color)}"><span>${color}</span></button>`;
}

function renderCart() {
  const count = $("#cartCount");
  const items = $("#cartItems");
  if (count) count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (!items) return;
  if (!cart.length) {
    items.innerHTML = "<p>No products selected yet.</p>";
    return;
  }
  items.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p>Size: ${item.size || "N/A"} | Color: ${item.color || "Standard"} | Qty: ${item.quantity} | ${item.branding || "No branding selected"}</p>
      </div>
      <button type="button" data-remove="${index}">Remove</button>
    </div>
  `).join("");
}

function addToCart(sku) {
  const selectedProduct = products.find((p) => p.sku === sku);
  const quantity = parseInt($("#modalProductQuantity")?.value || 50);
  const selectedSize = $("#modalSizeSelect")?.value;

  if (!selectedSize) {
    alert("Please select a size before adding to the cart.");
    return;
  }
  if (!activeCatalogColor) {
    alert("Please select a color before adding to the cart.");
    return;
  }
  if (quantity < 1 || isNaN(quantity)) {
    alert("Please enter a valid quantity.");
    return;
  }

  const existing = cart.find(
    (item) => item.sku === selectedProduct.sku && item.color === activeCatalogColor && item.size === selectedSize
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      ...selectedProduct,
      quantity,
      color: activeCatalogColor,
      size: selectedSize,
    });
  }
  saveCart();
  renderCart();
  
  const modal = $("#productModal");
  if (modal) modal.style.display = "none";
  
  const quoteSection = $("#quote");
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: "smooth" });
  }
}

function setupStudio() {
  const shirt = $("#studioShirt");
  if (!shirt) return;
  shirt.dataset.color = "white";
  const studioColors = ["White", "Black", "Navy", "Grey", "Green", "Red"];
  const studioSwatches = $("#studioColorSwatches");
  if (studioSwatches) {
    studioSwatches.innerHTML = studioColors.map((c) => colorButton(c)).join("");
    studioSwatches.querySelector('[data-color="White"]').classList.add("active");
  }
  $("#placementSelect").addEventListener("change", (event) => { 
    $("#logoPreview").className = `logo-preview ${event.target.value}`; 
    if (event.target.value !== "custom") {
      $("#logoPreview").style.left = "";
      $("#logoPreview").style.top = "";
      $("#logoPreview").style.width = "";
      $("#logoPreview").style.height = "";
      $("#logoPreview").style.transform = "";
    }
  });
  $("#logoSize").addEventListener("input", (event) => {
    $("#logoPreview").style.setProperty("--logo-size", `${event.target.value}%`);
  });

  const logoPreview = $("#logoPreview");
  const placementSelect = $("#placementSelect");
  const studioStage = document.querySelector(".studio-stage");
  let isDragging = false, startX, startY, initLeft, initTop;

  if (logoPreview && studioStage) {
    logoPreview.style.cursor = "grab";
    
    logoPreview.addEventListener("mousedown", (e) => {
      if (e.offsetX > logoPreview.offsetWidth - 15 && e.offsetY > logoPreview.offsetHeight - 15) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      logoPreview.style.cursor = "grabbing";
      
      let customOpt = placementSelect.querySelector('option[value="custom"]');
      if (!customOpt) {
        customOpt = document.createElement("option");
        customOpt.value = "custom";
        customOpt.textContent = "Custom (Dragged)";
        placementSelect.appendChild(customOpt);
      }
      
      if (placementSelect.value !== "custom") {
        placementSelect.value = "custom";
        const rect = logoPreview.getBoundingClientRect();
        const stageRect = studioStage.getBoundingClientRect();
        
        const newSizePct = (rect.width / stageRect.width) * 100;
        logoPreview.style.setProperty("--logo-size", newSizePct + "%");
        const logoSizeInput = $("#logoSize");
        if (logoSizeInput) {
          logoSizeInput.value = newSizePct;
        }
        logoPreview.className = "logo-preview custom";
        
        initLeft = ((rect.left - stageRect.left) / stageRect.width) * 100;
        initTop = ((rect.top - stageRect.top) / stageRect.height) * 100;
        
        logoPreview.style.left = initLeft + "%";
        logoPreview.style.top = initTop + "%";
        logoPreview.style.transform = "none";
        
        // Remove explicit inline width/height to let CSS variable take over
        logoPreview.style.width = "";
        logoPreview.style.height = "";
      } else {
        initLeft = parseFloat(logoPreview.style.left) || 0;
        initTop = parseFloat(logoPreview.style.top) || 0;
      }
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const stageRect = studioStage.getBoundingClientRect();
      const dx = ((e.clientX - startX) / stageRect.width) * 100;
      const dy = ((e.clientY - startY) / stageRect.height) * 100;
      logoPreview.style.left = (initLeft + dx) + "%";
      logoPreview.style.top = (initTop + dy) + "%";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        logoPreview.style.cursor = "grab";
      }
    });
  }
  $("#logoUpload").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { $("#logoPreview").innerHTML = `<img src="${reader.result}" alt="Uploaded logo" />`; };
    reader.readAsDataURL(file);
  });
  $("#addStudioQuote").addEventListener("click", () => {
    const logoUpload = $("#logoUpload");
    if (logoUpload && (!logoUpload.files || logoUpload.files.length === 0)) {
      alert("Please upload your logo file before adding this item to the quote cart.");
      return;
    }
    
    if (!$("#logoDisclaimer")?.checked) {
      alert("You must agree to the legal disclaimer before adding a branded mockup.");
      return;
    }
    
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) {
      alert("Please select a product from the catalog first.");
      return;
    }
    
    const quantity = parseInt($("#modalProductQuantity")?.value || 50);
    const selectedSize = $("#modalSizeSelect")?.value || "Standard";
    let placementText = $("#placementSelect").selectedOptions[0].textContent;
    if ($("#placementSelect").value === "custom") {
      const left = parseFloat($("#logoPreview").style.left).toFixed(1);
      const top = parseFloat($("#logoPreview").style.top).toFixed(1);
      const size = parseFloat($("#logoPreview").style.getPropertyValue("--logo-size") || 13).toFixed(1);
      placementText += ` [Pos: X=${left}%, Y=${top}%, Size=${size}%]`;
    }
    const brandingString = `${$("#finishSelect").value}, ${placementText}`;

    const existing = cart.find(
      (item) => item.sku === selectedProduct.sku && item.color === activeCatalogColor && item.size === selectedSize && item.branding === brandingString
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        ...selectedProduct,
        quantity,
        color: activeCatalogColor,
        size: selectedSize,
        branding: brandingString
      });
    }
    saveCart();
    renderCart();
    const quoteSection = $("#quote");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  const colorDot = event.target.closest(".color-dot");
  const addSelected = event.target.closest("#modalAddBranding");
  const addBlank = event.target.closest("#modalAddBlank");
  
  if (add) addToCart(add.dataset.add);
  if (addBlank) addToCart(selectedProductSku);
  
  if (addSelected) {
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) return;
    
    const quantity = parseInt($("#modalProductQuantity")?.value || 50);
    const selectedSize = $("#modalSizeSelect")?.value;

    if (!selectedSize) {
      alert("Please select a size before proceeding.");
      return;
    }
    if (!activeCatalogColor) {
      alert("Please select a color before proceeding.");
      return;
    }
    if (quantity < 1 || isNaN(quantity)) {
      alert("Please enter a valid quantity.");
      return;
    }

    const studioName = $("#studioProductName");
    if (studioName) studioName.textContent = selectedProduct.name;
    
    const studioDesc = $("#studioProductColorDesc");
    if (studioDesc) studioDesc.textContent = `Color: ${activeCatalogColor} | Size: ${selectedSize} | Qty: ${quantity}`;
    
    activeStudioColor = activeCatalogColor;
    const shirtImg = $("#studioShirt");
    if (shirtImg) {
      shirtImg.dataset.color = activeStudioColor.toLowerCase().replace(/\s+/g, "-");
      const colorImg = selectedProduct.images?.find((img) => img.toLowerCase().includes(activeCatalogColor.toLowerCase()));
      if (colorImg) {
         shirtImg.src = colorImg;
      } else {
         const imgSrc = selectedProduct.image ? (selectedProduct.image.startsWith('http') ? selectedProduct.image : selectedProduct.image) : 'White Polo Shirt.png';
         shirtImg.src = imgSrc;
      }
    }
    
    $("#productModal").style.display = "none";
    const studioSection = $("#studio");
    if (studioSection) {
      studioSection.style.display = "block";
      setTimeout(() => {
        studioSection.scrollIntoView({ behavior: "smooth" });
      }, 50); // slight delay to ensure display: block has rendered before scrolling
    }
  }
  if (colorDot) {
    const parent = colorDot.parentElement;
    parent.querySelectorAll(".color-dot").forEach((button) => button.classList.remove("active"));
    colorDot.classList.add("active");
    if (parent.id === "colorFilter") {
      activeCatalogColor = colorDot.dataset.color;
      renderProducts();
    }
    if (parent.id === "modalColorFilter") {
      activeCatalogColor = colorDot.dataset.color;
    }
    if (parent.id === "studioColorSwatches") {
      activeStudioColor = colorDot.dataset.color;
      $("#studioShirt").dataset.color = activeStudioColor.toLowerCase().replace(/\s+/g, "-");
    }
  }
  if (remove) {
    cart.splice(Number(remove.dataset.remove), 1);
    saveCart();
    renderCart();
  }
});

["input", "change"].forEach((eventName) => {
  ["#productSearch", "#sortFilter", "#genderFilter", "#availabilityFilter"].forEach((selector) => {
    const el = $(selector);
    if (el) el.addEventListener(eventName, (event) => {
      renderProducts();
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-ready");
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href$='.html'], a[href*='.html#']");
  if (!link || link.target || event.metaKey || event.ctrlKey) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  document.body.classList.add("silk-leaving");
  setTimeout(() => { location.href = link.href; }, 340);
});

$("#clearCart")?.addEventListener("click", () => {
  cart.splice(0, cart.length);
  saveCart();
  renderCart();
});

$("#quoteForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
  const originalBtnText = submitBtn ? submitBtn.textContent : "Submit Request";
  
  if (submitBtn) {
    submitBtn.textContent = "Sending Request...";
    submitBtn.disabled = true;
  }

  const data = new FormData(form);
  const customerInfo = {};
  let base64File = null;
  let fileName = null;

  for (const [key, value] of data.entries()) {
    if (value instanceof File) {
      if (value.name && value.size > 0) {
        fileName = value.name;
        base64File = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(value);
        });
      }
    } else {
      customerInfo[key] = value;
    }
  }

  const payload = {
    customerInfo,
    cart,
    attachment: base64File ? { filename: fileName, content: base64File } : null
  };

  try {
    const res = await fetch('/api/sendQuote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      alert("Quote request sent successfully! We will contact you soon.");
      cart.splice(0, cart.length);
      saveCart();
      renderCart();
      form.reset();
    } else {
      const errorData = await res.json();
      alert("Error sending request: " + (errorData.message || "Unknown error"));
    }
  } catch (err) {
    alert("Network error: Could not send quote request. Ensure you are running this on a web server.");
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  }
});

function initSite() {
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderCart === 'function') renderCart();
  if (typeof setupStudio === 'function') setupStudio();
  
  // Check for SKU in URL to auto-open product modal (from Admin panel link)
  const urlParams = new URLSearchParams(window.location.search);
  const sku = urlParams.get('sku');
  if (sku && typeof openProductModal === 'function') {
    // Small delay to ensure DOM is ready and grid is painted
    setTimeout(() => openProductModal(sku), 100);
  }
}

// Form Validation UI
document.addEventListener("invalid", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
    e.target.classList.add("error");
  }
}, true); // Use capture to catch invalid events

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("error") && e.target.checkValidity()) {
    e.target.classList.remove("error");
  }
});
