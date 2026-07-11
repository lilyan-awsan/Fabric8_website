let products = [];

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyB4o7k3og4IkpN-1hWLCm0swSKfep2bX3Q",
    authDomain: "fabric8-backend.firebaseapp.com",
    databaseURL: "https://fabric8-backend-default-rtdb.firebaseio.com",
    projectId: "fabric8-backend",
    storageBucket: "fabric8-backend.firebasestorage.app",
    messagingSenderId: "218171330798",
    appId: "1:218171330798:web:567df110bd198a60a123ff"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  db.ref("products").once("value", (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        products.push(data[key]);
      }
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    initSite();
  });
} else {
  initSite();
}


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

function renderProducts() {
  const productImage = $("#featuredProductImage");
  if (!productImage) return;

  const categories = [...new Set(products.map((p) => p.category))].sort();
  const categoryFilter = $("#categoryFilter");
  const productSelect = $("#productSelect");
  const colorFilter = $("#colorFilter");

  const searchVal = $("#productSearch")?.value.toLowerCase() || "";
  const sortVal = $("#sortFilter")?.value || "featured";
  const genderVal = $("#genderFilter")?.value || "All";
  const availabilityVal = $("#availabilityFilter")?.value || "All";

  if (categoryFilter.options.length === 1) {
    categoryFilter.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
    if (categories.includes("Top Wear")) categoryFilter.value = "Top Wear";
  }

  const cat = categoryFilter.value;
  let filtered = products.filter((p) => p.category === cat);

  if (searchVal) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.long.toLowerCase().includes(searchVal));
  }
  if (genderVal !== "All") {
    filtered = filtered.filter(p => p.gender.includes(genderVal) || p.gender.includes("Unisex"));
  }
  if (availabilityVal !== "All") {
    filtered = filtered.filter(p => p.availability === availabilityVal);
  }
  if (sortVal === "A-Z") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortVal === "Z-A") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (filtered.length === 0) {
    productSelect.innerHTML = "<option value=''>No matches found</option>";
    $("#featuredProductName").textContent = "No matching products";
    return;
  }

  if (!filtered.some((p) => p.sku === selectedProductSku)) selectedProductSku = filtered[0]?.sku || products[0].sku;
  productSelect.innerHTML = filtered.map((p) => `<option value="${p.sku}" ${p.sku === selectedProductSku ? "selected" : ""}>${p.name}</option>`).join("");

  const selected = products.find((p) => p.sku === selectedProductSku) || filtered[0] || products[0];
  if (!selected.colors.includes(activeCatalogColor)) activeCatalogColor = selected.colors[0];
  colorFilter.innerHTML = selected.colors.map((c) => colorButton(c)).join("");
  const activeButton = colorFilter.querySelector(`[data-color="${CSS.escape(activeCatalogColor)}"]`);
  if (activeButton) activeButton.classList.add("active");

  productImage.src = selected.image;
  productImage.alt = selected.name;
  productImage.dataset.color = activeCatalogColor.toLowerCase().replace(/\s+/g, "-");
  $("#featuredProductName").textContent = selected.name;
  $("#featuredProductText").textContent = selected.short;

  if ($("#featuredProductSku")) $("#featuredProductSku").textContent = `SKU: ${selected.sku}`;
  if ($("#featuredProductLong")) $("#featuredProductLong").textContent = selected.long;
  if ($("#featuredProductFabric")) $("#featuredProductFabric").textContent = selected.fabric;
  if ($("#featuredProductGsm")) $("#featuredProductGsm").textContent = selected.gsm;
  if ($("#featuredProductSizes")) $("#featuredProductSizes").textContent = selected.sizes.join(", ");
  if ($("#featuredProductMoq")) $("#featuredProductMoq").textContent = selected.moq;
  if ($("#featuredProductLeadTime")) $("#featuredProductLeadTime").textContent = selected.leadTime;
  if ($("#featuredProductCare")) $("#featuredProductCare").textContent = selected.care;
  if ($("#featuredProductAvailability")) $("#featuredProductAvailability").textContent = selected.availability;
  if ($("#featuredProductBranding")) $("#featuredProductBranding").textContent = selected.branding;

  const sizeSelect = $("#sizeSelect");
  if (sizeSelect) {
    const currentSize = sizeSelect.value;
    sizeSelect.innerHTML = '<option value="">Select a size...</option>';
    if (selected.sizes && Array.isArray(selected.sizes)) {
      selected.sizes.forEach(size => {
        const opt = document.createElement("option");
        opt.value = size;
        opt.textContent = size;
        if (size === currentSize) opt.selected = true;
        sizeSelect.appendChild(opt);
      });
    }
  }
}

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
  const quantity = parseInt($("#productQuantity")?.value || 50);
  const selectedSize = $("#sizeSelect")?.value;

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
    if (!$("#logoDisclaimer")?.checked) {
      alert("You must agree to the legal disclaimer before adding a branded mockup.");
      return;
    }
    
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) {
      alert("Please select a product from the catalog first.");
      return;
    }
    
    const quantity = parseInt($("#productQuantity")?.value || 50);
    const selectedSize = $("#sizeSelect")?.value || "Standard";
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
  const addSelected = event.target.closest("#addSelectedProduct");
  const addBlank = event.target.closest("#addBlankProduct");
  
  if (add) addToCart(add.dataset.add);
  if (addBlank) addToCart(selectedProductSku);
  
  if (addSelected) {
    const selectedProduct = products.find((p) => p.sku === selectedProductSku);
    if (!selectedProduct) return;
    
    const quantity = parseInt($("#productQuantity")?.value || 50);
    const selectedSize = $("#sizeSelect")?.value;

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
         shirtImg.src = selectedProduct.images?.[0] || "White Polo Shirt.png";
      }
    }
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
  ["#categoryFilter", "#productSelect", "#productSearch", "#sortFilter", "#genderFilter", "#availabilityFilter"].forEach((selector) => {
    const el = $(selector);
    if (el) el.addEventListener(eventName, (event) => {
      if (event.target.id === "productSelect") selectedProductSku = event.target.value;
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
