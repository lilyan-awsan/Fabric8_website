const products = [
  ["F8-001", "Polo Shirt", "Top Wear", "Classic corporate polo, clean and professional.", "White Polo Shirt.png", ["Black", "White", "Navy", "Grey", "Green", "Red"]],
  ["F8-002", "Waiter Vest", "Top Wear", "Sleek, lightweight vest for front-of-house staff.", "Black Polo Shirt.jpg", ["Black", "White", "Custom Colors"]],
  ["F8-003", "Cargo Vest", "Outer Wear", "Rugged utility vest with functional storage.", "Black Polo Shirt.jpg", ["Black", "Beige", "Navy"]],
  ["F8-004", "Chef Hat", "Head Wear", "Traditional toque for a professional kitchen image.", "assets/fabric8-silk-hero.png", ["White", "Custom Colors"]],
  ["F8-005", "Chef Beret", "Head Wear", "Modern, low-profile kitchen headwear.", "assets/fabric8-silk-hero.png", ["White", "Custom Colors"]],
  ["F8-006", "Chef Bandana", "Head Wear", "Practical head covering for active kitchen staff.", "assets/fabric8-silk-hero.png", ["White", "Black", "Custom Colors"]],
  ["F8-007", "Lab Coats", "Outer Wear", "Crisp, professional coats for healthcare teams.", "White Shirt.png", ["White", "Custom Colors"]],
  ["F8-008", "Cargo Pants", "Bottom Wear", "Durable, functional pants for on-the-go teams.", "assets/fabric8-fashion-hero.png", ["Black", "Charcoal", "Beige", "Navy"]],
  ["F8-009", "Workwear / Waiter Pants", "Bottom Wear", "Polished, comfortable pants for service staff.", "assets/fabric8-fashion-hero.png", ["Black", "Charcoal", "Beige", "Navy"]],
  ["F8-010", "Caps", "Head Wear", "Adjustable branded cap for outdoor or retail teams.", "assets/fabric8-silk-hero.png", ["Black", "White", "Red", "Navy", "Green"]],
  ["F8-011", "Chef Jackets", "Top Wear", "Double-breasted jacket for culinary professionals.", "White Shirt.png", ["White", "Custom Colors"]],
  ["F8-012", "Scrubs", "Top Wear", "Comfortable, easy-care scrubs for clinical teams.", "White Polo Shirt.png", ["Black", "Navy", "Burgundy", "Charcoal", "White"]],
  ["F8-013", "Chef Pants", "Bottom Wear", "Comfortable, durable pants built for the kitchen.", "assets/fabric8-fashion-hero.png", ["Black", "Striped", "Custom Colors"]],
  ["F8-014", "Full Apron", "Accessories", "Classic full-coverage apron for kitchen and service staff.", "Black Polo Shirt.jpg", ["Black", "White", "Striped"]],
  ["F8-015", "Full Apron With Pocket", "Accessories", "Full-coverage apron with added on-the-job storage.", "Black Polo Shirt.jpg", ["Black", "White", "Striped"]],
  ["F8-016", "Half Apron", "Accessories", "Lightweight waist apron for quick-service environments.", "Black Polo Shirt.jpg", ["Black", "White", "Striped"]],
  ["F8-017", "Half Apron With Pocket", "Accessories", "Practical waist apron with built-in storage.", "Black Polo Shirt.jpg", ["Black", "White", "Striped"]],
  ["F8-018", "T-shirt", "Top Wear", "Everyday essential for casual team uniforms.", "White Polo Shirt.png", ["Black", "White", "Navy", "Burgundy"]],
  ["F8-019", "Oversized T-shirt", "Top Wear", "Relaxed, modern fit for a trend-forward team look.", "White Polo Shirt.png", ["Black", "White", "Custom Colors"]],
  ["F8-020", "Dri-Fit T-shirt", "Top Wear", "Moisture-wicking tee for active or outdoor roles.", "White Polo Shirt.png", ["Black", "White", "Blue", "Green"]],
  ["F8-021", "Dri-Fit Polo", "Top Wear", "Performance polo for active, client-facing teams.", "Black Polo Shirt.jpg", ["Black", "White", "Blue", "Green"]],
  ["F8-022", "Shirts", "Top Wear", "Versatile button-up for a polished corporate look.", "White Shirt.png", ["Black", "White", "Grey", "Navy"]],
  ["F8-023", "Hoodie", "Top Wear", "Comfortable layer for casual or outdoor work settings.", "assets/fabric8-fashion-hero.png", ["Black", "White", "Navy", "Charcoal"]],
  ["F8-024", "Zip-up Hoodie", "Top Wear", "Easy-layer hoodie for year-round versatility.", "assets/fabric8-fashion-hero.png", ["Black", "White", "Navy", "Charcoal"]],
  ["F8-025", "Puffer Jacket", "Outer Wear", "Insulated outerwear for cold-weather work environments.", "assets/fabric8-fashion-hero.png", ["Black"]]
].map(([sku, name, category, short, image, colors]) => ({
  sku,
  name,
  category,
  short,
  image,
  colors,
  sizes: ["XS", "S", "M", "L", "XL", "2XL"]
}));

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
  Green: "#2f873d",
  Red: "#b7342b",
  Beige: "#cbb99d",
  Charcoal: "#3a3d3d",
  Burgundy: "#6e1f32",
  Blue: "#2f6fb3",
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

  if (categoryFilter.options.length === 1) {
    categoryFilter.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
    if (categories.includes("Top Wear")) categoryFilter.value = "Top Wear";
  }

  const cat = categoryFilter.value;
  const filtered = products.filter((p) => p.category === cat);
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
      <strong>${item.name}</strong>
      <p>${item.sku} | Qty ${item.quantity} | ${item.color || "Color TBD"} | ${item.branding || "No branding selected"}</p>
      <button type="button" data-remove="${index}">Remove</button>
    </div>
  `).join("");
}

function addToCart(sku) {
  const product = products.find((p) => p.sku === sku);
  const quantity = Math.max(1, Number($("#productQuantity")?.value || 50));
  cart.push({ sku, name: product.name, quantity, color: activeCatalogColor });
  saveCart();
  renderCart();
  location.hash = "quote";
}

function setupStudio() {
  const shirt = $("#studioShirt");
  if (!shirt) return;
  shirt.dataset.color = "white";
  const studioColors = ["White", "Black", "Navy", "Grey", "Green", "Red"];
  $("#studioColorSwatches").innerHTML = studioColors.map((c) => colorButton(c)).join("");
  $("#studioColorSwatches").querySelector('[data-color="White"]').classList.add("active");
  $("#placementSelect").addEventListener("change", (event) => { $("#logoPreview").className = `logo-preview ${event.target.value}`; });
  $("#logoSize").addEventListener("input", (event) => {
    $("#logoPreview").style.setProperty("--logo-size", `${event.target.value}%`);
  });
  $("#logoUpload").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { $("#logoPreview").innerHTML = `<img src="${reader.result}" alt="Uploaded logo" />`; };
    reader.readAsDataURL(file);
  });
  $("#addStudioQuote").addEventListener("click", () => {
    cart.push({
      sku: "F8-BRAND",
      name: "Branded uniform mockup",
      quantity: 50,
      color: activeStudioColor,
      branding: `${$("#finishSelect").value}, ${$("#placementSelect").selectedOptions[0].textContent}`
    });
    saveCart();
    renderCart();
    location.hash = "quote";
  });
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  const colorDot = event.target.closest(".color-dot");
  const addSelected = event.target.closest("#addSelectedProduct");
  if (add) addToCart(add.dataset.add);
  if (addSelected) addToCart(selectedProductSku);
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
  ["#categoryFilter", "#productSelect"].forEach((selector) => {
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

$("#quoteForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const lines = [...data.entries()].map(([key, value]) => `${key}: ${value}`);
  lines.push("\nSelected products:");
  lines.push(cart.map((item) => `- ${item.name} (${item.sku}) Qty: ${item.quantity} ${item.color || ""} ${item.branding || ""}`).join("\n") || "No products selected.");
  location.href = `mailto:hello@thefabric8.com?subject=${encodeURIComponent("Fabric8 Quote Request")}&body=${encodeURIComponent(lines.join("\n"))}`;
});

renderProducts();
renderCart();
setupStudio();
