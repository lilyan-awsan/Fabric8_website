const products = [
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
].map(p => ({
  ...p,
  fabric: "Premium Poly-Cotton Blend",
  gsm: "180-220 GSM",
  moq: "50 pieces",
  leadTime: "14-21 Business Days",
  care: "Machine wash cold, do not bleach.",
  branding: "Embroidery, Screen Print, Heat Transfer",
  availability: "In Stock",
  image: p.image || "White Polo Shirt.png",
  colors: p.colors || ["Black", "White"]
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
    sizeSelect.innerHTML = '<option value="">Select a size...</option>';
    if (selected.sizes && Array.isArray(selected.sizes)) {
      selected.sizes.forEach(size => {
        const opt = document.createElement("option");
        opt.value = size;
        opt.textContent = size;
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

renderProducts();
renderCart();
setupStudio();
