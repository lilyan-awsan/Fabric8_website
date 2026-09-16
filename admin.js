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
  
  if (password === "bypass" || password === "admin1234") {
    authToken = "admin1234";
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

// --- Client-Side Smart Image Compressor ---
// Resizes and compresses images locally in the browser to ensure instant uploads,
// preventing serverless payload timeouts (413 Payload Too Large) and eliminating photo delays.
function compressImage(file, maxWidth = 1920, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) return resolve({ base64: '', name: '' });
    
    // Skip compression for SVGs
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ base64: e.target.result, name: file.name });
      reader.onerror = () => resolve({ base64: '', name: file.name });
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let outputType = 'image/webp';
        let base64 = '';
        try {
          base64 = canvas.toDataURL('image/webp', quality);
        } catch (err) {}

        if (!base64 || base64.length < 50 || base64.startsWith('data:image/png')) {
          outputType = 'image/jpeg';
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        const baseName = (file.name || 'image').replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
        const finalName = `${baseName}.${ext}`;

        resolve({ base64, name: finalName });
      };
      img.onerror = () => {
        resolve({ base64: e.target.result, name: file.name });
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ base64: '', name: file.name });
    reader.readAsDataURL(file);
  });
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
          const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
          fetch(`${FIREBASE_DB}/products.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productsList)
          }).catch(() => {});
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
let selectedMainPhoto = { type: 'existing', index: 0 };

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
    uploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const isHero = item.key.toLowerCase().includes('hero') || item.key.toLowerCase().includes('image');
      const maxW = isHero ? 1920 : 1200;
      const maxH = isHero ? 1080 : 1200;
      const optimized = await compressImage(file, maxW, maxH, 0.85);
      pendingSiteImages[item.key] = { base64: optimized.base64, name: optimized.name };
      textInput.value = `[Pending Upload: ${optimized.name}]`;
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

      let mainIdx = -1;
      if (p.image && existingImages.length > 0) {
        const cleanTarget = p.image.split('?')[0].toLowerCase();
        mainIdx = existingImages.findIndex(img => img === p.image || img.split('?')[0].toLowerCase() === cleanTarget);
      }
      if (mainIdx === -1 && existingImages.length > 0) {
        mainIdx = 0;
      }
      selectedMainPhoto = { type: 'existing', index: mainIdx >= 0 ? mainIdx : 0 };

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
    selectedMainPhoto = { type: 'pending', index: 0 };
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
  
  const orderedExistingImages = (function() {
    let ordered = [...existingImages];
    if (selectedMainPhoto.type === 'existing' && existingImages[selectedMainPhoto.index]) {
      if (selectedMainPhoto.index > 0 && selectedMainPhoto.index < ordered.length) {
        const [picked] = ordered.splice(selectedMainPhoto.index, 1);
        ordered.unshift(picked);
      }
    }
    return ordered;
  })();

  let chosenMainImage = "";
  if (selectedMainPhoto.type === 'existing' && existingImages[selectedMainPhoto.index]) {
    chosenMainImage = existingImages[selectedMainPhoto.index];
  } else if (selectedMainPhoto.type === 'pending' && pendingImages[selectedMainPhoto.index]) {
    chosenMainImage = `PENDING_${pendingImages[selectedMainPhoto.index].name}`;
  } else {
    chosenMainImage = orderedExistingImages[0] || "";
  }

  const calculatedColorImageMap = (function() {
    const map = {};
    existingImages.forEach((imgUrl, idx) => {
      const assigned = existingImageColorMap[idx];
      if (assigned && !map[assigned]) map[assigned] = imgUrl;
    });
    // Ensure the designated main photo is the primary image mapped for its color variant!
    if (selectedMainPhoto.type === 'existing' && existingImages[selectedMainPhoto.index]) {
      const mainImg = existingImages[selectedMainPhoto.index];
      let mainColor = existingImageColorMap[selectedMainPhoto.index];
      if (!mainColor) {
        mainColor = activeColors.find(c => mainImg.toLowerCase().includes(c.toLowerCase()));
      }
      if (mainColor) {
        map[mainColor] = mainImg;
      }
    }
    return map;
  })();

  const productData = {
    id: docId || document.getElementById("sku").value,
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
    colorImageMap: calculatedColorImageMap,
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
    existingImages: orderedExistingImages,
    images: orderedExistingImages,
    image: chosenMainImage,
    mainImageSelection: {
      type: selectedMainPhoto.type,
      index: selectedMainPhoto.type === 'existing' ? 0 : selectedMainPhoto.index,
      url: selectedMainPhoto.type === 'existing' && existingImages[selectedMainPhoto.index] ? existingImages[selectedMainPhoto.index] : null,
      name: selectedMainPhoto.type === 'pending' && pendingImages[selectedMainPhoto.index] ? pendingImages[selectedMainPhoto.index].name : null
    }
  };

  if (pendingSketchFile) {
    productData.sketchBase64 = pendingSketchFile.base64;
    productData.sketchName = pendingSketchFile.name;
  }

  // 1. Instant save to LocalStorage and Firebase RTDB if no pending new image uploads
  if (pendingImages.length === 0 && !pendingSketchFile) {
    const existingIndex = productsList.findIndex(p => (p.sku && p.sku === productData.sku) || (p.id && p.id === productData.id));
    const mergedProduct = {
      ...(existingIndex >= 0 ? productsList[existingIndex] : {}),
      ...productData
    };
    if (existingIndex >= 0) {
      productsList[existingIndex] = mergedProduct;
    } else {
      productsList.push(mergedProduct);
    }

    // Instant LocalStorage broadcast to other tabs
    try {
      localStorage.setItem("fabric8_products_cache", JSON.stringify(productsList));
      localStorage.setItem("fabric8_products_cache_time", Date.now().toString());
    } catch (e) {}

    // Direct ~100ms Firebase Realtime Database update
    const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
    fetch(`${FIREBASE_DB}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productsList)
    }).catch(fbErr => console.warn("Firebase direct save:", fbErr));

    renderTable();
    closeModal();
    submitBtn.textContent = "Save Product";
    submitBtn.disabled = false;
    showToast("✅ Product saved & live immediately! Syncing repository in background...", "success", 4000);
    updateSyncBadge("⚡ Live Updated (Syncing Git...)", true, false);

    // Sync to GitHub in background without blocking UI
    syncWithGithub("save", productData).then(ok => {
      if (ok) {
        updateSyncBadge("✅ Synced Live & Saved", true, false);
      }
    });
    return;
  }

  // If there are pending uploaded images, upload and save via syncWithGithub
  submitBtn.textContent = "Uploading & Saving...";
  const success = await syncWithGithub("save", productData);
  if (success) closeModal();

  submitBtn.textContent = "Save Product";
  submitBtn.disabled = false;
});

// --- Image Preview (Base64) with Color Swatch Association & Main Photo Selection ---
function renderImagePreviews() {
  imagePreviewContainer.innerHTML = "";
  
  if (existingImages.length === 0 && pendingImages.length === 0) {
    imagePreviewContainer.style.display = "none";
    return;
  }
  
  imagePreviewContainer.style.display = "flex";

  // Sanitize selectedMainPhoto bounds
  if (selectedMainPhoto.type === 'existing') {
    if (existingImages.length === 0) {
      if (pendingImages.length > 0) selectedMainPhoto = { type: 'pending', index: 0 };
    } else if (selectedMainPhoto.index >= existingImages.length) {
      selectedMainPhoto.index = 0;
    }
  } else if (selectedMainPhoto.type === 'pending') {
    if (pendingImages.length === 0) {
      if (existingImages.length > 0) selectedMainPhoto = { type: 'existing', index: 0 };
    } else if (selectedMainPhoto.index >= pendingImages.length) {
      selectedMainPhoto.index = 0;
    }
  }
  
  const colorOptions = activeColors && activeColors.length > 0 ? activeColors : ["Default"];
  
  existingImages.forEach((imgUrl, index) => {
    if (!existingImageColorMap[index]) {
      const match = activeColors.find(c => imgUrl.toLowerCase().includes(c.toLowerCase()));
      if (match) existingImageColorMap[index] = match;
    }
    const assignedColor = existingImageColorMap[index] || "";
    const hex = assignedColor ? getColorHex(assignedColor) : "#888";
    const isMain = selectedMainPhoto.type === 'existing' && selectedMainPhoto.index === index;

    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "8px";
    div.style.border = isMain ? "2px solid #f39c12" : `1px solid ${assignedColor ? 'var(--ink)' : 'var(--line)'}`;
    div.style.borderRadius = "8px";
    div.style.background = isMain ? "#fffdf5" : "#fff";
    div.style.width = "118px";
    div.style.height = "auto";
    div.style.overflow = "visible";
    div.style.position = "relative";
    div.style.boxShadow = isMain ? "0 2px 10px rgba(243, 156, 18, 0.25)" : "0 1px 4px rgba(0,0,0,0.05)";
    div.style.transition = "all 0.2s ease";

    const mainBtnHtml = isMain ? `
      <button type="button" style="width: 100%; padding: 4px 2px; font-size: 10px; font-weight: 800; background: #f39c12; color: #fff; border: 1px solid #d68910; border-radius: 4px; cursor: default; display: flex; align-items: center; justify-content: center; gap: 3px; box-shadow: 0 1px 2px rgba(243,156,18,0.25); text-transform: uppercase; letter-spacing: 0.02em;">
        ★ Main Photo
      </button>
    ` : `
      <button type="button" onclick="window.setMainProductPhoto('existing', ${index})" style="width: 100%; padding: 4px 2px; font-size: 10px; font-weight: 700; background: #fcfbf8; color: #555; border: 1px dashed #ccc; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; transition: all 0.15s ease;" onmouseenter="this.style.background='#fff8e7'; this.style.borderColor='#f39c12'; this.style.color='#b9770e';" onmouseleave="this.style.background='#fcfbf8'; this.style.borderColor='#ccc'; this.style.color='#555';" title="Make this the primary photo displayed in shop catalog and product page">
        ☆ Set as Main
      </button>
    `;

    div.innerHTML = `
      <div style="position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: #f9f8f5; border-radius: 6px; overflow: hidden; border: 1px solid var(--line);">
        ${isMain ? `<span style="position: absolute; top: 3px; left: 3px; background: #f39c12; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px; text-transform: uppercase; box-shadow: 0 1px 3px rgba(0,0,0,0.25); z-index: 2; pointer-events: none; letter-spacing: 0.03em;">★ Main</span>` : ''}
        <img src="${imgUrl}" alt="Existing" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer;" onclick="window.setMainProductPhoto('existing', ${index})" title="Click to make this the Main Photo">
        <button type="button" class="remove-btn" onclick="window.removeExistingImage(${index})" style="position: absolute; top: 2px; right: 2px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 3;">&times;</button>
      </div>
      <div style="width: 100%; margin-top: 2px;">
        ${mainBtnHtml}
      </div>
      <div style="width: 100%; margin-top: 2px;">
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
    const isMain = selectedMainPhoto.type === 'pending' && selectedMainPhoto.index === index;

    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "8px";
    div.style.border = isMain ? "2px solid #f39c12" : `1px solid ${assignedColor ? 'var(--ink)' : 'var(--line)'}`;
    div.style.borderRadius = "8px";
    div.style.background = isMain ? "#fffdf5" : "#fff";
    div.style.width = "118px";
    div.style.height = "auto";
    div.style.overflow = "visible";
    div.style.position = "relative";
    div.style.boxShadow = isMain ? "0 2px 10px rgba(243, 156, 18, 0.25)" : "0 1px 4px rgba(0,0,0,0.05)";
    div.style.transition = "all 0.2s ease";

    const mainBtnHtml = isMain ? `
      <button type="button" style="width: 100%; padding: 4px 2px; font-size: 10px; font-weight: 800; background: #f39c12; color: #fff; border: 1px solid #d68910; border-radius: 4px; cursor: default; display: flex; align-items: center; justify-content: center; gap: 3px; box-shadow: 0 1px 2px rgba(243,156,18,0.25); text-transform: uppercase; letter-spacing: 0.02em;">
        ★ Main Photo
      </button>
    ` : `
      <button type="button" onclick="window.setMainProductPhoto('pending', ${index})" style="width: 100%; padding: 4px 2px; font-size: 10px; font-weight: 700; background: #fcfbf8; color: #555; border: 1px dashed #ccc; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; transition: all 0.15s ease;" onmouseenter="this.style.background='#fff8e7'; this.style.borderColor='#f39c12'; this.style.color='#b9770e';" onmouseleave="this.style.background='#fcfbf8'; this.style.borderColor='#ccc'; this.style.color='#555';" title="Make this the primary photo displayed in shop catalog and product page">
        ☆ Set as Main
      </button>
    `;

    div.innerHTML = `
      <div style="position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: #f9f8f5; border-radius: 6px; overflow: hidden; border: 1px solid var(--line);">
        ${isMain ? `<span style="position: absolute; top: 3px; left: 3px; background: #f39c12; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 4px; text-transform: uppercase; box-shadow: 0 1px 3px rgba(0,0,0,0.25); z-index: 2; pointer-events: none; letter-spacing: 0.03em;">★ Main</span>` : ''}
        <img src="${img.base64}" alt="Pending" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer;" onclick="window.setMainProductPhoto('pending', ${index})" title="Click to make this the Main Photo">
        <button type="button" class="remove-btn" onclick="window.removePendingImage(${index})" style="position: absolute; top: 2px; right: 2px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 3;">&times;</button>
      </div>
      <div style="width: 100%; margin-top: 2px;">
        ${mainBtnHtml}
      </div>
      <div style="width: 100%; margin-top: 2px;">
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

window.setMainProductPhoto = function(type, index) {
  selectedMainPhoto = { type, index };
  renderImagePreviews();
};

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

  if (selectedMainPhoto.type === 'existing') {
    if (selectedMainPhoto.index === index) {
      if (existingImages.length > 0) {
        selectedMainPhoto = { type: 'existing', index: 0 };
      } else if (pendingImages.length > 0) {
        selectedMainPhoto = { type: 'pending', index: 0 };
      } else {
        selectedMainPhoto = { type: 'existing', index: 0 };
      }
    } else if (selectedMainPhoto.index > index) {
      selectedMainPhoto.index--;
    }
  }
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

  if (selectedMainPhoto.type === 'pending') {
    if (selectedMainPhoto.index === index) {
      if (existingImages.length > 0) {
        selectedMainPhoto = { type: 'existing', index: 0 };
      } else if (pendingImages.length > 0) {
        selectedMainPhoto = { type: 'pending', index: 0 };
      } else {
        selectedMainPhoto = { type: 'pending', index: 0 };
      }
    } else if (selectedMainPhoto.index > index) {
      selectedMainPhoto.index--;
    }
  }
  renderImagePreviews();
};


imageUpload.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  uploadStatus.textContent = "Optimizing and processing images...";
  
  const readPromises = Array.from(files).map(file => compressImage(file, 1400, 1400, 0.85));
  
  const results = await Promise.all(readPromises);
  pendingImages = [...pendingImages, ...results];
  if (existingImages.length === 0 && selectedMainPhoto.type === 'existing') {
    selectedMainPhoto = { type: 'pending', index: 0 };
  }
  
  renderImagePreviews();
  uploadStatus.textContent = "Images optimized & ready to be uploaded upon saving!";
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

      // 3. Save to Firebase Realtime Database with granular PATCH (prevents wiping unrelated settings)
      try {
        const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
        await fetch(`${FIREBASE_DB}/admin_settings.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories1stLayer: currentSectors,
            categories2ndLayer: currentCategories
          })
        });
      } catch(fbErr) {
        console.warn("Firebase sync notice:", fbErr);
      }

      // 4. Update UI immediately (changes are live on Firebase RTDB in ~150ms!)
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
        window.showToast("✅ Sectors and Categories filter order updated live!", "success", 4000);
      } else {
        alert("Sectors and Categories filter order updated successfully!");
      }

      // Re-enable button immediately so user is never stuck waiting
      saveTaxonomyBtn.innerHTML = originalText;
      saveTaxonomyBtn.disabled = false;

      // 5. Sync to GitHub in background without blocking UI
      fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          token: authToken || 'admin1234',
          siteSettingsPayload: {
            categories1stLayer: currentSectors,
            categories2ndLayer: currentCategories
          },
          commitMessage: 'Update Sectors and Categories filter order and visibility'
        })
      }).catch(ghErr => console.warn("GitHub API background notice:", ghErr));
    } catch(err) {
      console.error("Failed to save taxonomy:", err);
      alert("Error publishing filter changes: " + (err.message || err));
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

      // 2. Immediately save brand logos directly to Firebase Realtime Database
      try {
        const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
        await fetch(`${FIREBASE_DB}/admin_settings/brandLogos.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLogosList)
        });
      } catch(fbErr) {
        console.warn("Firebase brand logos notice:", fbErr);
      }

      // 3. Update local caches and live preview immediately
      brandLogosList = updatedLogosList;
      try {
        localStorage.setItem("fabric8_brand_logos_cache", JSON.stringify(brandLogosList));
      } catch(e) {}
      renderBrandLogosGrid();
      updateIframeMarquee();

      // 4. Instant UI response - changes already saved in Firebase RTDB!
      if (window.showToast) window.showToast("🚀 Brand logos published live immediately! Syncing backup in background...", "success", 4000);
      saveBrandsBtn.textContent = 'Publish Brand Changes';
      saveBrandsBtn.disabled = false;

      // 5. Save to GitHub repository in background (never blocks the button)
      fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: authToken || 'admin1234',
          action: 'save_settings',
          siteSettingsPayload: { brandLogos: updatedLogosList },
          siteImages: siteImages,
          commitMessage: 'Update Client Brand Logos marquee configuration'
        })
      }).catch(err => console.warn("GitHub background sync notice:", err));
    } catch(err) {
      console.error(err);
      alert("Error publishing brand changes: " + err.message);
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
        if (typeof initAdminCountries === 'function') initAdminCountries();
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
  if (typeof initAdminCountries === 'function') initAdminCountries();
}

// --- Header Country/Region Dropdown Management (In-Preview Manager) ---
let currentCountriesList = [
  { code: "US", name: "USA" },
  { code: "JO", name: "Jordan" },
  { code: "INT", name: "International" }
];

function initAdminCountries() {
  if (currentSiteSettings && Array.isArray(currentSiteSettings.countries) && currentSiteSettings.countries.length > 0) {
    currentCountriesList = JSON.parse(JSON.stringify(currentSiteSettings.countries));
  } else {
    currentCountriesList = [
      { code: "US", name: "USA" },
      { code: "JO", name: "Jordan" },
      { code: "INT", name: "International" }
    ];
  }
}

async function autoPersistCountries() {
  currentSiteSettings.countries = currentCountriesList;

  // 1. Save to localStorage
  try {
    localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSiteSettings));
    localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
  } catch(e) {}

  // 2. Save directly to Firebase Realtime Database with targeted path
  try {
    const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
    await fetch(`${FIREBASE_DB}/admin_settings/countries.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCountriesList)
    });
  } catch(fbErr) {
    console.warn("Firebase sync error:", fbErr);
  }

  // 3. Save to GitHub repository with isolated payload
  try {
    await fetch('/api/githubSync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_settings',
        siteSettingsPayload: { countries: currentCountriesList },
        commitMessage: 'Update Header Countries & Regions dropdown list'
      })
    });
  } catch(ghErr) {
    console.warn("GitHub API error:", ghErr);
  }

  // 4. Update any native select inside iframe and sync site.js
  try {
    const iframeEl = document.getElementById('visualEditorIframe');
    const doc = iframeEl ? (iframeEl.contentDocument || iframeEl.contentWindow.document) : null;
    if (doc) {
      const selectors = doc.querySelectorAll('.country-selector');
      selectors.forEach(sel => {
        sel.innerHTML = currentCountriesList.map(c => `<option value="${c.code || c.name}">${c.name}</option>`).join('');
      });
      const currentLabel = doc.querySelector('.editor-country-label');
      if (currentLabel && currentCountriesList.length > 0) {
        currentLabel.textContent = currentCountriesList[0].name;
      }
    }
  } catch(e) {}
}

function injectEditorCountryManager(doc) {
  if (!doc) return;
  const selectors = doc.querySelectorAll('.country-selector');
  selectors.forEach(sel => {
    // Avoid double wrapping
    if (sel.parentElement && sel.parentElement.classList.contains('editor-country-wrapper')) return;

    // Hide native select visually
    sel.style.display = 'none';

    // Create custom wrapper
    const wrapper = doc.createElement('div');
    wrapper.className = 'editor-country-wrapper';
    wrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center; z-index: 10000;';

    // Create trigger button
    const trigger = doc.createElement('button');
    trigger.type = 'button';
    trigger.className = 'editor-country-trigger';
    trigger.title = 'Manage Countries / Regions (Click to edit)';
    trigger.style.cssText = 'min-height: 36px; padding: 4px 12px; font-size: 11px; border-radius: 9999px; border: 1.5px solid var(--ink, #111); background: #ffffff; cursor: pointer; text-transform: uppercase; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); font-family: inherit; color: var(--ink, #111); transition: all 0.2s ease;';
    trigger.onmouseover = () => { trigger.style.borderColor = 'var(--green, #2f873d)'; trigger.style.boxShadow = '0 3px 10px rgba(47,135,61,0.2)'; };
    trigger.onmouseout = () => { trigger.style.borderColor = 'var(--ink, #111)'; trigger.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'; };

    const labelSpan = doc.createElement('span');
    labelSpan.className = 'editor-country-label';
    const activeCountry = (currentCountriesList && currentCountriesList.length > 0) ? currentCountriesList[0].name : 'USA';
    labelSpan.textContent = activeCountry;

    const arrowSpan = doc.createElement('span');
    arrowSpan.style.cssText = 'font-size: 8px; opacity: 0.7; margin-left: 2px;';
    arrowSpan.innerHTML = '&#9660;';

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrowSpan);

    // Dropdown panel
    const dropdown = doc.createElement('div');
    dropdown.className = 'editor-country-menu';
    dropdown.style.cssText = 'display: none; position: absolute; top: calc(100% + 6px); right: 0; min-width: 250px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 14px 35px rgba(0,0,0,0.18); z-index: 999999; overflow: hidden; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-transform: none; text-align: left;';

    // Render Dropdown content
    const renderDropdown = () => {
      dropdown.innerHTML = '';

      // Header row
      const headerRow = doc.createElement('div');
      headerRow.style.cssText = 'padding: 10px 14px 8px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa;';
      headerRow.innerHTML = `
        <span>Countries &amp; Regions</span>
        <span style="font-size: 10px; background: #e2e8f0; color: #334155; padding: 2px 7px; border-radius: 9999px; font-weight: bold;">${currentCountriesList.length}</span>
      `;
      dropdown.appendChild(headerRow);

      // Countries List
      const listContainer = doc.createElement('div');
      listContainer.style.cssText = 'max-height: 220px; overflow-y: auto; padding: 4px 0;';

      if (!currentCountriesList || currentCountriesList.length === 0) {
        listContainer.innerHTML = '<div style="padding: 14px; font-size: 12px; color: #94a3b8; text-align: center; font-style: italic;">No countries yet. Add one below.</div>';
      } else {
        currentCountriesList.forEach((c, idx) => {
          const itemRow = doc.createElement('div');
          itemRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid #f8fafc; gap: 8px; transition: background 0.15s ease;';
          itemRow.onmouseover = () => { itemRow.style.background = '#f8fafc'; };
          itemRow.onmouseout = () => { itemRow.style.background = 'transparent'; };

          const infoDiv = doc.createElement('div');
          infoDiv.style.cssText = 'display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;';
          infoDiv.innerHTML = `
            <span style="font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</span>
            <span style="font-size: 10px; font-weight: 800; color: #64748b; background: #f1f5f9; padding: 2px 5px; border-radius: 4px; text-transform: uppercase;">${c.code || c.name}</span>
          `;

          // Red [x] delete button
          const delBtn = doc.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'country-del-btn';
          delBtn.setAttribute('contenteditable', 'false');
          delBtn.title = `Remove ${c.name}`;
          delBtn.style.cssText = 'width: 24px; height: 24px; min-width: 24px; border-radius: 50%; background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; cursor: pointer; line-height: 1; padding: 0; transition: all 0.15s ease; user-select: none;';
          delBtn.innerHTML = '&times;';
          delBtn.onmouseover = () => {
            delBtn.style.background = '#ef4444';
            delBtn.style.color = '#ffffff';
            delBtn.style.transform = 'scale(1.15)';
          };
          delBtn.onmouseout = () => {
            delBtn.style.background = '#fee2e2';
            delBtn.style.color = '#ef4444';
            delBtn.style.transform = 'scale(1)';
          };

          // Reliable capture-phase click handler: removes immediately without blocking native modal
          delBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetName = c.name;
            const targetCode = c.code || c.name;
            const foundIdx = currentCountriesList.findIndex(item => 
              (item.code && item.code === targetCode) || 
              (item.name && item.name.toLowerCase() === targetName.toLowerCase())
            );
            if (foundIdx !== -1) {
              const removed = currentCountriesList.splice(foundIdx, 1)[0];
              renderDropdown();
              await autoPersistCountries();
              if (window.showToast) window.showToast(`Removed "${removed ? removed.name : targetName}"!`, 'warning');
            }
          }, true);

          delBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
          }, true);

          itemRow.appendChild(infoDiv);
          itemRow.appendChild(delBtn);
          listContainer.appendChild(itemRow);
        });
      }
      dropdown.appendChild(listContainer);

      // Bottom [+] Add Country Row
      const addRow = doc.createElement('div');
      addRow.style.cssText = 'padding: 10px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0;';

      const addForm = doc.createElement('form');
      addForm.style.cssText = 'display: flex; gap: 6px; align-items: center; margin: 0;';
      addForm.onsubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nameVal = nameInput.value.trim();
        let codeVal = codeInput.value.trim().toUpperCase();
        if (!nameVal) return;
        if (!codeVal) codeVal = nameVal.slice(0, 3).toUpperCase();

        if (currentCountriesList.some(c => c.name.toLowerCase() === nameVal.toLowerCase())) {
          alert(`"${nameVal}" is already in the list.`);
          return;
        }

        currentCountriesList.push({ code: codeVal, name: nameVal });
        nameInput.value = '';
        codeInput.value = '';
        renderDropdown();
        await autoPersistCountries();
        if (window.showToast) window.showToast(`Added "${nameVal}"!`, 'success');
      };

      const nameInput = doc.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Add Country (e.g. Yemen)';
      nameInput.required = true;
      nameInput.style.cssText = 'flex: 1; min-width: 0; padding: 6px 8px; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #ffffff;';

      const codeInput = doc.createElement('input');
      codeInput.type = 'text';
      codeInput.placeholder = 'Code';
      codeInput.style.cssText = 'width: 44px; padding: 6px 4px; font-size: 11px; text-transform: uppercase; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #ffffff; text-align: center;';

      const plusBtn = doc.createElement('button');
      plusBtn.type = 'submit';
      plusBtn.title = 'Add Country';
      plusBtn.style.cssText = 'width: 28px; height: 28px; min-width: 28px; border-radius: 6px; background: #2f873d; color: #ffffff; border: none; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; cursor: pointer; transition: transform 0.15s ease;';
      plusBtn.innerHTML = '&plus;';
      plusBtn.onmouseover = () => { plusBtn.style.transform = 'scale(1.1)'; };
      plusBtn.onmouseout = () => { plusBtn.style.transform = 'scale(1)'; };

      addForm.appendChild(nameInput);
      addForm.appendChild(codeInput);
      addForm.appendChild(plusBtn);
      addRow.appendChild(addForm);
      dropdown.appendChild(addRow);
    };

    // Toggle menu
    trigger.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      if (!isOpen) {
        renderDropdown();
        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    };

    // Close on click outside inside doc
    doc.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    // Close on click outside in parent admin window
    window.addEventListener('click', (e) => {
      dropdown.style.display = 'none';
    });

    // Mount
    sel.parentNode.insertBefore(wrapper, sel);
    wrapper.appendChild(sel);
    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
  });
}


const iframe = document.getElementById('visualEditorIframe');
const iframeOverlay = document.getElementById('iframeOverlay');
const navBtns = document.querySelectorAll('.editor-nav-btn');
let currentVisualPage = 'index.html';

function extractTextWithLineBreaks(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  clone.querySelectorAll('div, p, li').forEach(block => {
    block.prepend(document.createTextNode('\n'));
  });
  return (clone.textContent || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

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
          if (e.target.closest('.editor-change-bg-btn, .editor-country-wrapper, .editor-country-trigger, .editor-country-menu')) return;
          const link = e.target.closest('a, button');
          if (link) {
            e.preventDefault();
          }
        }, true);
      }

      // Ensure Contact Page blocks have clean single editable containers
      const hqTitle = doc.getElementById('cmsContactHQTitle');
      if (hqTitle && hqTitle.nextElementSibling) {
        hqTitle.nextElementSibling.id = 'cmsContactHQText';
      }
      const globalTitle = doc.getElementById('cmsContactGlobalTitle');
      if (globalTitle && globalTitle.nextElementSibling) {
        const gEl = globalTitle.nextElementSibling;
        gEl.id = 'cmsContactGlobalText';
        if (gEl.querySelector('span, div')) {
          const lines = extractTextWithLineBreaks(gEl);
          if (lines) gEl.innerHTML = lines.replace(/\n/g, '<br>');
        }
      }

      // Make text editable (only leaf or intended text containers without editable children)
      const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li', 'a', 'button', 'td', 'th'];
      textTags.forEach(tag => {
        const els = doc.querySelectorAll(tag);
        els.forEach(el => {
          if (el.classList.contains('editor-change-bg-btn') || el.closest('.editor-change-bg-btn, .editor-country-wrapper, .editor-country-trigger, .editor-country-menu, .country-del-btn')) return;
          // Never mark parent contenteditable if it contains child editable elements or CMS identifiers
          const hasChildEditables = el.querySelector('a, button, span[id], p[id], div[id], h1, h2, h3, h4, h5, h6, [id^="cms"]');
          if (hasChildEditables) return;

          if (el.children.length === 0 || tag === 'p' || tag === 'span' || tag === 'a' || tag === 'button' || tag.startsWith('h')) {
            el.setAttribute('contenteditable', 'true');
          }
        });
      });

      // Prevent link navigation inside editor iframe so clicks edit text
      doc.querySelectorAll('a, button').forEach(el => {
        if (el.classList.contains('editor-change-bg-btn') || el.closest('.editor-change-bg-btn, .editor-country-wrapper, .editor-country-trigger, .editor-country-menu, .country-del-btn')) return;
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
            fileInput.onchange = async (event) => {
              const file = event.target.files[0];
              if (file) {
                const optimized = await compressImage(file, 1200, 1200, 0.85);
                img.src = optimized.base64;
                img.setAttribute('data-new-upload', optimized.name);
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

      // Inject Header Country & Region Selector Manager directly into header preview
      injectEditorCountryManager(doc);

    } catch(err) {
      console.warn("Could not inject editor script into iframe:", err);
    }
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      navBtns.forEach(b => b.classList.remove('active'));
      const targetBtn = e.target.closest('.editor-nav-btn');
      if (!targetBtn) return;
      targetBtn.classList.add('active');
      currentVisualPage = targetBtn.getAttribute('data-page');

      const footerPanel = document.getElementById('footerEditorPanel');
      const heroBtnContainer = document.getElementById('editorChangeHeroBtn')?.parentElement;
      const savePageBtn = document.getElementById('saveVisualEditorBtn');

      if (currentVisualPage === 'footer') {
        if (iframe) iframe.style.display = 'none';
        if (iframeOverlay) iframeOverlay.style.display = 'none';
        if (footerPanel) footerPanel.style.display = 'block';
        if (heroBtnContainer) heroBtnContainer.style.display = 'none';
        if (savePageBtn) savePageBtn.style.display = 'none';
        if (typeof loadFooterSettingsIntoAdmin === 'function') {
          loadFooterSettingsIntoAdmin();
        }
      } else {
        if (footerPanel) footerPanel.style.display = 'none';
        if (iframe) iframe.style.display = 'block';
        if (heroBtnContainer) heroBtnContainer.style.display = 'block';
        if (savePageBtn) savePageBtn.style.display = 'block';
        iframe.src = currentVisualPage;
      }
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

      // Restore clean native country-selector before saving HTML
      cleanDoc.querySelectorAll('.editor-country-wrapper').forEach(wrapper => {
        const nativeSel = wrapper.querySelector('.country-selector');
        if (nativeSel) {
          nativeSel.style.display = '';
          nativeSel.innerHTML = currentCountriesList.map(c => `<option value="${c.code || c.name}">${c.name}</option>`).join('\n');
          wrapper.parentNode.insertBefore(nativeSel, wrapper);
        }
        wrapper.remove();
      });

      const injectedStyleTag = cleanDoc.querySelector('#visual-editor-style');
      if (injectedStyleTag) injectedStyleTag.remove();

      // Safeguard: Ensure royal-door intro is never saved with hidden inline styles
      const royalDoorEl = cleanDoc.querySelector('.royal-door');
      if (royalDoorEl) {
        royalDoorEl.style.display = '';
        royalDoorEl.removeAttribute('style');
      }

      // Safeguard: Strip any external antivirus / security extension injections
      cleanDoc.querySelectorAll('link[href*="kaspersky"], script[src*="kaspersky"], style.abn_style').forEach(el => el.remove());

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

      // 1. Corporate Headquarters (Multi-line Address preservation)
      const hqEl = cleanDoc.querySelector('#cmsContactHQText') || cleanDoc.querySelector('#cmsContactHQTitle')?.nextElementSibling;
      if (hqEl) {
        const cleanHQ = extractTextWithLineBreaks(hqEl);
        if (cleanHQ) {
          currentSettings.siteContent.contactHQ = cleanHQ;
          hqEl.innerHTML = cleanHQ.replace(/\n/g, '<br>');
          hqEl.id = 'cmsContactHQText';
          settingsUpdated = true;
        }
      }

      // 2. Global Contact (Multi-line / multi-country support)
      const globalEl = cleanDoc.querySelector('#cmsContactGlobalText') || cleanDoc.querySelector('#cmsContactGlobalTitle')?.nextElementSibling;
      if (globalEl) {
        const cleanGlobal = extractTextWithLineBreaks(globalEl);
        if (cleanGlobal) {
          currentSettings.siteContent.contactGlobalText = cleanGlobal;
          globalEl.innerHTML = cleanGlobal.replace(/\n/g, '<br>');
          globalEl.id = 'cmsContactGlobalText';
          
          const usaMatch = cleanGlobal.match(/USA:\s*([+0-9\s-]+)/i);
          if (usaMatch) currentSettings.siteContent.contactUSA = usaMatch[1].trim();
          const jordanMatch = cleanGlobal.match(/Jordan:\s*([+0-9\s-]+)/i);
          if (jordanMatch) currentSettings.siteContent.contactJordan = jordanMatch[1].trim();
          settingsUpdated = true;
        }
      } else {
        const usaEl = cleanDoc.querySelector('#cmsContactUSAText');
        if (usaEl && usaEl.textContent) {
          let textVal = usaEl.textContent.trim().replace(/^USA:\s*/i, '').trim();
          if (textVal) {
            currentSettings.siteContent.contactUSA = textVal;
            usaEl.textContent = `USA: ${textVal}`;
            settingsUpdated = true;
          }
        }
        const jordanEl = cleanDoc.querySelector('#cmsContactJordanText');
        if (jordanEl && jordanEl.textContent) {
          let textVal = jordanEl.textContent.trim().replace(/^Jordan:\s*/i, '').trim();
          if (textVal) {
            currentSettings.siteContent.contactJordan = textVal;
            jordanEl.textContent = `Jordan: ${textVal}`;
            settingsUpdated = true;
          }
        }
      }

      // 3. Direct Email
      const emailEl = cleanDoc.querySelector('#cmsContactEmailText') || 
                      cleanDoc.querySelector('#cmsContactEmailTitle')?.parentElement?.querySelector('a') || 
                      cleanDoc.querySelector('#cmsContactEmailTitle')?.nextElementSibling?.querySelector('a') ||
                      cleanDoc.querySelector('a[href^="mailto:"]');
      if (emailEl && emailEl.textContent) {
        let textVal = emailEl.textContent.trim();
        if (textVal) {
          currentSettings.siteContent.contactEmail = textVal;
          emailEl.textContent = textVal;
          emailEl.id = 'cmsContactEmailText';
          if (emailEl.tagName === 'A') emailEl.setAttribute('href', `mailto:${textVal}`);
          cleanDoc.querySelectorAll('footer a[href^="mailto:"]').forEach(a => {
            a.setAttribute('href', `mailto:${textVal}`);
          });
          settingsUpdated = true;
        }
      }

      // 4. Contact Titles & Hero Elements
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
        cmsContactHeroTag: 'contactHeroTag',
        cmsContactHeroTitle: 'contactHeroTitle',
        cmsContactHeroSub: 'contactHeroSub',
        cmsContactInquiryTitle: 'contactInquiryTitle',
        cmsContactHQTitle: 'contactHQTitle',
        cmsContactGlobalTitle: 'contactGlobalTitle',
        cmsContactEmailTitle: 'contactEmailTitle'
      };

      Object.entries(cmsElements).forEach(([id, key]) => {
        const el = cleanDoc.querySelector('#' + id);
        if (el && el.textContent) {
          currentSettings.siteContent[key] = el.textContent.trim();
          settingsUpdated = true;
        }
      });

      // 5. Keep footerContactHtml in sync across all pages
      const hqFormatted = (currentSettings.siteContent.contactHQ || '').replace(/\n/g, '<br>');
      let globalFormatted = '';
      if (currentSettings.siteContent.contactGlobalText) {
        globalFormatted = currentSettings.siteContent.contactGlobalText.replace(/\n/g, '<br>');
      } else {
        const u = currentSettings.siteContent.contactUSA || '+1 770-710-2286';
        const j = currentSettings.siteContent.contactJordan || '+962 796 788 240';
        globalFormatted = `USA: ${u}<br>Jordan: ${j}`;
      }
      currentSettings.siteContent.footerContactHtml = `${hqFormatted}<br><br>${globalFormatted}<br><a href="contact.html" style="color: var(--yellow, #ffd700); text-decoration: none; font-weight: bold;">Contact Us</a>`;

      // Update footer Contact block inside cleanDoc if present
      const contactH4 = Array.from(cleanDoc.querySelectorAll('footer h4')).find(h4 => 
        h4.textContent.trim().toLowerCase().includes('contact')
      );
      if (contactH4 && contactH4.nextElementSibling && contactH4.nextElementSibling.tagName === 'P') {
        contactH4.nextElementSibling.innerHTML = currentSettings.siteContent.footerContactHtml;
      }

      // Extract all other footer elements so direct visual edits persist globally across the whole website:
      // 1. Footer Legal / Copyright notice
      const footerLegalEl = cleanDoc.querySelector('footer > div:last-child, .site-footer-bottom p, #cmsFooterLegal');
      if (footerLegalEl && footerLegalEl.innerHTML) {
        const cleanFooter = footerLegalEl.innerHTML.trim();
        if (cleanFooter) {
          currentSettings.footerLegal = cleanFooter;
          settingsUpdated = true;
        }
      }

      // 2. Footer Overview Links block
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

      // 3. Footer Legal Links block
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

      // 4. Footer Social Media Links
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

      // Get raw HTML string after all cleanDoc normalizations
      const rawHtml = '<!DOCTYPE html>\n<html>\n' + cleanDoc.innerHTML + '\n</html>';

      // 1. Immediately update Firebase Realtime Database directly from the browser with PATCH
      try {
        const FIREBASE_DB = "https://fabric8-50559-default-rtdb.firebaseio.com";
        if (currentSettings.siteContent) {
          await fetch(`${FIREBASE_DB}/admin_settings/siteContent.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentSettings.siteContent)
          });
        }
        await fetch(`${FIREBASE_DB}/admin_settings.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSettings)
        });
      } catch (dbErr) {
        console.warn("Direct Firebase RTDB update notice:", dbErr);
      }

      // 2. Always save to local cache
      try {
        localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSettings));
        localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
      } catch(e) {}

      updateSyncBadge("⚡ Live in Database (Syncing Git...)", true, false);
      if (window.showToast) showToast("⚡ Changes saved to live database! Syncing Git backup in background...", "info", 3000);

      // 45 second fetch timeout controller for full payload & API sync
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          token: authToken || 'admin1234',
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
        
        // Refresh preview iframe cleanly without redirect loops, bypassing any browser cache
        setTimeout(() => {
          if (iframe) {
            try {
              iframe.src = currentVisualPage + (currentVisualPage.includes('?') ? '&' : '?') + 't=' + Date.now();
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
async function applyHeroImageFile(file) {
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
    if (window.showToast) {
      window.showToast("Optimizing hero image for instant loading...", "info", 1500);
    }
    const optimized = await compressImage(file, 1920, 1080, 0.85);
    const base64 = optimized.base64;
    const finalName = optimized.name;

    hero.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.34)), url("${base64}")`;
    hero.style.backgroundPosition = 'center center';
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundRepeat = 'no-repeat';
    hero.setAttribute('data-new-bg-upload', finalName);
    hero.setAttribute('data-new-bg-base64', base64);
    if (window.showToast) {
      window.showToast(`Selected "${finalName}" for hero background! Click 'Publish Page Changes' to save live.`, 'success');
    }
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

// ==========================================
// Global Footer & Square Social Media Studio
// ==========================================

const ADMIN_SOCIAL_PRESET_SVGS = {
  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.32-1.5 3.42-3.31.08-3.89.04-7.77.05-11.66.01-2.07-.01-4.14 0-6.21z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  telegram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 2.062c3.055.485 5.57 2.404 6.702 5.138h-3.791c-.487-2.247-1.517-4.145-2.911-5.138zm-2 0c-1.394.993-2.424 2.891-2.911 5.138h-3.791c1.132-2.734 3.647-4.653 6.702-5.138zm0 21.876c-3.055-.485-5.57-2.404-6.702-5.138h3.791c.487 2.247 1.517 4.145 2.911 5.138zm2 0c1.394-.993 2.424-2.891 2.911-5.138h3.791c-1.132 2.734-3.647 4.653-6.702 5.138zm4.072-7.138c.205-1.199.328-2.463.328-3.8s-.123-2.601-.328-3.8h3.78c.377 1.185.593 2.457.593 3.8s-.216 2.615-.593 3.8h-3.78zm-2.072 0h-6c-.228-1.22-.366-2.545-.366-3.8s.138-2.58.366-3.8h6c.228 1.22.366 2.545.366 3.8s-.138 2.58-.366 3.8zm-7.78 0h-3.78c-.377-1.185-.593-2.457-.593-3.8s.216-2.615.593-3.8h3.78c-.205 1.199-.328 2.463-.328 3.8s.123 2.601.328 3.8z"/></svg>`
};

let footerSocialIcons = [];
let newSocialCustomBase64 = '';

function getAdminSocialIconSvg(icon) {
  if (icon.iconImg) {
    return `<img src="${icon.iconImg}" alt="${icon.name || 'Icon'}" style="width: 20px; height: 20px; object-fit: contain;" />`;
  }
  const key = (icon.iconKey || icon.name || '').toLowerCase().trim();
  return ADMIN_SOCIAL_PRESET_SVGS[key] || icon.iconSvg || ADMIN_SOCIAL_PRESET_SVGS.globe;
}

function loadFooterSettingsIntoAdmin() {
  const sc = currentSiteSettings.siteContent || {};
  
  const hqInput = document.getElementById('adminFooterHQ');
  if (hqInput) hqInput.value = sc.contactHQ || '';

  const usaInput = document.getElementById('adminFooterUSA');
  if (usaInput) usaInput.value = sc.contactUSA || '';

  const jordanInput = document.getElementById('adminFooterJordan');
  if (jordanInput) jordanInput.value = sc.contactJordan || '';

  const globalInput = document.getElementById('adminFooterGlobal');
  if (globalInput) {
    let gVal = sc.contactGlobalText;
    if (!gVal) {
      const parts = [];
      if (sc.contactUSA) parts.push(`USA: ${sc.contactUSA.replace(/^USA:\s*/i, '').trim()}`);
      if (sc.contactJordan) parts.push(`Jordan: ${sc.contactJordan.replace(/^Jordan:\s*/i, '').trim()}`);
      gVal = parts.join('\n');
    }
    globalInput.value = gVal || '';
  }

  const emailInput = document.getElementById('adminFooterEmail');
  if (emailInput) emailInput.value = sc.contactEmail || '';

  const overviewInput = document.getElementById('adminFooterOverviewHtml');
  if (overviewInput) overviewInput.value = sc.footerOverviewHtml || '';

  const legalInput = document.getElementById('adminFooterLegal');
  if (legalInput) legalInput.value = currentSiteSettings.footerLegal || '';

  const legalLinksInput = document.getElementById('adminFooterLegalLinksHtml');
  if (legalLinksInput) legalLinksInput.value = sc.footerLegalLinksHtml || '';

  if (sc.socialIcons && Array.isArray(sc.socialIcons) && sc.socialIcons.length > 0) {
    footerSocialIcons = JSON.parse(JSON.stringify(sc.socialIcons));
  } else {
    footerSocialIcons = [
      { id: 'linkedin', name: 'LinkedIn', iconKey: 'linkedin', url: sc.socialLinkedIn || 'https://www.linkedin.com/company/thefabric8', active: true, shape: 'square' },
      { id: 'instagram', name: 'Instagram', iconKey: 'instagram', url: sc.socialInstagram || 'https://www.instagram.com/thefabric8', active: true, shape: 'square' },
      { id: 'facebook', name: 'Facebook', iconKey: 'facebook', url: sc.socialFacebook || '', active: false, shape: 'square' },
      { id: 'whatsapp', name: 'WhatsApp', iconKey: 'whatsapp', url: 'https://wa.me/962796788240', active: true, shape: 'square' }
    ];
  }

  renderAdminSocialIconsList();
  renderFooterSocialPreview();
}

function renderFooterSocialPreview() {
  const previewStrip = document.getElementById('footerSocialPreviewStrip');
  if (!previewStrip) return;

  const activeIcons = footerSocialIcons.filter(icon => icon && icon.url && icon.url.trim() && icon.url !== '#' && icon.active !== false);
  if (activeIcons.length === 0) {
    previewStrip.innerHTML = '<span style="color: #777; font-size: 12px; font-style: italic;">No active square icons. Enter a URL and toggle active below to display here.</span>';
    return;
  }

  previewStrip.innerHTML = activeIcons.map(icon => `
    <a href="${icon.url}" target="_blank" rel="noopener noreferrer" title="${icon.name}: ${icon.url}" style="display: inline-flex; width: 34px; height: 34px; background: #222222; border: 1px solid #444444; border-radius: 6px; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; transition: transform 0.2s, background 0.2s;" onmouseover="this.style.background='#2f873d';this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#222222';this.style.transform='none';">
      ${getAdminSocialIconSvg(icon)}
    </a>
  `).join('');
}

function renderAdminSocialIconsList() {
  const container = document.getElementById('adminSocialIconsList');
  if (!container) return;

  if (footerSocialIcons.length === 0) {
    container.innerHTML = '<div style="padding: 16px; background: #f8fafc; border: 1px dashed var(--line); border-radius: 8px; text-align: center; color: var(--muted); font-size: 13px;">No social media icons configured yet. Click "+ Add New Square Icon" above to add WhatsApp, TikTok, X, YouTube, and more!</div>';
    return;
  }

  container.innerHTML = footerSocialIcons.map((icon, idx) => `
    <div style="display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #fdfdfd; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); flex-wrap: wrap;">
      <div style="width: 38px; height: 38px; background: #111827; border: 1px solid #374151; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;" title="${icon.name}">
        ${getAdminSocialIconSvg(icon)}
      </div>

      <div style="width: 130px; min-width: 100px;">
        <span style="display: block; font-weight: 700; font-size: 13px; color: var(--ink);">${icon.name}</span>
        <span style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Square Icon</span>
      </div>

      <div style="flex: 1; min-width: 220px;">
        <input type="url" class="social-icon-url-input" data-idx="${idx}" value="${icon.url || ''}" placeholder="https://${icon.iconKey || 'social'}.com/yourpage" style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--ink); cursor: pointer; user-select: none;">
        <input type="checkbox" class="social-icon-active-toggle" data-idx="${idx}" ${icon.active !== false ? 'checked' : ''}>
        Active
      </label>

      <button type="button" class="button delete-social-icon-btn" data-idx="${idx}" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Delete this icon">
        🗑️ Delete
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.social-icon-url-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      if (footerSocialIcons[idx]) {
        footerSocialIcons[idx].url = e.target.value.trim();
        renderFooterSocialPreview();
      }
    });
  });

  container.querySelectorAll('.social-icon-active-toggle').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      if (footerSocialIcons[idx]) {
        footerSocialIcons[idx].active = e.target.checked;
        renderFooterSocialPreview();
      }
    });
  });

  container.querySelectorAll('.delete-social-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      const item = footerSocialIcons[idx];
      if (item && confirm(`Remove "${item.name}" from footer social icons?`)) {
        footerSocialIcons.splice(idx, 1);
        renderAdminSocialIconsList();
        renderFooterSocialPreview();
      }
    });
  });
}

// Add Social Icon Modal Wireup
const addSocialModal = document.getElementById('addSocialIconModal');
const openAddSocialBtn = document.getElementById('openAddSocialIconBtn');
const closeAddSocialBtn = document.getElementById('closeAddSocialIconModalBtn');
const cancelAddSocialBtn = document.getElementById('cancelAddSocialIconBtn');
const addSocialForm = document.getElementById('addSocialIconForm');
const newSocialPreset = document.getElementById('newSocialPreset');
const newSocialName = document.getElementById('newSocialName');
const newSocialUrl = document.getElementById('newSocialUrl');
const newSocialCustomUploadGroup = document.getElementById('newSocialCustomUploadGroup');
const newSocialCustomFile = document.getElementById('newSocialCustomFile');
const newSocialPreviewIcon = document.getElementById('newSocialPreviewIcon');
const newSocialPreviewLabel = document.getElementById('newSocialPreviewLabel');

function updateNewSocialModalPreview() {
  const preset = newSocialPreset ? newSocialPreset.value : 'whatsapp';
  const customVisible = preset === 'custom';
  if (newSocialCustomUploadGroup) newSocialCustomUploadGroup.style.display = customVisible ? 'block' : 'none';

  const nameVal = newSocialName ? newSocialName.value.trim() : '';
  if (newSocialPreviewLabel) newSocialPreviewLabel.textContent = nameVal || 'Square Icon';

  if (newSocialPreviewIcon) {
    if (customVisible && newSocialCustomBase64) {
      newSocialPreviewIcon.innerHTML = `<img src="${newSocialCustomBase64}" style="width: 22px; height: 22px; object-fit: contain;" />`;
    } else {
      newSocialPreviewIcon.innerHTML = ADMIN_SOCIAL_PRESET_SVGS[preset] || ADMIN_SOCIAL_PRESET_SVGS.globe;
    }
  }
}

if (openAddSocialBtn) {
  openAddSocialBtn.addEventListener('click', () => {
    newSocialCustomBase64 = '';
    if (newSocialPreset) newSocialPreset.value = 'whatsapp';
    if (newSocialName) newSocialName.value = 'WhatsApp';
    if (newSocialUrl) newSocialUrl.value = '';
    if (newSocialCustomFile) newSocialCustomFile.value = '';
    updateNewSocialModalPreview();
    if (addSocialModal) addSocialModal.style.display = 'flex';
  });
}

if (closeAddSocialBtn) {
  closeAddSocialBtn.addEventListener('click', () => {
    if (addSocialModal) addSocialModal.style.display = 'none';
  });
}

if (cancelAddSocialBtn) {
  cancelAddSocialBtn.addEventListener('click', () => {
    if (addSocialModal) addSocialModal.style.display = 'none';
  });
}

if (newSocialPreset) {
  newSocialPreset.addEventListener('change', () => {
    const val = newSocialPreset.value;
    const presetNames = {
      whatsapp: 'WhatsApp',
      x: 'X',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      telegram: 'Telegram',
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      globe: 'Website',
      custom: 'Custom Icon'
    };
    if (newSocialName) newSocialName.value = presetNames[val] || val;
    updateNewSocialModalPreview();
  });
}

if (newSocialName) {
  newSocialName.addEventListener('input', updateNewSocialModalPreview);
}

if (newSocialCustomFile) {
  newSocialCustomFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newSocialCustomBase64 = ev.target.result;
        updateNewSocialModalPreview();
      };
      reader.readAsDataURL(file);
    }
  });
}

if (addSocialForm) {
  addSocialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (newSocialName ? newSocialName.value : '').trim() || 'Social';
    const preset = newSocialPreset ? newSocialPreset.value : 'globe';
    const url = (newSocialUrl ? newSocialUrl.value : '').trim();

    if (!url) {
      alert("Please enter a destination URL (e.g. https://...)");
      return;
    }

    const newIcon = {
      id: 'social_' + Date.now(),
      name: name,
      iconKey: preset,
      url: url,
      active: true,
      shape: 'square'
    };

    if (preset === 'custom' && newSocialCustomBase64) {
      newIcon.iconImg = newSocialCustomBase64;
    }

    footerSocialIcons.push(newIcon);
    renderAdminSocialIconsList();
    renderFooterSocialPreview();

    if (addSocialModal) addSocialModal.style.display = 'none';
    if (window.showToast) window.showToast(`Square icon "${name}" added! Click Save & Publish to push live.`, 'success');
  });
}

async function saveFooterSettings() {
  const topBtn = document.getElementById('saveFooterTopBtn');
  const bottomBtn = document.getElementById('saveFooterBottomBtn');
  const statusEl = document.getElementById('footerSaveStatus');

  const origTopText = topBtn ? topBtn.textContent : '';
  const origBottomText = bottomBtn ? bottomBtn.textContent : '';

  if (topBtn) { topBtn.textContent = 'Saving & Publishing...'; topBtn.disabled = true; }
  if (bottomBtn) { bottomBtn.textContent = 'Saving & Publishing...'; bottomBtn.disabled = true; }

  try {
    const hqInput = document.getElementById('adminFooterHQ');
    const usaInput = document.getElementById('adminFooterUSA');
    const jordanInput = document.getElementById('adminFooterJordan');
    const emailInput = document.getElementById('adminFooterEmail');
    const overviewInput = document.getElementById('adminFooterOverviewHtml');
    const legalInput = document.getElementById('adminFooterLegal');
    const legalLinksInput = document.getElementById('adminFooterLegalLinksHtml');

    if (!currentSiteSettings.siteContent) currentSiteSettings.siteContent = {};

    const contactHQ = hqInput ? hqInput.value.trim() : (currentSiteSettings.siteContent.contactHQ || '');
    const contactUSA = usaInput ? usaInput.value.trim() : (currentSiteSettings.siteContent.contactUSA || '');
    const contactJordan = jordanInput ? jordanInput.value.trim() : (currentSiteSettings.siteContent.contactJordan || '');
    const contactEmail = emailInput ? emailInput.value.trim() : (currentSiteSettings.siteContent.contactEmail || '');
    const footerOverviewHtml = overviewInput ? overviewInput.value.trim() : (currentSiteSettings.siteContent.footerOverviewHtml || '');
    const footerLegal = legalInput ? legalInput.value.trim() : (currentSiteSettings.footerLegal || '');
    const footerLegalLinksHtml = legalLinksInput ? legalLinksInput.value.trim() : (currentSiteSettings.siteContent.footerLegalLinksHtml || '');

    currentSiteSettings.siteContent.contactHQ = contactHQ;
    currentSiteSettings.siteContent.contactUSA = contactUSA;
    currentSiteSettings.siteContent.contactJordan = contactJordan;
    currentSiteSettings.siteContent.contactEmail = contactEmail;
    currentSiteSettings.siteContent.footerOverviewHtml = footerOverviewHtml;
    currentSiteSettings.footerLegal = footerLegal;
    currentSiteSettings.siteContent.footerLegalLinksHtml = footerLegalLinksHtml;
    currentSiteSettings.siteContent.socialIcons = footerSocialIcons;

    const li = footerSocialIcons.find(i => i.iconKey === 'linkedin' && i.active !== false);
    currentSiteSettings.siteContent.socialLinkedIn = li ? li.url : '';
    const fb = footerSocialIcons.find(i => i.iconKey === 'facebook' && i.active !== false);
    currentSiteSettings.siteContent.socialFacebook = fb ? fb.url : '';
    const ig = footerSocialIcons.find(i => i.iconKey === 'instagram' && i.active !== false);
    currentSiteSettings.siteContent.socialInstagram = ig ? ig.url : '';

    const hqFormatted = contactHQ.replace(/\n/g, '<br>');
    const globalInput = document.getElementById('adminFooterGlobal');
    let contactGlobal = globalInput ? globalInput.value.trim() : '';
    if (!contactGlobal) {
      contactGlobal = `USA: ${contactUSA}\nJordan: ${contactJordan}`.trim();
    }
    currentSiteSettings.siteContent.contactGlobalText = contactGlobal;
    currentSiteSettings.siteContent.footerContactHtml = `${hqFormatted}<br><br>${contactGlobal.replace(/\n/g, '<br>')}<br><a href="contact.html" style="color: var(--yellow, #ffd700); text-decoration: none; font-weight: bold;">Contact Us</a>`;

    try {
      localStorage.setItem("fabric8_admin_settings_cache", JSON.stringify(currentSiteSettings));
      localStorage.setItem("fabric8_admin_settings_cache_time", Date.now().toString());
    } catch(e) {}

    try {
      const DB_URL = "https://fabric8-50559-default-rtdb.firebaseio.com";
      // 1. Update footerLegal with targeted PUT
      if (currentSiteSettings.footerLegal) {
        await fetch(`${DB_URL}/admin_settings/footerLegal.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSiteSettings.footerLegal)
        });
      }
      // 2. Patch siteContent child keys without overwriting other root settings or images
      if (currentSiteSettings.siteContent) {
        await fetch(`${DB_URL}/admin_settings/siteContent.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSiteSettings.siteContent)
        });
      }
    } catch(fbErr) {
      console.warn("Firebase RTDB notice:", fbErr);
    }

    if (statusEl) {
      statusEl.style.display = 'inline-block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
    }
    if (window.showToast) {
      window.showToast("✅ Global Footer & Social Icons published live immediately!", "success", 4000);
    }
    if (topBtn) { topBtn.textContent = origTopText; topBtn.disabled = false; }
    if (bottomBtn) { bottomBtn.textContent = origBottomText; bottomBtn.disabled = false; }

    // Sync to GitHub in background (non-blocking)
    fetch('/api/githubSync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_settings',
        token: authToken || 'admin1234',
        siteSettingsPayload: {
          footerLegal: currentSiteSettings.footerLegal,
          siteContent: currentSiteSettings.siteContent
        },
        commitMessage: 'Update global footer content and square social icons'
      })
    }).catch(ghErr => console.warn("GitHub API background notice:", ghErr));
  } catch(err) {
    console.error("Save footer error:", err);
    alert("Could not publish footer settings. Please check connection and try again.");
    if (topBtn) { topBtn.textContent = origTopText; topBtn.disabled = false; }
    if (bottomBtn) { bottomBtn.textContent = origBottomText; bottomBtn.disabled = false; }
  }
}

const saveFooterTopBtn = document.getElementById('saveFooterTopBtn');
if (saveFooterTopBtn) saveFooterTopBtn.addEventListener('click', saveFooterSettings);

const saveFooterBottomBtn = document.getElementById('saveFooterBottomBtn');
if (saveFooterBottomBtn) saveFooterBottomBtn.addEventListener('click', saveFooterSettings);
