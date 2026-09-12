import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('re_mock')) {
    console.warn("RESEND_API_KEY is not configured or is a mock key:", apiKey);
    return res.status(500).json({
      error: 'RESEND_API_KEY is not configured. Please add a valid Resend API key to environment variables.'
    });
  }

  let resend;
  try {
    resend = new Resend(apiKey);
  } catch (initErr) {
    console.error("Resend initialization error:", initErr);
    return res.status(500).json({ error: 'Failed to initialize Resend client: ' + initErr.message });
  }

  try {
    const data = req.body || {};
    
    // Construct email content
    let emailHtml = `<div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; background: #ffffff;">`;
    emailHtml += `<h2 style="color: #111; margin-top: 0; border-bottom: 2px solid #2f873d; padding-bottom: 8px;">New Inquiry from Fabric-8 Website</h2>`;
    emailHtml += `<p style="color: #666; font-size: 13px;">Source: <strong>${data.source || 'Website'}</strong></p>`;
    
    emailHtml += `<h3 style="color: #2f873d; margin-top: 20px; font-size: 16px;">Contact Details:</h3><ul style="line-height: 1.8; font-size: 14px; color: #333; padding-left: 20px;">`;
    
    // Add all fields except source
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'source') {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        emailHtml += `<li><strong>${formattedKey}:</strong> ${value || 'N/A'}</li>`;
      }
    }
    emailHtml += `</ul>`;
    emailHtml += `<div style="margin-top: 30px; padding-top: 14px; border-top: 1px solid #eee; font-size: 12px; color: #999;">Fabric 8 Website Automated Notification</div></div>`;

    // Destination addresses
    const defaultToEmails = ['lilyanawsan@gmail.com', 'hello@thefabric8.com'];
    const toEmails = process.env.RESEND_TO_EMAIL
      ? process.env.RESEND_TO_EMAIL.split(',').map(e => e.trim()).filter(Boolean)
      : defaultToEmails;

    // Sender address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Fabric8 Website <hello@thefabric8.com>';

    // Customer reply-to address
    const customerEmail = data.email && typeof data.email === 'string' && data.email.includes('@')
      ? data.email.trim()
      : undefined;

    const subject = data.subject
      ? `[Inquiry: ${data.subject}] from ${data.email || 'Website'}`
      : `New Fabric8 Inquiry from ${data.firstName ? data.firstName + ' ' + (data.lastName || '') : (data.email || 'Client')}`;

    let options = {
      from: fromAddress,
      to: toEmails,
      subject: subject,
      html: emailHtml,
      ...(customerEmail ? { reply_to: customerEmail } : {})
    };

    let { data: responseData, error } = await resend.emails.send(options);

    // If custom domain is not yet verified or test mode restriction triggers, automatically fallback to onboarding@resend.dev
    if (error && (
      (error.message && (
        error.message.toLowerCase().includes('domain') ||
        error.message.toLowerCase().includes('verify') ||
        error.message.toLowerCase().includes('testing emails') ||
        error.message.toLowerCase().includes('validation_error')
      )) ||
      error.statusCode === 403
    )) {
      console.warn("Resend primary delivery restriction:", error.message, "- Retrying with onboarding@resend.dev...");
      const fallbackOptions = {
        ...options,
        from: 'Fabric8 <onboarding@resend.dev>',
        // In Resend free/test tier, you can only send to the verified account owner email
        to: process.env.RESEND_TO_EMAIL ? [process.env.RESEND_TO_EMAIL.trim()] : ['lilyanawsan@gmail.com']
      };

      const retryResult = await resend.emails.send(fallbackOptions);
      if (!retryResult.error) {
        console.log("Resend fallback delivery succeeded:", retryResult.data);
        responseData = retryResult.data;
        error = null;
      } else {
        console.error("Resend fallback delivery also failed:", retryResult.error);
        error = retryResult.error;
      }
    }

    if (error) {
      console.error("Resend Error:", error);
      return res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || error
      });
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
