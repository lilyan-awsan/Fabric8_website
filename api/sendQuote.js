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

    // ==========================================
    // 1. ENTERPRISE EXCEL SPREADSHEET GENERATION
    // ==========================================
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fabric 8 Custom Atelier System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Fabric8 Quote Order', {
      views: [{ showGridLines: true }],
      properties: { defaultRowHeight: 20 }
    });

    // Styling configurations
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
    sheet.mergeCells('A1:C1');

    for (const [key, value] of Object.entries(customerInfo)) {
      const row = sheet.addRow([key, value]);
      row.getCell(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF333333' } };
      row.getCell(2).font = { name: 'Arial', size: 11, color: { argb: 'FF111111' } };
      row.height = 22;
      row.alignment = { vertical: 'middle' };
      row.getCell(1).border = borderStyle;
      row.getCell(2).border = borderStyle;
    }

    // Spacer rows between sections
    sheet.addRow([]);
    sheet.addRow([]);

    // SECTION 2: Order Details Table
    const orderSectionTitle = sheet.addRow(['REQUIRED ORDER DETAILS']);
    orderSectionTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    orderSectionTitle.getCell(1).fill = subHeaderFill;
    orderSectionTitle.height = 28;
    orderSectionTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells(`A${orderSectionTitle.number}:I${orderSectionTitle.number}`);

    // Configure exact 9 client required column widths
    sheet.columns = [
      { key: 'index', width: 6 },      // 1. #
      { key: 'photo', width: 18 },     // 2. Photo
      { key: 'sku', width: 16 },       // 3. Product SKU
      { key: 'name', width: 36 },      // 4. Product Name
      { key: 'qty', width: 10 },       // 5. QTY
      { key: 'size', width: 14 },      // 6. Size
      { key: 'color', width: 18 },     // 7. Color
      { key: 'price', width: 18 },     // 8. Product Price (Empty)
      { key: 'total', width: 18 }      // 9. Total (Empty)
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

    // Populate order lines & embed garment photo thumbnails
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      let productName = item.name || 'Custom Garment';
      if (item.branding && item.branding !== "None") {
        productName += ` [Branding: ${item.branding}]`;
      }

      const row = sheet.addRow([
        i + 1,                   // 1. #
        "",                      // 2. Photo (cell reserved for visual thumbnail embed)
        item.sku || 'N/A',       // 3. Product SKU
        productName,             // 4. Product Name
        item.quantity || 1,      // 5. QTY
        item.size || "N/A",      // 6. Size
        item.color || "Standard",// 7. Color
        "",                      // 8. Product Price (Empty for sales pricing)
        ""                       // 9. Total (Empty)
      ]);

      row.height = 55; // Expand row height to fit embedded thumbnail image cleanly
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = borderStyle;
        cell.font = { name: 'Arial', size: 11 };
        if (colNumber === 1 || colNumber === 5 || colNumber === 6 || colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      });

      // Attempt to embed product image thumbnail into Column B (Photo)
      try {
        const imgRef = item.image || (item.images && item.images[0]) || '';
        if (imgRef) {
          let imgBuffer = null;
          let imgExtension = 'jpeg';

          if (imgRef.toLowerCase().endsWith('.png')) {
            imgExtension = 'png';
          } else if (imgRef.toLowerCase().endsWith('.webp') || imgRef.toLowerCase().endsWith('.gif')) {
            // ExcelJS standard image support focuses on PNG/JPEG
            continue;
          }

          if (imgRef.startsWith('http://') || imgRef.startsWith('https://')) {
            const resImg = await fetch(imgRef);
            if (resImg.ok) {
              const arrayBuf = await resImg.arrayBuffer();
              imgBuffer = Buffer.from(arrayBuf);
            }
          } else {
            // Local project filesystem image lookup
            const cleanPath = imgRef.replace(/^\//, '');
            const localPath = path.join(process.cwd(), cleanPath);
            if (fs.existsSync(localPath)) {
              imgBuffer = fs.readFileSync(localPath);
            }
          }

          if (imgBuffer) {
            const imageId = workbook.addImage({
              buffer: imgBuffer,
              extension: imgExtension,
            });

            // Anchor image directly over Row i's Column B cell
            sheet.addImage(imageId, {
              tl: { col: 1.15, row: row.number - 1 + 0.1 },
              br: { col: 1.85, row: row.number - 0.1 },
              editAs: 'oneCell'
            });
          }
        }
      } catch (imgErr) {
        console.warn(`Could not embed photo thumbnail for SKU ${item.sku}:`, imgErr.message);
      }
    }

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

    emailHtml += `<h2 style="font-size: 15px; color: #2f873d; border-bottom: 2px solid #2f873d; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Order Spreadsheet Preview</h2>`;
    emailHtml += `<p style="font-size: 13px; color: #666; line-height: 1.6;">Please open the attached Excel spreadsheet (<strong>Fabric8_Order_Quote.xlsx</strong>) to review customized product line items, visual garment thumbnails, quantities, sizes, colors, and to complete the empty Product Price and Total columns according to order specifics.</p>`;
    emailHtml += `<div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center;">Fabric 8 Custom Atelier System &copy; 2026. All rights reserved.</div></div>`;

    const replyTo = customerInfo['Email'] || customerInfo['email'] || customerInfo['Email Address'] || 'hello@thefabric8.com';
    const customerName = customerInfo['Full name'] || customerInfo['fullName'] || customerInfo['Name'] || 'Client';

    // Target recipients according to client specification
    const targetEmails = process.env.RESEND_TO_EMAIL 
      ? [process.env.RESEND_TO_EMAIL] 
      : ['hello@thefabric8.com', 'lilyanawsan@gmail.com'];

    const attachments = [
      {
        filename: `Fabric8_Order_Quote_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`,
        content: Buffer.from(excelBuffer).toString('base64')
      }
    ];

    // Preserve customer uploaded logo assets if present
    if (data.attachments && Array.isArray(data.attachments)) {
      data.attachments.forEach(att => {
        if (!att.filename?.includes(".xlsx")) {
          attachments.push(att);
        }
      });
    }

    const options = {
      from: process.env.RESEND_FROM_EMAIL || 'Fabric8 Orders <orders@thefabric8.com>',
      to: targetEmails,
      reply_to: replyTo,
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
