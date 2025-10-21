// Email service voor het versturen van notificaties
// TODO: Integreer met een echte email service provider (bijv. SendGrid, Resend, Mailgun)

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  packageName: string;
  industry: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

/**
 * Verstuur een bevestigingsmail voor een bestelling
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData, pdfInvoiceUrl?: string): Promise<boolean> {
  try {
    const emailHTML = generateOrderConfirmationHTML(data);
    const emailText = generateOrderConfirmationText(data);
    
    console.log('📧 Sending order confirmation email to:', data.customerEmail);
    console.log('📋 Order Number:', data.orderNumber);
    if (pdfInvoiceUrl) console.log('📄 Including PDF invoice:', pdfInvoiceUrl);
    
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
      return false;
    }
    
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Download PDF if URL is provided
      let attachments: any[] = [];
      if (pdfInvoiceUrl) {
        try {
          const pdfResponse = await fetch(pdfInvoiceUrl);
          if (pdfResponse.ok) {
            const pdfBuffer = await pdfResponse.arrayBuffer();
            attachments.push({
              filename: `Factuur-${data.orderNumber}.pdf`,
              content: Buffer.from(pdfBuffer),
            });
            console.log('✅ PDF invoice attached to email');
          }
        } catch (pdfError) {
          console.error('⚠️ Failed to attach PDF invoice:', pdfError);
        }
      }
      
      const { data: emailData, error } = await resend.emails.send({
        from: 'WarmeLeads <noreply@warmeleads.eu>',
        to: data.customerEmail,
        subject: `Bevestiging bestelling ${data.orderNumber} - WarmeLeads`,
        html: emailHTML,
        text: emailText,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      if (error) {
        console.error('❌ Failed to send email:', error);
        return false;
      }
      
      console.log('✅ Email sent successfully to customer:', data.customerEmail);
      return true;
    } catch (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Verstuur admin notificatie naar WarmeLeads
 */
export async function sendAdminOrderNotification(data: OrderConfirmationEmailData): Promise<boolean> {
  try {
    console.log('📧 Sending admin notification for order:', data.orderNumber);
    
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping admin email');
      return false;
    }
    
    const formattedAmount = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: data.currency,
    }).format(data.totalAmount / 100);
    
    const adminHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nieuwe Bestelling - ${data.orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 Nieuwe Bestelling!</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">${data.orderNumber}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 20px;">Bestelling Details</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Klant:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right;">${data.customerEmail}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Product:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right;">${data.packageName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Branche:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right;">${data.industry}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Aantal leads:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right;">${data.quantity}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Betaalmethode:</td>
          <td style="padding: 12px 0; color: #111827; font-size: 14px; text-align: right;">${getPaymentMethodName(data.paymentMethod)}</td>
        </tr>
        <tr style="border-bottom: 2px solid #e5e7eb;">
          <td style="padding: 16px 0; color: #111827; font-size: 16px; font-weight: 600;">Totaal:</td>
          <td style="padding: 16px 0; color: #667eea; font-size: 20px; font-weight: bold; text-align: right;">${formattedAmount}</td>
        </tr>
      </table>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 20px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ⚡ <strong>Actie vereist:</strong> Lead levering moet binnen 15 minuten worden gestart.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        WarmeLeads Admin Notificatie System
      </p>
    </div>
  </div>
</body>
</html>
    `;
    
    const adminText = `
NIEUWE BESTELLING - ${data.orderNumber}

Klant: ${data.customerName}
Email: ${data.customerEmail}
Product: ${data.packageName}
Branche: ${data.industry}
Aantal leads: ${data.quantity}
Betaalmethode: ${getPaymentMethodName(data.paymentMethod)}
Totaal: ${formattedAmount}

⚡ Actie vereist: Lead levering moet binnen 15 minuten worden gestart.
    `.trim();
    
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data: emailData, error } = await resend.emails.send({
        from: 'WarmeLeads Orders <noreply@warmeleads.eu>',
        to: 'info@warmeleads.eu',
        subject: `🎉 Nieuwe Bestelling: ${data.orderNumber} - ${formattedAmount}`,
        html: adminHTML,
        text: adminText,
      });
      
      if (error) {
        console.error('❌ Failed to send admin email:', error);
        return false;
      }
      
      console.log('✅ Admin notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Resend API error for admin email:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return false;
  }
}

/**
 * Genereer HTML voor bevestigingsmail
 */
function generateOrderConfirmationHTML(data: OrderConfirmationEmailData): string {
  const formattedAmount = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: data.currency,
  }).format(data.totalAmount / 100);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging Bestelling ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🎉 Bestelling Bevestigd!</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Bedankt voor uw bestelling bij WarmeLeads</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">Beste ${data.customerName},</p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Uw bestelling is succesvol verwerkt! Hieronder vindt u de details van uw bestelling:
      </p>
      
      <!-- Order Details Card -->
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h2 style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">📦 Bestellingsinformatie</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bestelnummer:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Product:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.packageName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Branche:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.industry}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Aantal leads:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${data.quantity}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Betaalmethode:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${getPaymentMethodName(data.paymentMethod)}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 16px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">Totaal:</td>
            <td style="padding: 16px 0 0 0; color: #667eea; font-size: 20px; font-weight: bold; text-align: right;">${formattedAmount}</td>
          </tr>
        </table>
      </div>
      
      <!-- What's Next -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 18px;">✨ Wat gebeurt er nu?</h3>
        <ul style="color: #ffffff; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Uw leads worden binnen <strong>15 minuten</strong> geleverd</li>
          <li>U ontvangt een aparte email met de lead details</li>
          <li>Factuur is bijgevoegd of beschikbaar in uw portal</li>
          <li>Heeft u vragen? Neem contact met ons op via support@warmeleads.eu</li>
        </ul>
      </div>
      
      ${data.invoiceUrl ? `
      <!-- Invoice Download Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.invoiceUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          📄 Download Factuur
        </a>
      </div>
      ` : ''}
      
      <!-- Portal Link -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.warmeleads.eu/portal" style="display: inline-block; background-color: #f3f4f6; color: #667eea; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #667eea;">
          🎯 Ga naar Mijn Portal
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 32px;">
        Met vriendelijke groet,<br>
        <strong style="color: #111827;">Het WarmeLeads Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">
        WarmeLeads.eu • KvK: 88929280<br>
        Stavangerweg 21-1, 9723 JC Groningen
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">
        <a href="https://www.warmeleads.eu/privacyverklaring" style="color: #667eea; text-decoration: none;">Privacyverklaring</a> •
        <a href="https://www.warmeleads.eu/algemene-voorwaarden" style="color: #667eea; text-decoration: none;">Algemene Voorwaarden</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genereer plain text versie voor email
 */
function generateOrderConfirmationText(data: OrderConfirmationEmailData): string {
  const formattedAmount = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: data.currency,
  }).format(data.totalAmount / 100);
  
  return `
BEVESTIGING BESTELLING ${data.orderNumber}

Beste ${data.customerName},

Uw bestelling is succesvol verwerkt! Hieronder vindt u de details:

BESTELLINGSINFORMATIE
---------------------
Bestelnummer: ${data.orderNumber}
Product: ${data.packageName}
Branche: ${data.industry}
Aantal leads: ${data.quantity}
Betaalmethode: ${getPaymentMethodName(data.paymentMethod)}
Totaal: ${formattedAmount}

WAT GEBEURT ER NU?
------------------
✓ Uw leads worden binnen 15 minuten geleverd
✓ U ontvangt een aparte email met de lead details
✓ Factuur is bijgevoegd of beschikbaar in uw portal
✓ Heeft u vragen? Neem contact met ons op via support@warmeleads.eu

${data.invoiceUrl ? `Download uw factuur: ${data.invoiceUrl}\n\n` : ''}

Ga naar uw portal: https://www.warmeleads.eu/portal

Met vriendelijke groet,
Het WarmeLeads Team

---
WarmeLeads.eu • KvK: 88929280
Stavangerweg 21-1, 9723 JC Groningen
  `.trim();
}

/**
 * Vertaal payment method naar Nederlandse naam
 */
function getPaymentMethodName(method: string): string {
  const methodNames: Record<string, string> = {
    'card': 'Creditcard/Debitcard',
    'ideal': 'iDEAL',
    'bancontact': 'Bancontact',
    'paypal': 'PayPal',
    'klarna': 'Klarna',
  };
  
  return methodNames[method.toLowerCase()] || method;
}

