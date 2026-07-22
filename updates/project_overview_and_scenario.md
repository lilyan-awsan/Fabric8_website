# Fabric-8 Project Overview & User Scenario

This document provides a comprehensive, detailed breakdown of everything currently implemented in the **Fabric-8 Website** project. You can use this report to cross-reference with your initial requirements file and verify if all scoped features have been accurately implemented.

## 1. Project Architecture & Tech Stack

The project is built as a static/vanilla web application with a lightweight backend integration for administrative and quoting purposes.

- **Frontend Core**: Vanilla HTML5, CSS3, and JavaScript (`site.js`, `admin.js`).
- **Styling**: Custom CSS (`site.css`, `admin.css`) utilizing modern design aesthetics (glassmorphism, CSS variables, responsive grids, and Montserrat typography). No heavy CSS frameworks (like Tailwind or Bootstrap) are used, ensuring maximum customization.
- **Data Source**: Initially loading product data from `data/products.json`.
- **Backend / Services**: 
  - **Firebase**: References to Firebase SDK exist for administrative data management (Products database).
  - **Quote API**: Form submissions attempt to POST to a backend endpoint (`/api/sendQuote`). If it fails, a robust fallback mechanism triggers a `mailto:` link and displays an on-screen email draft modal for the user.

## 2. Directory Structure & Key Files

### Core Pages (HTML)
- **`index.html` (Home)**: Features an animated "royal door" entrance, a fashion hero slider, editorial grids showcasing product categories (Polos, Shirts), and navigation.
- **`shop.html` (Catalog & Quoting)**: The most complex page. Contains the product catalog, filtering system, product details modal, "Branding Atelier" (logo upload), "Text Wizard Modal" (custom embroidery setup), and the Quote Cart form.
- **`admin.html` (Dashboard)**: A secured portal for administrators to add, edit, and delete products dynamically.
- **Informational Pages**: `about.html`, `services.html`, `sectors.html`, `method.html`, `contact.html`, `privacy.html`, `terms.html`.

### Assets & Data
- **`data/products.json`**: Contains a rich array of ~25 pre-configured products with details like SKU, name, descriptions, sizes, colors, MOQ, GSM, fabric, and availability.
- **`assets/` & Images**: Contains logos, product images (e.g., White Polo Shirt, Chef Hats, Scrubs, Puffer Jackets), and PDFs (`Fabric 8_Company Profile.pdf`).

## 3. Detailed Feature Breakdown

### A. The Catalog & Shop (`shop.html`)
- **Grid & Filtering**: Users can search by SKU/Name, filter by Category (Top Wear, Bottom Wear, Head Wear, etc.), and sort (A-Z, Z-A).
- **Product Modal**: Clicking a product opens a detailed modal showing:
  - Image gallery/slideshow with thumbnails.
  - Metadata: Fabric, GSM, MOQ (Minimum Order Quantity), Lead Time, Availability.
  - Interactive Size and Color selection (visual color swatches).
  - Customization options: Add Blank, Upload Logo, or Text Embroidery.

### B. The Branding Atelier (Logo Upload)
- Users can upload an image file of their logo.
- Interactive positioning on a 2D mockup (Left Chest, Right Chest, Center, Sleeve).
- Adjust logo size via a slider.
- Select finish type (Embroidery, Screen printing, Heat transfer).
- Includes a mandatory legal copyright disclaimer checkbox before adding to cart.

### C. Text Customization Wizard
- A step-by-step modal to build custom text embroidery (Direct or Emblem/Patch).
- Allows font style selection (Block, Script, Athletic, etc.), thread color, background/border colors (for patches), and number of lines.
- Live preview on the shirt mockup.

### D. The Quote Cart System
- **No Online Prices**: The site is explicitly built for B2B/Bulk quoting.
- Cart summarizes selected items, sizes, colors, quantities, and applied branding.
- **Checkout Form**: Captures full name, company, industry, delivery date, shipping/billing addresses, and allows a file upload (e.g., tech pack or logo).
- **Submission Fallback**: If the `/api/sendQuote` endpoint fails, the system automatically generates an email draft and displays it in a modal so the user can easily copy it or send it via their native email client.

### E. Admin Dashboard (`admin.html`)
- **Login Screen**: Simple password-protected gateway.
- **Product Management**: 
  - Table view of all products with search and category filters.
  - Modal to add/edit products, defining SKUs, Categories, Gender, Sectors, Descriptions, Sizes, Colors, GSM, MOQ, Lead Time, and Image uploads.

---

## 4. End-to-End User Scenario (The Customer Journey)

Here is a step-by-step walkthrough of how a customer interacts with the platform. You can compare this journey with your requirement file's expected user flows.

1. **Arrival & Introduction**:
   - *Action*: The customer lands on `index.html`.
   - *Experience*: They are greeted by an elegant "door opening" animation revealing the Fabric-8 logo and the tagline "Uniforms, Solved." They scroll down to see high-quality imagery of polo programs and button-ups.

2. **Browsing the Catalog**:
   - *Action*: The customer clicks "CHECK OUT OUR NEW COLLECTIONS" and is routed to `shop.html`.
   - *Experience*: They see a grid of products. They use the sidebar to filter by "Top Wear" and search for "Polo". They click on the "Polo Shirt" (SKU: F8-001).

3. **Configuring the Product**:
   - *Action*: The Product Modal opens.
   - *Experience*: The customer reads the specifications (Premium Poly-Cotton Blend, 180-220 GSM). They select Size "L", Color "Navy", and set the quantity to 150 (above the 50 MOQ).
   - *Decision*: They decide to add their company logo, so they click the **Upload Logo** customization card, and then click **Next: Upload Logo**.

4. **The Branding Atelier**:
   - *Action*: The customer is taken to the Branding section.
   - *Experience*: They upload their company's PNG logo. They see it appear on a Navy Polo mockup. They use the dropdown to set placement to "Left chest", adjust the size slider, and select "Embroidery" as the finish.
   - *Action*: They check the legal disclaimer box and click **Add to Quote Cart**.

5. **Submitting the Quote**:
   - *Action*: The page scrolls down to the Quote Request section.
   - *Experience*: The cart correctly shows "150 Navy Polo Shirts, Size L, Left Chest Embroidery". 
   - *Action*: The customer fills out their contact details, selects "Corporate" as their industry, inputs their required delivery date, and clicks **Submit Quote Request**.
   - *Result*: The request is successfully sent to the Fabric-8 team. (If there was a server issue, a helpful modal pops up with a pre-written email draft they can copy and send).

6. **Behind the Scenes (Admin)**:
   - *Action*: Later, a Fabric-8 administrator logs into `admin.html`.
   - *Experience*: They review their product database, decide to add a new "Summer Cap", fill out the metadata, upload an image, and save. The new product immediately becomes available for future customers on the shop page.

---
**Summary for Comparison**: Review this document against your requirements. The key pillars (No-price quoting, Custom Logo Upload, Custom Text Embroidery, Cart Management, Fallback Email system, and Admin Product Management) are fully implemented and functional based on the current codebase.
