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
  productTableBody.innerHTML = "<tr><td colspan='5'>Loading products from GitHub...</td></tr>";
  try {
    const res = await fetch('data/products.json?t=' + Date.now());
    if (!res.ok) throw new Error("Failed to read products.json");
    productsList = await res.json();
    productsList.sort((a, b) => a.name.localeCompare(b.name));
    renderTable();
  } catch (error) {
    console.error("Error fetching products:", error);
    productTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error loading database. Ensure data/products.json exists on GitHub.</td></tr>";
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
      alert(`Success! Changes saved to GitHub.\nNOTE: Vercel takes ~45 seconds to rebuild the website. Your changes will be live shortly.`);
      return true;
    } else {
      if (data.message === "Unauthorized") {
        logoutBtn.click();
      }
      alert("Error saving: " + data.message);
      return false;
    }
  } catch (error) {
    alert("Network error. Ensure you are on Vercel.");
    return false;
  }
}

// --- Modal & Form ---
// Dynamic Tag Managers & Sector Engine
let activeSizes = ["S", "M", "L", "XL"];
let activeColors = ["Black", "Navy", "White"];
let activeSectors = [];
let pendingSketchFile = null;

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
      document.getElementById("supportedPlacements").value = (p.supportedPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"]).join(", ");

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
    document.getElementById("supportedPlacements").value = "Left Chest, Right Chest, Center Back, Upper Sleeve";
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
  submitBtn.textContent = "Saving to GitHub...";
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
    supportedPlacements: document.getElementById("supportedPlacements")?.value.split(",").map(p => p.trim()).filter(Boolean) || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"],
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
    const cleanName = origName.replace(/^([a-zA-Z0-9]+)_/, "");
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

// --- Tab Switching Logic ---
const tabProducts = document.getElementById("tabProducts");
const tabSettings = document.getElementById("tabSettings");
const productsSection = document.getElementById("productsSection");
const settingsSection = document.getElementById("settingsSection");

if (tabProducts && tabSettings) {
  tabProducts.addEventListener("click", () => {
    tabProducts.classList.add("active");
    tabProducts.style.background = "var(--green)";
    tabProducts.style.color = "white";
    tabSettings.classList.remove("active");
    tabSettings.style.background = "white";
    tabSettings.style.color = "var(--ink)";
    productsSection.style.display = "block";
    settingsSection.style.display = "none";
  });
  
  tabSettings.addEventListener("click", () => {
    tabSettings.classList.add("active");
    tabSettings.style.background = "var(--green)";
    tabSettings.style.color = "white";
    tabProducts.classList.remove("active");
    tabProducts.style.background = "white";
    tabProducts.style.color = "var(--ink)";
    settingsSection.style.display = "block";
    productsSection.style.display = "none";
    fetchSettings();
  });
}

// --- Settings CMS & Category Engine Logic ---
let categories1stLayer = [
  { name: "Food & beverage", enabled: true },
  { name: "Hospitality", enabled: true },
  { name: "Corporate", enabled: true },
  { name: "Healthcare", enabled: true },
  { name: "Industrial", enabled: true },
  { name: "Education", enabled: false },
  { name: "Aviation", enabled: false }
];
let categories2ndLayer = [
  { name: "HEAD WEAR", enabled: true },
  { name: "TOP WEAR", enabled: true },
  { name: "BOTTOM WEAR", enabled: true },
  { name: "OUTER WEAR", enabled: true },
  { name: "ACCESSORIES", enabled: true }
];

function renderCmsCategoryLists() {
  const list1 = document.getElementById("cms1stLayerList");
  if (list1) {
    list1.innerHTML = categories1stLayer.map((cat, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: ${cat.enabled ? '#fff' : '#f5f4ef'}; border: 1px solid var(--line); border-radius: 6px; opacity: ${cat.enabled ? '1' : '0.65'};">
        <span style="font-size: 13px; font-weight: ${cat.enabled ? '700' : '500'}; color: var(--ink);">${cat.name} ${!cat.enabled ? '<span style="font-size: 10px; background: #ddd; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">OFF</span>' : ''}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="display: inline-flex; align-items: center; cursor: pointer; font-size: 12px; color: var(--muted);">
            <input type="checkbox" onchange="window.toggleCmsCat('1st', ${idx}, this.checked)" ${cat.enabled ? 'checked' : ''}> Enable
          </label>
          <button type="button" onclick="window.removeCmsCat('1st', ${idx})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 16px; font-weight: bold; line-height: 1;">&times;</button>
        </div>
      </div>
    `).join("");
  }

  const list2 = document.getElementById("cms2ndLayerList");
  if (list2) {
    list2.innerHTML = categories2ndLayer.map((cat, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: ${cat.enabled ? '#fff' : '#f5f4ef'}; border: 1px solid var(--line); border-radius: 6px; opacity: ${cat.enabled ? '1' : '0.65'};">
        <span style="font-size: 13px; font-weight: ${cat.enabled ? '700' : '500'}; color: var(--ink);">${cat.name} ${!cat.enabled ? '<span style="font-size: 10px; background: #ddd; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">OFF</span>' : ''}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="display: inline-flex; align-items: center; cursor: pointer; font-size: 12px; color: var(--muted);">
            <input type="checkbox" onchange="window.toggleCmsCat('2nd', ${idx}, this.checked)" ${cat.enabled ? 'checked' : ''}> Enable
          </label>
          <button type="button" onclick="window.removeCmsCat('2nd', ${idx})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 16px; font-weight: bold; line-height: 1;">&times;</button>
        </div>
      </div>
    `).join("");
  }
}

window.toggleCmsCat = function(layer, index, status) {
  if (layer === '1st' && categories1stLayer[index]) categories1stLayer[index].enabled = status;
  if (layer === '2nd' && categories2ndLayer[index]) categories2ndLayer[index].enabled = status;
  renderCmsCategoryLists();
};

window.removeCmsCat = function(layer, index) {
  if (confirm("Are you sure you want to delete this category?")) {
    if (layer === '1st') categories1stLayer.splice(index, 1);
    if (layer === '2nd') categories2ndLayer.splice(index, 1);
    renderCmsCategoryLists();
  }
};

document.getElementById("add1stLayerBtn")?.addEventListener("click", () => {
  const input = document.getElementById("new1stLayerInput");
  const val = input?.value.trim();
  if (val) {
    categories1stLayer.push({ name: val, enabled: true });
    input.value = "";
    renderCmsCategoryLists();
  }
});

document.getElementById("add2ndLayerBtn")?.addEventListener("click", () => {
  const input = document.getElementById("new2ndLayerInput");
  const val = input?.value.trim();
  if (val) {
    categories2ndLayer.push({ name: val, enabled: true });
    input.value = "";
    renderCmsCategoryLists();
  }
});

async function fetchSettings() {
  try {
    const res = await fetch('data/admin_settings.json?t=' + Date.now());
    if (res.ok) {
      const settings = await res.json();
      if (settings.categories1stLayer) categories1stLayer = settings.categories1stLayer;
      if (settings.categories2ndLayer) categories2ndLayer = settings.categories2ndLayer;
      renderCmsCategoryLists();

      document.getElementById("settingPromoBanner").value = settings.promoBanner || "";
      document.getElementById("settingFooterLegal").value = settings.footerLegal || "";

      const sc = settings.siteContent || {};
      if (document.getElementById("settingHomeTitle")) document.getElementById("settingHomeTitle").value = sc.homeHeroTitle || "Engineered for Comfort, Designed to Inspire";
      if (document.getElementById("settingHomeBtn")) document.getElementById("settingHomeBtn").value = sc.homeHeroBtnText || "EXPLORE THE COLLECTION";
      if (document.getElementById("settingHomeSub")) document.getElementById("settingHomeSub").value = sc.homeHeroSubtitle || "High-performance industrial uniforms & corporate fashion designed for modern teams.";
      if (document.getElementById("settingAboutText")) document.getElementById("settingAboutText").value = sc.aboutText || "We partner with leading corporate enterprises, healthcare groups, and industrial sectors...";

      const lc = settings.legalContent || {};
      if (document.getElementById("settingTermsText")) document.getElementById("settingTermsText").value = lc.termsText || "";
      if (document.getElementById("settingPrivacyText")) document.getElementById("settingPrivacyText").value = lc.privacyText || "";

      const bc = settings.brandingSettings || {};
      if (document.getElementById("settingDefaultPlacements")) document.getElementById("settingDefaultPlacements").value = (bc.defaultPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"]).join(", ");
      if (document.getElementById("settingDtfNote")) document.getElementById("settingDtfNote").value = bc.dtfHelperNote || "";
      if (document.getElementById("settingEmbroideryNote")) document.getElementById("settingEmbroideryNote").value = bc.embroideryHelperNote || "";
    } else {
      renderCmsCategoryLists();
    }
  } catch (err) {
    console.error("No existing settings found.");
    renderCmsCategoryLists();
  }
}

document.getElementById("saveSettingsBtn")?.addEventListener("click", async () => {
  const btn = document.getElementById("saveSettingsBtn");
  const statusSpan = document.getElementById("cmsSaveStatus");
  const originalText = btn.textContent;
  btn.textContent = "Saving CMS to GitHub...";
  btn.disabled = true;
  if (statusSpan) statusSpan.style.display = "none";

  const settingsPayload = {
    promoBanner: document.getElementById("settingPromoBanner")?.value || "",
    footerLegal: document.getElementById("settingFooterLegal")?.value || "",
    categories1stLayer: categories1stLayer,
    categories2ndLayer: categories2ndLayer,
    siteContent: {
      homeHeroTitle: document.getElementById("settingHomeTitle")?.value || "Engineered for Comfort, Designed to Inspire",
      homeHeroBtnText: document.getElementById("settingHomeBtn")?.value || "EXPLORE THE COLLECTION",
      homeHeroSubtitle: document.getElementById("settingHomeSub")?.value || "",
      aboutText: document.getElementById("settingAboutText")?.value || "",
      methodLeafletUrl: "assets/needs/Product Data General Sheet (1).xlsx"
    },
    legalContent: {
      termsText: document.getElementById("settingTermsText")?.value || "",
      privacyText: document.getElementById("settingPrivacyText")?.value || ""
    },
    brandingSettings: {
      defaultPlacements: document.getElementById("settingDefaultPlacements")?.value.split(",").map(p => p.trim()).filter(Boolean) || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"],
      dtfHelperNote: document.getElementById("settingDtfNote")?.value || "",
      embroideryHelperNote: document.getElementById("settingEmbroideryNote")?.value || ""
    }
  };

  try {
    const res = await fetch('/api/githubSync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: authToken,
        action: "save_settings",
        product: settingsPayload
      })
    });
    
    const data = await res.json();
    if (data.success) {
      if (statusSpan) {
        statusSpan.style.display = "inline";
        setTimeout(() => { statusSpan.style.display = "none"; }, 5000);
      }
      alert(`Success! Master CMS Content and Category states saved to GitHub.\nNOTE: Vercel takes ~45 seconds to rebuild the website.`);
    } else {
      alert("Error saving settings: " + data.message);
    }
  } catch (error) {
    alert("Network error. Ensure you are on Vercel.");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});


