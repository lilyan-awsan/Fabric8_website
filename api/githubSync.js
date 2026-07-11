export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { token, action, product, image } = req.body;
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
    // 1. If there's a new image, upload it to GitHub first
    let imageUrl = product?.image || "assets/white.png";
    if (image && image.base64 && image.name) {
      const imgPath = `assets/products/${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
      const imgRes = await fetch(`https://api.github.com/repos/${repo}/contents/${imgPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Upload image for ${product.sku}`,
          content: image.base64.split(',')[1] // Remove 'data:image/png;base64,' prefix
        })
      });
      if (!imgRes.ok) {
        const err = await imgRes.json();
        throw new Error("Failed to upload image to GitHub: " + err.message);
      }
      imageUrl = imgPath;
    }

    // 2. Fetch the current products.json to get its SHA and content
    const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${jsonPath}`, {
      headers: { 'Authorization': `Bearer ${githubToken}` }
    });
    
    if (!fileRes.ok) throw new Error("Could not read products.json from GitHub");
    const fileData = await fileRes.json();
    const currentSha = fileData.sha;
    
    // Decode current content
    const contentStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
    let productsList = JSON.parse(contentStr);

    // 3. Apply the action
    if (action === "save") {
      const newProduct = { ...product, image: imageUrl, id: product.sku };
      const existingIndex = productsList.findIndex(p => p.sku === product.sku || p.id === product.id);
      if (existingIndex >= 0) {
        productsList[existingIndex] = newProduct;
      } else {
        productsList.push(newProduct);
      }
    } else if (action === "delete") {
      productsList = productsList.filter(p => p.id !== product.id && p.sku !== product.sku);
    }

    // 4. Save the updated products.json back to GitHub
    const newContentStr = JSON.stringify(productsList, null, 2);
    const newContentBase64 = Buffer.from(newContentStr).toString('base64');

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
      throw new Error("Failed to save products.json to GitHub: " + err.message);
    }

    return res.status(200).json({ success: true, message: 'Saved successfully', products: productsList });

  } catch (error) {
    console.error("GitHub Sync Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
