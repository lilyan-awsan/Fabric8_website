import { Resend } from 'resend';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const customerInfo = data.customerInfo || {};
    const cart = data.cart || [];

    // Resolve base host domain for Vercel CDN asset URL links
    const host = req.headers.host || 'thefabric8.com';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // ==========================================
    // 1. ENTERPRISE EXCEL SPREADSHEET GENERATION
    // ==========================================
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fabric 8 Custom Atelier System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Fabric8 Quote Order', {
      views: [{ showGridLines: true }],
      properties: { defaultRowHeight: 22 }
    });

    // Professional styling configurations
    const headerFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111111' } };
    const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F873D' } }; // Fabric8 Green
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
    };

    // SECTION 1: Client / User Information at top of sheet
    const titleRow = sheet.addRow(['CLIENT / USER INFORMATION']);
    titleRow.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.getCell(1).fill = subHeaderFill;
    titleRow.height = 28;
    titleRow.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells('A1:D1');

    for (const [key, value] of Object.entries(customerInfo)) {
      const row = sheet.addRow([key, value]);
      row.getCell(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF333333' } };
      row.getCell(2).font = { name: 'Arial', size: 11, color: { argb: 'FF111111' } };
      row.height = 22;
      row.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      row.getCell(1).border = borderStyle;
      row.getCell(2).border = borderStyle;
      sheet.mergeCells(`B${row.number}:D${row.number}`);
    }

    // Spacer rows between sections
    sheet.addRow([]);
    sheet.addRow([]);

    // SECTION 2: Required Order Details Table
    const orderSectionTitle = sheet.addRow(['REQUIRED ORDER DETAILS']);
    orderSectionTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    orderSectionTitle.getCell(1).fill = subHeaderFill;
    orderSectionTitle.height = 28;
    orderSectionTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells(`A${orderSectionTitle.number}:I${orderSectionTitle.number}`);

    // Configure exact 9 client required column widths
    sheet.columns = [
      { key: 'index', width: 6 },      // 1. #
      { key: 'photo', width: 22 },     // 2. Photo
      { key: 'sku', width: 16 },       // 3. Product SKU
      { key: 'name', width: 38 },      // 4. Product Name
      { key: 'qty', width: 10 },       // 5. QTY
      { key: 'size', width: 14 },      // 6. Size
      { key: 'color', width: 18 },     // 7. Color
      { key: 'price', width: 18 },     // 8. Product Price (Empty)
      { key: 'total', width: 20 }      // 9. Total (Formula Calculated)
    ];

    const tableHeaders = ['#', 'Photo', 'Product SKU', 'Product Name', 'QTY', 'Size', 'Color', 'Product Price', 'Total'];
    const tableHeaderRow = sheet.addRow(tableHeaders);
    tableHeaderRow.font = headerFont;
    tableHeaderRow.height = 26;
    tableHeaderRow.eachCell({ includeEmpty: false }, (cell) => {
      cell.fill = headerFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderStyle;
    });

    const startRow = tableHeaderRow.number + 1;

    // Populate order lines & embed garment visual link/thumbnail
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      let productName = item.name || 'Custom Garment';
      if (item.branding && item.branding !== "None") {
        productName += ` [Branding: ${item.branding}]`;
      }

      // Resolve Vercel CDN or local HTTP asset link
      let photoCellVal = "";
      const imgRef = item.image || (item.images && item.images[0]) || '';
      let fullImgUrl = "";
      if (imgRef) {
        if (imgRef.startsWith('http://') || imgRef.startsWith('https://')) {
          fullImgUrl = imgRef;
        } else {
          fullImgUrl = `${baseUrl}/${imgRef.replace(/^\//, '')}`;
        }
        // Insert interactive clickable formula link in Photo cell (guaranteed to work across all Excel versions & formats like .webp)
        photoCellVal = { formula: `HYPERLINK("${fullImgUrl}", "VIEW PHOTO 🔗")` };
      }

      const row = sheet.addRow([
        i + 1,                   // 1. #
        photoCellVal,            // 2. Photo (Live Hyperlink)
        item.sku || 'N/A',       // 3. Product SKU
        productName,             // 4. Product Name
        Number(item.quantity) || 1, // 5. QTY (Numeric)
        item.size || "N/A",      // 6. Size
        item.color || "Standard",// 7. Color
        "",                      // 8. Product Price (Empty as required for quotation fill-in)
        { formula: `IF(ISBLANK(H${tableHeaderRow.number + 1 + i}), "", E${tableHeaderRow.number + 1 + i} * H${tableHeaderRow.number + 1 + i})` } // 9. Total (Live Calculation Formula)
      ]);

      row.height = 55; // Expand row height for clean visual preview and layout
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = borderStyle;
        cell.font = { name: 'Arial', size: 11 };
        
        if (colNumber === 1 || colNumber === 5 || colNumber === 6 || colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 10, color: { argb: 'FF0052CC' }, underline: true };
        } else if (colNumber === 8 || colNumber === 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '$#,##0.00';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      });

    }

    const endRow = tableHeaderRow.number + cart.length;

    // Automated Quotation Totals Footer Row
    const totalRow = sheet.addRow([
      "", "", "", "TOTALS / SUMMARY:",
      { formula: `SUM(E${startRow}:E${endRow})` }, // Total Garments Count
      "", "",
      "GRAND TOTAL:",
      { formula: `SUM(I${startRow}:I${endRow})` }  // Computed Quotation Value
    ]);
    totalRow.height = 28;
    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = borderStyle;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF111111' } };
      if (colNumber === 4 || colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
      } else if (colNumber === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '$#,##0.00';
      }
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();

    // ==========================================
    // 2. RESEND EMAIL DELIVERY ARCHITECTURE
    // ==========================================
    let emailHtml = `<div style="font-family: Arial, sans-serif; color: #111; max-width: 650px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 28px; background: #ffffff;">`;
    emailHtml += `<h1 style="color: #111; margin: 0 0 8px; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Fabric 8 Order & Quote Request</h1>`;
    emailHtml += `<p style="color: #555; font-size: 14px; margin: 0 0 24px;">An enterprise order spreadsheet has been generated from the live checkout and attached to this notification.</p>`;
    
    emailHtml += `<h2 style="font-size: 15px; color: #2f873d; border-bottom: 2px solid #2f873d; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Client / User Information</h2>`;
    emailHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 14px;">`;
    for (const [key, value] of Object.entries(customerInfo)) {
      emailHtml += `<tr><td style="padding: 8px 0; color: #666; font-weight: bold; width: 35%; border-bottom: 1px solid #f0f0f0;">${key}:</td><td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;">${value || 'N/A'}</td></tr>`;
    }
    emailHtml += `</table>`;

    emailHtml += `<h2 style="font-size: 15px; color: #2f873d; border-bottom: 2px solid #2f873d; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 24px;">Ordered Garments & Customizations</h2>`;
    emailHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">`;
    emailHtml += `<tr style="background: #f8f9fa; text-align: left;"><th style="padding: 10px; border-bottom: 2px solid #eee;">#</th><th style="padding: 10px; border-bottom: 2px solid #eee;">Customized Garment Photo</th><th style="padding: 10px; border-bottom: 2px solid #eee;">Garment & Customization Details</th><th style="padding: 10px; border-bottom: 2px solid #eee; text-align: center;">Qty</th></tr>`;

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const customizedImg = item.customizedImage || item.mockupImage || item.previewImage;
      const baseImg = item.image || (item.images && item.images[0]) || '';
      
      let photoHtml = "";
      if (customizedImg && typeof customizedImg === 'string' && customizedImg.startsWith('data:image/')) {
        // High quality rendered preview with logo/text on garment
        photoHtml = `<div style="text-align: center;"><img src="${customizedImg}" width="115" style="object-fit: contain; border-radius: 6px; border: 2px solid #2f873d; background: #ffffff; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" alt="Customized Garment"><div style="font-size: 10px; color: #2f873d; font-weight: bold; margin-top: 4px;">✦ Customized Preview</div></div>`;
      } else if (baseImg) {
        let fullImgUrl = baseImg.startsWith('http') ? baseImg : `${baseUrl}/${baseImg.replace(/^\//, '')}`;
        photoHtml = `<a href="${fullImgUrl}" target="_blank" style="text-decoration: none;"><img src="${fullImgUrl}" width="85" style="object-fit: contain; border-radius: 6px; border: 1px solid #e0e0e0; background: #ffffff; padding: 4px;" alt="${item.name || 'Product'}"></a>`;
      } else {
        photoHtml = `<span style="color:#aaa; font-size: 11px;">No Photo</span>`;
      }

      // Build Customization summary box (Text Embroidery / Logo Upload / Placement)
      let customDetailsHtml = "";
      if (item.customization || item.embroideryData || item.logoData || (item.branding && item.branding !== "None")) {
        customDetailsHtml += `<div style="margin-top: 8px; padding: 8px 10px; background: #f4fbf6; border-left: 3px solid #2f873d; border-radius: 4px; font-size: 12px;">`;
        
        if (item.customizationType === "upload_logo" || item.logoData) {
          const lData = item.logoData || {};
          customDetailsHtml += `<div style="font-weight: bold; color: #1a5e2a; font-size: 13px;">🖼️ Logo Customization</div>`;
          customDetailsHtml += `<div>Placement Zone: <strong>${lData.placement || item.customization?.placement || 'Custom'}</strong></div>`;
          customDetailsHtml += `<div>Technique / Finish: <strong>${lData.finish || item.customization?.finish || 'Embroidery / DTF Print'}</strong></div>`;
        } else if (item.customizationType === "text_embroidery" || item.embroideryData || (item.customization && item.customization.textDetails)) {
          const emb = item.embroideryData || {};
          const textLines = emb.textLines || (item.customization && item.customization.textDetails) || {};
          customDetailsHtml += `<div style="font-weight: bold; color: #1a5e2a; font-size: 13px;">✍️ Text Embroidery Details</div>`;
          if (emb.position || item.customization?.placement) {
            customDetailsHtml += `<div>Placement Zone: <strong>${emb.position || item.customization?.placement}</strong></div>`;
          }
          if (emb.fontStyle || textLines.font) {
            customDetailsHtml += `<div>Font Style: <strong>${emb.fontStyle || textLines.font || 'Standard'}</strong> | Thread Color: <strong>${emb.threadColor || textLines.threadColor || 'Standard'}</strong></div>`;
          }
          if (textLines.line1 || textLines.line2 || textLines.line3 || textLines.line1 === "") {
            customDetailsHtml += `<div style="margin-top: 4px; font-weight: bold; color: #111;">Embroidery Text:</div>`;
            if (textLines.line1) customDetailsHtml += `<div style="padding-left: 8px; color: #222;">• Line 1: <em>"${textLines.line1}"</em></div>`;
            if (textLines.line2) customDetailsHtml += `<div style="padding-left: 8px; color: #222;">• Line 2: <em>"${textLines.line2}"</em></div>`;
            if (textLines.line3) customDetailsHtml += `<div style="padding-left: 8px; color: #222;">• Line 3: <em>"${textLines.line3}"</em></div>`;
          }
        } else if (item.branding && item.branding !== "None") {
          customDetailsHtml += `<div style="color: #1a5e2a; font-weight: bold;">✦ Branding: ${item.branding}</div>`;
        }
        
        customDetailsHtml += `</div>`;
      }

      emailHtml += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 10px; font-weight: bold; color: #666; vertical-align: top;">#${i + 1}</td>
          <td style="padding: 12px 10px; vertical-align: top;">${photoHtml}</td>
          <td style="padding: 12px 10px; vertical-align: top;">
            <div style="font-weight: bold; color: #111; font-size: 14px;">${item.name || 'Custom Garment'}</div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">SKU: <strong>${item.sku || 'N/A'}</strong> | Size: <strong>${item.size || 'N/A'}</strong> | Color: <strong>${item.color || 'Standard'}</strong></div>
            ${customDetailsHtml}
          </td>
          <td style="padding: 12px 10px; text-align: center; font-weight: bold; font-size: 15px; color: #111; vertical-align: top;">${item.quantity || 1}</td>
        </tr>
      `;
    }
    emailHtml += `</table>`;

    emailHtml += `<h2 style="font-size: 15px; color: #2f873d; border-bottom: 2px solid #2f873d; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Quotation Spreadsheet & Attachments</h2>`;
    emailHtml += `<p style="font-size: 13px; color: #666; line-height: 1.6;">Please open the attached Excel spreadsheet (<strong>Fabric8_Order_Quote.xlsx</strong>) to review line item details, pricing formulas, and complete the quotation fill-in.</p>`;
    emailHtml += `<div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center;">Fabric 8 Custom Atelier System &copy; 2026. All rights reserved.</div></div>`;

    const customerEmail = customerInfo['Email'] || customerInfo['email'] || customerInfo['Email Address'];
    const replyTo = (customerEmail && customerEmail.includes('@')) ? customerEmail : undefined;
    const customerName = customerInfo['Full name'] || customerInfo['fullName'] || customerInfo['Name'] || 'Client';

    // Set destination email address (defaults to lilyanawsan@gmail.com while domain verification is pending)
    const targetEmails = ['lilyanawsan@gmail.com'];

    const attachments = [
      {
        filename: `Fabric8_Order_Quote_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`,
        content: Buffer.from(excelBuffer).toString('base64')
      }
    ];

    // Preserve and sanitize customer uploaded logo assets if present
    if (data.attachments && Array.isArray(data.attachments)) {
      data.attachments.forEach(att => {
        if (!att.filename?.includes(".xlsx") && att.content) {
          let rawContent = att.content;
          if (typeof rawContent === 'object' && !Buffer.isBuffer(rawContent) && !Array.isArray(rawContent) && !(rawContent instanceof ArrayBuffer)) {
            rawContent = rawContent.imageSrc || rawContent.data || null;
          }
          if (rawContent) {
            let cleanContent = typeof rawContent === 'string' ? rawContent : Buffer.from(rawContent).toString('base64');
            // Strip any data:image/...;base64, header prefix to satisfy Resend strict base64 requirement
            if (cleanContent.includes('base64,')) {
              cleanContent = cleanContent.split('base64,')[1];
            } else if (cleanContent.startsWith('data:')) {
              cleanContent = cleanContent.split(',')[1];
            }
            if (cleanContent && cleanContent.trim() !== '') {
              attachments.push({
                filename: att.filename || `Attachment_${Date.now()}.png`,
                content: cleanContent
              });
            }
          }
        }
      });
    }

    const options = {
      from: 'Fabric8 Orders <onboarding@resend.dev>',
      to: targetEmails,
      subject: `[New Order & Quote] Fabric 8 Request from ${customerName}`,
      html: emailHtml,
      attachments: attachments
    };

    const { data: responseData, error } = await resend.emails.send(options);

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(400).json(error);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Serverless Quote Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
