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
  { name: 'Gold', hex: '#ffd700' },
  { name: 'Navy', hex: '#17233f' },
  { name: 'Grey', hex: '#9a9a96' },
  { name: 'Green', hex: '#2f873d' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Orange', hex: '#ff8c00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#ffc0cb' }
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
  const order = ["Top Wear", "Bottom Wear", "Outerwear", "Headwear", "Accessories", "Healthcare"];
  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) => {
    let ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia === -1) ia = 999;
    if (ib === -1) ib = 999;
    return ia - ib || a.localeCompare(b);
  });
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
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(activeSearchTerm) || 
      p.sku.toLowerCase().includes(activeSearchTerm) ||
      (p.description && p.description.toLowerCase().includes(activeSearchTerm))
    );
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
      <div class="product-card" onclick="window.location.href='product.html?sku=${p.sku}'">
        <div class="product-card-img" ${(p.images && p.images.length > 1) ? `onmouseenter="window.startSlideshow('${p.sku}')" onmouseleave="window.stopSlideshow('${p.sku}')"` : ''}>
          ${imagesHtml}
        </div>
        <div class="product-card-info">
          <p>${p.sku}</p>
          <h3>${p.name}</h3>
        </div>
        <div class="product-card-overlay">
          <div class="product-card-overlay-text">+ View Details</div>
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
      <div style="display: flex; gap: 12px;">
        <button type="button" data-edit="${index}" style="color: var(--ink); font-weight: bold; background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline;">Edit</button>
        <button type="button" data-remove="${index}" style="color: #b7342b; font-weight: bold; background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline;">Remove</button>
      </div>
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
      customizationType: null,
      embroideryData: null,
      logoData: null
    });
  }
  saveCart();
  renderCart();
  
  const modal = $("#productModal");
  if (modal) modal.style.display = "none";
  setTimeout(() => {
    const quoteSection = $("#quote");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
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
  let initLeft, initTop;
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
        branding: brandingString,
        customizationType: "upload_logo",
        embroideryData: null,
        logoData: { 
          left: parseFloat($("#logoPreview").style.left).toFixed(1), 
          top: parseFloat($("#logoPreview").style.top).toFixed(1),
          size: parseFloat($("#logoPreview").style.getPropertyValue("--logo-size") || 13).toFixed(1)
        }
      });
    }
    saveCart();
    renderCart();
    
    const productModal = document.getElementById("productModal");
    if (productModal) productModal.style.display = "none";
    const productSidebar = document.getElementById("productSidebar");
    if (productSidebar) productSidebar.classList.remove("open");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");

    setTimeout(() => {
      const quoteSection = $("#quote");
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  });
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  const edit = event.target.closest("[data-edit]");
  const colorDot = event.target.closest(".color-dot");
  const addSelected = event.target.closest("#modalAddBranding");
  const addBlank = event.target.closest("#modalAddBlank");
  
  if (add) addToCart(add.dataset.add);
  if (addBlank) addToCart(selectedProductSku);

  if (edit) {
    editingCartIndex = Number(edit.dataset.edit);
    renderEditOrderSummaryModal(editingCartIndex);
  }
  
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
function triggerMailtoFallback(customerInfo, cart) {
  let bodyText = `New Fabric-8 Quote Request\n\n`;
  bodyText += `Customer Details:\n`;
  for (const [key, value] of Object.entries(customerInfo || {})) {
    bodyText += `- ${key}: ${value}\n`;
  }
  bodyText += `\nSelected Products:\n`;
  if (!cart || cart.length === 0) {
    bodyText += `- No products selected.\n`;
  } else {
    cart.forEach(item => {
      bodyText += `- ${item.name} (${item.sku})\n  Size: ${item.size || "N/A"} | Color: ${item.color || "Standard"} | Qty: ${item.quantity}\n  Branding: ${item.branding || "None"}\n\n`;
    });
  }
  
  // 1. Try to open the user's email client
  const mailtoLink = `mailto:hello@thefabric8.com?subject=${encodeURIComponent('New Fabric8 Quote Request')}&body=${encodeURIComponent(bodyText)}`;
  window.location.href = mailtoLink;

  // 2. Also show a modal with the draft on screen just in case mailto fails
  const modalHtml = `
    <div id="emailDraftModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: white; border-radius: 8px; width: 100%; max-width: 600px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; position: relative;">
        <button onclick="document.getElementById('emailDraftModal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #333;">&times;</button>
        <h2 style="margin-top: 0; color: #111;">Email Draft</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">It looks like your browser isn't configured to open email apps automatically. You can review the draft below and copy it manually.</p>
        <div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 13px; margin-bottom: 20px; max-height: 400px; overflow-y: auto; color: #333;" id="draftContent">${bodyText}</div>
        <div style="display: flex; gap: 10px;">
          <button onclick="navigator.clipboard.writeText(document.getElementById('draftContent').innerText).then(() => { const btn = this; const oldText = btn.innerText; btn.innerText = 'Copied!'; setTimeout(() => btn.innerText = oldText, 2000); })" style="padding: 10px 20px; background: #1a6f3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Copy to Clipboard</button>
          <button onclick="document.getElementById('emailDraftModal').remove()" style="padding: 10px 20px; background: white; color: #111; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-weight: bold;">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}
async function generateExcelBase64(customerInfo, cart) {
  if (typeof XLSX === 'undefined') return null;
  
  const wb = XLSX.utils.book_new();
  
  const cartData = cart.map((item, index) => ({
    "Item No": index + 1,
    "SKU": item.sku,
    "Product Name": item.name,
    "Category": item.category,
    "Size": item.size || "N/A",
    "Color": item.color || "Standard",
    "Quantity": item.quantity,
    "Branding": item.branding || "None"
  }));
  const wsCart = XLSX.utils.json_to_sheet(cartData);
  XLSX.utils.book_append_sheet(wb, wsCart, "Selected Products");

  const customerData = Object.entries(customerInfo).map(([key, value]) => ({
    "Field": key,
    "Value": value
  }));
  const wsCustomer = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(wb, wsCustomer, "Customer Details");

  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
}

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

  const attachments = [];
  if (base64File) {
    attachments.push({ filename: fileName, content: base64File });
  }

  // Generate Excel
  try {
    const excelBase64 = await generateExcelBase64(customerInfo, cart);
    if (excelBase64) {
      attachments.push({ filename: "Fabric8_Quote_Request.xlsx", content: excelBase64 });
    }
  } catch(err) {
    console.error("Failed to generate Excel:", err);
  }

  const payload = {
    customerInfo,
    cart,
    attachments: attachments
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
      console.error("Resend error:", errorData);
      triggerMailtoFallback(customerInfo, cart);
    }
  } catch (err) {
    console.error("Network error:", err);
    triggerMailtoFallback(customerInfo, cart);
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  }
});

function initSite() {
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('product.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku');
    if (sku) {
      initProductPage(sku);
    }
  } else if (path.includes('checkout.html')) {
    if (typeof renderCart === 'function') renderCart();
  } else {
    // For shop.html and others
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderCart === 'function') renderCart();
    if (typeof setupStudio === 'function') setupStudio();
    if (typeof renderShowcase === 'function') renderShowcase();
  }
}

let productPageData = { sizeQtys: {} };

function initProductPage(sku) {
  const p = products.find(x => x.sku === sku);
  if (!p) return;
  
  selectedProductSku = sku;
  if (!p.colors.includes(activeCatalogColor)) activeCatalogColor = p.colors[0];
  
  const mainImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'White Polo Shirt.png');
  const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
  
  document.getElementById('productMainImage').src = imgSrc;
  document.getElementById('productName').textContent = p.name;
  document.getElementById('productCategory').textContent = p.category;
  document.getElementById('productSku').textContent = `SKU: ${p.sku}`;
  document.getElementById('productDesc').textContent = p.long || p.short || "";
  document.getElementById('productFabric').textContent = p.fabric || "N/A";
  document.getElementById('productGsm').textContent = p.gsm || "N/A";
  if (document.getElementById('productCare')) {
    document.getElementById('productCare').textContent = p.care || "Machine wash cold, tumble dry low.";
  }
  document.getElementById('productAvailability').textContent = p.availability || "Made to Order";
  
  const sketchAcc = document.getElementById('sketchAccordion');
  const sketchImg = document.getElementById('productSketch');
  if (sketchAcc && sketchImg) {
    if (p.sketch) {
      sketchImg.src = p.sketch;
      sketchAcc.style.display = 'block';
    } else {
      sketchAcc.style.display = 'none';
    }
  }

  const thumbnailsContainer = document.getElementById("productThumbnails");
  if (thumbnailsContainer && p.images && p.images.length > 1) {
    thumbnailsContainer.innerHTML = p.images.map(img => {
      return `<img src="${img}" alt="Thumbnail" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 1px solid var(--line);" onclick="document.getElementById('productMainImage').src='${img}'">`;
    }).join("");
  }
  
  // Colors
  const colorFilter = document.getElementById("productColorFilter");
  if (colorFilter) {
    colorFilter.innerHTML = p.colors.map(c => colorButton(c)).join("");
    const activeBtn = colorFilter.querySelector(`[data-color="${CSS.escape(activeCatalogColor)}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }

  // Size / Qty Matrix
  const matrix = document.getElementById("sizeQtyMatrix");
  const minQtyLabel = document.getElementById("minQtyLabel");
  const moqVal = p.moq ? p.moq.replace(/[^0-9]/g, '') || "50" : "50";
  if (minQtyLabel) minQtyLabel.textContent = moqVal;
  
  if (matrix) {
    matrix.innerHTML = (p.sizes || ["Standard"]).map(size => `
      <div style="display: flex; align-items: center; gap: 12px; background: #fff; padding: 8px; border: 1px solid var(--line); border-radius: 8px;">
        <div style="flex: 1; padding: 10px; background: #f9f9f9; border: 1px solid var(--line); border-radius: 4px; font-weight: 800; font-size: 13px;">${size}</div>
        <input type="number" min="0" placeholder="QTY" class="matrix-qty-input" data-size="${size}" style="width: 100px; padding: 10px; text-align: center; border: 1px solid var(--line); border-radius: 4px; font-family: inherit; font-size: 14px;" />
      </div>
    `).join("");
  }

  // Bind color clicks for product page
  colorFilter.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      colorFilter.querySelectorAll(".color-dot").forEach((b) => b.classList.remove("active"));
      const btn = e.target.closest('.color-dot');
      btn.classList.add("active");
      activeCatalogColor = btn.dataset.color;
    });
  });

  // Accordions logic
  document.querySelectorAll('details.accordion summary').forEach(summary => {
    summary.addEventListener('click', (e) => {
      const details = summary.parentElement;
      const span = summary.querySelector('span');
      if (span) {
        span.textContent = details.open ? '+' : '−';
      }
    });
  });
  
  // Customization Type Toggle
  document.querySelectorAll('input[name="customizationType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll(".customization-card").forEach(card => {
        card.style.borderColor = "var(--line)";
        card.style.backgroundColor = "#fff";
      });
      const activeCard = e.target.closest(".customization-card");
      if (activeCard) {
        activeCard.style.borderColor = "var(--green)";
        activeCard.style.backgroundColor = "rgba(47,135,61,0.05)";
      }
      
      const settings = document.getElementById("customizationSettings");
      const logoSet = document.getElementById("logoSettings");
      const textSet = document.getElementById("textSettings");
      
      if (settings) settings.style.display = "block";
      if (e.target.value === 'upload_logo') {
        if (logoSet) logoSet.style.display = "flex";
        if (textSet) textSet.style.display = "none";
      } else {
        if (logoSet) logoSet.style.display = "none";
        if (textSet) textSet.style.display = "flex";
      }
    });
  });
  
  // Initialize text thread colors
  const threadColorDiv = document.getElementById("pageTextThreadColors");
  if (threadColorDiv) {
    threadColorDiv.innerHTML = threadColors.map(c => colorButton(c.name)).join("");
    const defaultColorBtn = threadColorDiv.querySelector(`[data-color="Black"]`);
    if(defaultColorBtn) defaultColorBtn.classList.add('active');
    
    threadColorDiv.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        threadColorDiv.querySelectorAll(".color-dot").forEach((b) => b.classList.remove("active"));
        e.target.closest('.color-dot').classList.add("active");
      });
    });
  }

  // Add to Cart
  document.getElementById("pageAddToCart")?.addEventListener("click", () => {
    let totalQty = 0;
    const sizes = {};
    document.querySelectorAll(".matrix-qty-input").forEach(input => {
      const q = parseInt(input.value);
      if (q && q > 0) {
        sizes[input.dataset.size] = q;
        totalQty += q;
      }
    });
    
    if (totalQty === 0) {
      alert("Please enter a quantity for at least one size.");
      return;
    }
    
    // Check customization
    const custType = document.querySelector('input[name="customizationType"]:checked')?.value;
    let brandingDesc = "Blank";
    if (custType === 'upload_logo') {
      const place = document.getElementById("pageLogoPlacement").selectedOptions[0].text;
      const finish = document.getElementById("pageLogoFinish").selectedOptions[0].text;
      const fileInput = document.getElementById("pageLogoUpload");
      if (!fileInput.files.length) {
        alert("Please upload a logo image.");
        return;
      }
      brandingDesc = `Logo (${finish}) on ${place}`;
    } else if (custType === 'text_embroidery') {
      const text = document.getElementById("pageTextInput1").value;
      if (!text) {
        alert("Please enter text for embroidery.");
        return;
      }
      const place = document.getElementById("pageTextPlacement").selectedOptions[0].text;
      const font = document.getElementById("pageTextFont").selectedOptions[0].text;
      const tColor = document.querySelector("#pageTextThreadColors .color-dot.active")?.dataset.color || "Black";
      brandingDesc = `Text "${text}" (${font}, ${tColor}) on ${place}`;
    }
    
    // Add items for each size
    for (const [size, qty] of Object.entries(sizes)) {
      cart.push({
        ...p,
        quantity: qty,
        color: activeCatalogColor,
        size: size,
        branding: brandingDesc,
        customizationType: custType || null
      });
    }
    
    saveCart();
    alert("Added to cart successfully!");
    window.location.href = "checkout.html";
  });
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
      `<span class="color-dot ${c.name === embroideryData.threadColor ? 'active' : ''}" style="--swatch:${c.hex}; background-color:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-thread-color="${c.name}"></span>`
    ).join("");
  }

  const bgContainer = document.getElementById("wizardBgColors");
  if (bgContainer) {
    bgContainer.innerHTML = threadColors.map(c => 
      `<span class="color-dot bg-color-dot ${c.name === embroideryData.bgColor ? 'active' : ''}" style="--swatch:${c.hex}; background-color:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-bg-color="${c.name}"></span>`
    ).join("");
  }

  const borderContainer = document.getElementById("wizardBorderColors");
  if (borderContainer) {
    borderContainer.innerHTML = threadColors.map(c => 
      `<span class="color-dot border-color-dot ${c.name === embroideryData.borderColor ? 'active' : ''}" style="--swatch:${c.hex}; background-color:${c.hex}; margin-right: 8px; display: inline-block; cursor: pointer; border: 1px solid var(--line); border-radius: 50%; width: 30px; height: 30px;" data-border-color="${c.name}"></span>`
    ).join("");
  }
  
  const emblemOpts = document.getElementById("emblemColorOptions");
  if (emblemOpts) emblemOpts.style.display = "none";
  
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

function renderTextPreview(preview = document.getElementById("wizardTextPreview"), data = embroideryData, isIsolated = false) {
  if (!preview) return;
  
  let text = [];
  for (let i = 1; i <= data.lineCount; i++) {
    if (data.textLines[`line${i}`]) {
      text.push(data.textLines[`line${i}`]);
    }
  }
  preview.innerHTML = text.join("<br>");
  
  let fontFamily = "sans-serif";
  if (data.fontStyle === "script") fontFamily = "cursive, 'Brush Script MT'";
  else if (data.fontStyle === "serif") fontFamily = "serif, 'Times New Roman'";
  else if (data.fontStyle === "athletic") fontFamily = "Impact, sans-serif";
  else if (data.fontStyle === "typewriter") fontFamily = "monospace, 'Courier New'";
  preview.style.fontFamily = fontFamily;
  
  const threadColorObj = threadColors.find(c => c.name === data.threadColor);
  preview.style.color = threadColorObj ? threadColorObj.hex : "#000";
  
  if (data.type === "emblem") {
    const bgObj = threadColors.find(c => c.name === data.bgColor);
    const borderObj = threadColors.find(c => c.name === data.borderColor);
    
    preview.style.backgroundColor = bgObj ? bgObj.hex : "#fff";
    preview.style.border = `3px solid ${borderObj ? borderObj.hex : "#000"}`;
    preview.style.padding = "16px";
    
    if (data.selectedStyleSku === "Style EM1092") {
      preview.style.borderRadius = "50%";
      preview.style.aspectRatio = "1 / 1";
      preview.style.display = "flex";
      preview.style.flexDirection = "column";
      preview.style.justifyContent = "center";
      preview.style.alignItems = "center";
    } else {
      preview.style.borderRadius = "4px";
      preview.style.aspectRatio = "auto";
      preview.style.display = "block";
    }
  } else {
    preview.style.backgroundColor = "transparent";
    preview.style.border = "none";
    preview.style.padding = "0";
    preview.style.borderRadius = "0";
    preview.style.aspectRatio = "auto";
    preview.style.display = "block";
  }

  let scale = 1;
  if (data.size === "small") scale = 0.7;
  else if (data.size === "large") scale = 1.3;

  let baseTransform = isIsolated ? `scale(${scale})` : `translate(-50%, -50%) scale(${scale})`;

  if (!isIsolated) {
    preview.style.left = "50%";
    preview.style.top = "40%";
    preview.style.transform = baseTransform;
    
    const pos = data.position;
    if (pos === "left_chest") { preview.style.left = "65%"; preview.style.top = "35%"; }
    else if (pos === "right_chest") { preview.style.left = "35%"; preview.style.top = "35%"; }
    else if (pos === "right_sleeve") { preview.style.left = "20%"; preview.style.top = "35%"; preview.style.transform = `${baseTransform} rotate(-10deg)`; }
    else if (pos === "left_sleeve") { preview.style.left = "80%"; preview.style.top = "35%"; preview.style.transform = `${baseTransform} rotate(10deg)`; }
    else if (pos === "back") { preview.style.top = "30%"; }
  } else {
    preview.style.transform = baseTransform;
    preview.style.left = "auto";
    preview.style.top = "auto";
  }
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
      branding: brandingString,
      customizationType: "text_embroidery",
      embroideryData: JSON.parse(JSON.stringify(embroideryData)),
      logoData: null
    });
  }
  saveCart();
  renderCart();
  document.getElementById("textWizardModal").style.display = "none";
  
  const productModal = document.getElementById("productModal");
  if (productModal) productModal.style.display = "none";
  const productSidebar = document.getElementById("productSidebar");
  if (productSidebar) productSidebar.classList.remove("open");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");
  
  setTimeout(() => {
    const quoteSection = document.getElementById("quote");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
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
    document.querySelectorAll("#wizardThreadColors .color-dot").forEach(d => d.classList.remove("active"));
    threadColorDot.classList.add("active");
    embroideryData.threadColor = threadColorDot.dataset.threadColor;
    renderTextPreview();
  }

  const bgColorDot = e.target.closest("#wizardBgColors .bg-color-dot");
  if (bgColorDot) {
    document.querySelectorAll("#wizardBgColors .bg-color-dot").forEach(d => d.classList.remove("active"));
    bgColorDot.classList.add("active");
    embroideryData.bgColor = bgColorDot.dataset.bgColor;
    renderTextPreview();
  }

  const borderColorDot = e.target.closest("#wizardBorderColors .border-color-dot");
  if (borderColorDot) {
    document.querySelectorAll("#wizardBorderColors .border-color-dot").forEach(d => d.classList.remove("active"));
    borderColorDot.classList.add("active");
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
  if (e.target.id === "wizardSize") {
    embroideryData.size = e.target.value;
    renderTextPreview();
  }
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


// --- ISOLATED EDIT MODALS LOGIC ---
let editingCartIndex = -1;

function renderEditOrderSummaryModal(index) {

  const item = cart[index];

  if (!item) return;

  const content = document.getElementById("editOrderSummaryContent");

  if (!content) return;



  content.innerHTML = `

    <div style="background: #f9f9f9; padding: 16px; border: 1px solid var(--line); border-radius: 4px;">

      <h3 style="margin: 0 0 12px 0;">${item.name} <span style="font-weight: normal; font-size: 13px; color: var(--muted);">(${item.sku})</span></h3>

      

      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding: 8px 0;">

        <span><strong>Size:</strong> ${item.size || "N/A"}</span>

        <button type="button" onclick="openEditBasicDetails()" style="color: var(--ink); font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Change</button>

      </div>



      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding: 8px 0;">

        <span><strong>Color:</strong> ${item.color || "Standard"}</span>

        <button type="button" onclick="openEditBasicDetails()" style="color: var(--ink); font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Change</button>

      </div>



      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding: 8px 0;">

        <span><strong>Quantity:</strong> ${item.quantity}</span>

        <button type="button" onclick="openEditBasicDetails()" style="color: var(--ink); font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Change</button>

      </div>



      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0;">

        <span style="flex: 1;"><strong>Branding:</strong><br>${item.branding || "No branding selected"}</span>

        <button type="button" onclick="openEditBranding()" style="color: var(--ink); font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Change</button>

      </div>

    </div>

  `;



  document.getElementById("editOrderSummaryModal").style.display = "flex";

}



window.openEditBasicDetails = function() {

  const item = cart[editingCartIndex];

  if (!item) return;

  const product = products.find(p => p.sku === item.sku);

  

  // Populate Sizes

  const sizeSelect = document.getElementById("editBasicSize");

  if (sizeSelect && product) {

    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>`).join("");

  }

  

  // Populate Colors

  const colorFilter = document.getElementById("editBasicColorFilter");

  if (colorFilter && product) {

    colorFilter.innerHTML = product.colors.map(c => colorButton(c)).join("");

    const activeBtn = colorFilter.querySelector(`[data-color="${CSS.escape(item.color)}"]`);

    if (activeBtn) activeBtn.classList.add("active");

  }

  

  // Populate Quantity

  const qtyInput = document.getElementById("editBasicQty");

  if (qtyInput) qtyInput.value = item.quantity;



  document.getElementById("editOrderSummaryModal").style.display = "none";

  document.getElementById("editBasicDetailsModal").style.display = "flex";

}



window.openEditBranding = function() {

  const item = cart[editingCartIndex];

  if (!item) return;

  const product = products.find(p => p.sku === item.sku);

  

  document.getElementById("editOrderSummaryModal").style.display = "none";

  

  if (item.customizationType === "text_embroidery" && item.embroideryData) {

    // Populate simplified text wizard

    const shirtImg = document.getElementById("editTextShirt");

    if (shirtImg && product) {

      const colorImg = product.images?.find((img) => img.toLowerCase().includes(item.color.toLowerCase()));

      shirtImg.src = colorImg || (product.image || 'White T-Shirt.png');

    }

    

    // Set thread colors

    const threadContainer = document.getElementById("editTextThreadColors");

    if (threadContainer) {

      threadContainer.innerHTML = threadColors.map(c => 

        `<span class="color-dot ${c.name === item.embroideryData.threadColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block;" data-edit-thread-color="${c.name}"></span>`

      ).join("");

    }

    

    // Set Emblem Colors (if applicable)

    const emblemColorsGroup = document.getElementById("editEmblemColors");

    if (item.embroideryData.type === "emblem" && emblemColorsGroup) {

      emblemColorsGroup.style.display = "flex";

      

      const bgContainer = document.getElementById("editTextBgColors");

      if (bgContainer) {

        bgContainer.innerHTML = threadColors.map(c => 

          `<span class="bg-color-dot color-dot ${c.name === item.embroideryData.bgColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block;" data-edit-bg-color="${c.name}"></span>`

        ).join("");

      }

      

      const borderContainer = document.getElementById("editTextBorderColors");

      if (borderContainer) {

        borderContainer.innerHTML = threadColors.map(c => 

          `<span class="border-color-dot color-dot ${c.name === item.embroideryData.borderColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block;" data-edit-border-color="${c.name}"></span>`

        ).join("");

      }

    } else if (emblemColorsGroup) {

      emblemColorsGroup.style.display = "none";

    }

    

    // Set details

    const placementEl = document.getElementById("editTextPlacement");

    if (placementEl) placementEl.value = item.embroideryData.position || "left_chest";

    

    const sizeEl = document.getElementById("editTextSize");

    if (sizeEl) sizeEl.value = item.embroideryData.size || "medium";

    

    const fontStyleEl = document.getElementById("editTextFontStyle");

    if (fontStyleEl) fontStyleEl.value = item.embroideryData.fontStyle || "block";

    

    const lineCountEl = document.getElementById("editTextLineCount");

    if (lineCountEl) lineCountEl.value = item.embroideryData.lineCount || 1;

    

    const templateStyleGroup = document.getElementById("editTemplateStyleGroup");

    const templateStyleEl = document.getElementById("editTextTemplateStyle");

    if (item.embroideryData.type === "emblem") {

      if (templateStyleGroup) templateStyleGroup.style.display = "flex";

      if (templateStyleEl) templateStyleEl.value = item.embroideryData.selectedStyleSku || "Style EM1092";

    } else {

      if (templateStyleGroup) templateStyleGroup.style.display = "none";

    }



    // Set texts

    const textContainer = document.getElementById("editTextsContainer");

    if (textContainer) {

      let html = "";

      for (let i = 1; i <= item.embroideryData.lineCount; i++) {

        html += `

          <div>

            <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 6px;">Line ${i} Text</label>

            <input type="text" class="edit-text-input" data-line="${i}" maxlength="20" value="${item.embroideryData.textLines[`line${i}`] || ''}" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;">

          </div>

        `;

      }

      textContainer.innerHTML = html;

    }

    

    // Set Preview Content

    renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    

    document.getElementById("editTextBrandingModal").style.display = "flex";

    

  } else if (item.customizationType === "upload_logo") {

    const shirtImg = document.getElementById("editLogoShirt");

    if (shirtImg && product) {

      const colorImg = product.images?.find((img) => img.toLowerCase().includes(item.color.toLowerCase()));

      shirtImg.src = colorImg || (product.image || 'White T-Shirt.png');

    }

    

    const previewBox = document.getElementById("editLogoPreview");

    if (item.logoData) {

      if (previewBox) {

        previewBox.innerHTML = ''; // clear

        previewBox.className = `logo-box ${item.logoData.placement}`;

        if (item.logoData.imageSrc) {

          const img = document.createElement("img");

          img.src = item.logoData.imageSrc;

          img.style.maxWidth = "150px";

          img.style.maxHeight = "150px";

          img.style.marginBottom = "20px";

          img.style.objectFit = "contain";

          previewBox.appendChild(img);

        }

      }

      const placementEl = document.getElementById("editLogoPlacement");

      if (placementEl) placementEl.value = item.logoData.placement || "left-chest";

      const sizeEl = document.getElementById("editLogoSize");

      if (sizeEl) sizeEl.value = item.logoData.size || "4";

      const finishEl = document.getElementById("editLogoFinish");

      if (finishEl) finishEl.value = item.logoData.finish || "Embroidery";

    }

    document.getElementById("editLogoBrandingModal").style.display = "flex";

  } else {

    // No branding, so we can't edit branding. Just alert.

    alert("This item has no branding configured. If you wish to add branding, please remove this item and configure a new one.");

    document.getElementById("editOrderSummaryModal").style.display = "flex";

  }

}



// Event Listeners for Isolated Modals

document.addEventListener("click", (e) => {

  // Close buttons

  if (e.target.id === "closeEditOrderSummary" || e.target.id === "finishEditOrderBtn") {
    document.getElementById("editOrderSummaryModal").style.display = "none";
    editingCartIndex = -1;
    if (e.target.id === "finishEditOrderBtn") {
      setTimeout(() => {
        const quoteSection = document.getElementById("quote");
        if (quoteSection) {
          quoteSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }

  if (e.target.id === "closeEditBasicDetails") {

    document.getElementById("editBasicDetailsModal").style.display = "none";

    document.getElementById("editOrderSummaryModal").style.display = "flex";

  }

  if (e.target.id === "closeEditTextBranding") {

    document.getElementById("editTextBrandingModal").style.display = "none";

    document.getElementById("editOrderSummaryModal").style.display = "flex";

  }

  if (e.target.id === "closeEditLogoBranding") {

    document.getElementById("editLogoBrandingModal").style.display = "none";

    document.getElementById("editOrderSummaryModal").style.display = "flex";

  }

  

  // Basic Details Color Selection

  const editColorDot = e.target.closest("#editBasicColorFilter .color-dot");

  if (editColorDot) {

    const parent = editColorDot.parentElement;

    parent.querySelectorAll(".color-dot").forEach((btn) => btn.classList.remove("active"));

    editColorDot.classList.add("active");

  }

  

  // Text Embroidery Thread Color

  const editThreadDot = e.target.closest("#editTextThreadColors .color-dot");

  if (editThreadDot) {

    const parent = editThreadDot.parentElement;

    parent.querySelectorAll(".color-dot").forEach((btn) => btn.classList.remove("active"));

    editThreadDot.classList.add("active");

    

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      item.embroideryData.threadColor = editThreadDot.dataset.editThreadColor;

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }



  // Emblem Bg Color

  const editBgDot = e.target.closest("#editTextBgColors .color-dot");

  if (editBgDot) {

    const parent = editBgDot.parentElement;

    parent.querySelectorAll(".color-dot").forEach((btn) => btn.classList.remove("active"));

    editBgDot.classList.add("active");

    

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      item.embroideryData.bgColor = editBgDot.dataset.editBgColor;

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }



  // Emblem Border Color

  const editBorderDot = e.target.closest("#editTextBorderColors .color-dot");

  if (editBorderDot) {

    const parent = editBorderDot.parentElement;

    parent.querySelectorAll(".color-dot").forEach((btn) => btn.classList.remove("active"));

    editBorderDot.classList.add("active");

    

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      item.embroideryData.borderColor = editBorderDot.dataset.editBorderColor;

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }



  // Save Buttons

  if (e.target.id === "saveEditBasicBtn") {

    const item = cart[editingCartIndex];

    if (item) {

      item.size = document.getElementById("editBasicSize").value;

      item.quantity = parseInt(document.getElementById("editBasicQty").value) || item.quantity;

      const activeColorDot = document.querySelector("#editBasicColorFilter .color-dot.active");

      if (activeColorDot) item.color = activeColorDot.dataset.color;

      

      saveCart();

      renderCart();

    }

    document.getElementById("editBasicDetailsModal").style.display = "none";

    renderEditOrderSummaryModal(editingCartIndex);

  }

  

  if (e.target.id === "saveEditTextBtn") {

    const item = cart[editingCartIndex];

    if (item && item.customizationType === "text_embroidery") {

      const activeThreadDot = document.querySelector("#editTextThreadColors .color-dot.active");

      if (activeThreadDot) item.embroideryData.threadColor = activeThreadDot.dataset.editThreadColor;

      

      document.querySelectorAll(".edit-text-input").forEach(input => {

        const lineNum = input.dataset.line;

        item.embroideryData.textLines[`line${lineNum}`] = input.value;

      });

      

      let linesText = [];

      for (let i = 1; i <= item.embroideryData.lineCount; i++) linesText.push(item.embroideryData.textLines[`line${i}`]);

      const emblemColorsStr = item.embroideryData.type === "emblem" ? `, Bg: ${item.embroideryData.bgColor}, Border: ${item.embroideryData.borderColor}` : "";

      item.branding = `Text Embroidery (${item.embroideryData.type}), ${item.embroideryData.selectedStyleSku}, ${item.embroideryData.fontStyle} font, ${item.embroideryData.threadColor} thread${emblemColorsStr}, Pos: ${item.embroideryData.position}, Texts: [${linesText.join(' | ')}]`;

      

      saveCart();

      renderCart();

    }

    document.getElementById("editTextBrandingModal").style.display = "none";

    renderEditOrderSummaryModal(editingCartIndex);

  }



  if (e.target.id === "saveEditLogoBtn") {

    const item = cart[editingCartIndex];

    if (item && item.customizationType === "upload_logo") {

      item.logoData.placement = document.getElementById("editLogoPlacement").value;

      item.logoData.size = document.getElementById("editLogoSize").value;

      item.logoData.finish = document.getElementById("editLogoFinish").value;

      item.branding = `Upload Logo, Placement: ${item.logoData.placement}, Size: ${item.logoData.size}in, Finish: ${item.logoData.finish}`;

      saveCart();

      renderCart();

    }

    document.getElementById("editLogoBrandingModal").style.display = "none";

    renderEditOrderSummaryModal(editingCartIndex);

  }

});



// Update Preview dynamically

document.addEventListener("input", (e) => {

  if (e.target.classList.contains("edit-text-input")) {

    const lineNum = e.target.dataset.line;

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      item.embroideryData.textLines[`line${lineNum}`] = e.target.value;

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }

});



document.addEventListener("change", (e) => {

  if (e.target.id === "editLogoPlacement") {

    const item = cart[editingCartIndex];

    if (item && item.logoData) {

      item.logoData.placement = e.target.value;

      const previewBox = document.getElementById("editLogoPreview");

      if (previewBox) previewBox.className = `logo-box ${e.target.value}`;

    }

  }

  

  if (["editTextPlacement", "editTextSize", "editTextFontStyle", "editTextTemplateStyle"].includes(e.target.id)) {

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      if (e.target.id === "editTextPlacement") item.embroideryData.position = e.target.value;

      if (e.target.id === "editTextSize") item.embroideryData.size = e.target.value;

      if (e.target.id === "editTextFontStyle") item.embroideryData.fontStyle = e.target.value;

      if (e.target.id === "editTextTemplateStyle") item.embroideryData.selectedStyleSku = e.target.value;

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }

  if (e.target.id === "editTextLineCount") {

    const item = cart[editingCartIndex];

    if (item && item.embroideryData) {

      item.embroideryData.lineCount = parseInt(e.target.value);

      

      // Re-render text inputs

      const textContainer = document.getElementById("editTextsContainer");

      if (textContainer) {

        let html = "";

        for (let i = 1; i <= item.embroideryData.lineCount; i++) {

          html += `

            <div>

              <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 6px;">Line ${i} Text</label>

              <input type="text" class="edit-text-input" data-line="${i}" maxlength="20" value="${item.embroideryData.textLines[`line${i}`] || ''}" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;">

            </div>

          `;

        }

        textContainer.innerHTML = html;

      }

      renderTextPreview(document.getElementById("editTextPreviewBox"), item.embroideryData, true);

    }

  }





  if (e.target.id === "editLogoUpload") {

    const file = e.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = (ev) => {

        const item = cart[editingCartIndex];

        if (item && item.logoData) {

          item.logoData.imageSrc = ev.target.result;

          const previewBox = document.getElementById("editLogoPreview");

          if (previewBox) {

            previewBox.innerHTML = '';

            const img = document.createElement("img");

            img.src = item.logoData.imageSrc;

            img.style.maxWidth = "150px";

            img.style.maxHeight = "150px";

            img.style.marginBottom = "20px";

            img.style.objectFit = "contain";

            previewBox.appendChild(img);

          }

        }

      };

      reader.readAsDataURL(file);

    }

  }

});


// Dynamic Homepage Showcase
function renderShowcase() {
  const showcase = document.getElementById('dynamicShowcase');
  if (!showcase || !products || products.length === 0) return;

  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);
  
  showcase.innerHTML = selected.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'White Polo Shirt.png');
    const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
    
    return `<article class="product-card">
      <a href="product.html?sku=${p.sku}" style="text-decoration: none; color: inherit; display: block; height: 100%; position: relative;">
        <div style="background: #fff; padding: 24px; display: grid; place-items: center; border-bottom: 1px solid var(--line); aspect-ratio: 4/5;">
          <img src="${imgSrc}" alt="${p.name}" style="max-height: 100%; max-width: 100%; object-fit: contain; mix-blend-mode: multiply;">
        </div>
        <div class="product-card-info" style="padding: 16px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 900; line-height: 1.3;">${p.name || 'Product'}</h3>
          <p style="margin: 4px 0 0; font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase;">${p.category || 'Apparel'}</p>
        </div>
        <div class="product-card-overlay">
          <span style="color: #fff; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; font-size: 13px;">+ View Details</span>
        </div>
      </a>
    </article>`;
  }).join('');
}
