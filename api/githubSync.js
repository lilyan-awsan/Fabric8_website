export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { token, action, product, newImages, pendingSiteImages } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD;
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!adminPass || !githubToken) {
    return res.status(500).json({ success: false, message: 'Server missing Environment Variables.' });
  }

  if (token !== adminPass) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const repo = "lilyan-awsan/Fabric8_website";
  const jsonPath = "data/products.json";

  try {
    // Immediate handler for save_html action to avoid unnecessary products.json fetches
    if (action === "save_html") {
      const { filename, htmlContent, siteImages } = req.body;
      
      let finalHtml = htmlContent;
      if (siteImages && Array.isArray(siteImages)) {
        for (const img of siteImages) {
          if (img && img.base64 && img.name) {
            const ext = img.name.split('.').pop() || 'png';
            const imgPath = `assets/site_images/${Date.now()}_img.${ext}`;
            const imgRes = await fetch(`https://api.github.com/repos/${repo}/contents/${imgPath}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${githubToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `Upload visual editor image ${img.name}`,
                content: img.base64.split(',')[1]
              })
            });
            if (imgRes.ok) {
              finalHtml = finalHtml.split(img.base64).join(imgPath);
            }
          }
        }
      }

      let currentHtmlSha = null;
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`, {
          headers: { 'Authorization': `Bearer ${githubToken}` }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          currentHtmlSha = fileData.sha;
        }
      } catch (e) {}

      const newContentBase64 = Buffer.from(finalHtml).toString('base64');
      const bodyPayload = {
        message: `Visual Editor update to ${filename}`,
        content: newContentBase64
      };
      if (currentHtmlSha) bodyPayload.sha = currentHtmlSha;

      const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${githubToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error("Failed to save HTML to server: " + err.message);
      }
      return res.status(200).json({ success: true, message: 'HTML layout saved successfully' });
    }

    // 1. If there are new images or sketch attachments, upload them to GitHub first
    let finalImages = product?.existingImages || [];
    
    if (newImages && Array.isArray(newImages) && newImages.length > 0) {
      for (const img of newImages) {
        if (img.base64 && img.name) {
          const imgPath = `assets/products/${Date.now()}_${img.name.replace(/\s+/g, '_')}`;
          const imgRes = await fetch(`https://api.github.com/repos/${repo}/contents/${imgPath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Upload image for ${product.sku}`,
              content: img.base64.split(',')[1]
            })
          });
          if (!imgRes.ok) {
            const err = await imgRes.json();
            throw new Error("Failed to upload image: " + err.message);
          }
          finalImages.push(imgPath);
        }
      }
    }

    if (product?.sketchBase64 && product?.sketchName) {
      const sketchPath = `assets/products/${Date.now()}_sketch_${product.sketchName.replace(/\s+/g, '_')}`;
      const skRes = await fetch(`https://api.github.com/repos/${repo}/contents/${sketchPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Upload technical sketch for ${product.sku || 'SKU'}`,
          content: product.sketchBase64.split(',')[1]
        })
      });
      if (skRes.ok) {
        product.sketch = sketchPath;
      }
      delete product.sketchBase64;
      delete product.sketchName;
    }


    // 2. Fetch the current products.json to get its SHA and content
    const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${jsonPath}`, {
      headers: { 'Authorization': `Bearer ${githubToken}` }
    });
    
    if (!fileRes.ok) throw new Error("Could not read database from server");
    const fileData = await fileRes.json();
    const currentSha = fileData.sha;
    
    // Decode current content
    const contentStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
    let productsList = JSON.parse(contentStr);

    // 3. Apply the action
    if (action === "save_settings") {
      if (pendingSiteImages && typeof pendingSiteImages === 'object') {
        for (const [key, img] of Object.entries(pendingSiteImages)) {
          if (img && img.base64 && img.name) {
            const imgPath = `assets/site_images/${Date.now()}_${key}_${img.name.replace(/\s+/g, '_')}`;
            const imgRes = await fetch(`https://api.github.com/repos/${repo}/contents/${imgPath}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `Upload site asset for ${key}`,
                content: img.base64.split(',')[1]
              })
            });
            if (imgRes.ok) {
              if (product && product.siteContent) {
                product.siteContent[key] = imgPath;
              }
            } else {
              const err = await imgRes.json();
              throw new Error(`Failed to upload site graphic (${key}): ` + err.message);
            }
          }
        }
      }

      const settingsPath = "data/admin_settings.json";
      let currentSettingsSha = null;
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${settingsPath}`, {
          headers: { 'Authorization': `Bearer ${githubToken}` }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          currentSettingsSha = fileData.sha;
        }
      } catch (e) {}

      const newContentStr = JSON.stringify(product, null, 2); // 'product' holds settings payload here
      const newContentBase64 = Buffer.from(newContentStr).toString('base64');
      const bodyPayload = {
        message: 'Update admin settings',
        content: newContentBase64
      };
      if (currentSettingsSha) bodyPayload.sha = currentSettingsSha;

      const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${settingsPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });
      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error("Failed to save settings to server: " + err.message);
      }
      // Sync settings to Firebase Realtime Database
      try {
        await fetch("https://fabric8-50559-default-rtdb.firebaseio.com/admin_settings.json", {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      } catch (fbErr) {
        console.error("Firebase Settings Sync Error:", fbErr);
      }

      return res.status(200).json({ success: true, message: 'Settings saved successfully' });
    } else if (action === "save") {
      delete product.existingImages;
      const newProduct = { 
        ...product, 
        images: finalImages, 
        image: finalImages.length > 0 ? finalImages[0] : "assets/white.png", 
        id: product.sku 
      };
      const existingIndex = productsList.findIndex(p => p.sku === product.sku || p.id === product.id);
      if (existingIndex >= 0) {
        productsList[existingIndex] = newProduct;
      } else {
        productsList.push(newProduct);
      }
    } else if (action === "delete") {
      productsList = productsList.filter(p => p.id !== product.id && p.sku !== product.sku);
    }

    // 4. Save the updated products.json back to GitHub & Firebase
    if (action === "save" || action === "delete") {
      const newContentStr = JSON.stringify(productsList, null, 2);
      const newContentBase64 = Buffer.from(newContentStr).toString('base64');

      // Sync to Firebase Realtime Database
      try {
        await fetch("https://fabric8-50559-default-rtdb.firebaseio.com/products.json", {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productsList)
        });
      } catch (fbErr) {
        console.error("Firebase Products Sync Error:", fbErr);
      }

      const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${jsonPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `${action === 'delete' ? 'Delete' : 'Save'} product ${product.sku || product.id}`,
          content: newContentBase64,
          sha: currentSha
        })
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error("Failed to save products database to server: " + err.message);
      }

      return res.status(200).json({ success: true, message: 'Saved successfully', products: productsList });
    }

  } catch (error) {
    console.error("Sync Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
