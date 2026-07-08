const baseProducts = [
  {
    sku: "F8-001",
    name: "Polo Shirt",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Classic corporate polo, clean and professional.",
    long: "A tailored, comfortable polo shirt made from durable cotton or cotton-blend fabric. Reinforced collar and cuffs hold their shape through repeated washing, making it ideal for daily corporate wear.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Navy", "Grey", "Turquoise Blue", "Pink", "Brown", "Baby Blue", "Olive Green", "Orange", "Yellow", "Green", "Red", "Charcoal", "Blue", "Purple"],
    gender: "Men / Women / Unisex",
    image: "White Polo Shirt.png"
  },
  {
    sku: "F8-002",
    name: "Waiter Vest",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Sleek, lightweight vest for front-of-house staff.",
    long: "A slim-fit vest designed for restaurant and hospitality teams. Offers a professional silhouette over a dress shirt while allowing full range of motion for serving.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-003",
    name: "Cargo Vest",
    category: "Top Wear",
    sectors: "Hospitality, Corporate, Healthcare, Industrial, Aviation",
    short: "Rugged utility vest with functional storage.",
    long: "Built for staff who need hands-free storage on the job, with secure pockets for tools, phones, and equipment.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Beige", "Navy"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-004",
    name: "Chef Hat",
    category: "Head Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Traditional toque for a professional kitchen image.",
    long: "A classic pleated chef hat that keeps kitchen staff cool while signaling culinary professionalism.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-005",
    name: "Chef Beret",
    category: "Head Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Modern, low-profile alternative to the toque.",
    long: "A soft, flat-topped kitchen cap offering a contemporary look for culinary teams.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-006",
    name: "Chef Bandana",
    category: "Head Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Practical head covering for active kitchen staff.",
    long: "A tie-back bandana that keeps hair contained and sweat away from the face during high-heat kitchen work.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["White", "Black", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-007",
    name: "Lab Coats",
    category: "Outer Wear",
    sectors: "Healthcare",
    short: "Crisp, professional coats for healthcare teams.",
    long: "A knee-length lab coat designed for clinical and laboratory environments, with durable easy-care fabric and convenient pockets.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-008",
    name: "Cargo Pants",
    category: "Bottom Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Durable, functional pants for on-the-go teams.",
    long: "Rugged pants with utility pockets and reinforced stitching for facilities, warehouse, or maintenance staff.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Charcoal", "Beige", "Navy"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-009",
    name: "Workwear / Waiter Pants",
    category: "Bottom Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Polished, comfortable pants for service staff.",
    long: "A versatile pant designed for all-day wear in hospitality and service settings, with wrinkle-resistant fabric and comfortable movement.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Charcoal", "Beige", "Navy"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-010",
    name: "Caps",
    category: "Head Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Adjustable branded cap for outdoor or retail teams.",
    long: "A structured cap that provides sun protection and a cohesive team look, easily customized with embroidery.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Red", "Navy", "Green", "Burgundy", "Light Grey", "Charcoal", "Yellow", "Brown"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-011",
    name: "Chef Jackets",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Signature double-breasted jacket for culinary professionals.",
    long: "A durable, heat-resistant jacket featuring the classic double-breasted design and breathable reinforced construction.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-012",
    name: "Scrubs",
    category: "Top Wear",
    sectors: "Healthcare",
    short: "Comfortable, easy-care scrubs for clinical teams.",
    long: "A two-piece top-and-pant set made from soft, breathable, easy-care fabric suited to long clinical shifts.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Navy", "Burgundy", "Charcoal", "Ocean Blue", "White", "Baby Blue", "Olive Green"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-013",
    name: "Chef Pants",
    category: "Bottom Wear",
    sectors: "Food and beverage, Hospitality",
    short: "Comfortable, durable pants built for the kitchen.",
    long: "Loose-fit pants designed for comfort and safety in hot kitchen environments with durable stain-resistant fabric.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Striped", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-014",
    name: "Full Apron",
    category: "Accessories",
    sectors: "Food and beverage, Hospitality, Corporate, Industrial",
    short: "Classic full-coverage apron for kitchen and service staff.",
    long: "A durable apron covering chest to knees, secured with adjustable neck and waist ties for a comfortable fit.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Striped", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-015",
    name: "Full Apron With Pocket",
    category: "Accessories",
    sectors: "Food and beverage, Hospitality, Corporate, Industrial",
    short: "Full-coverage apron with added on-the-job storage.",
    long: "A full protective apron with a front pocket for order pads, tools, or a phone.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Striped", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-016",
    name: "Half Apron",
    category: "Accessories",
    sectors: "Food and beverage, Hospitality",
    short: "Lightweight waist apron for quick-service environments.",
    long: "A waist-down apron that offers essential protection without bulk for counter service, baristas, and retail staff.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Striped", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-017",
    name: "Half Apron With Pocket",
    category: "Accessories",
    sectors: "Food and beverage, Hospitality",
    short: "Practical waist apron with built-in storage.",
    long: "A lightweight waist apron with a front pocket for order pads, cash, or small tools.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Striped", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-018",
    name: "T-shirt",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Everyday essential for casual team uniforms.",
    long: "A soft, breathable cotton tee ideal for casual work environments, events, or team apparel programs.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Navy", "Burgundy", "Baby Blue", "American Blue", "Army Green", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-019",
    name: "Oversized T-shirt",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Relaxed, modern fit for a trend-forward team look.",
    long: "A loose, oversized tee that offers a contemporary silhouette for casual or streetwear-inspired uniform programs.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-020",
    name: "Dri-Fit T-shirt",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Moisture-wicking tee for active or outdoor roles.",
    long: "Engineered with quick-dry fabric technology to keep employees cool during physically demanding or outdoor work.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Blue", "Baby Blue", "Yellow", "Green", "Red", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-021",
    name: "Dri-Fit Polo",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Performance polo for active, client-facing teams.",
    long: "A professional polo silhouette with moisture-wicking performance fabric for active or outdoor staff.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Blue", "Baby Blue", "Yellow", "Green", "Red", "Custom Colors"],
    gender: "Men / Women / Unisex",
    image: "Black Polo Shirt.jpg"
  },
  {
    sku: "F8-022",
    name: "Shirts",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Versatile button-up for a polished corporate look.",
    long: "A clean, professional button-up shirt suited for office, retail, or client-facing roles.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Grey", "Navy", "Baby Blue"],
    gender: "Men / Women / Unisex",
    image: "White Shirt.png"
  },
  {
    sku: "F8-023",
    name: "Hoodie",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education",
    short: "Comfortable layer for casual or outdoor work settings.",
    long: "A soft, heavyweight hoodie offering warmth and comfort for cooler environments or casual team apparel.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Navy", "Charcoal", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-024",
    name: "Zip-up Hoodie",
    category: "Top Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education",
    short: "Easy-layer hoodie for year-round versatility.",
    long: "A full-zip hoodie with easy on/off wear over uniforms, durable fabric, and a relaxed fit.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Navy", "Charcoal", "Custom Colors"],
    gender: "Men / Women / Unisex"
  },
  {
    sku: "F8-025",
    name: "Puffer Jacket",
    category: "Outer Wear",
    sectors: "Food and beverage, Hospitality, Corporate, Healthcare, Industrial, Education, Aviation",
    short: "Insulated outerwear for cold-weather work environments.",
    long: "A lightweight quilted jacket with water-resistant fabric and insulated construction for outdoor or cold conditions.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["Black"],
    gender: "Men / Women / Unisex"
  }
];

const els = {
  productGrid: document.querySelector("#productGrid"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  genderFilter: document.querySelector("#genderFilter"),
  colorFilter: document.querySelector("#colorFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  cartCount: document.querySelector("#cartCount"),
  cartItems: document.querySelector("#cartItems"),
  clearCart: document.querySelector("#clearCart"),
  quoteForm: document.querySelector("#quoteForm"),
  menuToggle: document.querySelector(".menu-toggle"),
  studioShirt: document.querySelector("#studioShirt"),
  logoPreview: document.querySelector("#logoPreview"),
  logoUpload: document.querySelector("#logoUpload"),
  logoFileName: document.querySelector("#logoFileName"),
  studioGarmentName: document.querySelector("#studioGarmentName"),
  studioPlacementName: document.querySelector("#studioPlacementName"),
  finishSelect: document.querySelector("#finishSelect"),
  addStudioQuote: document.querySelector("#addStudioQuote"),
  adminLogin: document.querySelector("#adminLogin"),
  adminPanel: document.querySelector("#adminPanel"),
  adminPassword: document.querySelector("#adminPassword"),
  adminUnlock: document.querySelector("#adminUnlock"),
  adminLock: document.querySelector("#adminLock"),
  adminMessage: document.querySelector("#adminMessage"),
  addProductForm: document.querySelector("#addProductForm"),
  passwordForm: document.querySelector("#passwordForm"),
  newAdminPassword: document.querySelector("#newAdminPassword"),
  clearCustomProducts: document.querySelector("#clearCustomProducts")
};

const heroSlides = [
  {
    kicker: "New uniform collection",
    title: "Corporate Couture",
    subtitle: "A fashion-led approach to uniforms, branding, and team image wear.",
    button: "Shop",
    target: "#catalog"
  },
  {
    kicker: "Branding Atelier",
    title: "Make a Statement",
    subtitle: "Upload your logo, choose placement, and preview the garment before quote.",
    button: "Design",
    target: "#studio"
  },
  {
    kicker: "The Fabric8 Method",
    title: "Forming Excellence",
    subtitle: "Eight steps from consultation and fabric selection to production and after-sales.",
    button: "Discover",
    target: "#method"
  }
];
let heroSlideIndex = 0;

const customProducts = JSON.parse(localStorage.getItem("fabric8CustomProducts") || "[]");
let products = [...baseProducts, ...customProducts];
const cart = JSON.parse(localStorage.getItem("fabric8QuoteCart") || "[]");
const studioGarments = {
  "white-polo": { name: "White Polo Shirt", sku: "F8-001", image: "White Polo Shirt.png" },
  "black-polo": { name: "Black Polo Shirt", sku: "F8-001", image: "Black Polo Shirt.jpg" },
  "white-shirt": { name: "White Dress Shirt", sku: "F8-022", image: "White Shirt.png" }
};
const placements = {
  "left-chest": "Left chest embroidery",
  "center-chest": "Center chest print",
  "right-sleeve": "Right sleeve mark",
  "back-large": "Large back print"
};
const studioState = {
  garment: "white-polo",
  placement: "left-chest",
  logoName: "No logo uploaded"
};

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function optionMarkup(value) {
  return `<option value="${value}">${value}</option>`;
}

function populateFilters() {
  const selectedCategory = els.categoryFilter.value || "all";
  const selectedColor = els.colorFilter.value || "all";
  els.categoryFilter.innerHTML = `<option value="all">All categories</option>`;
  els.colorFilter.innerHTML = `<option value="all">All colors</option>`;

  unique(products.map((product) => product.category)).forEach((category) => {
    els.categoryFilter.insertAdjacentHTML("beforeend", optionMarkup(category));
  });

  unique(products.flatMap((product) => product.colors)).forEach((color) => {
    els.colorFilter.insertAdjacentHTML("beforeend", optionMarkup(color));
  });

  els.categoryFilter.value = [...els.categoryFilter.options].some((option) => option.value === selectedCategory) ? selectedCategory : "all";
  els.colorFilter.value = [...els.colorFilter.options].some((option) => option.value === selectedColor) ? selectedColor : "all";
}

function productImage(product) {
  if (product.image) {
    return `
      <div class="product-image">
        <span class="product-badge">Price on request</span>
        ${product.custom ? `<span class="custom-product-tag">New</span>` : ""}
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
    `;
  }

  return `
    <div class="product-image placeholder">
      <span class="product-badge">Price on request</span>
      ${product.custom ? `<span class="custom-product-tag">New</span>` : ""}
      <div class="placeholder-shape" aria-hidden="true"></div>
    </div>
  `;
}

function renderProducts() {
  const term = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const gender = els.genderFilter.value;
  const color = els.colorFilter.value;

  let filtered = products.filter((product) => {
    const haystack = [
      product.sku,
      product.name,
      product.category,
      product.sectors,
      product.short,
      product.long,
      product.gender,
      product.colors.join(" ")
    ].join(" ").toLowerCase();

    return (
      (!term || haystack.includes(term)) &&
      (category === "all" || product.category === category) &&
      (gender === "all" || product.gender.includes(gender)) &&
      (color === "all" || product.colors.includes(color))
    );
  });

  if (els.sortSelect.value === "az") {
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (els.sortSelect.value === "za") {
    filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  els.productGrid.innerHTML = filtered
    .map((product) => {
      const colorOptions = product.colors.slice(0, 4).map((value) => `<span class="color-chip">${value}</span>`).join("");
      return `
        <article class="product-card">
          ${productImage(product)}
          <div class="product-body">
            <div>
              <p class="eyebrow">${product.sku} / ${product.category}</p>
              <h3>${product.name}</h3>
            </div>
            <p>${product.short}</p>
            <div class="product-meta">
              <span>${product.sizes.join(", ")}</span>
              <span>${product.gender}</span>
              <span>Available / made to order</span>
            </div>
            <div class="product-meta">${colorOptions}</div>
            <div class="product-actions">
              <input class="qty-input" id="qty-${product.sku}" type="number" min="1" value="50" aria-label="Quantity for ${product.name}" />
              <button class="btn primary" type="button" data-add="${product.sku}">Add to Quote</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (!filtered.length) {
    els.productGrid.innerHTML = `<p class="cart-empty">No products match the current filters.</p>`;
  }
}

function saveCart() {
  localStorage.setItem("fabric8QuoteCart", JSON.stringify(cart));
}

function addToCart(sku) {
  const product = products.find((item) => item.sku === sku);
  const qtyInput = document.querySelector(`#qty-${sku}`);
  const quantity = Math.max(1, Number(qtyInput?.value || 1));
  const existing = cart.find((item) => item.sku === sku);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      sku: product.sku,
      name: product.name,
      quantity,
      size: product.sizes[0],
      color: product.colors[0]
    });
  }

  saveCart();
  renderCart();
  document.querySelector("#quote").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCart() {
  els.cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!cart.length) {
    els.cartItems.innerHTML = `<p class="cart-empty">Your quote cart is empty. Add products from the catalog to begin.</p>`;
    return;
  }

  els.cartItems.innerHTML = cart
    .map((item, index) => {
      const product = products.find((productItem) => productItem.sku === item.sku);
      return `
        <div class="cart-item">
          <strong>${item.name}</strong>
          <span>${item.sku}</span>
          ${item.branding ? `<span>${item.branding}</span>` : ""}
          <div class="cart-item-row">
            <select data-cart-size="${index}" aria-label="Size for ${item.name}">
              ${product.sizes.map((size) => `<option ${size === item.size ? "selected" : ""}>${size}</option>`).join("")}
            </select>
            <input type="number" min="1" value="${item.quantity}" data-cart-qty="${index}" aria-label="Quantity for ${item.name}" />
          </div>
          <select data-cart-color="${index}" aria-label="Color for ${item.name}">
            ${product.colors.map((color) => `<option ${color === item.color ? "selected" : ""}>${color}</option>`).join("")}
          </select>
          <button type="button" data-remove="${index}">Remove</button>
        </div>
      `;
    })
    .join("");
}

function cartSummary() {
  if (!cart.length) return "No products selected.";
  return cart
    .map((item) => {
      const branding = item.branding ? ` | Branding: ${item.branding}` : "";
      const logo = item.logoName ? ` | Logo file: ${item.logoName}` : "";
      return `- ${item.name} (${item.sku}) | Qty: ${item.quantity} | Size: ${item.size} | Color: ${item.color}${branding}${logo}`;
    })
    .join("\n");
}

function updateStudioPreview() {
  const garment = studioGarments[studioState.garment];
  els.studioShirt.src = garment.image;
  els.studioShirt.alt = `${garment.name} preview`;
  els.studioGarmentName.textContent = garment.name;
  els.studioPlacementName.textContent = placements[studioState.placement];
  els.logoPreview.className = `logo-preview ${studioState.placement}${studioState.logoName === "No logo uploaded" ? " empty" : ""}`;
}

function addStudioToQuote() {
  const garment = studioGarments[studioState.garment];
  cart.push({
    sku: garment.sku,
    name: `${garment.name} - branded mockup`,
    quantity: 50,
    size: "M",
    color: garment.name.includes("Black") ? "Black" : "White",
    branding: `${els.finishSelect.value}, ${placements[studioState.placement]}`,
    logoName: studioState.logoName
  });
  saveCart();
  renderCart();
  document.querySelector("#quote").scrollIntoView({ behavior: "smooth", block: "start" });
}

function currentAdminPassword() {
  return localStorage.getItem("fabric8AdminPassword") || "fabric8";
}

function setAdminOpen(isOpen) {
  els.adminLogin.hidden = isOpen;
  els.adminPanel.hidden = !isOpen;
  els.adminMessage.textContent = "";
}

function saveCustomProducts() {
  localStorage.setItem("fabric8CustomProducts", JSON.stringify(customProducts));
  products = [...baseProducts, ...customProducts];
  populateFilters();
  renderProducts();
}

function unlockAdmin() {
  if (els.adminPassword.value === currentAdminPassword()) {
    setAdminOpen(true);
    els.adminPassword.value = "";
    return;
  }

  els.adminMessage.textContent = "Wrong password. Try fabric8 unless you changed it.";
}

function addCustomProduct(event) {
  event.preventDefault();
  const data = new FormData(els.addProductForm);
  const name = String(data.get("name")).trim();
  if (!name) return;

  const sku = `F8-C${String(customProducts.length + 1).padStart(3, "0")}`;
  customProducts.push({
    sku,
    name,
    category: String(data.get("category")),
    sectors: "Custom uniform program",
    short: String(data.get("short")).trim(),
    long: "Custom added product for quote preview. Final specifications can be confirmed during consultation.",
    sizes: String(data.get("sizes") || "XS, S, M, L, XL, 2XL").split(",").map((item) => item.trim()).filter(Boolean),
    colors: String(data.get("colors") || "Custom Colors").split(",").map((item) => item.trim()).filter(Boolean),
    gender: "Men / Women / Unisex",
    image: String(data.get("image")),
    custom: true
  });

  saveCustomProducts();
  els.addProductForm.reset();
  document.querySelector("#catalog").scrollIntoView({ behavior: "smooth", block: "start" });
}

function changeAdminPassword(event) {
  event.preventDefault();
  const nextPassword = els.newAdminPassword.value.trim();
  if (nextPassword.length < 4) return;
  localStorage.setItem("fabric8AdminPassword", nextPassword);
  els.newAdminPassword.value = "";
  alert("Admin password changed for this browser.");
}

function setHeroSlide(index) {
  heroSlideIndex = index;
  const slide = heroSlides[index];
  document.querySelector("#heroKicker").textContent = slide.kicker;
  document.querySelector("#heroTitle").textContent = slide.title;
  document.querySelector("#heroSubtitle").textContent = slide.subtitle;
  const heroButton = document.querySelector("#heroButton");
  heroButton.textContent = slide.button;
  heroButton.href = slide.target;
  document.querySelectorAll("[data-hero-dot]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.heroDot) === index);
  });
}

function submitQuote(event) {
  event.preventDefault();
  const formData = new FormData(els.quoteForm);
  const lines = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.name) lines.push(`${key}: ${value.name}`);
    } else {
      lines.push(`${key}: ${value || "N/A"}`);
    }
  }

  lines.push("\nSelected products:");
  lines.push(cartSummary());

  const subject = encodeURIComponent("Fabric8 Quote Request");
  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:hello@thefabric8.com?subject=${subject}&body=${body}`;
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const removeButton = event.target.closest("[data-remove]");
  const navLink = event.target.closest(".main-nav a");
  const heroDot = event.target.closest("[data-hero-dot]");

  if (addButton) addToCart(addButton.dataset.add);
  if (heroDot) setHeroSlide(Number(heroDot.dataset.heroDot));

  if (removeButton) {
    cart.splice(Number(removeButton.dataset.remove), 1);
    saveCart();
    renderCart();
  }

  if (navLink) {
    document.body.classList.remove("nav-open");
    els.menuToggle?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  const garmentButton = event.target.closest("[data-garment]");
  const placementButton = event.target.closest("[data-placement]");

  if (garmentButton) {
    document.querySelectorAll(".studio-choice").forEach((button) => button.classList.remove("active"));
    garmentButton.classList.add("active");
    studioState.garment = garmentButton.dataset.garment;
    updateStudioPreview();
  }

  if (placementButton) {
    document.querySelectorAll(".placement-option").forEach((button) => button.classList.remove("active"));
    placementButton.classList.add("active");
    studioState.placement = placementButton.dataset.placement;
    updateStudioPreview();
  }
});

els.cartItems.addEventListener("input", (event) => {
  const qtyIndex = event.target.dataset.cartQty;
  if (qtyIndex !== undefined) {
    cart[Number(qtyIndex)].quantity = Math.max(1, Number(event.target.value || 1));
    saveCart();
    renderCart();
  }
});

els.cartItems.addEventListener("change", (event) => {
  const sizeIndex = event.target.dataset.cartSize;
  const colorIndex = event.target.dataset.cartColor;

  if (sizeIndex !== undefined) cart[Number(sizeIndex)].size = event.target.value;
  if (colorIndex !== undefined) cart[Number(colorIndex)].color = event.target.value;
  saveCart();
});

["input", "change"].forEach((eventName) => {
  [els.searchInput, els.categoryFilter, els.genderFilter, els.colorFilter, els.sortSelect].forEach((element) => {
    element.addEventListener(eventName, renderProducts);
  });
});

els.clearCart.addEventListener("click", () => {
  cart.splice(0, cart.length);
  saveCart();
  renderCart();
});

els.quoteForm.addEventListener("submit", submitQuote);
els.addStudioQuote.addEventListener("click", addStudioToQuote);
els.adminUnlock.addEventListener("click", unlockAdmin);
els.adminPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") unlockAdmin();
});
els.adminLock.addEventListener("click", () => setAdminOpen(false));
els.addProductForm.addEventListener("submit", addCustomProduct);
els.passwordForm.addEventListener("submit", changeAdminPassword);
els.clearCustomProducts.addEventListener("click", () => {
  customProducts.splice(0, customProducts.length);
  saveCustomProducts();
});

els.logoUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  studioState.logoName = file.name;
  els.logoFileName.textContent = file.name;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    els.logoPreview.innerHTML = `<img src="${reader.result}" alt="Uploaded logo preview" />`;
    updateStudioPreview();
  });
  reader.readAsDataURL(file);
});

els.menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  els.menuToggle.setAttribute("aria-expanded", String(isOpen));
});

populateFilters();
renderProducts();
renderCart();
updateStudioPreview();
setHeroSlide(0);
setInterval(() => {
  setHeroSlide((heroSlideIndex + 1) % heroSlides.length);
}, 5000);
