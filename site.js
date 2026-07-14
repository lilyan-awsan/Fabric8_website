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
let selectedCustomization = null;

let textWizardStep = 1;
let embroideryData = {
  type: '', size: 'medium', fontStyle: 'block', threadColor: 'Black',
  lineCount: 1, selectedStyleSku: '', position: '',
  textLines: { line1: '', line2: '', line3: '' }
};
const threadColors = [
  { name: 'Red', hex: '#b7342b' },
  { name: 'Blue', hex: '#2f6fb3' },
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Gold', hex: '#ffd700' }
];

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
    if (p.images && p.images.length > 1) {
      imagesHtml = `
        <img id="img-main-${p.sku}" data-index="0" src="${p.images[0]}" alt="${p.name}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover;">
        <img id="img-next-${p.sku}" src="${p.images[1]}" alt="${p.name}" style="position: absolute; left: 100%; top: 0; width: 100%; height: 100%; object-fit: cover;">
      `;
    } else {
      imagesHtml = `<img src="${imgSrc}" alt="${p.name}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover;">`;
    }

    return `
      <div class="product-card" onclick="openProductModal('${p.sku}')">
        <div class="product-card-img" style="position: relative; overflow: hidden; padding: 0; margin: 0; border-radius: 4px 4px 0 0;" ${(p.images && p.images.length > 1) ? `onmouseenter="window.startSlideshow('${p.sku}')" onmouseleave="window.stopSlideshow('${p.sku}')"` : ''}>
          ${imagesHtml}
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
  const p = products.find(x => x.sku === sku);
  const mainImg = document.getElementById(`img-main-${sku}`);
  if (p && mainImg && p.images && p.images.length > 0) {
    mainImg.style.transition = 'none';
    mainImg.src = p.images[0];
    mainImg.style.left = '0';
    mainImg.dataset.index = "0";
  }
};

window.nextImage = function(sku, direction) {
  const p = products.find(x => x.sku === sku);
  if (!p || !p.images || p.images.length <= 1) return;
  const mainImg = document.getElementById(`img-main-${sku}`);
  const nextImg = document.getElementById(`img-next-${sku}`);
  if (!mainImg || !nextImg) return;
  
  let currentIndex = parseInt(mainImg.dataset.index || "0");
  currentIndex += direction;
  if (currentIndex >= p.images.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = p.images.length - 1;
  
  nextImg.src = p.images[currentIndex];
  nextImg.style.transition = 'none';
  nextImg.style.left = '100%';
  
  void nextImg.offsetWidth; // Force reflow
  
  mainImg.style.transition = 'left 0.4s ease-in-out';
  nextImg.style.transition = 'left 0.4s ease-in-out';
  mainImg.style.left = '-100%';
  nextImg.style.left = '0';
  
  setTimeout(() => {
    mainImg.src = p.images[currentIndex];
    mainImg.dataset.index = currentIndex;
    mainImg.style.transition = 'none';
    mainImg.style.left = '0';
  }, 400);
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

  selectedCustomization = null;
  const nextBtn = document.getElementById("modalAddBranding");
  if (nextBtn) nextBtn.style.display = "none";
  document.querySelectorAll('input[name="customizationType"]').forEach(r => r.checked = false);
  document.querySelectorAll(".customization-card").forEach(card => {
    card.style.borderColor = "var(--line)";
    card.style.backgroundColor = "transparent";
  });

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
    if (selectedCustomization === "text_embroidery") {
      openTextWizard();
      return;
    }
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

document.addEventListener("change", (e) => {
  if (e.target.name === "customizationType") {
    selectedCustomization = e.target.value;
    
    document.querySelectorAll(".customization-card").forEach(card => {
      card.style.borderColor = "var(--line)";
      card.style.backgroundColor = "transparent";
    });
    const activeCard = e.target.closest(".customization-card");
    if (activeCard) {
      activeCard.style.borderColor = "var(--ink)";
      activeCard.style.backgroundColor = "var(--bg-alt, #f5f5f5)";
    }

    const nextBtn = document.getElementById("modalAddBranding");
    if (nextBtn) {
      if (selectedCustomization === "upload_logo") {
        nextBtn.textContent = "NEXT: UPLOAD LOGO";
        nextBtn.style.display = "block";
      } else if (selectedCustomization === "text_embroidery") {
        nextBtn.textContent = "NEXT: CUSTOMIZE TEXT";
        nextBtn.style.display = "block";
      } else {
        nextBtn.style.display = "none";
      }
    }
  }
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

// Mobile Filter Toggle
document.addEventListener("DOMContentLoaded", () => {
  const filterToggle = document.querySelector('.filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      const contents = document.querySelector('.filter-contents');
      if (contents) {
        contents.classList.toggle('open');
        const icon = filterToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = contents.classList.contains('open') ? '−' : '+';
        }
      }
    });
  }
});

// --- TEXT WIZARD LOGIC ---
function openTextWizard() {
  const selectedProduct = products.find((p) => p.sku === selectedProductSku);
  if (!selectedProduct) return;
  
  const quantityElement = document.getElementById("sidebarProductQuantity") || document.getElementById("modalProductQuantity");
  const quantity = parseInt(quantityElement?.value || 50);
  
  const sizeElement = document.getElementById("sidebarSizeSelect") || document.getElementById("modalSizeSelect");
  const selectedSize = sizeElement?.value;

  if (!selectedSize || !activeCatalogColor || activeCatalogColor === "all") {
    alert("Please select size and color before proceeding.");
    return;
  }
  
  document.getElementById("wizardProductName").textContent = selectedProduct.name;
  document.getElementById("wizardProductColorDesc").textContent = `Color: ${activeCatalogColor} | Size: ${selectedSize} | Qty: ${quantity}`;
  
  const shirtImg = document.getElementById("wizardShirt");
  if (shirtImg) {
    const colorImg = selectedProduct.images?.find((img) => img.toLowerCase().includes(activeCatalogColor.toLowerCase()));
    if (colorImg) {
       shirtImg.src = colorImg;
    } else {
       const imgSrc = selectedProduct.image ? (selectedProduct.image.startsWith('http') ? selectedProduct.image : selectedProduct.image) : 'White Polo Shirt.png';
       shirtImg.src = imgSrc;
    }
  }

  textWizardStep = 1;
  embroideryData = {
    type: '', size: 'medium', fontStyle: 'block', threadColor: threadColors[0].name,
    bgColor: 'White', borderColor: 'Black',
    lineCount: 1, selectedStyleSku: '', position: '',
    textLines: { line1: '', line2: '', line3: '' }
  };
  
  const colorContainer = document.getElementById("wizardThreadColors");
  if (colorContainer) {
    colorContainer.innerHTML = threadColors.map(c => 
      `<span class="color-dot ${c.name === embroideryData.threadColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-thread-color="${c.name}"></span>`
    ).join("");
  }

  const bgContainer = document.getElementById("wizardBgColors");
  if (bgContainer) {
    bgContainer.innerHTML = threadColors.map(c => 
      `<span class="bg-color-dot ${c.name === embroideryData.bgColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-bg-color="${c.name}"></span>`
    ).join("");
  }

  const borderContainer = document.getElementById("wizardBorderColors");
  if (borderContainer) {
    borderContainer.innerHTML = threadColors.map(c => 
      `<span class="border-color-dot ${c.name === embroideryData.borderColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-border-color="${c.name}"></span>`
    ).join("");
  }
  
  document.getElementById("emblemColorOptions").style.display = "none";

  document.querySelectorAll('.selection-card, .template-card, .placement-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('input[name="embroideryType"], input[name="templateStyle"], input[name="wizardPosition"]').forEach(r => r.checked = false);
  document.querySelectorAll('#wizardLineCount button').forEach(b => b.classList.remove('active'));
  document.querySelector('#wizardLineCount button[data-lines="1"]')?.classList.add('active');
  document.getElementById("wizardSize").value = "medium";
  document.getElementById("wizardFontStyle").value = "block";

  renderTextInputs();
  renderTextPreview();
  updateWizardUI();

  const productSidebar = document.getElementById("productSidebar");
  if (productSidebar) productSidebar.classList.remove("open");
  document.getElementById("textWizardModal").style.display = "flex";
}

function updateWizardUI() {
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`wizardStep${i}`);
    if (stepEl) stepEl.style.display = (i === textWizardStep) ? "block" : "none";
  }
  
  const btnBack = document.getElementById("wizardBtnBack");
  const btnNext = document.getElementById("wizardBtnNext");
  const btnConfirm = document.getElementById("wizardBtnConfirm");
  
  if (textWizardStep === 1) {
    btnBack.style.display = "none";
  } else {
    btnBack.style.display = "block";
  }
  
  if (textWizardStep === 5) {
    btnNext.style.display = "none";
    btnConfirm.style.display = "block";
    renderSummary();
  } else {
    btnNext.style.display = "block";
    btnConfirm.style.display = "none";
  }
}

function renderTextInputs() {
  const container = document.getElementById("wizardTextInputsContainer");
  if (!container) return;
  let html = "";
  for (let i = 1; i <= embroideryData.lineCount; i++) {
    html += `
      <div class="form-group" style="margin-bottom: 16px; max-width: 320px;">
        <label>Line ${i} Text</label>
        <input type="text" class="wizard-text-input" data-line="${i}" maxlength="20" placeholder="Enter text..." value="${embroideryData.textLines[`line${i}`] || ''}" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;">
        <div id="counter-line${i}" style="text-align: right; font-size: 10px; color: var(--muted); margin-top: 4px;">${(embroideryData.textLines[`line${i}`] || '').length} / 20 characters</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderTextPreview() {
  const preview = document.getElementById("wizardTextPreview");
  if (!preview) return;
  
  let text = [];
  for (let i = 1; i <= embroideryData.lineCount; i++) {
    if (embroideryData.textLines[`line${i}`]) {
      text.push(embroideryData.textLines[`line${i}`]);
    }
  }
  preview.innerHTML = text.join("<br>");
  
  preview.style.fontFamily = embroideryData.fontStyle === "script" ? "cursive, 'Brush Script MT'" : "sans-serif";
  
  const threadColorObj = threadColors.find(c => c.name === embroideryData.threadColor);
  preview.style.color = threadColorObj ? threadColorObj.hex : "#000";
  
  if (embroideryData.type === "emblem") {
    const bgObj = threadColors.find(c => c.name === embroideryData.bgColor);
    const borderObj = threadColors.find(c => c.name === embroideryData.borderColor);
    
    preview.style.backgroundColor = bgObj ? bgObj.hex : "#fff";
    preview.style.border = `3px solid ${borderObj ? borderObj.hex : "#000"}`;
    preview.style.padding = "6px 16px";
    preview.style.borderRadius = "4px";
  } else {
    preview.style.backgroundColor = "transparent";
    preview.style.border = "none";
    preview.style.padding = "0";
    preview.style.borderRadius = "0";
  }

  preview.style.left = "50%";
  preview.style.top = "40%";
  preview.style.transform = "translate(-50%, -50%)";
  
  const pos = embroideryData.position;
  if (pos === "left_chest") { preview.style.left = "65%"; preview.style.top = "35%"; }
  else if (pos === "right_chest") { preview.style.left = "35%"; preview.style.top = "35%"; }
  else if (pos === "right_sleeve") { preview.style.left = "20%"; preview.style.top = "35%"; preview.style.transform = "translate(-50%, -50%) rotate(-10deg)"; }
  else if (pos === "left_sleeve") { preview.style.left = "80%"; preview.style.top = "35%"; preview.style.transform = "translate(-50%, -50%) rotate(10deg)"; }
  else if (pos === "back") { preview.style.top = "30%"; }
}

function renderSummary() {
  const list = document.getElementById("wizardSummaryList");
  if (!list) return;
  list.innerHTML = `
    <li style="padding: 8px 0; border-bottom: 1px solid var(--line);"><strong>Customization Type:</strong> ${embroideryData.type === 'emblem' ? 'Emblem (Patch)' : 'Direct Embroidery'}</li>
    <li style="padding: 8px 0; border-bottom: 1px solid var(--line);"><strong>Style:</strong> ${embroideryData.selectedStyleSku}</li>
    <li style="padding: 8px 0; border-bottom: 1px solid var(--line);"><strong>Design Options:</strong> Size ${embroideryData.size}, ${embroideryData.fontStyle} font, ${embroideryData.threadColor} thread</li>
    <li style="padding: 8px 0; border-bottom: 1px solid var(--line);"><strong>Placement:</strong> ${embroideryData.position.replace('_', ' ')}</li>
    <li style="padding: 8px 0;"><strong>Text:</strong><br>
      ${embroideryData.lineCount >= 1 ? `Line 1: ${embroideryData.textLines.line1}<br>` : ''}
      ${embroideryData.lineCount >= 2 ? `Line 2: ${embroideryData.textLines.line2}<br>` : ''}
      ${embroideryData.lineCount >= 3 ? `Line 3: ${embroideryData.textLines.line3}` : ''}
    </li>
  `;
}

function addWizardToCart() {
  const selectedProduct = products.find((p) => p.sku === selectedProductSku);
  
  const quantityElement = document.getElementById("sidebarProductQuantity") || document.getElementById("modalProductQuantity");
  const quantity = parseInt(quantityElement?.value || 50);
  
  const sizeElement = document.getElementById("sidebarSizeSelect") || document.getElementById("modalSizeSelect");
  const selectedSize = sizeElement?.value || "Standard";
  
  let linesText = [];
  for (let i = 1; i <= embroideryData.lineCount; i++) linesText.push(embroideryData.textLines[`line${i}`]);
  
  const brandingString = `Text Embroidery (${embroideryData.type}), ${embroideryData.selectedStyleSku}, ${embroideryData.fontStyle} font, ${embroideryData.threadColor} thread, Pos: ${embroideryData.position}, Texts: [${linesText.join(' | ')}]`;

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
  document.getElementById("textWizardModal").style.display = "none";
  const quoteSection = document.getElementById("quote");
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("click", (e) => {
  if (e.target.id === "closeTextWizard") {
    document.getElementById("textWizardModal").style.display = "none";
    const productSidebar = document.getElementById("productSidebar");
    if (productSidebar) productSidebar.classList.add("open");
  }
  
  if (e.target.id === "wizardBtnNext") {
    if (textWizardStep === 1 && !embroideryData.type) return alert("Select an embroidery type.");
    if (textWizardStep === 2 && !embroideryData.selectedStyleSku) return alert("Select a template style.");
    if (textWizardStep === 3 && !embroideryData.position) return alert("Select a placement.");
    if (textWizardStep === 4) {
      if (!embroideryData.textLines.line1) return alert("Please enter text for at least Line 1.");
    }
    if (textWizardStep < 5) {
      textWizardStep++;
      updateWizardUI();
    }
  }
  
  if (e.target.id === "wizardBtnBack") {
    if (textWizardStep > 1) {
      textWizardStep--;
      updateWizardUI();
    }
  }

  if (e.target.id === "wizardBtnConfirm") {
    addWizardToCart();
  }

  const threadColorDot = e.target.closest("#wizardThreadColors .color-dot");
  if (threadColorDot) {
    document.querySelectorAll("#wizardThreadColors .color-dot").forEach(d => { d.classList.remove("active"); d.style.boxShadow = "none"; });
    threadColorDot.classList.add("active");
    threadColorDot.style.boxShadow = "0 0 0 2px #fff, 0 0 0 4px var(--ink)";
    embroideryData.threadColor = threadColorDot.dataset.threadColor;
    renderTextPreview();
  }

  const bgColorDot = e.target.closest("#wizardBgColors .bg-color-dot");
  if (bgColorDot) {
    document.querySelectorAll("#wizardBgColors .bg-color-dot").forEach(d => { d.classList.remove("active"); d.style.boxShadow = "none"; });
    bgColorDot.classList.add("active");
    bgColorDot.style.boxShadow = "0 0 0 2px #fff, 0 0 0 4px var(--ink)";
    embroideryData.bgColor = bgColorDot.dataset.bgColor;
    renderTextPreview();
  }

  const borderColorDot = e.target.closest("#wizardBorderColors .border-color-dot");
  if (borderColorDot) {
    document.querySelectorAll("#wizardBorderColors .border-color-dot").forEach(d => { d.classList.remove("active"); d.style.boxShadow = "none"; });
    borderColorDot.classList.add("active");
    borderColorDot.style.boxShadow = "0 0 0 2px #fff, 0 0 0 4px var(--ink)";
    embroideryData.borderColor = borderColorDot.dataset.borderColor;
    renderTextPreview();
  }
  
  const lineBtn = e.target.closest("#wizardLineCount button");
  if (lineBtn) {
    document.querySelectorAll("#wizardLineCount button").forEach(b => b.classList.remove("active"));
    lineBtn.classList.add("active");
    embroideryData.lineCount = parseInt(lineBtn.dataset.lines);
    renderTextInputs();
    renderTextPreview();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.name === "embroideryType") {
    embroideryData.type = e.target.value;
    document.querySelectorAll('input[name="embroideryType"]').forEach(r => r.closest('.selection-card').classList.remove('active'));
    e.target.closest('.selection-card').classList.add('active');
    const colorOpts = document.getElementById("emblemColorOptions");
    if (colorOpts) {
      colorOpts.style.display = embroideryData.type === "emblem" ? "block" : "none";
    }
    renderTextPreview();
  }
  if (e.target.name === "templateStyle") {
    embroideryData.selectedStyleSku = e.target.value;
    document.querySelectorAll('input[name="templateStyle"]').forEach(r => r.closest('.template-card').classList.remove('active'));
    e.target.closest('.template-card').classList.add('active');
  }
  if (e.target.name === "wizardPosition") {
    embroideryData.position = e.target.value;
    document.querySelectorAll('input[name="wizardPosition"]').forEach(r => r.closest('.placement-card').classList.remove('active'));
    e.target.closest('.placement-card').classList.add('active');
    renderTextPreview();
  }
  if (e.target.id === "wizardSize") embroideryData.size = e.target.value;
  if (e.target.id === "wizardFontStyle") {
    embroideryData.fontStyle = e.target.value;
    renderTextPreview();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("wizard-text-input")) {
    const lineNum = e.target.dataset.line;
    embroideryData.textLines[`line${lineNum}`] = e.target.value;
    
    const counter = document.getElementById(`counter-line${lineNum}`);
    if (counter) counter.textContent = `${e.target.value.length} / 20 characters`;
    
    renderTextPreview();
  }
});
