// Toast Notification System for Store & Studio
window.showToast = function(message, type = 'success', duration = 6000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-notice ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
  const msgEl = document.createElement('span');
  msgEl.style.whiteSpace = 'pre-line';
  msgEl.textContent = message;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);
  container.appendChild(toast);
  if (duration > 0) {
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }
};

let products = [];
let siteSettings = {};

function applySiteSettings() {
  if (siteSettings.banners) {
    const path = window.location.pathname.toLowerCase();
    let pageKey = 'home';
    if (path.includes('shop') || path.includes('product') || path.includes('checkout') || path.includes('branding')) pageKey = 'shop';
    else if (path.includes('services')) pageKey = 'services';
    else if (path.includes('sectors')) pageKey = 'sectors';
    else if (path.includes('method')) pageKey = 'method';
    else if (path.includes('about')) pageKey = 'about';
    else if (path.includes('contact')) pageKey = 'contact';

    const bannerText = siteSettings.banners[pageKey];
    if (bannerText && bannerText.trim() !== '') {
      document.querySelectorAll('.promo-banner p, .topline a').forEach(el => {
        if (el.id !== 'cmsMethodBrochureLink' && el.id !== 'cmsAboutProfileLink') {
          // Do not overwrite topline on shop, services, sectors
          if (el.closest('.topline') && (path.includes('shop') || path.includes('product') || path.includes('checkout') || path.includes('branding') || path.includes('services') || path.includes('sectors'))) {
            return;
          }
          el.textContent = bannerText;
        }
      });
    }
  }
  if (siteSettings.footerLegal) {
    document.querySelectorAll('.site-footer-bottom p, footer > div:last-child').forEach(footer => {
      footer.innerHTML = siteSettings.footerLegal;
    });
  }
  
  const sc = siteSettings.siteContent || {};
  // 1. Homepage Engine
  if (sc.homeHeroTitle) {
    const heroTitle = document.getElementById('cmsHomeHeroTitle');
    if (heroTitle) heroTitle.textContent = sc.homeHeroTitle;
  }
  if (sc.homeHeroSubtitle) {
    const heroSub = document.getElementById('cmsHomeHeroSub');
    if (heroSub) heroSub.textContent = sc.homeHeroSubtitle;
  }
  if (sc.homeHeroBtnText) {
    const heroBtn = document.getElementById('cmsHomeHeroBtn');
    if (heroBtn) heroBtn.textContent = sc.homeHeroBtnText;
  }
  if (sc.heroImage && document.getElementById('cmsHomeHeroTitle')) {
    const heroBg = document.querySelector('.page-hero');
    if (heroBg) {
      heroBg.style.background = `linear-gradient(90deg, rgba(0,0,0,.84), rgba(0,0,0,.22)), url('${sc.heroImage}') center / cover`;
    }
  }
  if (sc.promoImage) {
    const promoEl = document.getElementById('cmsPromoGraphic');
    if (promoEl) promoEl.src = sc.promoImage;
  }

  // 2. Services Page Engine
  if (sc.servicesTitle) {
    const el = document.getElementById('cmsServicesTitle');
    if (el) el.textContent = sc.servicesTitle;
  }
  if (sc.servicesSub) {
    const el = document.getElementById('cmsServicesSub');
    if (el) el.textContent = sc.servicesSub;
  }
  if (sc.servicesConsultImg) {
    const el = document.getElementById('cmsServicesConsultImg');
    if (el) el.src = sc.servicesConsultImg;
  }
  if (sc.servicesBrandImg) {
    const el = document.getElementById('cmsServicesBrandImg');
    if (el) el.src = sc.servicesBrandImg;
  }
  if (sc.servicesProdImg) {
    const el = document.getElementById('cmsServicesProdImg');
    if (el) el.src = sc.servicesProdImg;
  }

  // 3. Method Page Engine
  if (sc.methodTitle) {
    const el = document.getElementById('cmsMethodTitle');
    if (el) el.textContent = sc.methodTitle;
  }
  if (sc.methodSub) {
    const el = document.getElementById('cmsMethodSub');
    if (el) el.textContent = sc.methodSub;
  }
  if (sc.methodBrochure || sc.methodLeafletUrl) {
    const el = document.getElementById('cmsMethodBrochureLink');
    if (el) el.href = sc.methodBrochure || sc.methodLeafletUrl;
  }
  if (sc.companyProfileUrl) {
    const el = document.getElementById('cmsAboutProfileLink');
    if (el) el.href = sc.companyProfileUrl;
  }

  // 4. Sectors Showcase Engine
  if (sc.sectorsTitle) {
    const el = document.getElementById('cmsSectorsTitle');
    if (el) el.textContent = sc.sectorsTitle;
  }
  if (sc.sectorsSub) {
    const el = document.getElementById('cmsSectorsSub');
    if (el) el.textContent = sc.sectorsSub;
  }
  if (sc.sectorsHeroImg) {
    const el = document.getElementById('cmsSectorsHeroBg');
    if (el) {
      el.style.background = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url('${sc.sectorsHeroImg}') center / cover`;
    }
  }

  // 5. About Us & Core Values Engine
  if (sc.aboutTitle) {
    const el = document.getElementById('cmsAboutTitle');
    if (el) el.textContent = sc.aboutTitle;
  }
  if (sc.aboutSub) {
    const el = document.getElementById('cmsAboutSub');
    if (el) el.textContent = sc.aboutSub;
  }
  if (sc.aboutMission) {
    const el = document.getElementById('cmsAboutMission');
    if (el) el.textContent = sc.aboutMission;
  }
  if (sc.aboutVision) {
    const el = document.getElementById('cmsAboutVision');
    if (el) el.textContent = sc.aboutVision;
  }
  if (sc.aboutImage) {
    const el = document.getElementById('cmsAboutImage');
    if (el) el.src = sc.aboutImage;
    const heroBg = document.getElementById('cmsAboutHeroBg');
    if (heroBg) {
      heroBg.style.background = `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url('${sc.aboutImage}') center / cover`;
    }
  }

  // 6. Contact Information & Global Footers Engine
  if (sc.contactHQ) {
    const el = document.getElementById('cmsContactHQText');
    if (el) el.innerHTML = sc.contactHQ.replace(/\n/g, '<br>');
  }
  if (sc.contactUSA) {
    const el = document.getElementById('cmsContactUSAText');
    if (el) el.textContent = `USA: ${sc.contactUSA}`;
  }
  if (sc.contactJordan) {
    const el = document.getElementById('cmsContactJordanText');
    if (el) el.textContent = `Jordan: ${sc.contactJordan}`;
  }
  if (sc.contactEmail) {
    const el = document.getElementById('cmsContactEmailText');
    if (el) {
      el.textContent = sc.contactEmail;
      el.href = `mailto:${sc.contactEmail}`;
    }
  }

  // Social Links Engine
  document.querySelectorAll('#cmsSocialInstagram').forEach(el => {
    if (sc.socialInstagram) { el.href = sc.socialInstagram; el.style.display = "inline-block"; }
    else { el.style.display = "none"; }
  });
  document.querySelectorAll('#cmsSocialFacebook').forEach(el => {
    if (sc.socialFacebook) { el.href = sc.socialFacebook; el.style.display = "inline-block"; }
    else { el.style.display = "none"; }
  });
  document.querySelectorAll('#cmsSocialLinkedIn').forEach(el => {
    if (sc.socialLinkedIn) { el.href = sc.socialLinkedIn; el.style.display = "inline-block"; }
    else { el.style.display = "none"; }
  });

  // 7. Legal Agreements Engine
  const lc = siteSettings.legalContent || {};
  if (lc.termsText) {
    const termsEl = document.getElementById('cmsTermsContent');
    if (termsEl) termsEl.innerText = lc.termsText;
  }
  if (lc.privacyText) {
    const privacyEl = document.getElementById('cmsPrivacyContent');
    if (privacyEl) privacyEl.innerText = lc.privacyText;
  }

  // 8. Branding Studio Placements (product-customizer.html)
  const bs = siteSettings.brandingSettings || {};
  const dtfSelect = document.getElementById('dtfPlacementSelect');
  if (dtfSelect && bs.dtfPlacements) {
    dtfSelect.innerHTML = bs.dtfPlacements.map(p => `<option value="${p.toLowerCase().replace(/ /g, '-')}">${p}</option>`).join("");
  }
  const embSelect = document.getElementById('embPlacementSelect');
  if (embSelect && bs.embPlacements) {
    embSelect.innerHTML = bs.embPlacements.map(p => `<option value="${p.toLowerCase().replace(/ /g, '-')}">${p}</option>`).join("");
  }
}


async function loadProducts() {
  try {
    const settingsRes = await fetch('data/admin_settings.json?t=' + Date.now());
    if (settingsRes.ok) {
      siteSettings = await settingsRes.json();
      applySiteSettings();
    }
  } catch (err) {
    console.warn("Could not load admin settings.");
  }

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
  "Dark Green": "#1e4d2b",
  "Olive Green": "#556b2f",
  "Army Green": "#4b5320",
  Red: "#b7342b",
  Burgundy: "#6e1f32",
  Beige: "#cbb99d",
  Charcoal: "#3a3d3d",
  Blue: "#2f6fb3",
  "Light Blue": "#add8e6",
  "Baby Blue": "#89cff0",
  "Turquoise Blue": "#00b5e2",
  "Ocean Blue": "#0077be",
  "American Blue": "#3b3b6d",
  "Puple Blue": "#4b0082",
  "Purple Blue": "#4b0082",
  Kiwi: "#8ee53f",
  Pink: "#ffc0cb",
  Brown: "#5c4033",
  Orange: "#ffa500",
  Yellow: "#ffd700",
  "Light Yellow": "#fffacd",
  Purple: "#800080",
  "Black Striped": "linear-gradient(45deg,#111 0 20%,#fff 20% 40%,#111 40% 60%,#fff 60% 80%,#111 80%)",
  Striped: "linear-gradient(45deg,#111 0 20%,#fff 20% 40%,#111 40% 60%,#fff 60% 80%,#111 80%)",
  "Custom Colors": "linear-gradient(135deg,#2f873d,#75aee0,#e79aa3,#d3d116)"
};

function saveCart() {
  localStorage.setItem("fabric8QuoteCart", JSON.stringify(cart));
}


let activeSectorFilter = "All";
let activeCategoryFilter = "All";
let activeSearchTerm = "";
let activeSortTerm = "featured";

function renderFilters() {
  let allowedSectors = ["Food & beverage", "Hospitality", "Corporate", "Healthcare", "Industrial"];
  if (siteSettings.categories1stLayer && Array.isArray(siteSettings.categories1stLayer)) {
    allowedSectors = siteSettings.categories1stLayer.filter(c => c.enabled !== false).map(c => c.name);
  } else if (siteSettings.visibleSectors && siteSettings.visibleSectors.length > 0) {
    allowedSectors = siteSettings.visibleSectors;
  }

  const sectorContainer = document.getElementById("sectorFilterContainer");
  if (sectorContainer) {
    let sHtml = `<button type="button" class="category-btn ${activeSectorFilter === 'All' ? 'active' : ''}" data-sec="All">All Sectors</button>`;
    allowedSectors.forEach(sec => {
      sHtml += `<button type="button" class="category-btn ${activeSectorFilter === sec ? 'active' : ''}" data-sec="${sec}">${sec}</button>`;
    });
    sectorContainer.innerHTML = sHtml;
    sectorContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeSectorFilter = e.target.dataset.sec;
        renderFilters();
        renderProducts();
      });
    });
  }

  let allowedCategories = ["Head Wear", "Top Wear", "Bottom Wear", "Outer Wear", "Accessories"];
  if (siteSettings.categories2ndLayer && Array.isArray(siteSettings.categories2ndLayer)) {
    allowedCategories = siteSettings.categories2ndLayer.filter(c => c.enabled !== false).map(c => c.name);
  } else if (siteSettings.visibleCategories && siteSettings.visibleCategories.length > 0) {
    allowedCategories = siteSettings.visibleCategories;
  }

  const categoryContainer = document.getElementById("categoryFilterContainer");
  if (categoryContainer) {
    let cHtml = `<button type="button" class="category-btn ${activeCategoryFilter === 'All' ? 'active' : ''}" data-cat="All">All Categories</button>`;
    allowedCategories.forEach(cat => {
      cHtml += `<button type="button" class="category-btn ${activeCategoryFilter === cat ? 'active' : ''}" data-cat="${cat}">${cat}</button>`;
    });
    categoryContainer.innerHTML = cHtml;
    categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategoryFilter = e.target.dataset.cat;
        renderFilters();
        renderProducts();
      });
    });
  }
}

function renderProducts() {
  renderFilters();
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  activeSearchTerm = document.getElementById("productSearch")?.value.toLowerCase() || "";
  activeSortTerm = document.getElementById("sortFilter")?.value || "featured";

  let filtered = products;

  const activeGenderFilter = document.getElementById("genderFilter")?.value || "All";
  if (activeGenderFilter !== "All") {
    filtered = filtered.filter(p => {
      const gLower = (p.gender || "Unisex").toLowerCase();
      if (activeGenderFilter === "Unisex") return gLower.includes("unisex");
      if (activeGenderFilter === "Men") return gLower.includes("men") && !gLower.includes("women");
      if (activeGenderFilter === "Women") return gLower.includes("women");
      return true;
    });
  }

  if (activeSectorFilter !== "All") {
    filtered = filtered.filter(p => p.sectors && p.sectors.toLowerCase().includes(activeSectorFilter.toLowerCase()));
  }

  if (activeCategoryFilter !== "All") {
    filtered = filtered.filter(p => p.category && p.category.toLowerCase().replace(/\s/g, '') === activeCategoryFilter.toLowerCase().replace(/\s/g, ''));
  }

  if (activeSearchTerm) {
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(activeSearchTerm)) || 
      (p.sku && p.sku.toLowerCase().includes(activeSearchTerm)) ||
      (p.description && p.description.toLowerCase().includes(activeSearchTerm)) ||
      (p.short && p.short.toLowerCase().includes(activeSearchTerm)) ||
      (p.long && p.long.toLowerCase().includes(activeSearchTerm)) ||
      (p.category && p.category.toLowerCase().includes(activeSearchTerm)) ||
      (p.sectors && p.sectors.toLowerCase().includes(activeSearchTerm))
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
      imagesHtml = p.images.map((img, idx) => 
        `<img id="img-${p.sku}-${idx}" src="${img}" alt="${p.name}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: contain; padding: 20px; opacity: ${idx === 0 ? 1 : 0}; transition: opacity 0.6s ease-in-out;">`
      ).join('');
    } else {
      imagesHtml = `<img src="${imgSrc}" alt="${p.name}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: contain; padding: 20px;">`;
    }

    return `
      <div class="product-card" onclick="window.location.href='product.html?sku=${p.sku}'">
        <div class="product-card-img" ${(p.images && p.images.length > 1) ? `onmouseenter="window.startSlideshow('${p.sku}', ${p.images.length})" onmouseleave="window.stopSlideshow('${p.sku}', ${p.images.length})"` : ''}>
          ${imagesHtml}
        </div>
        <div class="product-card-info">
          <p class="product-card-category" style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
            <span>${p.category} | ${p.sku}</span>
            ${p.gender ? `<span style="background: #f0eee9; color: var(--ink); padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 800; letter-spacing: 0.02em;">${p.gender}</span>` : ''}
            ${p.sectors ? `<span style="width: 100%; font-size: 10px; color: var(--muted); text-transform: capitalize; margin-top: 2px;">Sectors: ${p.sectors}</span>` : ''}
          </p>
          <h3 class="product-card-title">${p.name}</h3>
        </div>
      </div>
    `;
  }).join("");
}


window.slideshowTimers = {};
window.slideshowIndices = {};

window.startSlideshow = function(sku, maxIdx) {
  if (window.slideshowTimers[sku]) clearInterval(window.slideshowTimers[sku]);
  window.slideshowIndices[sku] = window.slideshowIndices[sku] || 0;
  window.nextImage(sku, maxIdx);
  window.slideshowTimers[sku] = setInterval(() => {
    window.nextImage(sku, maxIdx);
  }, 1200); // 1.2s allows time to see the view
};

window.stopSlideshow = function(sku, maxIdx) {
  if (window.slideshowTimers[sku]) {
    clearInterval(window.slideshowTimers[sku]);
    window.slideshowTimers[sku] = null;
  }
  window.slideshowIndices[sku] = 0;
  for (let i = 0; i < maxIdx; i++) {
    const img = document.getElementById(`img-${sku}-${i}`);
    if (img) img.style.opacity = i === 0 ? "1" : "0";
  }
};

window.nextImage = function(sku, maxIdx) {
  let curr = window.slideshowIndices[sku];
  let next = curr + 1;
  if (next >= maxIdx) next = 0;
  window.slideshowIndices[sku] = next;

  for (let i = 0; i < maxIdx; i++) {
    const img = document.getElementById(`img-${sku}-${i}`);
    if (img) img.style.opacity = i === next ? "1" : "0";
  }
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
        return `<img src="${img}" alt="Thumbnail" style="width: 60px; height: 60px; object-fit: contain; padding: 2px; background: #f0f0f0; border-radius: 4px; cursor: pointer; border: 1px solid var(--line);" onclick="document.getElementById('modalProductImage').src='${img}'">`;
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
    showToast("Please select a size before adding to the cart.", "warning");
    return;
  }
  if (!activeCatalogColor) {
    showToast("Please select a color before adding to the cart.", "warning");
    return;
  }
  if (quantity < 1 || isNaN(quantity)) {
    showToast("Please enter a valid quantity.", "warning");
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
    let val = parseFloat(event.target.value);
    const maxScale = siteSettings.logoMaxScale || 15;
    if (val > maxScale) {
       val = maxScale;
       event.target.value = maxScale;
    }
    $("#logoPreview").style.setProperty("--logo-size", `${val}%`);
  });

  const logoPreview = $("#logoPreview");
  const placementSelect = $("#placementSelect");
  if (siteSettings.lockPositions && placementSelect) {
    Array.from(placementSelect.options).forEach(opt => {
      if (opt.value === "custom") {
        opt.disabled = true;
        opt.textContent = "Custom Position (Locked by Admin)";
      }
    });
  }
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
      showToast("Please upload your logo file before adding this item to the quote cart.", "warning");
      return;
    }
    
    if (!$("#logoDisclaimer")?.checked) {
      showToast("You must agree to the legal disclaimer before adding a branded mockup.", "warning");
      return;
    }
    
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) {
      showToast("Please select a product from the catalog first.", "warning");
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
    const item = cart[editingCartIndex];
    if (item) {
      if (confirm("You will be redirected to the Branding Studio to edit this item. The current item will be removed from your cart.")) {
        cart.splice(editingCartIndex, 1);
        saveCart();
        const queryParams = new URLSearchParams({
          sku: item.sku || "F8-STUDIO-CUSTOM",
          name: item.name || "Custom Uniform Garment",
          color: item.color || "Standard",
          size: item.size || "Assorted",
          qty: item.quantity || 50,
        });
        window.location.href = `product-customizer.html?_cb=${Date.now()}&${queryParams.toString()}`;
      }
    }
  }
  
  if (addSelected) {
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) return;
    
    const quantity = parseInt($("#modalProductQuantity")?.value || 50);
    const selectedSize = $("#modalSizeSelect")?.value;

    if (!selectedSize) {
      showToast("Please select a size before proceeding.", "warning");
      return;
    }
    if (!activeCatalogColor) {
      showToast("Please select a color before proceeding.", "warning");
      return;
    }
    if (quantity < 1 || isNaN(quantity)) {
      showToast("Please enter a valid quantity.", "warning");
      return;
    }

    // Determine exact product photography matching the selected catalog color
    let targetImg = selectedProduct.image || 'assets/products/Polo White Front.jpg';
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      const colorMatch = selectedProduct.images.find(img => img.toLowerCase().includes(activeCatalogColor.toLowerCase()));
      if (colorMatch) {
        targetImg = colorMatch;
      } else {
        targetImg = selectedProduct.images[0];
      }
    }

    // Determine testing mode (embroidery or dtf)
    const modeParam = (selectedCustomization === "text_embroidery") ? "embroidery" : "dtf";

    // Direct user straight to dedicated branding studio without pop-up modals!
    const queryParams = new URLSearchParams({
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      size: selectedSize,
      color: activeCatalogColor,
      qty: quantity,
      img: targetImg,
      mode: modeParam,
      cust: selectedProduct.customizationCapability || selectedProduct.customizationPermissions || "both"
    });
    window.location.href = `product-customizer.html?_cb=${Date.now()}&${queryParams.toString()}`;
    return;
  }
  if (colorDot) {
    const parent = colorDot.parentElement;
    parent.querySelectorAll(".color-dot").forEach((button) => button.classList.remove("active"));
    colorDot.classList.add("active");
    if (parent.id === "colorFilter") {
      activeCatalogColor = colorDot.dataset.color;
      renderProducts();
    }
    if (parent.id === "productColorFilter") {
      activeCatalogColor = colorDot.dataset.color;
      const p = products.find(x => x.sku === selectedProductSku);
      if (p) {
        let targetIdx = currentCarouselImages.findIndex(img => img.toLowerCase().includes(activeCatalogColor.toLowerCase()));
        if (targetIdx !== -1) {
          if (typeof window.updateMainImageSmooth === 'function') {
            window.updateMainImageSmooth(currentCarouselImages[targetIdx], targetIdx);
          } else {
            document.getElementById('productMainImage').src = currentCarouselImages[targetIdx];
          }
        }
      }
    }
    if (parent.id === "modalColorFilter") {
      activeCatalogColor = colorDot.dataset.color;
    }
    if (parent.id === "studioColorSwatches") {
      activeStudioColor = colorDot.dataset.color;
      const shirt = document.getElementById("studioShirt");
      if (shirt) shirt.dataset.color = activeStudioColor.toLowerCase().replace(/\s+/g, "-");
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
  if (typeof initHeaderSearch === "function") initHeaderSearch();
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

  // Attach auto-transparent logos from the cart
  cart.forEach((item, index) => {
    if (item.logoData) {
      const logoContent = typeof item.logoData === 'object' ? (item.logoData.imageSrc || item.logoData.data) : item.logoData;
      if (typeof logoContent === 'string' && logoContent.trim() !== '') {
        attachments.push({ filename: `${item.sku}_Logo_${index + 1}.png`, content: logoContent });
      }
    }
  });

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
      showToast("Quote request and Excel spreadsheet sent successfully to hello@thefabric8.com!", "success", 8000);
      cart.splice(0, cart.length);
      saveCart();
      renderCart();
      form.reset();
      if (typeof initClientDetailsPersistence === 'function') initClientDetailsPersistence();
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error("Resend error:", errorData);
      showToast(`Vercel Email Server Error: ${errorData.message || errorData.error || "Server rejected email dispatch."}\n\nFalling back to manual plain-text draft copy.`, "error", 8000);
      triggerMailtoFallback(customerInfo, cart);
    }
  } catch (err) {
    console.error("Network error:", err);
    showToast("Vercel Serverless Connection Notice: Could not reach the automated Excel email server (Note: Serverless Excel generation requires testing on your LIVE Vercel web domain rather than local PC preview).\n\nDisplaying backup manual text draft.", "warning", 8000);
    triggerMailtoFallback(customerInfo, cart);
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  }
});

function initClientDetailsPersistence() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  try {
    const saved = localStorage.getItem("fabric8_client_details");
    if (saved) {
      const data = JSON.parse(saved);
      for (const [key, val] of Object.entries(data)) {
        const input = form.elements[key];
        if (input && input.type !== "file") {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = (input.value === val || val === true || val === "Yes");
          } else {
            input.value = val;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Failed to restore client details", e);
  }

  const saveDetails = () => {
    try {
      const data = {};
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        if (!(value instanceof File) && key !== "Message") {
          data[key] = value;
        }
      }
      localStorage.setItem("fabric8_client_details", JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save client details", e);
    }
  };

  form.querySelectorAll("input:not([type='file']), select").forEach(el => {
    el.addEventListener("input", saveDetails);
    el.addEventListener("change", saveDetails);
  });
}

function initHeaderSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search") || urlParams.get("q") || "";
  const productSearchEl = document.getElementById("productSearch");

  if (productSearchEl && searchQuery) {
    productSearchEl.value = searchQuery;
  }

  const headerSearchInputs = document.querySelectorAll('input[type="search"]:not(#productSearch)');
  headerSearchInputs.forEach((input) => {
    if (searchQuery) {
      input.value = searchQuery;
    }
    if (input.dataset.searchWired === "true") return;
    input.dataset.searchWired = "true";

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = input.value.trim();
        
        if (productSearchEl) {
          productSearchEl.value = query;
          if (typeof renderProducts === "function") renderProducts();
          const targetSection = document.getElementById("productGrid") || productSearchEl;
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          document.body.classList.add("silk-leaving");
          setTimeout(() => {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
          }, 200);
        }
      }
    });
  });
}

function initSite() {
  initHeaderSearch();
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('product.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku');
    if (sku) {
      initProductPage(sku);
    }
  } else if (path.includes('checkout.html') || path.includes('quote.html')) {
    if (typeof renderCart === 'function') renderCart();
    initClientDetailsPersistence();
  } else {
    initClientDetailsPersistence();
    // For shop.html and others
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderCart === 'function') renderCart();
    if (typeof setupStudio === 'function') setupStudio();
    if (typeof renderShowcase === 'function') renderShowcase();
  }
}

let productPageData = { sizeQtys: {} };

let currentCarouselImages = [];
let activeCarouselIdx = 0;

window.updateMainImageSmooth = function(newSrc, newIdx = -1) {
  const mainImg = document.getElementById('productMainImage');
  if (!mainImg || mainImg.src.endsWith(newSrc)) return;
  
  if (newIdx !== -1) {
    activeCarouselIdx = newIdx;
  } else {
    const idx = currentCarouselImages.indexOf(newSrc);
    if (idx !== -1) activeCarouselIdx = idx;
  }
  
  mainImg.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  mainImg.style.opacity = '0';
  setTimeout(() => {
    mainImg.src = newSrc;
    mainImg.onload = () => { mainImg.style.opacity = '1'; };
    mainImg.onerror = () => { mainImg.style.opacity = '1'; };
    setTimeout(() => { mainImg.style.opacity = '1'; }, 150);
    window.highlightActiveThumbnail();
  }, 200);
};

window.highlightActiveThumbnail = function() {
  const thumbs = document.querySelectorAll('#productThumbnails img');
  thumbs.forEach((th, idx) => {
    if (idx === activeCarouselIdx) {
      th.style.borderColor = 'var(--ink)';
      th.style.borderWidth = '2px';
      th.style.transform = 'scale(1.04)';
    } else {
      th.style.borderColor = 'var(--line)';
      th.style.borderWidth = '1px';
      th.style.transform = 'scale(1)';
    }
  });
};

function initProductPage(sku) {
  const p = products.find(x => x.sku === sku);
  if (!p) return;
  
  selectedProductSku = sku;
  if (!p.colors.includes(activeCatalogColor)) activeCatalogColor = p.colors[0];
  
  currentCarouselImages = (p.images && p.images.length > 0) ? [...p.images] : [p.image || 'White Polo Shirt.png'];
  activeCarouselIdx = 0;
  
  const mainImg = currentCarouselImages[0];
  const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
  
  document.getElementById('productMainImage').src = imgSrc;
  document.getElementById('productName').textContent = p.name;
  document.getElementById('productCategory').textContent = p.category;
  document.getElementById('productSku').textContent = `SKU: ${p.sku}`;
  
  const custSection = document.getElementById("productCustomizationSection");
  if (custSection) {
    const custCap = p.customizationCapability || p.customizationPermissions || "both";
    if (custCap.toLowerCase() === "none" || custCap.toLowerCase() === "n/a") {
      custSection.style.display = "none";
    } else {
      custSection.style.display = "block";
    }
  }
  
  const genderBadge = document.getElementById('productGenderBadge');
  if (genderBadge && p.gender) {
    genderBadge.textContent = p.gender;
    genderBadge.style.display = 'inline-block';
  } else if (genderBadge) {
    genderBadge.style.display = 'none';
  }

  const shortDescEl = document.getElementById('productShortDesc');
  if (shortDescEl) shortDescEl.textContent = p.short || p.description || "";
  
  document.getElementById('productDesc').textContent = p.long || p.description || "Detailed tailoring characteristics, construction notes, and ergonomic design elements engineered for intensive daily use.";
  
  document.getElementById('productFabric').textContent = p.fabric || "N/A";
  document.getElementById('productGsm').textContent = p.gsm || "N/A";
  if (document.getElementById('productCare')) {
    document.getElementById('productCare').textContent = p.care || "Machine wash cold, tumble dry low. Do not bleach.";
  }
  const careFull = document.getElementById('productCareFull');
  if (careFull) {
    careFull.textContent = p.care || "Machine wash cold, tumble dry low. Do not bleach.";
  }
  document.getElementById('productAvailability').textContent = "Made to Order";
  
  const sketchAcc = document.getElementById('sketchAccordion');
  const sketchImg = document.getElementById('productSketch');
  const noSketchMsg = document.getElementById('noSketchMsg');
  const sketchDesc = document.getElementById('productSketchDesc');
  if (sketchAcc && sketchImg) {
    sketchAcc.style.display = 'block';
    if (p.sketch) {
      sketchImg.src = p.sketch;
      sketchImg.style.display = 'inline-block';
      if (noSketchMsg) noSketchMsg.style.display = 'none';
    } else {
      sketchImg.style.display = 'none';
      if (noSketchMsg) noSketchMsg.style.display = 'block';
    }
    if (sketchDesc && p.sketchDescription) {
      sketchDesc.textContent = p.sketchDescription;
      sketchDesc.style.display = 'block';
    } else if (sketchDesc) {
      sketchDesc.style.display = 'none';
    }
  }

  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const thumbnailsContainer = document.getElementById("productThumbnails");
  
  if (currentCarouselImages.length > 1) {
    if (prevBtn) {
      prevBtn.style.display = 'grid';
      prevBtn.onclick = () => {
        activeCarouselIdx = (activeCarouselIdx - 1 + currentCarouselImages.length) % currentCarouselImages.length;
        window.updateMainImageSmooth(currentCarouselImages[activeCarouselIdx], activeCarouselIdx);
      };
    }
    if (nextBtn) {
      nextBtn.style.display = 'grid';
      nextBtn.onclick = () => {
        activeCarouselIdx = (activeCarouselIdx + 1) % currentCarouselImages.length;
        window.updateMainImageSmooth(currentCarouselImages[activeCarouselIdx], activeCarouselIdx);
      };
    }
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = currentCarouselImages.map((img, idx) => {
        return `<img src="${img}" alt="Thumbnail" style="width: 80px; height: 80px; object-fit: contain; padding: 4px; background: #f0f0f0; border-radius: 8px; cursor: pointer; border: ${idx === 0 ? '2px solid var(--ink)' : '1px solid var(--line)'}; transform: ${idx === 0 ? 'scale(1.04)' : 'scale(1)'}; transition: all 0.2s ease;" onclick="window.updateMainImageSmooth('${img}', ${idx})">`;
      }).join("");
    }
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
  }
  
  // Colors
  const colorFilter = document.getElementById("productColorFilter");
  if (colorFilter && p.colors) {
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
    const isOneSize = p.category === "Head Wear" || p.name.toLowerCase().includes("apron");
    let displaySizes = isOneSize ? ["ONE SIZE"] : (p.sizes || ["S", "M", "L", "XL", "2XL"]);
    
    matrix.innerHTML = displaySizes.map(size => `
      <div class="size-row" style="display: flex; align-items: center; gap: 12px; background: #fff; padding: 6px 12px; border: 1px solid var(--line); border-radius: 8px; transition: all 0.25s ease;">
        <button type="button" class="size-select-btn" data-size="${size}" style="flex: 1; padding: 10px 14px; background: transparent; border: 1px solid var(--line); border-radius: 6px; font-weight: 800; font-size: 13px; text-align: left; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center; color: var(--ink);">
          <span>${size}</span>
          <span class="chk-indicator" style="font-size: 11px; color: var(--muted);">○</span>
        </button>
        <input type="number" min="0" placeholder="QTY" class="matrix-qty-input" data-size="${size}" style="width: 100px; padding: 8px; text-align: center; border: 1px solid var(--line); border-radius: 6px; font-family: inherit; font-size: 14px; transition: all 0.2s ease;" />
      </div>
    `).join("");

    matrix.querySelectorAll(".size-row").forEach(row => {
      const btn = row.querySelector(".size-select-btn");
      const input = row.querySelector(".matrix-qty-input");
      const chk = row.querySelector(".chk-indicator");

      const updateHighlight = () => {
        const val = parseInt(input.value);
        if ((val && val > 0) || btn.classList.contains("selected")) {
          btn.style.borderColor = "var(--ink)";
          btn.style.background = "#f4f3ef";
          chk.textContent = "●";
          chk.style.color = "var(--ink)";
          row.style.borderColor = "var(--ink)";
          row.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
        } else {
          btn.style.borderColor = "var(--line)";
          btn.style.background = "transparent";
          chk.textContent = "○";
          chk.style.color = "var(--muted)";
          row.style.borderColor = "var(--line)";
          row.style.boxShadow = "none";
        }
      };

      btn.addEventListener("click", () => {
        btn.classList.toggle("selected");
        if (btn.classList.contains("selected") && !input.value) {
          input.focus();
        }
        updateHighlight();
      });

      input.addEventListener("input", () => {
        if (parseInt(input.value) > 0) {
          btn.classList.add("selected");
        } else {
          btn.classList.remove("selected");
        }
        updateHighlight();
      });
    });
  }

  // Dynamic Customization Configuration & Direct Studio Redirection
  window.currentLoadedProduct = p;
  window.launchBrandingStudioFromProduct = function(e) {
    if (e) e.preventDefault();


    // 2. Validate Size & Quantity Selection
    const sizeInputs = document.querySelectorAll("#sizeQtyMatrix input[type='number']");
    let totalQty = 0;
    let selectedSizesList = [];
    let sizeDetailsList = [];
    
    if (sizeInputs && sizeInputs.length > 0) {
      sizeInputs.forEach(inp => {
        const v = parseInt(inp.value);
        if (!isNaN(v) && v > 0) {
          totalQty += v;
          selectedSizesList.push(inp.dataset.size);
          sizeDetailsList.push(`${inp.dataset.size} (${v})`);
        }
      });
    }

    const prod = window.currentLoadedProduct || p || {};
    const moqLimit = parseInt(prod.moq ? prod.moq.toString().replace(/[^0-9]/g, '') : "50") || 50;
    if (totalQty < moqLimit) {
      showToast(`Minimum Order Quantity is ${moqLimit} pcs. Please enter a total quantity of at least ${moqLimit} pieces across your chosen sizes before customizing.`, "warning", 5000);
      return;
    }

    const selectedColor = (typeof activeCatalogColor !== 'undefined' && activeCatalogColor !== 'all') ? activeCatalogColor : (prod.colors && prod.colors.length ? prod.colors[0] : "Standard Commercial Spec");
    
    let targetImg = prod.image || "assets/products/Polo White Front.jpg";
    if (prod.images && prod.images.length > 0) {
      const colorMatch = prod.images.find(img => img.toLowerCase().includes(selectedColor.toLowerCase()));
      if (colorMatch) targetImg = colorMatch;
      else targetImg = prod.images[0];
    }
    
    let targetSize = sizeDetailsList.length > 0 ? sizeDetailsList.join(", ") : "Standard Commercial Spec";

    let modeParam = "dtf";
    const custSetting = (prod.customizationCapability || prod.customizationPermissions || "both").toLowerCase();
    if (custSetting === "embroidery" || custSetting === "embroidery_only") {
      modeParam = "embroidery";
    }

    const queryParams = new URLSearchParams({
      sku: prod.sku || "F8-STUDIO-CUSTOM",
      name: prod.name || "Custom Uniform Garment",
      color: selectedColor,
      size: targetSize,
      qty: totalQty,
      img: targetImg,
      mode: modeParam,
      cust: prod.customizationCapability || prod.customizationPermissions || "both"
    });

    const customizerState = {
      sku: prod.sku || "F8-STUDIO-CUSTOM",
      name: prod.name || "Custom Uniform Garment",
      color: selectedColor,
      size: targetSize,
      qty: totalQty,
      image: targetImg,
      category: prod.category || "General Apparel",
      capability: prod.customizationCapability || prod.customizationPermissions || "both",
      supportedFinishes: prod.supportedFinishes || ["Embroidery", "DTF"],
      supportedPlacements: prod.supportedPlacements || ["Left Chest", "Right Chest", "Full Back", "Upper Sleeve"],
      placements: prod.placements || [
        { name: "Left Chest", x: 68, y: 34, w: 18, h: 18, r: 0 },
        { name: "Right Chest", x: 32, y: 34, w: 18, h: 18, r: 0 },
        { name: "Full Back", x: 50, y: 40, w: 45, h: 45, r: 0 },
        { name: "Upper Sleeve", x: 82, y: 32, w: 14, h: 14, r: 5 }
      ]
    };
    try {
      localStorage.setItem('fabric8_customizer_state', JSON.stringify(customizerState));
    } catch (err) {
      console.warn("Unable to store customizer state in localStorage", err);
    }

    window.location.href = `product-customizer.html?_cb=${Date.now()}&${queryParams.toString()}`;
  };

  const customizationSection = document.getElementById("productCustomizationSection");
  const toggleHeader = document.getElementById("customizationToggleHeader");
  if (toggleHeader) {
    toggleHeader.addEventListener("click", window.launchBrandingStudioFromProduct);
  }

  const updateFinishHelper = () => {
    const finishVal = document.querySelector('input[name="pageLogoFinish"]:checked')?.value || "";
    const helperEl = document.getElementById("finishHelperText");
    if (!helperEl) return;
    
    if (finishVal === "Embroidery") {
      helperEl.textContent = siteSettings?.brandingSettings?.embroideryHelperNote || "Embroidery is recommended for structured, smaller logos (chest, sleeve, caps, pockets) and holds up best on woven/heavier fabrics.";
      helperEl.style.display = "block";
    } else if (finishVal.toLowerCase().includes("dtf") || finishVal.toLowerCase().includes("direct")) {
      helperEl.textContent = siteSettings?.brandingSettings?.dtfHelperNote || "Direct-to-fabric (DTF) printing is recommended for larger, multi-color, or photo-realistic designs, and works best on flatter areas like full front/back placements on t-shirts and hoodies.";
      helperEl.style.display = "block";
    } else {
      helperEl.style.display = "none";
    }
  };

  if (customizationSection) {
    const custType = p.customizationCapability || p.customization || "both";
    
    if (custType.toLowerCase() === "none" || custType.toLowerCase() === "n/a") {
      customizationSection.style.display = "none";
    } else {
      customizationSection.style.display = "block";
      const cardLogo = document.getElementById("cardUploadLogo");
      const cardText = document.getElementById("cardTextEmbroidery");
      if (custType === "dtf_only" && cardText) {
        cardText.style.display = "none";
      } else if (custType === "embroidery_only" && cardLogo) {
        // Logo still supports embroidery finish, just restrict finish options
      }
      
      const allowedFinishes = ["Embroidery", "Direct To Fabric (DTF) Printing"];
      
      const renderRadioGroup = (name, options) => {
        return options.map((opt, idx) => `
          <label class="radio-btn ${idx === 0 ? 'active' : ''}" style="border: 1px solid ${idx === 0 ? 'var(--ink)' : 'var(--line)'}; background: ${idx === 0 ? '#f2f1ed' : '#fff'}; border-radius: 6px; padding: 12px; cursor: pointer; text-align: center; transition: all 0.2s ease; display: block; font-weight: 800;">
            <input type="radio" name="${name}" value="${opt}" ${idx === 0 ? 'checked' : ''} style="display: none;">
            <span style="font-size: 12px; font-weight: 800; ${idx === 0 ? 'color: var(--ink);' : ''}">${opt}</span>
          </label>
        `).join("");
      };

      const bs = siteSettings?.brandingSettings || {};
      const dtfPlacements = bs.dtfPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      const embPlacements = bs.embPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      
      const logoPlacement = document.getElementById("pageLogoPlacementContainer");
      if (logoPlacement) logoPlacement.innerHTML = renderRadioGroup("pageLogoPlacement", p.supportedPlacements || dtfPlacements);

      const textPlacement = document.getElementById("pageTextPlacementContainer");
      if (textPlacement) textPlacement.innerHTML = renderRadioGroup("pageTextPlacement", p.supportedPlacements || embPlacements);

      const logoFinish = document.getElementById("pageLogoFinishContainer");
      if (logoFinish) {
        logoFinish.innerHTML = renderRadioGroup("pageLogoFinish", allowedFinishes);
        setTimeout(updateFinishHelper, 10);
      }
    }
  }

  // Bind color clicks and hovers for product page with cinematic transitions
  colorFilter.querySelectorAll('.color-dot').forEach(dot => {
    const triggerColorSwitch = () => {
      colorFilter.querySelectorAll(".color-dot").forEach((b) => b.classList.remove("active"));
      dot.classList.add("active");
      activeCatalogColor = dot.dataset.color;
      const colorImages = p.images?.filter(img => img.toLowerCase().includes(activeCatalogColor.toLowerCase()));
      if (colorImages && colorImages.length > 0) {
        window.updateMainImageSmooth(colorImages[0]);
        const thumbs = document.getElementById('productThumbnails');
        if (thumbs) {
          if (colorImages.length > 1) {
            thumbs.innerHTML = colorImages.map(img => `<img src="${img}" alt="Thumbnail" style="width: 80px; height: 80px; object-fit: contain; padding: 4px; background: #f0f0f0; border-radius: 8px; cursor: pointer; border: 1px solid var(--line); transition: transform 0.2s ease;" onclick="window.updateMainImageSmooth('${img}')">`).join("");
          } else {
            thumbs.innerHTML = "";
          }
        }
      }
    };
    dot.addEventListener('click', triggerColorSwitch);
    dot.addEventListener('mouseenter', triggerColorSwitch);
  });

  // Accordions logic with symbols only
  document.querySelectorAll('details.accordion summary').forEach(summary => {
    summary.addEventListener('click', (e) => {
      const details = summary.parentElement;
      const span = summary.querySelector('.acc-icon');
      if (span) {
        setTimeout(() => {
          span.textContent = details.open ? '−' : '+';
        }, 20);
      }
    });
  });
  
  // Customization Type Toggle & Disclaimer Banner
  document.querySelectorAll('input[name="customizationType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll(".customization-card").forEach(card => {
        card.style.borderColor = "var(--line)";
        card.style.backgroundColor = "#fff";
      });
      const activeCard = e.target.closest(".customization-card");
      if (activeCard) {
        activeCard.style.borderColor = "var(--ink)";
        activeCard.style.backgroundColor = "#f4f3ef";
      }
      
      const settings = document.getElementById("customizationSettings");
      const disclaimer = document.getElementById("brandingDisclaimer");
      const logoSet = document.getElementById("logoSettings");
      const textSet = document.getElementById("textSettings");
      
      if (settings) settings.style.display = "block";
      if (disclaimer) disclaimer.style.display = "flex";
      
      if (e.target.value === 'upload_logo') {
        if (logoSet) logoSet.style.display = "flex";
        if (textSet) textSet.style.display = "none";
      } else {
        if (logoSet) logoSet.style.display = "none";
        if (textSet) textSet.style.display = "flex";
      }
    });
  });
  
  // Initialize text thread colors (Borderless Premium Swatches)
  const threadColorDiv = document.getElementById("pageTextThreadColors");
  if (threadColorDiv) {
    threadColorDiv.innerHTML = threadColors.map(c => `
      <span class="color-dot ${c.name === 'Black' ? 'active' : ''}" style="--swatch:${c.hex}; background-color:${c.hex}; width: 34px; height: 34px; border-radius: 50%; display: inline-block; cursor: pointer; border: none; box-shadow: 0 2px 6px rgba(0,0,0,0.18); transition: transform 0.2s ease;" data-thread-color="${c.name}" title="${c.name}"></span>
    `).join("");
    
    threadColorDiv.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        threadColorDiv.querySelectorAll(".color-dot").forEach((b) => {
          b.classList.remove("active");
          b.style.transform = "scale(1)";
          b.style.boxShadow = "0 2px 6px rgba(0,0,0,0.18)";
        });
        const target = e.target.closest('.color-dot');
        target.classList.add("active");
        target.style.transform = "scale(1.18)";
        target.style.boxShadow = "0 0 0 2px #fff, 0 0 0 4px var(--ink)";
      });
    });
    // Apply active ring to initial color
    const initial = threadColorDiv.querySelector('.color-dot.active');
    if (initial) {
      initial.style.transform = "scale(1.18)";
      initial.style.boxShadow = "0 0 0 2px #fff, 0 0 0 4px var(--ink)";
    }
  }

  // Handle Customization Radio & Font Buttons
  document.querySelectorAll('.radio-btn input[type="radio"], .font-radio-btn input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const container = e.target.closest('label').parentElement;
      container.querySelectorAll('label').forEach(lbl => {
        lbl.classList.remove('active');
        lbl.style.borderColor = 'var(--line)';
        lbl.style.background = '#fff';
        const span = lbl.querySelector('span');
        if(span) span.style.color = '';
      });
      const activeLbl = e.target.closest('label');
      activeLbl.classList.add('active');
      activeLbl.style.borderColor = 'var(--ink)';
      activeLbl.style.background = '#f2f1ed';
      const activeSpan = activeLbl.querySelector('span');
      if(activeSpan) activeSpan.style.color = 'var(--ink)';
      
      if (e.target.name === "pageLogoFinish") {
        updateFinishHelper();
      }
    });
  });

  let uploadedLogoBase64 = null;
  const logoUploadInput = document.getElementById("pageLogoUpload");
  if (logoUploadInput) {
    logoUploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          

          ctx.putImageData(imageData, 0, 0);
          uploadedLogoBase64 = canvas.toDataURL('image/png').split(',')[1];
          
          const previewWrap = document.getElementById("pageLogoPreview");
          const previewImg = document.getElementById("pageLogoPreviewImg");
          if (previewWrap && previewImg) {
            previewImg.src = canvas.toDataURL('image/png');
            previewWrap.style.display = "block";
            
            // Apply dimension constraints based on placement
            const place = document.querySelector('input[name="pageLogoPlacement"]:checked')?.value || "left-chest";
            if (place.includes("chest") || place.includes("sleeve")) {
               previewWrap.style.width = "15%"; // Approx 4 inches max
            } else if (place === "center-chest") {
               previewWrap.style.width = "25%"; // Approx 8 inches max
            } else {
               previewWrap.style.width = "35%"; // Full Back approx 12 inches max
            }
            
            // Simple drag logic
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            previewWrap.onmousedown = dragStart;
            document.onmouseup = dragEnd;
            document.onmousemove = drag;

            function dragStart(e) {
              initialX = e.clientX - xOffset;
              initialY = e.clientY - yOffset;
              if (e.target === previewWrap || e.target === previewImg) {
                isDragging = true;
              }
            }

            function dragEnd(e) {
              initialX = currentX;
              initialY = currentY;
              isDragging = false;
            }

            function drag(e) {
              if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                previewWrap.style.transform = `translate(${currentX}px, ${currentY}px)`;
              }
            }
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }


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
    else textPreviewContent.style.fontFamily = "'Century Gothic', system-ui, sans-serif";
    
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
    
    const moqLimit = parseInt(p.moq ? p.moq.toString().replace(/[^0-9]/g, '') : "50") || 50;
    if (totalQty < moqLimit) {
      showToast(`Minimum Order Quantity is ${moqLimit} pcs. Please enter a total quantity of at least ${moqLimit} pieces across your chosen sizes.`, "warning", 5000);
      return;
    }
    
    let brandingDesc = "Blank";
    
    // Add items for each size
    for (const [size, qty] of Object.entries(sizes)) {
      cart.push({
        ...p,
        quantity: qty,
        color: activeCatalogColor,
        size: size,
        branding: brandingDesc,
        customizationType: null,
        logoData: null
      });
    }
    
    saveCart();
    showToast("Added to cart successfully!", "success", 4000);
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
    showToast("Please select size and color before proceeding.", "warning");
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
    if (textWizardStep === 1 && !embroideryData.type) return showToast("Select an embroidery type.", "warning");
    if (textWizardStep === 2 && !embroideryData.selectedStyleSku) return showToast("Select a template style.", "warning");
    if (textWizardStep === 3 && !embroideryData.position) return showToast("Select a placement.", "warning");
    if (textWizardStep === 4) {
      if (!embroideryData.textLines.line1) return showToast("Please enter text for at least Line 1.", "warning");
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
}
window.openEditBasicDetails = function() {
  const item = cart[editingCartIndex];
  if (!item) return;
  const product = products.find(p => p.sku === item.sku);
  const sizeSelect = document.getElementById("editBasicSize");
  if (sizeSelect && product) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>`).join("");
  }
  const colorFilter = document.getElementById("editBasicColorFilter");
  if (colorFilter && product) {
    colorFilter.innerHTML = product.colors.map(c => colorButton(c)).join("");
    const activeBtn = colorFilter.querySelector(`[data-color="${CSS.escape(item.color)}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }
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
    const shirtImg = document.getElementById("editTextShirt");
    if (shirtImg && product) {
      const colorImg = product.images?.find((img) => img.toLowerCase().includes(item.color.toLowerCase()));
      shirtImg.src = colorImg || (product.image || 'White T-Shirt.png');
    }
    const threadContainer = document.getElementById("editTextThreadColors");
    if (threadContainer) {
      threadContainer.innerHTML = threadColors.map(c => 
        `<span class="color-dot ${c.name === item.embroideryData.threadColor ? 'active' : ''}" style="--swatch:${c.hex}; margin-right: 8px; display: inline-block;" data-edit-thread-color="${c.name}"></span>`
      ).join("");
    }
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
        previewBox.innerHTML = '';
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
    showToast("This item has no branding configured. If you wish to add branding, please remove this item and configure a new one.", "warning");
    document.getElementById("editOrderSummaryModal").style.display = "flex";
  }
}
document.addEventListener("click", (e) => {
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
  const editColorDot = e.target.closest("#editBasicColorFilter .color-dot");
  if (editColorDot) {
    const parent = editColorDot.parentElement;
    parent.querySelectorAll(".color-dot").forEach((btn) => btn.classList.remove("active"));
    editColorDot.classList.add("active");
  }
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

function renderShowcase() {
  const showcase = document.getElementById('dynamicShowcase');
  if (!showcase || !products || products.length === 0) return;

  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);
  
  showcase.style.display = 'grid';
  showcase.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  showcase.style.gap = '32px';
  showcase.style.alignItems = 'stretch';
  
  showcase.innerHTML = selected.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'White Polo Shirt.png');
    const imgSrc = mainImg.startsWith('http') ? mainImg : mainImg;
    
    return `<article class="product-card" style="background: transparent !important; border: none !important; box-shadow: none !important; display: flex; flex-direction: column;">
      <a href="product.html?sku=${p.sku}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; position: relative;">
        <div style="background: transparent; height: 340px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: none !important; padding: 10px;">
          <img src="${imgSrc}" alt="${p.name}" style="max-height: 310px; max-width: 100%; object-fit: contain; mix-blend-mode: multiply; transition: transform 0.4s ease;">
        </div>
        <div class="product-card-info" style="padding: 14px 0 0 0; background: transparent !important; border: none !important; display: flex; flex-direction: column; align-items: flex-start;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 800; color: var(--green); text-transform: uppercase; letter-spacing: 0.06em;">${p.category || 'Apparel'}</p>
          <h3 style="margin: 0; font-size: 18px; font-weight: 900; line-height: 1.25; color: var(--ink);">${p.name || 'Product'}</h3>
        </div>
      </a>
    </article>`;
  }).join('');
}

// Capability Belt Interactive Carousel Row (Req #7)
function initCapabilityBelt() {
  const row = document.getElementById('capabilityBeltRow');
  const capTitle = document.getElementById('capTitle');
  const capLink = document.getElementById('capLink');
  const capDesc = document.getElementById('capDesc');
  const capHighlight1 = document.getElementById('capHighlight1');
  const capHighlight2 = document.getElementById('capHighlight2');
  const capHighlight3 = document.getElementById('capHighlight3');
  const expBox = document.getElementById('capabilityExpansionBox');
  
  if (!row || !capTitle || !expBox) return;

  const sectorSpecs = {
    food: {
      title: "🍽️ Food & Beverage Uniform Engineering",
      desc: "Engineered to endure kitchen heat, grease splashes, and intense industrial washing cycles while delivering exceptional front-of-house elegance. Featuring advanced thermal breathability, stain-release coatings, and ergonomic seam articulation for executive chefs and dining room professionals.",
      link: "sectors.html#food",
      h1: "✦ Stain-Release Thermal Cotton", h2: "✦ MOQ: 50 Pieces Custom-Tailored", h3: "✦ Custom Emblem & Text Embroidery"
    },
    hospitality: {
      title: "🏨 Hospitality & Luxury Hotel Couture",
      desc: "Impeccable uniform choreography tailored for concierge desks, executive reception teams, and house management. Our hospitality garments merge fine suit tailoring with durable daily stretch fibers to uphold five-star brand authority.",
      link: "sectors.html#hospitality",
      h1: "✦ Wrinkle-Resistant Luxury Wool Stretch", h2: "✦ Tailored Cut & Ergonomic Fit", h3: "✦ Gold & Silver Thread Cresting"
    },
    corporate: {
      title: "💼 Corporate Workplace Fashion & Apparel",
      desc: "Modernizing professional business wear with sleek, tailored silhouettes designed for corporate headquarters, banks, and enterprise enterprises. Combining sophisticated executive styling with everyday all-day mobility.",
      link: "sectors.html#corporate",
      h1: "✦ Premium Executive Suiting & Polos", h2: "✦ Bespoke Color Palette Synchronization", h3: "✦ High-Definition Subtle Branding"
    },
    healthcare: {
      title: "⚕️ Healthcare, Medical & Clinical Uniforms",
      desc: "High-performance antimicrobial scrubs and physician coats built for intensive medical laboratory and hospital environments. Crafted with soft, fluids-repellent stretch textiles that withstand stringent autoclave sanitization.",
      link: "sectors.html#healthcare",
      h1: "✦ Antimicrobial 4-Way Stretch Fiber", h2: "✦ Fluid-Resistant Protective Barriers", h3: "✦ Ergonomic Utility Tool Pocketing"
    },
    industrial: {
      title: "🏭 Industrial & Safety Workwear Solutions",
      desc: "Heavy-duty flame-resistant and high-visibility industrial garments structured for factories, engineering sites, and logistical operations. Reinforced with ripstop weaving and industrial bar-tack stitching at high-stress junctions.",
      link: "sectors.html#industrial",
      h1: "✦ Certified Flame-Resistant & Ripstop", h2: "✦ Industrial Wash & Abrasion Resistance", h3: "✦ Reinforced Safety Utility Construction"
    },
    education: {
      title: "🎓 Educational & Academic Institution Attire",
      desc: "Cohesive collegiate blazer collections, faculty apparel, and administrative uniform wardrobes designed for private schools and universities. Built for long-term comfort, seasonal climate resilience, and distinguished academic heritage.",
      link: "sectors.html#education",
      h1: "✦ Durable Anti-Pilling Fabrics", h2: "✦ Institutional Emblem Weaving", h3: "✦ Complete Size Customization & Trim"
    },
    aviation: {
      title: "✈️ Aviation, Flight Crew & Ground Operations",
      desc: "Precision-engineered flight attendant tunics, pilot trench suiting, and terminal logistical wear designed for global airlines. Offering high wrinkle-resilience and cabin-climate thermal adaptation for long-haul duty.",
      link: "sectors.html#aviation",
      h1: "✦ Cabin-Tested Thermal Regulation", h2: "✦ Flawless Post-Flight Wrinkle Resistance", h3: "✦ Integrated Epaulette & Wing Mounting"
    }
  };

  const buttons = row.querySelectorAll('.capability-icon-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.style.border = '1px solid var(--line)';
        b.classList.remove('active');
      });
      btn.style.border = '2px solid var(--ink)';
      btn.classList.add('active');
      
      const sec = btn.getAttribute('data-sector') || 'food';
      const spec = sectorSpecs[sec] || sectorSpecs.food;
      
      expBox.style.opacity = '0';
      expBox.style.transform = 'translateY(6px)';
      
      setTimeout(() => {
        capTitle.innerText = spec.title;
        capDesc.innerText = spec.desc;
        capLink.href = spec.link;
        if(capHighlight1) capHighlight1.innerText = spec.h1;
        if(capHighlight2) capHighlight2.innerText = spec.h2;
        if(capHighlight3) capHighlight3.innerText = spec.h3;
        
        expBox.style.opacity = '1';
        expBox.style.transform = 'translateY(0)';
      }, 150);
    });
  });
}

// Generic Contact Form Handlers
function setupContactForm(formId, sourceName) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById(formId + 'Status');
    const originalBtnText = btn.innerText;
    
    btn.innerText = 'Sending...';
    btn.disabled = true;
    if(statusDiv) statusDiv.style.display = 'none';
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.source = sourceName;
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to send');
      
      form.reset();
      if(statusDiv) {
        statusDiv.innerText = 'Message sent successfully! We will be in touch soon.';
        statusDiv.style.color = 'var(--green, #2f873d)';
        statusDiv.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      if(statusDiv) {
        statusDiv.innerText = 'Failed to send message. Please try again later.';
        statusDiv.style.color = '#b7342b';
        statusDiv.style.display = 'block';
      }
    } finally {
      btn.innerText = originalBtnText;
      btn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupContactForm('aboutForm', 'About Us Page');
  setupContactForm('contactForm', 'Contact Us Page');
  initCapabilityBelt();
});


    
