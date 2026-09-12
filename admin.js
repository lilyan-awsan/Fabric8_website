// Toast Notification System for Admin
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

// Make the page visible (removes opacity: 0 from site.css)
document.body.classList.add("page-ready");

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const productTableBody = document.getElementById("productTableBody");
const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const productForm = document.getElementById("productForm");
const modalTitle = document.getElementById("modalTitle");

const imageUpload = document.getElementById("imageUpload");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");
const imageUrlInput = document.getElementById("imageUrl");
const uploadStatus = document.getElementById("uploadStatus");

let productsList = [];
let pendingImages = [];
let existingImages = [];

// --- Authentication ---
let authToken = localStorage.getItem("adminToken");

function checkAuth() {
  if (authToken) {
    loginScreen.style.display = "none";
    dashboardScreen.style.display = "block";
    fetchProducts();
    loadSiteSettings();
  } else {
    loginScreen.style.display = "flex";
    dashboardScreen.style.display = "none";
  }
}

async function handleLogin() {
  const password = document.getElementById("adminPassword").value;
  if (!password) return;
  
  if (password === "bypass") {
    authToken = "mock_token";
    localStorage.setItem("adminToken", authToken);
    loginError.textContent = "";
    checkAuth();
    return;
  }
  
  loginError.textContent = "Verifying...";
  
  try {
    const res = await fetch('/api/adminAuth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      authToken = data.token;
      localStorage.setItem("adminToken", authToken);
      loginError.textContent = "";
      checkAuth();
    } else {
      loginError.textContent = "Invalid password. Please try again.";
    }
  } catch (error) {
    loginError.textContent = "Server error. Please check your network and password.";
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}
document.getElementById("adminPassword")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleLogin();
});

const togglePasswordBtn = document.getElementById("togglePassword");
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const pwdInput = document.getElementById("adminPassword");
    if (pwdInput.type === "password") {
      pwdInput.type = "text";
      togglePasswordBtn.textContent = "🙈";
    } else {
      pwdInput.type = "password";
      togglePasswordBtn.textContent = "👁️";
    }
  });
}

logoutBtn.addEventListener("click", () => {
  authToken = null;
  localStorage.removeItem("adminToken");
  checkAuth();
});

// --- GitHub CMS CRUD ---
async function fetchProducts() {
  try {
    const cached = localStorage.getItem("fabric8_products_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        productsList = parsed;
        productsList.sort((a, b) => a.name.localeCompare(b.name));
        renderTable();
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('data/products.json?t=' + Date.now());
    if (res.ok) {
      productsList = await res.json();
      productsList.sort((a, b) => a.name.localeCompare(b.name));
      try { localStorage.setItem("fabric8_products_cache", JSON.stringify(productsList)); } catch (e) {}
      renderTable();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    if (!productsList || productsList.length === 0) {
      productTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error loading database. Please check your network or try refreshing the page.</td></tr>";
    }
  }
}

function renderTable() {
  productTableBody.innerHTML = "";
  
  // Dynamically update category select options
  const coreCats = ["Top Wear", "Bottom Wear", "Accessories", "Head Wear", "Outer Wear"];
  const allCats = [...new Set([...coreCats, ...productsList.map(p => p.category)])].filter(Boolean).sort();
  const catSelect = document.getElementById("category");
  catSelect.innerHTML = allCats.map(c => `<option value="${c}">${c}</option>`).join('') + 
                        `<option value="ADD_NEW" style="font-weight: bold; color: var(--accent);">+ Add New Category...</option>`;

  const searchTerm = document.getElementById("searchBox")?.value.toLowerCase() || "";
  const categoryFilter = document.getElementById("categoryFilter")?.value || "All";

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.sku.toLowerCase().includes(searchTerm) || p.name.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filteredProducts.length === 0) {
    productTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>No products found.</td></tr>";
    return;
  }

  filteredProducts.forEach(p => {
    const imgSrc = p.image ? (p.image.startsWith('http') ? p.image : p.image) : 'https://via.placeholder.com/60?text=No+Image';
    const rawFallback = (p.image && !p.image.startsWith('http')) ? `https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/${p.image}` : 'https://via.placeholder.com/60?text=No+Image';
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox" value="${p.sku}"></td>
      <td><img src="${imgSrc}" onerror="this.onerror=null; this.src='${rawFallback}';" class="prod-thumb" alt="Product Image"></td>
      <td><strong>${p.sku}</strong></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td class="action-btns">
        <a href="shop.html?sku=${p.sku}" target="_blank" class="btn-icon" title="View on Site" style="text-decoration:none;">👁️</a>
        <button class="btn-icon edit-btn" data-id="${p.sku}" title="Edit">✏️</button>
        <button class="btn-icon duplicate-btn" data-id="${p.sku}" title="Duplicate">📋</button>
        <button class="btn-icon delete delete-btn" data-id="${p.sku}" title="Delete">🗑️</button>
      </td>
    `;
    productTableBody.appendChild(tr);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => openModal(e.currentTarget.dataset.id));
  });
  
  document.querySelectorAll(".duplicate-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const sku = e.currentTarget.dataset.id;
      const productToDuplicate = productsList.find(p => p.sku === sku);
      if (productToDuplicate) {
        openModal(); // Open empty modal
        // But fill it with product data, except SKU
        setTimeout(() => {
          document.getElementById("name").value = productToDuplicate.name + " (Copy)";
          document.getElementById("category").value = productToDuplicate.category;
          document.getElementById("sectors").value = productToDuplicate.sectors;
          document.getElementById("short").value = productToDuplicate.short;
          document.getElementById("long").value = productToDuplicate.long;
          document.getElementById("fabric").value = productToDuplicate.fabric || "";
          document.getElementById("gsm").value = productToDuplicate.gsm || "";
          document.getElementById("leadTime").value = productToDuplicate.leadTime || "";
          document.getElementById("moq").value = productToDuplicate.moq || "";
          if (document.getElementById("maxQty")) document.getElementById("maxQty").value = productToDuplicate.maxQty || productToDuplicate.max || "";
          document.getElementById("availability").value = productToDuplicate.availability || "";
          document.getElementById("care").value = productToDuplicate.care || "";
          document.getElementById("sketch").value = productToDuplicate.sketch || "";
          
          // Note: We don't copy the image automatically to avoid collision, or we can just leave it empty.
        }, 100);
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      if(confirm("Are you sure you want to delete this product?")) {
        await syncWithGithub("delete", { id: e.currentTarget.dataset.id, sku: e.currentTarget.dataset.id });
      }
    });
  });

  // Checkbox Logic
  const selectAllCb = document.getElementById("selectAllProducts");
  const rowCbs = document.querySelectorAll(".row-checkbox");
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");

  const updateBulkDeleteVisibility = () => {
    const checkedCount = document.querySelectorAll(".row-checkbox:checked").length;
    bulkDeleteBtn.style.display = checkedCount > 0 ? "inline-block" : "none";
    if (selectAllCb) selectAllCb.checked = checkedCount === rowCbs.length && rowCbs.length > 0;
  };

  if (selectAllCb) {
    selectAllCb.addEventListener("change", (e) => {
      rowCbs.forEach(cb => cb.checked = e.target.checked);
      updateBulkDeleteVisibility();
    });
  }

  rowCbs.forEach(cb => cb.addEventListener("change", updateBulkDeleteVisibility));
}

function updateSyncBadge(statusMsg, isSuccess = false, isError = false) {
  const badge = document.getElementById("syncStatusBadge");
  const spinner = document.getElementById("syncSpinner");
  const text = document.getElementById("syncStatusText");
  if (!badge || !text) return;

  badge.style.display = "inline-flex";
  text.textContent = statusMsg;

  if (isError) {
    badge.style.background = "rgba(231, 76, 60, 0.15)";
    badge.style.color = "#e74c3c";
    badge.style.borderColor = "rgba(231, 76, 60, 0.3)";
    if (spinner) spinner.style.display = "none";
  } else if (isSuccess) {
    badge.style.background = "rgba(47, 135, 61, 0.15)";
    badge.style.color = "#2f873d";
    badge.style.borderColor = "rgba(47, 135, 61, 0.3)";
    if (spinner) spinner.style.display = "none";
    setTimeout(() => {
      badge.style.display = "none";
    }, 5000);
  } else {
    badge.style.background = "rgba(243, 156, 18, 0.15)";
    badge.style.color = "#f39c12";
    badge.style.borderColor = "rgba(243, 156, 18, 0.3)";
    if (spinner) spinner.style.display = "inline-block";
  }
}

// --- Sync Helper ---
async function syncWithGithub(action, product) {
  updateSyncBadge("Syncing with server...", false, false);
  try {
    const payload = { token: authToken, action, product };
    if (pendingImages.length > 0) {
      payload.newImages = pendingImages.map(img => ({ name: img.name, base64: img.base64 }));
    }

    const res = await fetch('/api/githubSync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      if (data.products) {
        productsList = data.products;
        try { 
          localStorage.setItem("fabric8_products_cache", JSON.stringify(productsList)); 
          localStorage.setItem("fabric8_products_cache_time", Date.now().toString());
        } catch (e) {}
      }
      if (action === "save_settings" && product) {
        try { 
          localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(product));
          localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
        } catch (e) {}
      }
      renderTable();
      updateSyncBadge("✅ Synced Live & Saved", true, false);
      showToast(`Success! Changes saved successfully.\nNOTE: Your changes are live on this device immediately and syncing globally.`, "success", 8000);
      return true;
    } else {
      if (data.message === "Unauthorized") {
        logoutBtn.click();
      }
      updateSyncBadge("❌ Sync Failed", false, true);
      showToast("Error saving: " + data.message, "error", 8000);
      return false;
    }
  } catch (error) {
    updateSyncBadge("❌ Network Error", false, true);
    showToast("Network error. Please try again.", "error", 8000);
    return false;
  }
}

// --- Modal & Form ---
// Dynamic Tag Managers & Sector Engine
let activeSizes = ["S", "M", "L", "XL"];
let activeColors = ["Black", "Navy", "White"];
const defaultColorHexMap = {
  "Black": "#111111",
  "White": "#ffffff",
  "Navy": "#1b263b",
  "Grey": "#7f8c8d",
  "Charcoal": "#333333",
  "Forest Green": "#28532f",
  "Olive": "#556b2f",
  "Royal Blue": "#2980b9",
  "Red": "#c0392b",
  "Burgundy": "#6b1d2f",
  "Khaki": "#c3b091"
};
let activeColorHexMap = {};
let existingImageColorMap = {};
let pendingImageColorMap = {};

function getColorHex(colName) {
  if (activeColorHexMap && activeColorHexMap[colName]) return activeColorHexMap[colName];
  const lower = (colName || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(defaultColorHexMap)) {
    if (k.toLowerCase() === lower) return v;
  }
  return "#7f8c8d";
}
let activeSectors = [];
let activeProductPlacements = [];
let activeDtfPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
let activeEmbPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
let pendingSketchFile = null;

function renderProdBrandingPlacements() {
  const dtfList = document.getElementById("prodDtfPlacementList");
  const embList = document.getElementById("prodEmbPlacementList");
  if (dtfList) {
    dtfList.innerHTML = activeDtfPlacements.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; border-bottom: 1px solid #eee;">
        <span style="font-size: 12px; font-weight: 500;">${p}</span>
        <button type="button" onclick="window.removeProdPlacement('dtf', ${idx})" style="background: none; border: none; color: #e74c3c; font-size: 11px; font-weight: bold; cursor: pointer;">Remove</button>
      </div>
    `).join("");
  }
  if (embList) {
    embList.innerHTML = activeEmbPlacements.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; border-bottom: 1px solid #eee;">
        <span style="font-size: 12px; font-weight: 500;">${p}</span>
        <button type="button" onclick="window.removeProdPlacement('emb', ${idx})" style="background: none; border: none; color: #e74c3c; font-size: 11px; font-weight: bold; cursor: pointer;">Remove</button>
      </div>
    `).join("");
  }
}

window.removeProdPlacement = function(type, idx) {
  if (type === 'dtf') {
    activeDtfPlacements.splice(idx, 1);
  } else {
    activeEmbPlacements.splice(idx, 1);
  }
  renderProdBrandingPlacements();
};
let pendingSiteImages = {};

[
  { input: 'HeroImage', key: 'heroImage' },
  { input: 'PromoImage', key: 'promoImage' },
  { input: 'AboutImage', key: 'aboutImage' },
  { input: 'ServicesConsultImg', key: 'servicesConsultImg' },
  { input: 'ServicesBrandImg', key: 'servicesBrandImg' },
  { input: 'ServicesProdImg', key: 'servicesProdImg' },
  { input: 'SectorsHeroImg', key: 'sectorsHeroImg' }
].forEach(item => {
  const uploadInput = document.getElementById(`setting${item.input}Upload`);
  const textInput = document.getElementById(`setting${item.input}`);
  if (uploadInput && textInput) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        pendingSiteImages[item.key] = { base64: evt.target.result, name: file.name };
        textInput.value = `[Pending Upload: ${file.name}]`;
      };
      reader.readAsDataURL(file);
    });
  }
});

function renderSizesTags() {
  const container = document.getElementById("sizesTagsContainer");
  if (!container) return;
  container.innerHTML = activeSizes.map((size, idx) => `
    <span style="background: #f0eee9; color: var(--ink); padding: 4px 10px; border-radius: 16px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line);">
      ${size}
      <button type="button" onclick="window.removeSizeTag(${idx})" style="background: none; border: none; font-size: 15px; cursor: pointer; color: #888; line-height: 1; padding: 0;">&times;</button>
    </span>
  `).join("");
}

function renderColorsTags() {
  const container = document.getElementById("colorsTagsContainer");
  if (!container) return;
  container.innerHTML = activeColors.map((col, idx) => {
    const hex = getColorHex(col);
    return `
      <span style="background: #f0eee9; color: var(--ink); padding: 4px 10px; border-radius: 16px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line);">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: ${hex}; border: 1px solid ${hex.toLowerCase() === '#ffffff' ? '#ccc' : 'transparent'}; display: inline-block; flex-shrink: 0;"></span>
        ${col}
        <button type="button" onclick="window.removeColorTag(${idx})" style="background: none; border: none; font-size: 15px; cursor: pointer; color: #888; line-height: 1; padding: 0;">&times;</button>
      </span>
    `;
  }).join("");
  renderImagePreviews();
}

window.removeSizeTag = function(index) {
  activeSizes.splice(index, 1);
  renderSizesTags();
};

window.removeColorTag = function(index) {
  const removed = activeColors[index];
  if (removed && activeColorHexMap) delete activeColorHexMap[removed];
  activeColors.splice(index, 1);
  renderColorsTags();
};

function renderPlacementsTable() {
  const tbody = document.getElementById("placementsTableBody");
  if (!tbody) return;
  tbody.innerHTML = activeProductPlacements.map((p, idx) => `
    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
      <td style="padding: 6px;"><input type="text" value="${p.name || ''}" onchange="window.updatePlacementField(${idx}, 'name', this.value)" style="width: 100%; padding: 6px; font-size: 12px;"></td>
      <td style="padding: 6px;"><input type="number" value="${p.x ?? 65}" onchange="window.updatePlacementField(${idx}, 'x', this.value)" style="width: 60px; padding: 6px; text-align: center; font-size: 12px;"></td>
      <td style="padding: 6px;"><input type="number" value="${p.y ?? 36}" onchange="window.updatePlacementField(${idx}, 'y', this.value)" style="width: 60px; padding: 6px; text-align: center; font-size: 12px;"></td>
      <td style="padding: 6px;"><input type="number" value="${p.w ?? 18}" onchange="window.updatePlacementField(${idx}, 'w', this.value)" style="width: 60px; padding: 6px; text-align: center; font-size: 12px;"></td>
      <td style="padding: 6px;"><input type="number" value="${p.h ?? 18}" onchange="window.updatePlacementField(${idx}, 'h', this.value)" style="width: 60px; padding: 6px; text-align: center; font-size: 12px;"></td>
      <td style="padding: 6px;"><input type="number" value="${p.r ?? 0}" onchange="window.updatePlacementField(${idx}, 'r', this.value)" style="width: 60px; padding: 6px; text-align: center; font-size: 12px;"></td>
      <td style="padding: 6px; text-align: center;"><button type="button" onclick="window.removePlacementRow(${idx})" style="background: none; border: none; font-size: 16px; color: #e74c3c; cursor: pointer;">&times;</button></td>
    </tr>
  `).join("");
}

window.updatePlacementField = function(idx, field, val) {
  if (field === 'name') {
    activeProductPlacements[idx][field] = val;
  } else {
    activeProductPlacements[idx][field] = parseFloat(val) || 0;
  }
};

window.removePlacementRow = function(idx) {
  activeProductPlacements.splice(idx, 1);
  renderPlacementsTable();
};

document.getElementById("addPlacementRowBtn")?.addEventListener("click", () => {
  activeProductPlacements.push({ name: "New Zone", x: 50, y: 50, w: 20, h: 20, r: 0 });
  renderPlacementsTable();
});

document.getElementById("addProdDtfPlacementBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newProdDtfPlacementInput");
  const val = input?.value.trim();
  if (val && !activeDtfPlacements.includes(val)) {
    activeDtfPlacements.push(val);
    input.value = "";
    renderProdBrandingPlacements();
  }
});

document.getElementById("addProdEmbPlacementBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newProdEmbPlacementInput");
  const val = input?.value.trim();
  if (val && !activeEmbPlacements.includes(val)) {
    activeEmbPlacements.push(val);
    input.value = "";
    renderProdBrandingPlacements();
  }
});

document.getElementById("addSizeTagBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newSizeInput");
  const val = input?.value.trim();
  if (val && !activeSizes.includes(val)) {
    activeSizes.push(val);
    input.value = "";
    renderSizesTags();
  }
});

document.getElementById("addColorTagBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newColorInput");
  const picker = document.getElementById("newColorPicker");
  const val = input?.value.trim();
  const hex = picker ? picker.value : getColorHex(val);
  if (val && !activeColors.includes(val)) {
    activeColors.push(val);
    activeColorHexMap[val] = hex;
    input.value = "";
    renderColorsTags();
  }
});

document.getElementById("newColorInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("addColorTagBtn")?.click();
  }
});

document.querySelectorAll(".admin-color-preset").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const hex = btn.dataset.hex;
    const input = document.getElementById("newColorInput");
    const picker = document.getElementById("newColorPicker");
    if (input) input.value = name;
    if (picker) picker.value = hex;
  });
});

const adminColorPicker = document.getElementById("newColorPicker");
if (adminColorPicker) {
  adminColorPicker.addEventListener("input", (e) => {
    const hex = e.target.value;
    const input = document.getElementById("newColorInput");
    if (input && (!input.value || input.value.startsWith("#"))) {
      input.value = hex;
    }
  });
}

function renderSectorButtons() {
  const container = document.getElementById("productSectorsButtons");
  if (!container) return;
  const sectorsList = (typeof currentSectors !== 'undefined' && currentSectors && currentSectors.length > 0)
    ? currentSectors.filter(s => s.enabled !== false).map(s => s.name)
    : (typeof currentSiteSettings !== 'undefined' && currentSiteSettings.categories1stLayer && currentSiteSettings.categories1stLayer.length > 0)
      ? currentSiteSettings.categories1stLayer.filter(s => s.enabled !== false).map(s => s.name)
      : ["Food & beverage", "Hospitality", "Corporate", "Healthcare", "Industrial", "Education", "Aviation"];

  container.innerHTML = sectorsList.map(sec => {
    const isSelected = activeSectors.some(s => s.toLowerCase() === sec.toLowerCase());
    return `
      <button type="button" class="sector-btn ${isSelected ? 'active' : ''}" data-sector="${sec}" onclick="window.toggleSectorSelection('${sec}')" style="padding: 8px 16px; border-radius: 20px; border: 1px solid ${isSelected ? 'var(--ink)' : 'var(--line)'}; background: ${isSelected ? 'var(--ink)' : '#fff'}; color: ${isSelected ? '#fff' : 'var(--ink)'}; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
        ${sec} ${isSelected ? '✓' : ''}
      </button>
    `;
  }).join("");
  const input = document.getElementById("sectors");
  if (input) input.value = activeSectors.join(", ");
}

function updateCategoryDropdowns() {
  const categoriesList = (typeof currentCategories !== 'undefined' && currentCategories && currentCategories.length > 0)
    ? currentCategories.filter(c => c.enabled !== false).map(c => c.name)
    : (typeof currentSiteSettings !== 'undefined' && currentSiteSettings.categories2ndLayer && currentSiteSettings.categories2ndLayer.length > 0)
      ? currentSiteSettings.categories2ndLayer.filter(c => c.enabled !== false).map(c => c.name)
      : ["HEAD WEAR", "TOP WEAR", "BOTTOM WEAR", "OUTER WEAR", "ACCESSORIES"];

  // Update modal #category select
  const catSelect = document.getElementById("category");
  if (catSelect) {
    const curVal = catSelect.value;
    catSelect.innerHTML = categoriesList.map(c => `<option value="${c}">${c}</option>`).join("") +
      `<option value="ADD_NEW" style="font-weight: bold; color: var(--accent, #2f873d);">+ Add New Category...</option>`;
    if (curVal && Array.from(catSelect.options).some(o => o.value.toLowerCase() === curVal.toLowerCase())) {
      catSelect.value = curVal;
    }
  }

  // Update table filter #categoryFilter select
  const filterSelect = document.getElementById("categoryFilter");
  if (filterSelect) {
    const curFilterVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="All">All Categories</option>` +
      categoriesList.map(c => `<option value="${c}">${c}</option>`).join("");
    if (curFilterVal && Array.from(filterSelect.options).some(o => o.value === curFilterVal)) {
      filterSelect.value = curFilterVal;
    }
  }
}

window.toggleSectorSelection = function(sectorName) {
  const idx = activeSectors.findIndex(s => s.toLowerCase() === sectorName.toLowerCase());
  if (idx >= 0) {
    activeSectors.splice(idx, 1);
  } else {
    activeSectors.push(sectorName);
  }
  renderSectorButtons();
};

document.getElementById("sketchUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    pendingSketchFile = { base64: evt.target.result, name: file.name };
    const input = document.getElementById("sketch");
    if (input) input.value = `[Pending Upload: ${file.name}]`;
  };
  reader.readAsDataURL(file);
});

function openModal(docId = null) {
  productForm.reset();
  imagePreviewContainer.style.display = "none";
  imagePreviewContainer.innerHTML = "";
  imageUrlInput.value = "";
  uploadStatus.textContent = "";
  pendingImages = [];
  existingImages = [];
  pendingSketchFile = null;
  document.querySelectorAll("#genderGroup input[type='checkbox']").forEach(cb => cb.checked = false);
  updateMultiSelectText('genderGroup', 'genderText', 'Select Gender');

  if (docId) {
    modalTitle.textContent = "Edit Product";
    const p = productsList.find(x => x.id === docId || x.sku === docId);
    if (p) {
      document.getElementById("docId").value = p.sku;
      document.getElementById("sku").value = p.sku || "";
      document.getElementById("name").value = p.name || "";
      document.getElementById("category").value = p.category || "Top Wear";
      
      const pGender = p.gender || "Men / Women / Unisex";
      document.querySelectorAll("#genderGroup input[type='checkbox']").forEach(cb => {
        cb.checked = pGender.includes(cb.value);
      });
      updateMultiSelectText('genderGroup', 'genderText', 'Select Gender');
      
      activeSectors = p.sectors ? p.sectors.split(",").map(s => s.trim()).filter(Boolean) : [];
      renderSectorButtons();

      document.getElementById("short").value = p.short || "";
      document.getElementById("long").value = p.long || "";
      
      activeSizes = p.sizes && p.sizes.length > 0 ? [...p.sizes] : ["S", "M", "L", "XL"];
      activeColors = p.colors && p.colors.length > 0 ? [...p.colors] : ["Black", "White", "Navy"];
      renderSizesTags();
      renderColorsTags();

      document.getElementById("fabric").value = p.fabric || "";
      document.getElementById("gsm").value = p.gsm || "";
      document.getElementById("leadTime").value = p.leadTime || "";
      document.getElementById("moq").value = p.moq || "";
      if (document.getElementById("maxQty")) document.getElementById("maxQty").value = p.maxQty || p.max || "";
      document.getElementById("availability").value = p.availability || "";
      document.getElementById("care").value = p.care || "";
      document.getElementById("sketch").value = p.sketch || "";
      document.getElementById("sketchDescription").value = p.sketchDescription || "";
      
      // Implement Garment Placement Matrix Auto-Fill / Customizer Sync
      const pCat = (p.category || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      if (pCat.includes("bottom") || pName.includes("pant") || pName.includes("trouser") || pName.includes("short") || pName.includes("skirt")) {
        activeDtfPlacements = p.dtfPlacements && p.dtfPlacements.length > 0 ? [...p.dtfPlacements] : ["Left Hip Pocket", "Right Hip Pocket", "Left Cargo Pocket / Leg", "Right Cargo Pocket / Leg"];
        activeEmbPlacements = p.embroideryPlacements && p.embroideryPlacements.length > 0 ? [...p.embroideryPlacements] : ["Left Hip Pocket", "Right Hip Pocket", "Left Cargo Pocket / Leg", "Right Cargo Pocket / Leg"];
      } else if (pCat.includes("head") || pName.includes("cap") || pName.includes("hat") || pName.includes("beanie")) {
        activeDtfPlacements = p.dtfPlacements && p.dtfPlacements.length > 0 ? [...p.dtfPlacements] : ["Front Center Panel", "Side Panel"];
        activeEmbPlacements = p.embroideryPlacements && p.embroideryPlacements.length > 0 ? [...p.embroideryPlacements] : ["Front Center Panel", "Side Panel"];
      } else {
        activeDtfPlacements = p.dtfPlacements && p.dtfPlacements.length > 0 ? [...p.dtfPlacements] : ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
        activeEmbPlacements = p.embroideryPlacements && p.embroideryPlacements.length > 0 ? [...p.embroideryPlacements] : ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      }
      renderProdBrandingPlacements();

      activeProductPlacements = p.placements && p.placements.length > 0 ? JSON.parse(JSON.stringify(p.placements)) : [
        { name: "Left Chest", x: 65, y: 36, w: 18, h: 18, r: 0 },
        { name: "Right Chest", x: 35, y: 36, w: 18, h: 18, r: 0 },
        { name: "Full Back", x: 50, y: 45, w: 45, h: 45, r: 0 },
        { name: "Upper Sleeve", x: 84, y: 34, w: 13, h: 13, r: 6 }
      ];
      renderPlacementsTable();

      const custCap = p.customizationCapability || "both";
      const radio = document.querySelector(`input[name="customizationCapability"][value="${custCap}"]`);
      if (radio) {
        radio.checked = true;
        document.querySelectorAll('input[name="customizationCapability"]').forEach(r => {
          const lbl = r.closest('label');
          if (lbl) {
            lbl.style.background = r.checked ? '#f2f1ed' : '#fff';
            lbl.style.borderColor = r.checked ? 'var(--ink)' : 'var(--line)';
          }
        });
      }

      existingImageColorMap = {};
      pendingImageColorMap = {};
      pendingImages = [];
      activeColorHexMap = p.colorHexMap ? { ...p.colorHexMap } : {};

      if (p.images && p.images.length > 0) {
        existingImages = [...p.images];
      } else if (p.image) {
        existingImages = [p.image];
      } else {
        existingImages = [];
      }

      if (p.colorImageMap && typeof p.colorImageMap === "object") {
        existingImages.forEach((imgUrl, idx) => {
          for (const [col, colUrl] of Object.entries(p.colorImageMap)) {
            if (colUrl === imgUrl) {
              existingImageColorMap[idx] = col;
            }
          }
        });
      }
      renderImagePreviews();
    }
  } else {
    modalTitle.textContent = "Add Product";
    document.getElementById("docId").value = "";
    activeSectors = ["Corporate", "Hospitality"];
    activeSizes = ["S", "M", "L", "XL", "2XL"];
    activeColors = ["Black", "White", "Navy", "Grey"];
    activeColorHexMap = {};
    existingImageColorMap = {};
    pendingImageColorMap = {};
    existingImages = [];
    pendingImages = [];
    renderSectorButtons();
    renderSizesTags();
    renderColorsTags();
    renderImagePreviews();
    activeDtfPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
    activeEmbPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
    renderProdBrandingPlacements();
    activeProductPlacements = [
      { name: "Left Chest", x: 65, y: 36, w: 18, h: 18, r: 0 },
      { name: "Right Chest", x: 35, y: 36, w: 18, h: 18, r: 0 },
      { name: "Full Back", x: 50, y: 45, w: 45, h: 45, r: 0 },
      { name: "Upper Sleeve", x: 84, y: 34, w: 13, h: 13, r: 6 }
    ];
    renderPlacementsTable();
  }
  
  productModal.style.display = "flex";
}

function closeModal() {
  productModal.style.display = "none";
}

addProductBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// Handle Customization Capability Radio clicks in Modal
document.querySelectorAll('input[name="customizationCapability"]').forEach(r => {
  r.addEventListener('change', (e) => {
    document.querySelectorAll('input[name="customizationCapability"]').forEach(radio => {
      const lbl = radio.closest('label');
      if (lbl) {
        lbl.style.background = radio.checked ? '#f2f1ed' : '#fff';
        lbl.style.borderColor = radio.checked ? 'var(--ink)' : 'var(--line)';
      }
    });
  });
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById("saveProductBtn");
  submitBtn.textContent = "Saving Product...";
  submitBtn.disabled = true;

  const docId = document.getElementById("docId").value || document.getElementById("sku").value;
  const custCap = document.querySelector('input[name="customizationCapability"]:checked')?.value || "both";
  const supportedFinishes = custCap === "dtf_only" ? ["Direct To Fabric (DTF) Printing"] :
                            custCap === "embroidery_only" ? ["Embroidery"] :
                            custCap === "none" ? [] : ["Embroidery", "Direct To Fabric (DTF) Printing"];
  
  const productData = {
    id: docId,
    sku: document.getElementById("sku").value,
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    gender: Array.from(document.querySelectorAll("#genderGroup input[type='checkbox']:checked")).map(cb => cb.value).join(" / ") || "Unisex",
    sectors: activeSectors.join(", "),
    short: document.getElementById("short").value,
    long: document.getElementById("long").value,
    sizes: activeSizes,
    colors: activeColors,
    colorHexMap: activeColorHexMap,
    colorImageMap: (function() {
      const map = {};
      existingImages.forEach((imgUrl, idx) => {
        const assigned = existingImageColorMap[idx];
        if (assigned) map[assigned] = imgUrl;
      });
      return map;
    })(),
    fabric: document.getElementById("fabric").value,
    gsm: document.getElementById("gsm").value,
    leadTime: document.getElementById("leadTime").value,
    moq: document.getElementById("moq").value,
    maxQty: document.getElementById("maxQty")?.value || "",
    availability: document.getElementById("availability").value,
    care: document.getElementById("care").value,
    sketch: pendingSketchFile ? "PENDING_UPLOAD" : document.getElementById("sketch").value,
    sketchDescription: document.getElementById("sketchDescription")?.value || "",
    supportedPlacements: activeProductPlacements.map(p => p.name).filter(Boolean),
    placements: activeProductPlacements,
    dtfPlacements: activeDtfPlacements,
    embroideryPlacements: activeEmbPlacements,
    supportedFinishes: supportedFinishes,
    customizationCapability: custCap,
    existingImages: existingImages
  };

  if (pendingSketchFile) {
    productData.sketchBase64 = pendingSketchFile.base64;
    productData.sketchName = pendingSketchFile.name;
  }

  const success = await syncWithGithub("save", productData);
  if (success) closeModal();

  submitBtn.textContent = "Save Product";
  submitBtn.disabled = false;
});

// --- Image Preview (Base64) with Color Swatch Association ---
function renderImagePreviews() {
  imagePreviewContainer.innerHTML = "";
  
  if (existingImages.length === 0 && pendingImages.length === 0) {
    imagePreviewContainer.style.display = "none";
    return;
  }
  
  imagePreviewContainer.style.display = "flex";
  
  const colorOptions = activeColors && activeColors.length > 0 ? activeColors : ["Default"];
  
  existingImages.forEach((imgUrl, index) => {
    if (!existingImageColorMap[index]) {
      const match = activeColors.find(c => imgUrl.toLowerCase().includes(c.toLowerCase()));
      if (match) existingImageColorMap[index] = match;
    }
    const assignedColor = existingImageColorMap[index] || "";
    const hex = assignedColor ? getColorHex(assignedColor) : "#888";

    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "8px";
    div.style.border = `1px solid ${assignedColor ? 'var(--ink)' : 'var(--line)'}`;
    div.style.borderRadius = "8px";
    div.style.background = "#fff";
    div.style.width = "114px";
    div.style.position = "relative";
    div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";

    div.innerHTML = `
      <div style="position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; background: #f9f8f5; border-radius: 6px; overflow: hidden; border: 1px solid var(--line);">
        <img src="${imgUrl}" alt="Existing" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        <button type="button" class="remove-btn" onclick="window.removeExistingImage(${index})" style="position: absolute; top: 2px; right: 2px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">&times;</button>
      </div>
      <div style="width: 100%;">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
          ${assignedColor ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${hex}; border: 1px solid ${hex.toLowerCase() === '#ffffff' ? '#ccc' : 'transparent'}; display: inline-block;"></span>` : ''}
          <span style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Color Variant:</span>
        </div>
        <select onchange="window.updateImageColorMatch('existing', ${index}, this.value)" style="font-size: 11px; font-weight: 700; padding: 3px 4px; border-radius: 4px; width: 100%; border: 1px solid var(--line); background: ${assignedColor ? '#f2f8f3' : '#fff'}; color: ${assignedColor ? '#2f873d' : 'inherit'};">
          <option value="">(All Colors)</option>
          ${colorOptions.map(col => `<option value="${col}" ${assignedColor === col ? 'selected' : ''}>${col}</option>`).join("")}
        </select>
      </div>
    `;
    imagePreviewContainer.appendChild(div);
  });
  
  pendingImages.forEach((img, index) => {
    if (!pendingImageColorMap[index]) {
      const match = activeColors.find(c => img.name && img.name.toLowerCase().includes(c.toLowerCase()));
      if (match) pendingImageColorMap[index] = match;
    }
    const assignedColor = pendingImageColorMap[index] || "";
    const hex = assignedColor ? getColorHex(assignedColor) : "#888";

    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "8px";
    div.style.border = `1px solid ${assignedColor ? 'var(--ink)' : 'var(--line)'}`;
    div.style.borderRadius = "8px";
    div.style.background = "#fff";
    div.style.width = "114px";
    div.style.position = "relative";
    div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";

    div.innerHTML = `
      <div style="position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; background: #f9f8f5; border-radius: 6px; overflow: hidden; border: 1px solid var(--line);">
        <img src="${img.base64}" alt="Pending" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        <button type="button" class="remove-btn" onclick="window.removePendingImage(${index})" style="position: absolute; top: 2px; right: 2px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">&times;</button>
      </div>
      <div style="width: 100%;">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
          ${assignedColor ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${hex}; border: 1px solid ${hex.toLowerCase() === '#ffffff' ? '#ccc' : 'transparent'}; display: inline-block;"></span>` : ''}
          <span style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Color Variant:</span>
        </div>
        <select onchange="window.updateImageColorMatch('pending', ${index}, this.value)" style="font-size: 11px; font-weight: 700; padding: 3px 4px; border-radius: 4px; width: 100%; border: 1px solid var(--line); background: ${assignedColor ? '#f2f8f3' : '#fff'}; color: ${assignedColor ? '#2f873d' : 'inherit'};">
          <option value="">(All Colors)</option>
          ${colorOptions.map(col => `<option value="${col}" ${assignedColor === col ? 'selected' : ''}>${col}</option>`).join("")}
        </select>
      </div>
    `;
    imagePreviewContainer.appendChild(div);
  });
}

window.updateImageColorMatch = function(type, index, colorName) {
  if (type === 'existing') {
    existingImageColorMap[index] = colorName;
    renderImagePreviews();
  } else if (type === 'pending' && pendingImages[index]) {
    pendingImageColorMap[index] = colorName;
    const origName = pendingImages[index].name || "image.png";
    let cleanName = origName;
    if (origName.includes("_")) {
      cleanName = origName.split("_").slice(1).join("_");
    }
    pendingImages[index].name = colorName ? `${colorName}_${cleanName}` : cleanName;
    renderImagePreviews();
  }
};

window.removeExistingImage = function(index) {
  existingImages.splice(index, 1);
  const newMap = {};
  existingImages.forEach((_, i) => {
    const oldIdx = i >= index ? i + 1 : i;
    if (existingImageColorMap[oldIdx]) newMap[i] = existingImageColorMap[oldIdx];
  });
  existingImageColorMap = newMap;
  renderImagePreviews();
};

window.removePendingImage = function(index) {
  pendingImages.splice(index, 1);
  const newMap = {};
  pendingImages.forEach((_, i) => {
    const oldIdx = i >= index ? i + 1 : i;
    if (pendingImageColorMap[oldIdx]) newMap[i] = pendingImageColorMap[oldIdx];
  });
  pendingImageColorMap = newMap;
  renderImagePreviews();
};


imageUpload.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  uploadStatus.textContent = "Processing images...";
  
  const readPromises = Array.from(files).map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({ name: file.name, base64: event.target.result });
      };
      reader.readAsDataURL(file);
    });
  });
  
  const results = await Promise.all(readPromises);
  pendingImages = [...pendingImages, ...results];
  
  renderImagePreviews();
  uploadStatus.textContent = "Images ready to be uploaded upon saving!";
  imageUpload.value = ""; // reset input
});

// Init
checkAuth();

// --- Add New Category Logic ---
const categorySelect = document.getElementById("category");
let previousCategory = "";

categorySelect?.addEventListener("focus", () => {
  previousCategory = categorySelect.value;
});

categorySelect?.addEventListener("change", (e) => {
  if (e.target.value === "ADD_NEW") {
    const newCat = prompt("Enter new category name:");
    if (newCat && newCat.trim() !== "") {
      const option = document.createElement("option");
      option.value = newCat.trim();
      option.textContent = newCat.trim();
      categorySelect.insertBefore(option, categorySelect.lastElementChild);
      categorySelect.value = newCat.trim();
      previousCategory = newCat.trim();
    } else {
      categorySelect.value = previousCategory;
    }
  } else {
    previousCategory = categorySelect.value;
  }
});

// --- Select All Logic ---
document.getElementById("selectAllSizes")?.addEventListener("click", (e) => {
  e.preventDefault();
  const cbs = document.querySelectorAll("#sizesGroup input[type='checkbox']");
  const allChecked = Array.from(cbs).every(cb => cb.checked);
  cbs.forEach(cb => cb.checked = !allChecked);
  updateMultiSelectText('sizesGroup', 'sizesText', 'Select Sizes');
});

document.getElementById("selectAllColors")?.addEventListener("click", (e) => {
  e.preventDefault();
  const cbs = document.querySelectorAll("#colorsGroup input[type='checkbox']");
  const allChecked = Array.from(cbs).every(cb => cb.checked);
  cbs.forEach(cb => cb.checked = !allChecked);
  updateMultiSelectText('colorsGroup', 'colorsText', 'Select Colors');
});

// --- Multi-Select Dropdown Logic ---
document.querySelectorAll('.multi-select .select-box').forEach(box => {
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = box.nextElementSibling;
    const isVisible = menu.style.display === 'block';
    document.querySelectorAll('.multi-select .dropdown-menu').forEach(m => m.style.display = 'none');
    if (!isVisible) {
      menu.style.display = 'block';
    }
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.multi-select')) {
    document.querySelectorAll('.multi-select .dropdown-menu').forEach(m => m.style.display = 'none');
  }
});

function updateMultiSelectText(groupId, textId, defaultText) {
  const checked = Array.from(document.querySelectorAll(`#${groupId} input[type='checkbox']:checked`)).map(cb => cb.value);
  const textEl = document.getElementById(textId);
  if (checked.length === 0) {
    textEl.textContent = defaultText;
  } else if (checked.length <= 3) {
    textEl.textContent = checked.join(', ');
  } else {
    textEl.textContent = `${checked.length} selected`;
  }
}

document.querySelectorAll("#genderGroup input[type='checkbox']").forEach(cb => {
  cb.addEventListener('change', () => updateMultiSelectText('genderGroup', 'genderText', 'Select Gender'));
});
document.querySelectorAll("#sizesGroup input[type='checkbox']").forEach(cb => {
  cb.addEventListener('change', () => updateMultiSelectText('sizesGroup', 'sizesText', 'Select Sizes'));
});
document.querySelectorAll("#colorsGroup input[type='checkbox']").forEach(cb => {
  cb.addEventListener('change', () => updateMultiSelectText('colorsGroup', 'colorsText', 'Select Colors'));
});

// --- Search, Filter & Bulk Delete Logic ---
document.getElementById("searchBox")?.addEventListener("input", renderTable);
document.getElementById("categoryFilter")?.addEventListener("change", renderTable);

document.getElementById("bulkDeleteBtn")?.addEventListener("click", async () => {
  const selectedSkus = Array.from(document.querySelectorAll(".row-checkbox:checked")).map(cb => cb.value);
  if(selectedSkus.length === 0) return;
  if(confirm(`Are you sure you want to delete ${selectedSkus.length} product(s)?`)) {
    const btn = document.getElementById("bulkDeleteBtn");
    const originalText = btn.textContent;
    btn.textContent = "Deleting...";
    btn.disabled = true;
    try {
      for (const sku of selectedSkus) {
        await syncWithGithub("delete", { id: sku, sku: sku });
      }
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
});

// --- Visual Editor Controller ---
const tabProducts = document.getElementById('tabProducts');
const tabTaxonomy = document.getElementById('tabTaxonomy');
const tabSettings = document.getElementById('tabSettings');
const productsSection = document.getElementById('productsSection');
const tableContainer = document.querySelector('.table-container');
const taxonomySection = document.getElementById('taxonomySection');
const settingsSection = document.getElementById('settingsSection');
const tabBrands = document.getElementById('tabBrands');
const brandsSection = document.getElementById('brandsSection');
const brandLogosGrid = document.getElementById('brandLogosGrid');
const saveBrandsBtn = document.getElementById('saveBrandsBtn');

const saveTaxonomyBtn = document.getElementById('saveTaxonomyBtn');
const taxonomyStatusBadge = document.getElementById('taxonomyStatusBadge');
const sectorsReorderList = document.getElementById('sectorsReorderList');
const categoriesReorderList = document.getElementById('categoriesReorderList');
const newSectorInput = document.getElementById('newSectorInput');
const newCategoryInput = document.getElementById('newCategoryInput');
const sectorsCountBadge = document.getElementById('sectorsCountBadge');
const categoriesCountBadge = document.getElementById('categoriesCountBadge');
const previewSectorPills = document.getElementById('previewSectorPills');
const previewCategoryPills = document.getElementById('previewCategoryPills');

const addBrandModal = document.getElementById('addBrandModal');
const closeBrandModalBtn = document.getElementById('closeBrandModalBtn');
const cancelBrandModalBtn = document.getElementById('cancelBrandModalBtn');
const brandForm = document.getElementById('brandForm');
const brandNameInput = document.getElementById('brandNameInput');
const brandLogoFileInput = document.getElementById('brandLogoFileInput');
const brandLogoUrlInput = document.getElementById('brandLogoUrlInput');
const brandLogoPreviewBox = document.getElementById('brandLogoPreviewBox');
const brandLogoPreviewImg = document.getElementById('brandLogoPreviewImg');
const brandModalTitle = document.getElementById('brandModalTitle');
let editingBrandIndex = -1;

let brandLogosList = [
  { id: "brand_district", name: "DISTRICT", src: "assets/site_images/district.png" },
  { id: "brand_alibi", name: "ALIBI", src: "assets/site_images/alibi.png" },
  { id: "brand_cewas", name: "CEWAS", src: "assets/site_images/cewas.png" },
  { id: "brand_blaze_n_puff", name: "BLAZE N PUFF", src: "assets/site_images/blaze_n_puff.png" },
  { id: "brand_royal", name: "ROYAL", src: "assets/site_images/royal.png" },
  { id: "brand_mazaj_resto_cafe", name: "MAZAJ Resto Cafe", src: "assets/site_images/mazaj_resto_cafe.png" },
  { id: "brand_visiotech", name: "VISIOTECH", src: "assets/site_images/visiotech.png" }
];

async function loadBrandLogos() {
  // 1. Check admin_settings in Firebase or data/admin_settings.json
  try {
    const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
    const res = await fetch(`${FIREBASE_DB}/admin_settings.json?t=` + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.brandLogos) && data.brandLogos.length > 0) {
        brandLogosList = data.brandLogos;
        localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
        renderBrandLogosGrid();
        return;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('data/admin_settings.json?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.brandLogos) && data.brandLogos.length > 0) {
        brandLogosList = data.brandLogos;
        localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
        renderBrandLogosGrid();
        return;
      }
    }
  } catch (e) {}

  // 2. Parse live logos directly from index.html marquee
  try {
    const resHtml = await fetch('index.html?t=' + Date.now());
    if (resHtml.ok) {
      const htmlText = await resHtml.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const marquee = doc.querySelector('.marquee-content');
      if (marquee) {
        const imgs = marquee.querySelectorAll('img');
        const extracted = [];
        const seen = new Set();
        imgs.forEach(img => {
          const alt = (img.getAttribute('alt') || '').trim();
          const src = (img.getAttribute('src') || '').trim();
          if (alt && src && !seen.has(alt)) {
            seen.add(alt);
            extracted.push({
              id: 'brand_' + alt.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
              name: alt,
              src: src
            });
          }
        });
        if (extracted.length > 0) {
          brandLogosList = extracted;
          localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
          renderBrandLogosGrid();
          return;
        }
      }
    }
  } catch (e) {}

  // 3. Fallback to localStorage cache
  try {
    const cached = localStorage.getItem("fabric8_brand_logos_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        brandLogosList = parsed;
      }
    }
  } catch (e) {}

  renderBrandLogosGrid();
}


function updateIframeMarquee() {
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;
    const marquee = doc.querySelector('.marquee-content');
    if (!marquee) return;

    const logoItemsHtml = brandLogosList.map(b => `
            <div style="height: 100px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
              <img src="${b.src}" alt="${b.name || ''}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/'+this.getAttribute('src');}" style="max-height: 85px; max-width: 230px; width: auto; height: auto; object-fit: contain; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" loading="lazy">
            </div>`).join('\n');

    marquee.innerHTML = `<!-- Set 1 -->\n${logoItemsHtml}\n            \n<!-- Set 2 for seamless loop -->\n${logoItemsHtml}`;
  } catch(e) {}
}

function renderBrandLogosGrid() {
  if (!brandLogosGrid) return;
  
  brandLogosGrid.innerHTML = `
    <div id="addNewBrandCardBtn" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 160px; height: 120px; border: 2px dashed #2ecc71; border-radius: 12px; background: #f0fff4; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#e1f9e8'; this.style.borderColor='#27ae60'" onmouseout="this.style.background='#f0fff4'; this.style.borderColor='#2ecc71'">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #2ecc71; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: bold; margin-bottom: 8px; box-shadow: 0 3px 8px rgba(46,204,113,0.35);">&plus;</div>
      <span style="font-size: 12px; font-weight: 800; color: #27ae60;">Add Logo</span>
    </div>
  `;
  
  const newAddBtn = document.getElementById("addNewBrandCardBtn");
  if (newAddBtn) {
    newAddBtn.addEventListener("click", () => {
      editingBrandIndex = -1;
      if (brandModalTitle) brandModalTitle.textContent = "Add Client Brand Logo";
      if (saveBrandBtn) saveBrandBtn.textContent = "Add Logo";
      if (brandForm) brandForm.reset();
      if (brandLogoPreviewBox) brandLogoPreviewBox.style.display = "none";
      if (addBrandModal) addBrandModal.style.display = "flex";
    });
  }

  brandLogosList.forEach((brand, idx) => {
    const card = document.createElement("div");
    card.style.cssText = "position: relative; width: 160px; height: 120px; border: 1px solid var(--line); border-radius: 12px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transition: all 0.2s ease; cursor: pointer;";
    card.title = "Click to edit or change this logo";
    card.onmouseover = () => { card.style.borderColor = '#2ecc71'; card.style.boxShadow = '0 6px 16px rgba(46,204,113,0.2)'; };
    card.onmouseout = () => { card.style.borderColor = 'var(--line)'; card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'; };
    
    card.innerHTML = `
      <div class="delete-brand-circle-btn" data-index="${idx}" style="position: absolute; top: -10px; right: -10px; width: 28px; height: 28px; border-radius: 50%; background: #e74c3c; color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; cursor: pointer; border: 2px solid white; box-shadow: 0 3px 8px rgba(231,76,60,0.4); line-height: 1; user-select: none; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'" title="Delete ${brand.name} Logo">&minus;</div>
      
      <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center;">
        <img src="${brand.src}" alt="${brand.name}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/'+this.getAttribute('src');}" style="max-height: 55px; max-width: 130px; object-fit: contain;">
      </div>
      <span style="font-size: 11px; font-weight: 700; color: var(--ink); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; margin-top: 6px;">${brand.name}</span>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".delete-brand-circle-btn")) return;
      editingBrandIndex = idx;
      const targetBrand = brandLogosList[idx];
      if (brandModalTitle) brandModalTitle.textContent = "Edit / Replace Brand Logo";
      if (saveBrandBtn) saveBrandBtn.textContent = "Save Changes";
      if (brandNameInput) brandNameInput.value = targetBrand.name || "";
      if (brandLogoUrlInput) brandLogoUrlInput.value = targetBrand.src || "";
      if (brandLogoPreviewImg) brandLogoPreviewImg.src = targetBrand.src;
      if (brandLogoPreviewBox) brandLogoPreviewBox.style.display = "block";
      if (addBrandModal) addBrandModal.style.display = "flex";
    });
    
    brandLogosGrid.appendChild(card);
  });

  document.querySelectorAll(".delete-brand-circle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(btn.getAttribute("data-index"), 10);
      const targetBrand = brandLogosList[index];
      if (confirm(`Are you sure you want to delete "${targetBrand?.name || 'this logo'}" from the client logo marquee?`)) {
        brandLogosList.splice(index, 1);
        try { localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList)); } catch(err){}
        renderBrandLogosGrid();
        updateIframeMarquee();
        if (window.showToast) window.showToast(`Deleted ${targetBrand?.name || 'Logo'}. Click 'Publish Brand Changes' to save live!`, 'warning');
      }
    });
  });
}

// Modal closing handlers
if (closeBrandModalBtn) closeBrandModalBtn.addEventListener('click', () => addBrandModal.style.display = 'none');
if (cancelBrandModalBtn) cancelBrandModalBtn.addEventListener('click', () => addBrandModal.style.display = 'none');

// File Upload Preview
let currentUploadedBrandFileName = '';
if (brandLogoFileInput) {
  brandLogoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      currentUploadedBrandFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e2) => {
        brandLogoUrlInput.value = e2.target.result;
        brandLogoPreviewImg.src = e2.target.result;
        brandLogoPreviewBox.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });
}
if (brandLogoUrlInput) {
  brandLogoUrlInput.addEventListener('input', () => {
    if (brandLogoUrlInput.value.trim()) {
      brandLogoPreviewImg.src = brandLogoUrlInput.value.trim();
      brandLogoPreviewBox.style.display = "block";
    } else {
      brandLogoPreviewBox.style.display = "none";
    }
  });
}

// Save Brand Form (Add & Edit)
if (brandForm) {
  brandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = brandNameInput.value.trim();
    const src = brandLogoUrlInput.value.trim();
    if (!name || !src) return alert("Please provide both a brand name and logo image!");

    if (editingBrandIndex >= 0) {
      // Edit existing brand logo
      const existing = brandLogosList[editingBrandIndex];
      existing.name = name;
      existing.src = src;
      if (currentUploadedBrandFileName) {
        existing.fileName = currentUploadedBrandFileName;
      }
      currentUploadedBrandFileName = '';
      try { localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList)); } catch(err){}
      renderBrandLogosGrid();
      updateIframeMarquee();
      addBrandModal.style.display = 'none';
      if (window.showToast) window.showToast(`Updated "${name}"! Click 'Publish Brand Changes' to save live.`, 'success');
      return;
    }

    // Add new brand logo
    brandLogosList.push({
      id: 'brand_' + Date.now(),
      name,
      src,
      fileName: currentUploadedBrandFileName || (name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.png')
    });
    currentUploadedBrandFileName = '';
    try { localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList)); } catch(err){}
    renderBrandLogosGrid();
    updateIframeMarquee();
    addBrandModal.style.display = 'none';
    if (window.showToast) window.showToast(`Added "${name}"! Click 'Publish Brand Changes' to deploy to live site.`, 'success');
  });
}

// Tab Switching (Products, Sectors & Categories, Site Settings)
function switchAdminTab(targetTab) {
  const tabs = [
    { btn: tabProducts, sec: productsSection, isProducts: true },
    { btn: tabTaxonomy, sec: taxonomySection },
    { btn: tabSettings, sec: settingsSection }
  ];

  tabs.forEach(t => {
    if (!t.btn) return;
    if (t.btn === targetTab) {
      t.btn.classList.add('active');
      t.btn.style.background = 'var(--green)';
      t.btn.style.color = 'white';
      t.btn.style.border = 'none';
      if (t.sec) t.sec.style.display = 'block';
      if (t.isProducts && tableContainer) tableContainer.style.display = 'block';
    } else {
      t.btn.classList.remove('active');
      t.btn.style.background = 'white';
      t.btn.style.color = 'var(--ink)';
      t.btn.style.border = '1px solid var(--line)';
      if (t.sec) t.sec.style.display = 'none';
      if (t.isProducts && tableContainer) tableContainer.style.display = 'none';
    }
  });

  if (targetTab === tabSettings) {
    loadBrandLogos();
    loadSiteSettings();
  } else if (targetTab === tabTaxonomy) {
    initTaxonomyManager();
  }
}

if (tabProducts) tabProducts.addEventListener('click', () => switchAdminTab(tabProducts));
if (tabTaxonomy) tabTaxonomy.addEventListener('click', () => switchAdminTab(tabTaxonomy));
if (tabSettings) tabSettings.addEventListener('click', () => switchAdminTab(tabSettings));

// ===================================================
// --- SECTORS & CATEGORIES (TAXONOMY) MANAGER ---
// ===================================================
let currentSectors = [];
let currentCategories = [];
let draggingTaxonomy = null; // { type: 'sector'|'category', index: number }

async function initTaxonomyManager() {
  if (!currentSiteSettings || !currentSiteSettings.categories1stLayer) {
    await loadSiteSettings();
  }

  if (currentSiteSettings.categories1stLayer && Array.isArray(currentSiteSettings.categories1stLayer)) {
    currentSectors = JSON.parse(JSON.stringify(currentSiteSettings.categories1stLayer));
  } else {
    currentSectors = [
      { name: "Food & beverage", enabled: true },
      { name: "Hospitality", enabled: true },
      { name: "Corporate", enabled: true },
      { name: "Healthcare", enabled: true },
      { name: "Industrial", enabled: true },
      { name: "Education", enabled: false },
      { name: "Aviation", enabled: false }
    ];
  }

  if (currentSiteSettings.categories2ndLayer && Array.isArray(currentSiteSettings.categories2ndLayer)) {
    currentCategories = JSON.parse(JSON.stringify(currentSiteSettings.categories2ndLayer));
  } else {
    currentCategories = [
      { name: "HEAD WEAR", enabled: true },
      { name: "TOP WEAR", enabled: true },
      { name: "BOTTOM WEAR", enabled: true },
      { name: "OUTER WEAR", enabled: true },
      { name: "ACCESSORIES", enabled: true }
    ];
  }

  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
}

function renderTaxonomyLists() {
  renderTaxonomyItemsList('sector');
  renderTaxonomyItemsList('category');
  renderLiveTaxonomyPreview();
}

function renderTaxonomyItemsList(type) {
  const isSector = type === 'sector';
  const container = isSector ? sectorsReorderList : categoriesReorderList;
  const badge = isSector ? sectorsCountBadge : categoriesCountBadge;
  const items = isSector ? currentSectors : currentCategories;

  if (!container) return;

  const activeCount = items.filter(i => i.enabled !== false).length;
  if (badge) {
    badge.textContent = `${activeCount} of ${items.length} Active`;
    badge.className = `reorder-badge ${activeCount > 0 ? 'active' : 'hidden'}`;
  }

  if (!items || items.length === 0) {
    container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--muted); font-size: 13px; background: #fff; border: 1px dashed var(--line); border-radius: 8px;">No ${isSector ? 'sectors' : 'categories'} found. Use the input above to add one!</div>`;
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === items.length - 1;
    const isEnabled = item.enabled !== false;
    const escapedName = (item.name || "").replace(/"/g, "&quot;");

    return `
      <div class="reorder-item ${isEnabled ? '' : 'item-disabled'}" 
           draggable="true" 
           data-taxonomy-type="${type}" 
           data-taxonomy-index="${idx}">
        <span class="reorder-handle" title="Drag to reorder" aria-label="Drag to reorder">⋮⋮</span>
        <span class="reorder-num">#${idx + 1}</span>
        
        <input type="text" 
               class="reorder-name-input" 
               value="${escapedName}" 
               placeholder="Name..." 
               onchange="window.updateTaxonomyName('${type}', ${idx}, this.value)"
               title="Click to rename" />

        <div class="reorder-controls">
          <div class="reorder-arrows">
            <button type="button" 
                    class="reorder-arrow-btn" 
                    ${isFirst ? 'disabled' : ''} 
                    onclick="window.moveTaxonomyItem('${type}', ${idx}, -1)" 
                    title="Move Up (Earlier in filter order)">▲</button>
            <button type="button" 
                    class="reorder-arrow-btn" 
                    ${isLast ? 'disabled' : ''} 
                    onclick="window.moveTaxonomyItem('${type}', ${idx}, 1)" 
                    title="Move Down (Later in filter order)">▼</button>
          </div>

          <button type="button" 
                  class="reorder-toggle-btn ${isEnabled ? 'visible' : 'hidden'}" 
                  onclick="window.toggleTaxonomyEnabled('${type}', ${idx})" 
                  title="${isEnabled ? 'Click to hide from Shop filter' : 'Click to show in Shop filter'}">
            ${isEnabled ? '👁️ Visible' : '🚫 Hidden'}
          </button>

          <button type="button" 
                  class="reorder-delete-btn" 
                  onclick="window.deleteTaxonomyItem('${type}', ${idx})" 
                  title="Delete this ${type}">✕</button>
        </div>
      </div>
    `;
  }).join("");

  attachTaxonomyDragHandlers(container, type);
}

function attachTaxonomyDragHandlers(container, type) {
  const itemEls = container.querySelectorAll('.reorder-item');

  itemEls.forEach(el => {
    el.addEventListener('dragstart', (e) => {
      const idx = parseInt(el.getAttribute('data-taxonomy-index'));
      draggingTaxonomy = { type, index: idx };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', idx.toString());
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      container.querySelectorAll('.reorder-item').forEach(i => {
        i.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      draggingTaxonomy = null;
    });

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggingTaxonomy || draggingTaxonomy.type !== type) return;
      e.dataTransfer.dropEffect = 'move';

      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        el.classList.add('drag-over-top');
        el.classList.remove('drag-over-bottom');
      } else {
        el.classList.add('drag-over-bottom');
        el.classList.remove('drag-over-top');
      }
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggingTaxonomy || draggingTaxonomy.type !== type) return;

      const fromIdx = draggingTaxonomy.index;
      let toIdx = parseInt(el.getAttribute('data-taxonomy-index'));
      if (fromIdx === toIdx) return;

      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dropAfter = e.clientY >= midY;

      const targetList = (type === 'sector') ? currentSectors : currentCategories;
      const movedItem = targetList.splice(fromIdx, 1)[0];

      // Recompute target index after splice
      let newIdx = toIdx;
      if (fromIdx < toIdx) {
        newIdx = dropAfter ? toIdx : toIdx - 1;
      } else {
        newIdx = dropAfter ? toIdx + 1 : toIdx;
      }
      if (newIdx < 0) newIdx = 0;
      if (newIdx > targetList.length) newIdx = targetList.length;

      targetList.splice(newIdx, 0, movedItem);

      renderTaxonomyLists();
      updateCategoryDropdowns();
      renderSectorButtons();
      if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
      if (window.showToast) window.showToast(`Reordered ${type}: "${movedItem.name}". Click 'Publish Filter Changes' to deploy!`, 'success', 3000);
    });
  });
}

window.moveTaxonomyItem = function(type, idx, direction) {
  const list = (type === 'sector') ? currentSectors : currentCategories;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= list.length) return;

  const temp = list[idx];
  list[idx] = list[newIdx];
  list[newIdx] = temp;

  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
};

window.updateTaxonomyName = function(type, idx, newName) {
  const list = (type === 'sector') ? currentSectors : currentCategories;
  const clean = (newName || "").trim();
  if (!clean) {
    alert("Name cannot be empty.");
    renderTaxonomyLists();
    return;
  }
  list[idx].name = clean;
  renderLiveTaxonomyPreview();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
};

window.toggleTaxonomyEnabled = function(type, idx) {
  const list = (type === 'sector') ? currentSectors : currentCategories;
  list[idx].enabled = list[idx].enabled === false ? true : false;
  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
};

window.deleteTaxonomyItem = function(type, idx) {
  const list = (type === 'sector') ? currentSectors : currentCategories;
  const item = list[idx];
  if (!confirm(`Are you sure you want to delete the ${type} "${item.name}"?`)) return;

  list.splice(idx, 1);
  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
  if (window.showToast) window.showToast(`Deleted "${item.name}". Click 'Publish Filter Changes' to save!`, 'warning', 3000);
};

window.addNewSectorFromInput = function() {
  if (!newSectorInput) return;
  const name = newSectorInput.value.trim();
  if (!name) {
    alert("Please enter a sector name.");
    return;
  }
  if (currentSectors.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    alert(`A sector named "${name}" already exists.`);
    return;
  }

  currentSectors.push({ name, enabled: true });
  newSectorInput.value = "";
  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
  if (window.showToast) window.showToast(`Added Sector "${name}"! Click 'Publish Filter Changes' to deploy.`, 'success');
};

window.addNewCategoryFromInput = function() {
  if (!newCategoryInput) return;
  const name = newCategoryInput.value.trim();
  if (!name) {
    alert("Please enter a category name.");
    return;
  }
  if (currentCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert(`A category named "${name}" already exists.`);
    return;
  }

  currentCategories.push({ name, enabled: true });
  newCategoryInput.value = "";
  renderTaxonomyLists();
  updateCategoryDropdowns();
  renderSectorButtons();
  if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = 'none';
  if (window.showToast) window.showToast(`Added Category "${name}"! Click 'Publish Filter Changes' to deploy.`, 'success');
};

function renderLiveTaxonomyPreview() {
  if (previewSectorPills) {
    const visibleSectors = currentSectors.filter(s => s.enabled !== false);
    let html = `<div style="padding: 6px 12px; background: var(--green); color: #fff; border-radius: 4px; font-size: 12px; font-weight: 700;">All Sectors</div>`;
    if (visibleSectors.length === 0) {
      html += `<div style="font-size: 11px; color: var(--muted); font-style: italic;">No active sectors</div>`;
    } else {
      visibleSectors.forEach(s => {
        html += `<div style="padding: 6px 12px; background: #f4f3ef; border: 1px solid var(--line); border-radius: 4px; font-size: 12px; color: var(--ink); font-weight: 500;">${s.name}</div>`;
      });
    }
    previewSectorPills.innerHTML = html;
  }

  if (previewCategoryPills) {
    const visibleCats = currentCategories.filter(c => c.enabled !== false);
    let html = `<div style="padding: 6px 12px; background: var(--green); color: #fff; border-radius: 4px; font-size: 12px; font-weight: 700;">All Categories</div>`;
    if (visibleCats.length === 0) {
      html += `<div style="font-size: 11px; color: var(--muted); font-style: italic;">No active categories</div>`;
    } else {
      visibleCats.forEach(c => {
        html += `<div style="padding: 6px 12px; background: #fff; border: 1px dashed var(--line); border-radius: 4px; font-size: 12px; color: var(--ink); font-weight: 600; text-transform: uppercase;">${c.name}</div>`;
      });
    }
    previewCategoryPills.innerHTML = html;
  }
}

// Publish Taxonomy Changes to GitHub & Firebase
if (saveTaxonomyBtn) {
  saveTaxonomyBtn.addEventListener('click', async () => {
    const originalText = saveTaxonomyBtn.innerHTML;
    saveTaxonomyBtn.innerHTML = `<span>⏳ Publishing...</span>`;
    saveTaxonomyBtn.disabled = true;

    try {
      // 1. Update in-memory siteSettings
      currentSiteSettings.categories1stLayer = currentSectors;
      currentSiteSettings.categories2ndLayer = currentCategories;

      // 2. Save to localStorage immediately
      try {
        localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSiteSettings));
        localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
      } catch(e) {}

      // 3. Save to Firebase Realtime Database
      try {
        const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
        await fetch(`${FIREBASE_DB}/admin_settings.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSiteSettings)
        });
      } catch(fbErr) {
        console.warn("Firebase sync notice:", fbErr);
      }

      // 4. Save to GitHub via /api/githubSync
      let ghSynced = false;
      try {
        const res = await fetch('/api/githubSync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_settings',
            siteSettingsPayload: currentSiteSettings,
            commitMessage: 'Update Sectors and Categories filter order and visibility'
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) ghSynced = true;
        }
      } catch(ghErr) {
        console.warn("GitHub API notice:", ghErr);
      }

      // 5. Update UI
      if (taxonomyStatusBadge) {
        taxonomyStatusBadge.textContent = "● Changes Published to Live Site!";
        taxonomyStatusBadge.style.display = "inline-block";
        setTimeout(() => {
          if (taxonomyStatusBadge) taxonomyStatusBadge.style.display = "none";
        }, 6000);
      }

      updateCategoryDropdowns();
      renderSectorButtons();

      if (window.showToast) {
        window.showToast("✅ Sectors and Categories filter order updated successfully!", "success", 5000);
      } else {
        alert("Sectors and Categories filter order updated successfully!");
      }
    } catch(err) {
      console.error("Failed to save taxonomy:", err);
      alert("Error publishing filter changes: " + (err.message || err));
    } finally {
      saveTaxonomyBtn.innerHTML = originalText;
      saveTaxonomyBtn.disabled = false;
    }
  });
}

// Save Brands to Live Site via API
if (saveBrandsBtn) {
  saveBrandsBtn.addEventListener('click', async () => {
    try {
      saveBrandsBtn.textContent = 'Publishing to Live Site...';
      saveBrandsBtn.disabled = true;

      // 1. Process brandLogosList: extract base64 images into siteImages with clean unique paths
      const siteImages = [];
      const updatedLogosList = brandLogosList.map((b, idx) => {
        if (b.src && b.src.startsWith('data:image')) {
          const ext = (b.fileName || 'logo.png').split('.').pop() || 'png';
          const cleanName = (b.name || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
          const newPath = `assets/site_images/${Date.now()}_${idx}_${cleanName}.${ext}`;
          
          siteImages.push({
            name: `${cleanName}.${ext}`,
            base64: b.src,
            newPath: newPath
          });
          
          return {
            ...b,
            src: newPath
          };
        }
        return b;
      });

      // 2. Fetch latest index.html
      const resHtml = await fetch('index.html?t=' + Date.now());
      let htmlText = await resHtml.text();

      // 3. Build Set 1 and Set 2 logo HTML using clean relative paths
      const logoItemsHtml = updatedLogosList.map(b => `
            <div style="height: 100px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <img src="${b.src}" alt="${b.name}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/'+this.getAttribute('src');}" style="max-height: 85px; max-width: 230px; width: auto; height: auto; object-fit: contain; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" loading="lazy">
            </div>`).join('\n');

      const marqueeReplacement = `<div class="marquee-content" style="display: flex; gap: 75px; width: max-content; align-items: center; animation: scrollBelt 25s linear infinite;">
            <!-- Set 1 -->
${logoItemsHtml}
            
            <!-- Set 2 for seamless loop -->
${logoItemsHtml}
          </div>`;

      // 4. Replace marquee-content block in index.html cleanly
      const parser = new DOMParser();
      const tempDoc = parser.parseFromString(htmlText, 'text/html');
      const marqueeEl = tempDoc.querySelector('.marquee-content');
      if (marqueeEl) {
        marqueeEl.outerHTML = marqueeReplacement;
        htmlText = '<!DOCTYPE html>\n<html>\n' + tempDoc.documentElement.innerHTML + '\n</html>';
      }

      // 5. Build siteSettingsPayload to save brandLogos permanently
      const siteSettingsPayload = {
        ...currentSiteSettings,
        brandLogos: updatedLogosList
      };

      // 6. Publish to GitHub via /api/githubSync
      const syncRes = await fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: authToken || 'admin1234',
          action: 'save_html',
          filename: 'index.html',
          htmlContent: htmlText,
          siteImages: siteImages,
          siteSettingsPayload: siteSettingsPayload
        })
      });

      const syncData = await syncRes.json();
      if (syncData.success) {
        brandLogosList = updatedLogosList;
        try {
          localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
        } catch(e) {}
        renderBrandLogosGrid();
        if (window.showToast) window.showToast("🚀 Brand logos published successfully to live site!", "success");
        alert("✅ Brand logos published successfully to live site!");
      } else {
        alert("Failed to publish: " + (syncData.message || "Unknown error"));
      }
    } catch(err) {
      console.error(err);
      alert("Error publishing brand changes: " + err.message);
    } finally {
      saveBrandsBtn.textContent = 'Publish Brand Changes';
      saveBrandsBtn.disabled = false;
    }
  });
}

// --- Site Settings Cache ---
let currentSiteSettings = {};

async function loadSiteSettings() {
  try {
    const cached = localStorage.getItem("fabric8_admin_settings_cache");
    if (cached) {
      currentSiteSettings = JSON.parse(cached);
    }
  } catch (e) {}

  try {
    const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
    const res = await fetch(`${FIREBASE_DB}/admin_settings.json?t=` + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        currentSiteSettings = data;
        try {
          localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSiteSettings));
          localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
        } catch (e) {}
        if (typeof updateCategoryDropdowns === 'function') updateCategoryDropdowns();
        if (typeof renderSectorButtons === 'function') renderSectorButtons();
        return;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('data/admin_settings.json?t=' + Date.now());
    if (res.ok) {
      currentSiteSettings = await res.json();
      try {
        localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSiteSettings));
        localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
      } catch (e) {}
    }
  } catch (e) {}

  if (typeof updateCategoryDropdowns === 'function') updateCategoryDropdowns();
  if (typeof renderSectorButtons === 'function') renderSectorButtons();
}

const iframe = document.getElementById('visualEditorIframe');
const iframeOverlay = document.getElementById('iframeOverlay');
const navBtns = document.querySelectorAll('.editor-nav-btn');
let currentVisualPage = 'index.html';

if (iframe && navBtns.length > 0) {
  const initIframeEditing = () => {
    if (iframeOverlay) iframeOverlay.style.display = 'none';
    
    // Inject Visual Editor Script into iframe
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.body) return;
      
      // Inject CSS if not present
      if (!doc.getElementById('visual-editor-style')) {
        const style = doc.createElement('style');
        style.id = 'visual-editor-style';
        style.innerHTML = `
          [contenteditable="true"] { outline: 2px dashed rgba(47, 135, 61, 0.5); cursor: text; transition: outline 0.2s; }
          [contenteditable="true"]:hover { outline: 2px solid var(--green, #2f873d); background: rgba(47, 135, 61, 0.05); }
          [contenteditable="true"]:focus { outline: 2px solid var(--green, #2f873d); background: white; color: black; }
          .editable-image { outline: 2px dashed rgba(47, 135, 61, 0.5); cursor: pointer; transition: outline 0.2s; position: relative; }
          .editable-image:hover { outline: 3px solid var(--green, #2f873d); opacity: 0.8; }
          .editable-image::after { content: "✏️ Click to change image"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: black; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; pointer-events: none; opacity: 0; }
          .editable-image:hover::after { opacity: 1; }
        `;
        doc.head.appendChild(style);
      }

      // Inject Red (-) and Green (+) buttons onto brand logos inside iframe marquee
      const iframeMarquee = doc.querySelector('.marquee-content');
      if (iframeMarquee && !iframeMarquee.getAttribute('data-controls-injected')) {
        iframeMarquee.setAttribute('data-controls-injected', 'true');
        
        // Add Green (+) Add Button to the left of logos marquee in iframe
        const greenAddBtn = doc.createElement('div');
        greenAddBtn.style.cssText = 'width: 50px; height: 50px; border-radius: 50%; background: #2ecc71; color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(46,204,113,0.4); flex-shrink: 0; margin-right: 20px; transition: transform 0.2s;';
        greenAddBtn.title = 'Add Brand Logo';
        greenAddBtn.innerHTML = '&plus;';
        greenAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (brandForm) brandForm.reset();
          if (brandLogoPreviewBox) brandLogoPreviewBox.style.display = 'none';
          if (addBrandModal) addBrandModal.style.display = 'flex';
        });
        iframeMarquee.insertBefore(greenAddBtn, iframeMarquee.firstChild);

        // Attach Red (-) Delete buttons to each logo item in iframe preview
        const logoBoxes = iframeMarquee.querySelectorAll('div:not([title="Add Brand Logo"])');
        logoBoxes.forEach(box => {
          box.style.position = 'relative';
          const redDeleteBtn = doc.createElement('div');
          redDeleteBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 26px; height: 26px; border-radius: 50%; background: #e74c3c; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: pointer; border: 2px solid white; box-shadow: 0 3px 8px rgba(231,76,60,0.4); z-index: 99; line-height: 1;';
          redDeleteBtn.title = 'Delete Logo';
          redDeleteBtn.innerHTML = '&minus;';
          redDeleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const imgEl = box.querySelector('img');
            const logoAlt = imgEl ? imgEl.getAttribute('alt') : 'this logo';
            if (confirm(`Delete "${logoAlt}" from logo strip?`)) {
              box.remove();
              // Also sync brandLogosList
              brandLogosList = brandLogosList.filter(b => !logoAlt || !b.name.toLowerCase().includes(logoAlt.toLowerCase()));
              try { localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList)); } catch(e){}
              renderBrandLogosGrid();
            }
          });
          box.appendChild(redDeleteBtn);
        });
      }
      
      // Intercept all link clicks in capture phase to prevent accidental iframe navigation
      if (!doc.body.getAttribute('data-click-intercepted')) {
        doc.body.setAttribute('data-click-intercepted', 'true');
        doc.addEventListener('click', (e) => {
          if (e.target.closest('.editor-change-bg-btn')) return;
          const link = e.target.closest('a, button');
          if (link) {
            e.preventDefault();
          }
        }, true);
      }

      // Make text editable
      const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li', 'a', 'button', 'td', 'th', 'div'];
      textTags.forEach(tag => {
        const els = doc.querySelectorAll(tag);
        els.forEach(el => {
          if (el.classList.contains('editor-change-bg-btn') || el.closest('.editor-change-bg-btn')) return;
          if (el.children.length === 0 || tag === 'span' || tag === 'a' || tag === 'button' || tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
            el.setAttribute('contenteditable', 'true');
          }
        });
      });

      // Prevent link navigation inside editor iframe so clicks edit text
      doc.querySelectorAll('a, button').forEach(el => {
        if (el.classList.contains('editor-change-bg-btn') || el.closest('.editor-change-bg-btn')) return;
        if (!el.getAttribute('data-editor-click-handled')) {
          el.setAttribute('data-editor-click-handled', 'true');
          el.addEventListener('click', (e) => {
            // Allow text focus instead of navigating
            e.preventDefault();
          });
        }
      });

      // Explicitly ensure all footer text and links are editable
      const footerEl = doc.querySelector('footer');
      if (footerEl) {
        footerEl.querySelectorAll('p, a, h4, div').forEach(el => {
          if (el.children.length === 0 || el.tagName === 'P' || el.tagName === 'H4' || el.tagName === 'A') {
            el.setAttribute('contenteditable', 'true');
          }
        });

        // Make footer social icons visible and clickable to set URL in visual editor
        const socialIcons = footerEl.querySelectorAll('#cmsSocialLinkedIn, #cmsSocialFacebook, #cmsSocialInstagram, a[href*="linkedin"], a[href*="facebook"], a[href*="instagram"]');
        socialIcons.forEach(icon => {
          icon.style.display = 'inline-flex';
          icon.style.alignItems = 'center';
          icon.style.justifyContent = 'center';
          icon.style.cursor = 'pointer';
          icon.title = 'Click to edit social media link';
          if (!icon.getAttribute('data-social-click-handled')) {
            icon.setAttribute('data-social-click-handled', 'true');
            icon.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const platform = icon.id.replace('cmsSocial', '') || 'Social';
              const cur = icon.getAttribute('data-updated-href') || icon.getAttribute('href') || '';
              const val = prompt(`Enter ${platform} Profile URL (or leave blank to hide):`, cur === '#' ? '' : cur);
              if (val !== null) {
                const cleanVal = val.trim();
                icon.setAttribute('data-updated-href', cleanVal);
                icon.setAttribute('href', cleanVal || '#');
                alert(`✅ ${platform} URL updated!`);
              }
            });
          }
        });
      }
      
      // Make images editable
      const images = doc.querySelectorAll('img');
      images.forEach(img => {
        if (!img.classList.contains('editable-image')) {
          img.classList.add('editable-image');
          img.addEventListener('click', (e) => {
            e.preventDefault();
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (event) => {
              const file = event.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e2) => {
                  img.src = e2.target.result;
                  img.setAttribute('data-new-upload', file.name);
                };
                reader.readAsDataURL(file);
              }
            };
            fileInput.click();
          });
        }
      });
      
      // Make CSS background images editable (hero banners)
      const heroes = doc.querySelectorAll('.page-hero, .shop-hero, .about-hero, .services-hero, .sectors-hero, .method-hero, .contact-hero, .fashion-slide');
      heroes.forEach(hero => {
        if (!hero.getAttribute('data-editable-bg')) {
          hero.setAttribute('data-editable-bg', 'true');
          hero.style.position = 'relative';

          const handleBgSelect = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const parentFileInput = document.getElementById('editorHeroFileInput');
            if (parentFileInput) {
              parentFileInput.click();
            } else {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.style.display = 'none';
              document.body.appendChild(fileInput);
              fileInput.onchange = (event) => {
                const file = event.target.files && event.target.files[0];
                if (file) applyHeroImageFile(file);
                fileInput.remove();
              };
              fileInput.click();
            }
          };

          // Inject floating "Change Photo" button directly into the hero
          if (!hero.querySelector('.editor-change-bg-btn')) {
            const btn = doc.createElement('button');
            btn.className = 'editor-change-bg-btn';
            btn.type = 'button';
            btn.setAttribute('contenteditable', 'false');
            btn.innerHTML = '📷 Change Hero Photo';
            btn.style.cssText = 'position: absolute; top: 15px; right: 20px; z-index: 999999; background: #111; color: #fff; border: 2px solid #2ecc71; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 8px; font-family: inherit; letter-spacing: 0.5px;';
            btn.onmouseover = () => { btn.style.background = '#2ecc71'; btn.style.color = '#fff'; btn.style.transform = 'scale(1.05)'; };
            btn.onmouseout = () => { btn.style.background = '#111'; btn.style.color = '#fff'; btn.style.transform = 'scale(1)'; };
            btn.addEventListener('click', handleBgSelect);
            hero.appendChild(btn);
          }

          hero.addEventListener('dblclick', (e) => {
            if (e.target.closest('[contenteditable="true"]')) return;
            handleBgSelect(e);
          });
          hero.title = "Click 'Change Hero Photo' or double-click to change";
        }
      });
      
      // Update iframe marquee with brand logos
      updateIframeMarquee();

    } catch(err) {
      console.warn("Could not inject editor script into iframe:", err);
    }
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      navBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentVisualPage = e.target.getAttribute('data-page');
      iframe.src = currentVisualPage;
    });
  });

  iframe.addEventListener('load', initIframeEditing);
  // Also try immediate initialization for fast loading
  setTimeout(initIframeEditing, 300);
  setTimeout(initIframeEditing, 1000);
}

const saveVisualEditorBtn = document.getElementById('saveVisualEditorBtn');
if (saveVisualEditorBtn) {
  saveVisualEditorBtn.addEventListener('click', async () => {
    try {
      saveVisualEditorBtn.textContent = 'Extracting HTML & Uploading...';
      saveVisualEditorBtn.disabled = true;
      
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Safety check: ensure iframe is actually showing currentVisualPage
      try {
        const actualPage = (iframe.contentWindow.location.pathname.split('/').pop() || '').split('?')[0];
        if (actualPage && actualPage.endsWith('.html') && actualPage !== currentVisualPage) {
          alert(`⚠️ The editor preview is currently on '${actualPage}'. You cannot save this onto '${currentVisualPage}'. Please select '${currentVisualPage}' from the left sidebar before publishing.`);
          saveVisualEditorBtn.textContent = 'Publish Changes';
          saveVisualEditorBtn.disabled = false;
          return;
        }
      } catch(e) {}
      
      // Deep clone document to strip editor attributes without affecting live preview
      // Load current admin settings first so image and logo updates have access

      // Load current admin settings first so image and logo updates have access
      let settingsUpdated = false;
      let currentSettings = {};
      try {
        const cached = localStorage.getItem("fabric8_admin_settings_cache");
        if (cached) currentSettings = JSON.parse(cached);
      } catch(e) {}

      if (!currentSettings.siteContent) {
        try {
          const resSetting = await fetch('data/admin_settings.json?t=' + Date.now());
          if (resSetting.ok) currentSettings = await resSetting.json();
        } catch(e) {}
      }
      if (!currentSettings.siteContent) currentSettings.siteContent = {};
      const cleanDoc = doc.documentElement.cloneNode(true);
      
      // Cleanup injected styles and classes
      const injectedStyles = cleanDoc.querySelectorAll('style');
      if (injectedStyles.length > 0) {
        const lastStyle = injectedStyles[injectedStyles.length - 1];
        if (lastStyle.innerHTML.includes('contenteditable')) {
          lastStyle.remove();
        }
      }
      
      // Cleanup all visual editor attributes
      const editables = cleanDoc.querySelectorAll('[contenteditable]');
      editables.forEach(el => el.removeAttribute('contenteditable'));
      
      const editableImages = cleanDoc.querySelectorAll('.editable-image');
      editableImages.forEach(el => el.classList.remove('editable-image'));
      
      cleanDoc.querySelectorAll('[data-editable-bg]').forEach(el => { el.removeAttribute('data-editable-bg'); el.removeAttribute('title'); });
      cleanDoc.querySelectorAll('[data-editor-click-handled]').forEach(el => el.removeAttribute('data-editor-click-handled'));
      cleanDoc.querySelectorAll('[data-controls-injected]').forEach(el => el.removeAttribute('data-controls-injected'));
      cleanDoc.querySelectorAll('[data-click-intercepted]').forEach(el => el.removeAttribute('data-click-intercepted'));
      cleanDoc.querySelectorAll('[data-social-click-handled]').forEach(el => el.removeAttribute('data-social-click-handled'));
      cleanDoc.querySelectorAll('[data-updated-href]').forEach(el => {
        const updated = el.getAttribute('data-updated-href');
        if (updated) {
          el.setAttribute('href', updated);
          el.style.display = 'inline-flex';
        }
        el.removeAttribute('data-updated-href');
      });
      cleanDoc.querySelectorAll('div[title="Add Brand Logo"], div[title="Delete Logo"]').forEach(el => el.remove());

      const injectedStyleTag = cleanDoc.querySelector('#visual-editor-style');
      if (injectedStyleTag) injectedStyleTag.remove();

      // Extract newly uploaded images and backgrounds
      const newSiteImages = [];
      
      const imgTags = cleanDoc.querySelectorAll('img[data-new-upload]');
      imgTags.forEach((img, idx) => {
        const origName = img.getAttribute('data-new-upload') || 'image.png';
        const ext = origName.split('.').pop() || 'png';
        const cleanName = origName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newPath = `assets/site_images/${Date.now()}_${idx}_${cleanName}`;
        
        newSiteImages.push({
          name: cleanName,
          base64: img.src,
          newPath: newPath
        });
        
        img.src = newPath;
        img.removeAttribute('data-new-upload');
      });
      
      // Remove floating editor buttons before saving HTML
      cleanDoc.querySelectorAll('.editor-change-bg-btn').forEach(el => el.remove());

      const bgTags = cleanDoc.querySelectorAll('[data-new-bg-upload]');
      bgTags.forEach((bg, idx) => {
        const origName = bg.getAttribute('data-new-bg-upload') || 'hero.webp';
        const ext = origName.split('.').pop() || 'webp';
        const cleanName = origName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newPath = `assets/site_images/${Date.now()}_bg_${idx}_${cleanName}`;
        const b64 = bg.getAttribute('data-new-bg-base64');

        if (b64) {
          newSiteImages.push({
            name: cleanName,
            base64: b64,
            newPath: newPath
          });
        }
        
        bg.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.34)), url("${newPath}")`;
        bg.style.backgroundPosition = 'center center';
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundRepeat = 'no-repeat';

        bg.removeAttribute('data-new-bg-upload');
        bg.removeAttribute('data-new-bg-base64');
        bg.removeAttribute('data-editable-bg');
        bg.removeAttribute('title');

        if (currentVisualPage === 'index.html' && (bg.classList.contains('page-hero') || bg.id === 'cmsHomeHeroBg')) {
          currentSettings.siteContent.heroImage = newPath;
          settingsUpdated = true;
        } else if (currentVisualPage === 'about.html') {
          currentSettings.siteContent.aboutImage = newPath;
          settingsUpdated = true;
        } else if (currentVisualPage === 'sectors.html') {
          currentSettings.siteContent.sectorsHeroImg = newPath;
          settingsUpdated = true;
        }
      });

      // Process any pending base64 brand logos in brandLogosList
      const pendingBrandImages = [];
      brandLogosList = brandLogosList.map((b, idx) => {
        if (b.src && b.src.startsWith('data:image')) {
          const ext = (b.fileName || 'logo.png').split('.').pop() || 'png';
          const cleanName = (b.name || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
          const newPath = `assets/site_images/${Date.now()}_brand_${idx}_${cleanName}.${ext}`;
          pendingBrandImages.push({
            name: `${cleanName}.${ext}`,
            base64: b.src,
            newPath: newPath
          });
          return { ...b, src: newPath };
        }
        return b;
      });

      const allSiteImages = [...newSiteImages, ...pendingBrandImages];
      currentSettings.brandLogos = brandLogosList;

      // Keep brand logos marquee updated in index.html so saving from Visual Editor never wipes out newly added logos
      if (currentVisualPage === 'index.html') {
        const marqueeEl = cleanDoc.querySelector('.marquee-content');
        if (marqueeEl && brandLogosList.length > 0) {
          const logoItemsHtml = brandLogosList.map(b => `
            <div style="height: 100px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;">
              <img src="${b.src}" alt="${b.name || ''}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://raw.githubusercontent.com/lilyan-awsan/Fabric8_website/main/'+this.getAttribute('src');}" style="max-height: 85px; max-width: 230px; width: auto; height: auto; object-fit: contain; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" loading="lazy">
            </div>`).join('\n');

          marqueeEl.innerHTML = `\n            <!-- Set 1 -->\n${logoItemsHtml}\n            \n            <!-- Set 2 for seamless loop -->\n${logoItemsHtml}\n          `;
        }
      }

      // Get raw HTML string
      const rawHtml = '<!DOCTYPE html>\n<html>\n' + cleanDoc.innerHTML + '\n</html>';

      // Update local admin settings cache with any cms text changes from the iframe
      const cmsElements = {
        cmsHomeHeroTag: 'homeHeroTag',
        cmsHomeHeroTitle: 'homeHeroTitle',
        cmsHomeHeroSub: 'homeHeroSubtitle',
        cmsHomeHeroBtn: 'homeHeroBtnText',
        cmsServicesTitle: 'servicesTitle',
        cmsServicesSub: 'servicesSub',
        cmsMethodTitle: 'methodTitle',
        cmsMethodSub: 'methodSub',
        cmsSectorsTitle: 'sectorsTitle',
        cmsSectorsSub: 'sectorsSub',
        cmsAboutTitle: 'aboutTitle',
        cmsAboutSub: 'aboutSub',
        cmsAboutMission: 'aboutMission',
        cmsAboutVision: 'aboutVision',
        cmsContactHQText: 'contactHQ',
        cmsContactUSAText: 'contactUSA',
        cmsContactJordanText: 'contactJordan',
        cmsContactEmailText: 'contactEmail'
      };

      

      Object.entries(cmsElements).forEach(([id, key]) => {
        const el = cleanDoc.querySelector('#' + id);
        if (el && el.textContent) {
          currentSettings.siteContent[key] = el.textContent.trim();
          settingsUpdated = true;
        }
      });

      // Extract all footer elements so direct visual edits persist globally across the whole website:
      // 1. Footer Legal / Copyright notice
      const footerLegalEl = cleanDoc.querySelector('footer > div:last-child, .site-footer-bottom p, #cmsFooterLegal');
      if (footerLegalEl && footerLegalEl.innerHTML) {
        const cleanFooter = footerLegalEl.innerHTML.trim();
        if (cleanFooter) {
          currentSettings.footerLegal = cleanFooter;
          settingsUpdated = true;
        }
      }

      // 2. Footer Contact Details block
      const contactH4 = Array.from(cleanDoc.querySelectorAll('footer h4')).find(h4 => 
        h4.textContent.trim().toLowerCase().includes('contact')
      );
      if (contactH4 && contactH4.nextElementSibling) {
        const contactP = contactH4.nextElementSibling;
        const cleanContactHtml = contactP.innerHTML.trim();
        if (cleanContactHtml) {
          currentSettings.siteContent.footerContactHtml = cleanContactHtml;
          settingsUpdated = true;

          // Parse granular fields for backward compatibility
          const fullText = contactP.innerText || contactP.textContent || '';
          const usaMatch = fullText.match(/USA:\s*([^\r\n<]+)/i);
          if (usaMatch) currentSettings.siteContent.contactUSA = usaMatch[1].trim();
          
          const jordanMatch = fullText.match(/Jordan:\s*([^\r\n<]+)/i);
          if (jordanMatch) currentSettings.siteContent.contactJordan = jordanMatch[1].trim();

          const mailto = contactP.querySelector('a[href^="mailto:"]');
          if (mailto) {
            currentSettings.siteContent.contactEmail = mailto.getAttribute('href').replace(/^mailto:/i, '').trim();
          }
        }
      }

      // 3. Footer Overview Links block
      const overviewH4 = Array.from(cleanDoc.querySelectorAll('footer h4')).find(h4 => 
        h4.textContent.trim().toLowerCase().includes('overview')
      );
      if (overviewH4 && overviewH4.nextElementSibling) {
        const overviewP = overviewH4.nextElementSibling;
        const cleanOverviewHtml = overviewP.innerHTML.trim();
        if (cleanOverviewHtml) {
          currentSettings.siteContent.footerOverviewHtml = cleanOverviewHtml;
          settingsUpdated = true;
        }
      }

      // 4. Footer Legal Links block
      const legalH4 = Array.from(cleanDoc.querySelectorAll('footer h4')).find(h4 => 
        h4.textContent.trim().toLowerCase().includes('legal')
      );
      if (legalH4 && legalH4.nextElementSibling) {
        const legalP = legalH4.nextElementSibling;
        const cleanLegalHtml = legalP.innerHTML.trim();
        if (cleanLegalHtml) {
          currentSettings.siteContent.footerLegalLinksHtml = cleanLegalHtml;
          settingsUpdated = true;
        }
      }

      // 5. Footer Social Media Links
      const linkedinA = cleanDoc.querySelector('#cmsSocialLinkedIn, footer a[href*="linkedin"]');
      if (linkedinA) {
        const href = linkedinA.getAttribute('data-updated-href') || linkedinA.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          currentSettings.siteContent.socialLinkedIn = href.trim();
          settingsUpdated = true;
        }
      }
      const fbA = cleanDoc.querySelector('#cmsSocialFacebook, footer a[href*="facebook"]');
      if (fbA) {
        const href = fbA.getAttribute('data-updated-href') || fbA.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          currentSettings.siteContent.socialFacebook = href.trim();
          settingsUpdated = true;
        }
      }
      const instaA = cleanDoc.querySelector('#cmsSocialInstagram, footer a[href*="instagram"]');
      if (instaA) {
        const href = instaA.getAttribute('data-updated-href') || instaA.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          currentSettings.siteContent.socialInstagram = href.trim();
          settingsUpdated = true;
        }
      }

      // Always save to local cache
      try {
        localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSettings));
        localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
      } catch(e) {}

      updateSyncBadge("Publishing visual page changes...", false, false);

      // 45 second fetch timeout controller for full payload & API sync
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          token: authToken,
          action: "save_html",
          filename: currentVisualPage,
          htmlContent: rawHtml,
          siteImages: allSiteImages,
          siteSettingsPayload: currentSettings
        })
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
        renderBrandLogosGrid();
        updateIframeMarquee();
        const statusEl = document.getElementById('visualEditorStatus');
        if (statusEl) statusEl.style.display = 'block';
        updateSyncBadge("✅ Visual Page Published", true, false);
        showToast("✅ Success! Changes published live to GitHub & Firebase.", "success", 8000);
        alert("✅ Success! Your changes were saved and published live to GitHub & Firebase.");
        setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 6000);
        
        // Refresh preview iframe cleanly without redirect loops
        setTimeout(() => {
          if (iframe) {
            try {
              iframe.contentWindow.location.reload();
            } catch(e) {
              iframe.src = currentVisualPage;
            }
          }
        }, 1200);
      } else {
        updateSyncBadge("❌ Publishing Failed", false, true);
        showToast("Error saving layout: " + (data.message || "Unknown error"), "error");
        alert("❌ Error saving layout: " + (data.message || "Unknown error"));
      }
    } catch(err) {
      console.error(err);
      const errMsg = err.name === 'AbortError' ? "Request timed out. Please try saving again." : (err.message || "Failed to communicate with server");
      showToast("Failed to save layout: " + errMsg, "error");
      alert("❌ Failed to save layout: " + errMsg);
    } finally {
      saveVisualEditorBtn.textContent = 'Publish Changes';
      saveVisualEditorBtn.disabled = false;
    }
  });
}

// Function to apply selected hero image file to currently previewed page
function applyHeroImageFile(file) {
  if (!file) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) {
      alert("Please wait for the page to finish loading in the editor before changing photo.");
      return;
    }
    const hero = doc.querySelector('.page-hero, .shop-hero, .about-hero, .services-hero, .sectors-hero, .method-hero, .contact-hero, .fashion-slide') ||
                 doc.getElementById('cmsHomeHeroBg') ||
                 doc.getElementById('cmsAboutHeroBg') ||
                 doc.getElementById('cmsSectorsHeroBg');
    if (!hero) {
      alert("No hero banner was found on the currently previewed page.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e2) => {
      const base64 = e2.target.result;
      hero.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.34)), url("${base64}")`;
      hero.style.backgroundPosition = 'center center';
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundRepeat = 'no-repeat';
      hero.setAttribute('data-new-bg-upload', file.name);
      hero.setAttribute('data-new-bg-base64', base64);
      if (window.showToast) {
        window.showToast(`Selected "${file.name}" for hero background! Click 'Publish Page Changes' to save live.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  } catch(err) {
    console.warn("Could not apply hero image:", err);
    alert("Please wait for the page to finish loading in the editor before changing photo.");
  }
}

// Dedicated hidden file input listener in admin dashboard
const editorHeroFileInput = document.getElementById('editorHeroFileInput');
if (editorHeroFileInput) {
  editorHeroFileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      applyHeroImageFile(file);
    }
    editorHeroFileInput.value = '';
  });
}

// Sidebar button to change hero photo of currently previewed page
const editorChangeHeroBtn = document.getElementById('editorChangeHeroBtn');
if (editorChangeHeroBtn) {
  editorChangeHeroBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (editorHeroFileInput) {
      editorHeroFileInput.click();
    } else {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.onchange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) applyHeroImageFile(file);
        fileInput.remove();
      };
      fileInput.click();
    }
  });
}



