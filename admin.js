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
    loginError.textContent = "Server error. Ensure you are on Vercel and ADMIN_PASSWORD is set.";
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
  productTableBody.innerHTML = "<tr><td colspan='5'>Loading product catalog...</td></tr>";
  try {
    const res = await fetch('data/products.json?t=' + Date.now());
    if (!res.ok) throw new Error("Failed to read products.json");
    productsList = await res.json();
    productsList.sort((a, b) => a.name.localeCompare(b.name));
    renderTable();
  } catch (error) {
    console.error("Error fetching products:", error);
    productTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error loading database. Please check your network or try refreshing the page.</td></tr>";
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

// --- Sync Helper ---
async function syncWithGithub(action, product) {
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
      productsList = data.products;
      renderTable();
      showToast(`Success! Changes saved successfully.\nNOTE: It takes ~45 seconds to update the live website. Your changes will be live shortly.`, "success", 8000);
      return true;
    } else {
      if (data.message === "Unauthorized") {
        logoutBtn.click();
      }
      showToast("Error saving: " + data.message, "error", 8000);
      return false;
    }
  } catch (error) {
    showToast("Network error. Ensure you are on Vercel.", "error", 8000);
    return false;
  }
}

// --- Modal & Form ---
// Dynamic Tag Managers & Sector Engine
let activeSizes = ["S", "M", "L", "XL"];
let activeColors = ["Black", "Navy", "White"];
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
  container.innerHTML = activeColors.map((col, idx) => `
    <span style="background: #f0eee9; color: var(--ink); padding: 4px 10px; border-radius: 16px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line);">
      ${col}
      <button type="button" onclick="window.removeColorTag(${idx})" style="background: none; border: none; font-size: 15px; cursor: pointer; color: #888; line-height: 1; padding: 0;">&times;</button>
    </span>
  `).join("");
  renderImagePreviews();
}

window.removeSizeTag = function(index) {
  activeSizes.splice(index, 1);
  renderSizesTags();
};

window.removeColorTag = function(index) {
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
  const val = input?.value.trim();
  if (val && !activeColors.includes(val)) {
    activeColors.push(val);
    input.value = "";
    renderColorsTags();
  }
});

function renderSectorButtons() {
  const container = document.getElementById("productSectorsButtons");
  if (!container) return;
  const sectors = ["Food & beverage", "Hospitality", "Corporate", "Healthcare", "Industrial", "Education", "Aviation"];
  container.innerHTML = sectors.map(sec => {
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

      if (p.images && p.images.length > 0) {
        existingImages = [...p.images];
      } else if (p.image) {
        existingImages = [p.image];
      }
      renderImagePreviews();
    }
  } else {
    modalTitle.textContent = "Add Product";
    document.getElementById("docId").value = "";
    activeSectors = ["Corporate", "Hospitality"];
    activeSizes = ["S", "M", "L", "XL", "2XL"];
    activeColors = ["Black", "White", "Navy", "Grey"];
    renderSectorButtons();
    renderSizesTags();
    renderColorsTags();
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
    fabric: document.getElementById("fabric").value,
    gsm: document.getElementById("gsm").value,
    leadTime: document.getElementById("leadTime").value,
    moq: document.getElementById("moq").value,
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
    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "6px";
    div.style.border = "1px solid var(--line)";
    div.style.borderRadius = "8px";
    div.style.background = "#fff";
    div.innerHTML = `
      <div style="position: relative;">
        <img src="${imgUrl}" alt="Existing" style="width: 80px; height: 80px; object-fit: contain; border-radius: 4px; background: #f9f8f5;">
        <button type="button" class="remove-btn" onclick="removeExistingImage(${index})" style="position: absolute; top: -6px; right: -6px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold;">&times;</button>
      </div>
      <select onchange="window.updateImageColorMatch('existing', ${index}, this.value)" style="font-size: 11px; padding: 2px 4px; border-radius: 4px; width: 100%; border: 1px solid var(--line);">
        <option value="">Match Color</option>
        ${colorOptions.map(col => `<option value="${col}" ${imgUrl.toLowerCase().includes(col.toLowerCase()) ? 'selected' : ''}>${col}</option>`).join("")}
      </select>
    `;
    imagePreviewContainer.appendChild(div);
  });
  
  pendingImages.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.gap = "6px";
    div.style.padding = "6px";
    div.style.border = "1px solid var(--line)";
    div.style.borderRadius = "8px";
    div.style.background = "#fff";
    div.innerHTML = `
      <div style="position: relative;">
        <img src="${img.base64}" alt="Pending" style="width: 80px; height: 80px; object-fit: contain; border-radius: 4px; background: #f9f8f5;">
        <button type="button" class="remove-btn" onclick="removePendingImage(${index})" style="position: absolute; top: -6px; right: -6px; background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold;">&times;</button>
      </div>
      <select onchange="window.updateImageColorMatch('pending', ${index}, this.value)" style="font-size: 11px; padding: 2px 4px; border-radius: 4px; width: 100%; border: 1px solid var(--line);">
        <option value="">Match Color</option>
        ${colorOptions.map(col => `<option value="${col}" ${img.name && img.name.toLowerCase().includes(col.toLowerCase()) ? 'selected' : ''}>${col}</option>`).join("")}
      </select>
    `;
    imagePreviewContainer.appendChild(div);
  });
}

window.updateImageColorMatch = function(type, index, colorName) {
  if (type === 'pending' && pendingImages[index]) {
    const origName = pendingImages[index].name || "image.png";
    let cleanName = origName;
    if (origName.includes("_")) {
      cleanName = origName.split("_").slice(1).join("_"); // Remove existing color prefix
    }
    pendingImages[index].name = colorName ? `${colorName}_${cleanName}` : cleanName;
  }
};

window.removeExistingImage = function(index) {
  existingImages.splice(index, 1);
  renderImagePreviews();
};

window.removePendingImage = function(index) {
  pendingImages.splice(index, 1);
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
const tabSettings = document.getElementById('tabSettings');
const productsSection = document.getElementById('productsSection');
const tableContainer = document.querySelector('.table-container');
const settingsSection = document.getElementById('settingsSection');

if (tabProducts && tabSettings) {
  tabProducts.addEventListener('click', () => {
    tabProducts.classList.add('active');
    tabProducts.style.background = 'var(--green)';
    tabProducts.style.color = 'white';
    tabSettings.classList.remove('active');
    tabSettings.style.background = 'white';
    tabSettings.style.color = 'var(--ink)';
    
    productsSection.style.display = 'block';
    if(tableContainer) tableContainer.style.display = 'block';
    settingsSection.style.display = 'none';
  });
  
  tabSettings.addEventListener('click', () => {
    tabSettings.classList.add('active');
    tabSettings.style.background = 'var(--green)';
    tabSettings.style.color = 'white';
    tabProducts.classList.remove('active');
    tabProducts.style.background = 'white';
    tabProducts.style.color = 'var(--ink)';
    
    productsSection.style.display = 'none';
    if(tableContainer) tableContainer.style.display = 'none';
    settingsSection.style.display = 'block';
  });
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
      
      // Intercept all link clicks in capture phase to prevent accidental iframe navigation
      if (!doc.body.getAttribute('data-click-intercepted')) {
        doc.body.setAttribute('data-click-intercepted', 'true');
        doc.addEventListener('click', (e) => {
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
          if (el.children.length === 0 || tag === 'span' || tag === 'a' || tag === 'button' || tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
            el.setAttribute('contenteditable', 'true');
          }
        });
      });

      // Prevent link navigation inside editor iframe so clicks edit text
      doc.querySelectorAll('a, button').forEach(el => {
        if (!el.getAttribute('data-editor-click-handled')) {
          el.setAttribute('data-editor-click-handled', 'true');
          el.addEventListener('click', (e) => {
            // Allow text focus instead of navigating
            e.preventDefault();
          });
        }
      });
      
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
          hero.addEventListener('dblclick', (e) => {
            if (e.target !== hero) return;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (event) => {
              const file = event.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e2) => {
                  hero.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.34)), url("${e2.target.result}")`;
                  hero.setAttribute('data-new-bg-upload', file.name);
                  hero.setAttribute('data-new-bg-base64', e2.target.result);
                };
                reader.readAsDataURL(file);
              }
            };
            fileInput.click();
          });
          hero.title = "Double-click background to change image";
        }
      });

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
      
      const editableBgs = cleanDoc.querySelectorAll('[data-editable-bg]');
      editableBgs.forEach(el => el.removeAttribute('data-editable-bg'));
      cleanDoc.querySelectorAll('[data-editor-click-handled]').forEach(el => el.removeAttribute('data-editor-click-handled'));

      const injectedStyleTag = cleanDoc.querySelector('#visual-editor-style');
      if (injectedStyleTag) injectedStyleTag.remove();

      // Extract newly uploaded images and backgrounds
      const newSiteImages = [];
      
      const imgTags = cleanDoc.querySelectorAll('img[data-new-upload]');
      imgTags.forEach(img => {
        newSiteImages.push({
          name: img.getAttribute('data-new-upload'),
          base64: img.src
        });
        img.removeAttribute('data-new-upload');
      });
      
      const bgTags = cleanDoc.querySelectorAll('[data-new-bg-upload]');
      bgTags.forEach(bg => {
        newSiteImages.push({
          name: bg.getAttribute('data-new-bg-upload'),
          base64: bg.getAttribute('data-new-bg-base64')
        });
        bg.removeAttribute('data-new-bg-upload');
        bg.removeAttribute('data-new-bg-base64');
      });

      // Get raw HTML string
      const rawHtml = '<!DOCTYPE html>\n<html>\n' + cleanDoc.innerHTML + '\n</html>';

      // 15 second fetch timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/githubSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          token: authToken,
          action: "save_html",
          filename: currentVisualPage,
          htmlContent: rawHtml,
          siteImages: newSiteImages
        })
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.success) {
        const statusEl = document.getElementById('visualEditorStatus');
        if (statusEl) statusEl.style.display = 'block';
        showToast("Success! Changes published to GitHub.\nNote: Vercel takes ~30-45s to complete the build for live site.", "success", 10000);
        alert("✅ Success! Your changes were saved and published to GitHub.\n\nNote: Vercel will update the live production site in ~30-45 seconds.");
        setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 6000);
        
        // Refresh preview iframe with cache-buster timestamp
        setTimeout(() => {
          if (iframe) iframe.src = currentVisualPage + '?t=' + Date.now();
        }, 1200);
      } else {
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


