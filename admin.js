import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref as dbRef, get, set, remove, child } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Make the page visible (removes opacity: 0 from site.css)
document.body.classList.add("page-ready");

const firebaseConfig = {
  apiKey: "AIzaSyB4o7k3og4IkpN-1hWLCm0swSKfep2bX3Q",
  authDomain: "fabric8-backend.firebaseapp.com",
  databaseURL: "https://fabric8-backend-default-rtdb.firebaseio.com",
  projectId: "fabric8-backend",
  storageBucket: "fabric8-backend.firebasestorage.app",
  messagingSenderId: "218171330798",
  appId: "1:218171330798:web:567df110bd198a60a123ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

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

// --- Authentication ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.style.display = "none";
    dashboardScreen.style.display = "block";
    fetchProducts();
  } else {
    loginScreen.style.display = "flex";
    dashboardScreen.style.display = "none";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  loginError.textContent = "";
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    loginError.textContent = "Invalid email or password. Please try again.";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// --- Database CRUD ---
async function fetchProducts() {
  productTableBody.innerHTML = "<tr><td colspan='5'>Loading products...</td></tr>";
  try {
    const snapshot = await get(dbRef(db, "products"));
    productsList = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        productsList.push({ id: key, ...data[key] });
      }
      // Sort A-Z
      productsList.sort((a, b) => a.name.localeCompare(b.name));
    }
    renderTable();
  } catch (error) {
    console.error("Error fetching products:", error);
    productTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error loading database. Make sure Rules are set to public for reading.</td></tr>";
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
        <button class="btn-icon edit-btn" data-id="${p.id}">Edit</button>
        <button class="btn-icon delete delete-btn" data-id="${p.id}">Delete</button>
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
        await remove(dbRef(db, "products/" + e.target.dataset.id));
        fetchProducts();
      }
    });
  });
}

// --- Modal & Form ---
function openModal(docId = null) {
  productForm.reset();
  imagePreviewContainer.style.display = "none";
  imageUrlInput.value = "";
  uploadStatus.textContent = "";

  if (docId) {
    modalTitle.textContent = "Edit Product";
    const p = productsList.find(x => x.id === docId);
    if (p) {
      document.getElementById("docId").value = p.id;
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
  submitBtn.textContent = "Saving...";
  submitBtn.disabled = true;

  const docId = document.getElementById("docId").value || document.getElementById("sku").value;
  
  const productData = {
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

  try {
    await set(dbRef(db, "products/" + docId), productData);
    closeModal();
    fetchProducts();
  } catch (error) {
    console.error("Error saving:", error);
    alert("Error saving product: " + error.message);
  } finally {
    submitBtn.textContent = "Save Product";
    submitBtn.disabled = false;
  }
});

// --- Storage Uploads ---
imageUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadStatus.textContent = "Uploading image...";
  const storageRef = ref(storage, 'products/' + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      uploadStatus.textContent = 'Upload is ' + Math.round(progress) + '% done';
    }, 
    (error) => {
      uploadStatus.textContent = "Upload failed: " + error.message;
    }, 
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      imageUrlInput.value = downloadURL;
      imagePreview.src = downloadURL;
      imagePreviewContainer.style.display = "flex";
      uploadStatus.textContent = "Upload successful!";
      imageUpload.value = ""; // clear input
    }
  );
});

removeImageBtn.addEventListener("click", () => {
  imageUrlInput.value = "";
  imagePreviewContainer.style.display = "none";
});
