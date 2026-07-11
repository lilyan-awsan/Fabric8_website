// Make the page visible (removes opacity: 0 from site.css)
document.body.classList.add("page-ready");

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
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
let pendingImageBase64 = null;
let pendingImageName = null;

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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("loginPassword").value;
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
});

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
  if (productsList.length === 0) {
    productTableBody.innerHTML = "<tr><td colspan='5'>No products found. Add one!</td></tr>";
    return;
  }

  productsList.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.image || 'assets/white.png'}" class="prod-thumb"></td>
      <td><strong>${p.sku}</strong></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td class="action-btns">
        <button class="btn-icon edit-btn" data-id="${p.sku}">Edit</button>
        <button class="btn-icon delete delete-btn" data-id="${p.sku}">Delete</button>
      </td>
    `;
    productTableBody.appendChild(tr);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => openModal(e.target.dataset.id));
  });
  
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      if(confirm("Are you sure you want to delete this product?")) {
        await syncWithGithub("delete", { id: e.target.dataset.id, sku: e.target.dataset.id });
      }
    });
  });
}

// --- Sync Helper ---
async function syncWithGithub(action, product) {
  try {
    const payload = { token: authToken, action, product };
    if (pendingImageBase64) {
      payload.image = { name: pendingImageName, base64: pendingImageBase64 };
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
function openModal(docId = null) {
  productForm.reset();
  imagePreviewContainer.style.display = "none";
  imageUrlInput.value = "";
  uploadStatus.textContent = "";
  pendingImageBase64 = null;
  pendingImageName = null;

  if (docId) {
    modalTitle.textContent = "Edit Product";
    const p = productsList.find(x => x.id === docId || x.sku === docId);
    if (p) {
      document.getElementById("docId").value = p.sku;
      document.getElementById("sku").value = p.sku || "";
      document.getElementById("name").value = p.name || "";
      document.getElementById("category").value = p.category || "Top Wear";
      document.getElementById("gender").value = p.gender || "Men / Women / Unisex";
      document.getElementById("sectors").value = p.sectors || "";
      document.getElementById("short").value = p.short || "";
      document.getElementById("long").value = p.long || "";
      document.getElementById("sizes").value = (p.sizes || []).join(", ");
      document.getElementById("colors").value = (p.colors || []).join(", ");
      document.getElementById("fabric").value = p.fabric || "";
      document.getElementById("gsm").value = p.gsm || "";
      document.getElementById("leadTime").value = p.leadTime || "";
      document.getElementById("moq").value = p.moq || "";
      
      if (p.image) {
        imageUrlInput.value = p.image;
        imagePreview.src = p.image;
        imagePreviewContainer.style.display = "flex";
      }
    }
  } else {
    modalTitle.textContent = "Add Product";
    document.getElementById("docId").value = "";
  }
  
  productModal.style.display = "flex";
}

function closeModal() {
  productModal.style.display = "none";
}

addProductBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById("saveProductBtn");
  submitBtn.textContent = "Saving to GitHub...";
  submitBtn.disabled = true;

  const docId = document.getElementById("docId").value || document.getElementById("sku").value;
  
  const productData = {
    id: docId,
    sku: document.getElementById("sku").value,
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    gender: document.getElementById("gender").value,
    sectors: document.getElementById("sectors").value,
    short: document.getElementById("short").value,
    long: document.getElementById("long").value,
    sizes: document.getElementById("sizes").value.split(",").map(s => s.trim()).filter(s => s),
    colors: document.getElementById("colors").value.split(",").map(s => s.trim()).filter(s => s),
    fabric: document.getElementById("fabric").value,
    gsm: document.getElementById("gsm").value,
    leadTime: document.getElementById("leadTime").value,
    moq: document.getElementById("moq").value,
    image: imageUrlInput.value || "assets/white.png"
  };

  const success = await syncWithGithub("save", productData);
  if (success) closeModal();

  submitBtn.textContent = "Save Product";
  submitBtn.disabled = false;
});

// --- Image Preview (Base64) ---
imageUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadStatus.textContent = "Processing image...";
  
  const reader = new FileReader();
  reader.onload = (event) => {
    pendingImageBase64 = event.target.result;
    pendingImageName = file.name;
    imagePreview.src = pendingImageBase64;
    imagePreviewContainer.style.display = "flex";
    uploadStatus.textContent = "Image ready to be uploaded upon saving!";
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener("click", () => {
  imageUrlInput.value = "";
  pendingImageBase64 = null;
  pendingImageName = null;
  imagePreviewContainer.style.display = "none";
  uploadStatus.textContent = "";
});

// Init
checkAuth();
