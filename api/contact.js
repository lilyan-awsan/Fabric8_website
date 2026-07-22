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
    emailHtml += `<h2>New Inquiry from Fabric-8 Website</h2>`;
    emailHtml += `<p style="color: #666;">Source: <strong>${data.source || 'Website'}</strong></p>`;
    
    emailHtml += `<h3 style="color: #1a6f3b;">Contact Details:</h3><ul style="line-height: 1.6;">`;
    
    // Add all fields except source
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'source') {
        emailHtml += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value || 'N/A'}</li>`;
      }
    }
    emailHtml += `</ul></div>`;

    const options = {
      from: 'Fabric8 Website <onboarding@resend.dev>',
      to: [process.env.RESEND_TO_EMAIL || 'lilyanawsan@gmail.com'],
      reply_to: data.email,
      subject: `New Fabric8 Inquiry from ${data.firstName ? data.firstName + ' ' + (data.lastName || '') : data.email}`,
      html: emailHtml,
    };

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
