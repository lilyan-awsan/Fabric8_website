import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Construct email content
    let emailHtml = `<div style="font-family: sans-serif; color: #111;">`;
    emailHtml += `<h2>New Fabric-8 Quote Request</h2>`;
    emailHtml += `<h3 style="color: #1a6f3b;">Customer Details:</h3><ul style="line-height: 1.6;">`;
    for (const [key, value] of Object.entries(data.customerInfo || {})) {
      emailHtml += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    emailHtml += `</ul><h3 style="color: #1a6f3b;">Selected Products:</h3><ul style="line-height: 1.6;">`;
    
    const cart = data.cart || [];
    if (cart.length === 0) {
      emailHtml += `<li>No products selected.</li>`;
    } else {
      cart.forEach(item => {
        emailHtml += `<li style="margin-bottom: 10px;"><strong>${item.name} (${item.sku})</strong><br>
          Size: ${item.size || "N/A"} | Color: ${item.color || "Standard"} | Qty: ${item.quantity}
        </li>`;
      });
    }
    emailHtml += `</ul></div>`;

    const options = {
      from: 'Fabric8 Testing <onboarding@resend.dev>',
      to: [process.env.RESEND_TO_EMAIL || 'lilyanawsan@gmail.com'],
      subject: 'New Fabric8 Quote Request from ' + (data.customerInfo['Full name'] || 'Website'),
      html: emailHtml,
    };

    if (data.attachment) {
      options.attachments = [data.attachment];
    }

    const { data: responseData, error } = await resend.emails.send(options);

    if (error) {
      console.error("Resend Error:", error);
      return res.status(400).json(error);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
