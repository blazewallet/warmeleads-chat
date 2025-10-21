import { formatPrice } from './stripe';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  packageName: string;
  packageDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `WL-${year}${month}${day}-${random}`;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const subtotal = data.unitPrice * data.quantity;
  const btw = Math.round(subtotal * 0.21); // 21% BTW
  const total = subtotal + btw;

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factuur ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    
    .invoice-container {
      background: white;
      padding: 60px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #ea580c;
    }
    
    .company-info h1 {
      color: #ea580c;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .company-info p {
      color: #666;
      font-size: 14px;
      margin: 3px 0;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-meta h2 {
      color: #ea580c;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .invoice-meta p {
      color: #666;
      font-size: 14px;
      margin: 3px 0;
    }
    
    .customer-info {
      margin-bottom: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
    }
    
    .customer-info h3 {
      color: #111827;
      font-size: 16px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .customer-info p {
      color: #6b7280;
      font-size: 14px;
      margin: 3px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    thead {
      background: #ea580c;
      color: white;
    }
    
    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    
    th:last-child,
    td:last-child {
      text-align: right;
    }
    
    tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    tbody tr:hover {
      background: #f9fafb;
    }
    
    td {
      padding: 15px;
      font-size: 14px;
      color: #4b5563;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      font-size: 14px;
    }
    
    .totals-row.subtotal {
      color: #6b7280;
    }
    
    .totals-row.btw {
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    
    .totals-row.total {
      background: #ea580c;
      color: white;
      font-weight: bold;
      font-size: 18px;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .payment-info {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 15px 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    
    .payment-info p {
      color: #065f46;
      font-size: 14px;
      margin: 5px 0;
    }
    
    .payment-info strong {
      color: #047857;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>🔥 WarmeLeads</h1>
        <p><strong>Stavangerweg 21-1</strong></p>
        <p>9723 JC Groningen</p>
        <p>Nederland</p>
        <p style="margin-top: 10px;">KvK: 88929280</p>
        <p>BTW: NL004876392B82</p>
        <p>Email: info@warmeleads.eu</p>
        <p>Tel: +31 85 047 7067</p>
      </div>
      
      <div class="invoice-meta">
        <h2>FACTUUR</h2>
        <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
        <p><strong>Factuurdatum:</strong> ${new Date(data.invoiceDate).toLocaleDateString('nl-NL')}</p>
        <p><strong>Vervaldatum:</strong> ${new Date(data.invoiceDate).toLocaleDateString('nl-NL')}</p>
      </div>
    </div>
    
    <!-- Customer Info -->
    <div class="customer-info">
      <h3>📧 Factuuradres</h3>
      <p><strong>${data.customerName}</strong></p>
      ${data.customerCompany ? `<p>${data.customerCompany}</p>` : ''}
      <p>${data.customerEmail}</p>
    </div>
    
    <!-- Payment Confirmation -->
    <div class="payment-info">
      <p>✅ <strong>Betaling ontvangen via ${data.paymentMethod}</strong></p>
      <p>Transactie ID: ${data.transactionId}</p>
      <p>Deze factuur is volledig voldaan.</p>
    </div>
    
    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Omschrijving</th>
          <th style="text-align: center;">Aantal</th>
          <th style="text-align: right;">Prijs per stuk</th>
          <th style="text-align: right;">Totaal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${data.packageName}</strong><br>
            <span style="color: #9ca3af; font-size: 13px;">${data.packageDescription}</span>
          </td>
          <td style="text-align: center;">${data.quantity}</td>
          <td style="text-align: right;">${formatPrice(data.unitPrice, data.currency.toUpperCase())}</td>
          <td style="text-align: right;"><strong>${formatPrice(subtotal, data.currency.toUpperCase())}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals">
      <div class="totals-row subtotal">
        <span>Subtotaal</span>
        <span>${formatPrice(subtotal, data.currency.toUpperCase())}</span>
      </div>
      <div class="totals-row btw">
        <span>BTW (21%)</span>
        <span>${formatPrice(btw, data.currency.toUpperCase())}</span>
      </div>
      <div class="totals-row total">
        <span>TOTAAL</span>
        <span>${formatPrice(total, data.currency.toUpperCase())}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Bedankt voor uw vertrouwen in WarmeLeads! 🚀</strong></p>
      <p style="margin-top: 15px;">Deze factuur is automatisch gegenereerd en digitaal geldig zonder handtekening.</p>
      <p>Voor vragen over deze factuur kunt u contact opnemen via info@warmeleads.eu</p>
      <p style="margin-top: 15px;">WarmeLeads.eu | KvK: 88929280 | BTW: NL004876392B82</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Email template for sending invoice
export function generateInvoiceEmail(data: InvoiceData, invoiceHTML: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 30px; 
      background: #ea580c; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: bold; 
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎉 Bedankt voor je bestelling!</h2>
    <p>Hoi ${data.customerName},</p>
    <p>Je betaling is succesvol verwerkt! Hierbij ontvang je je factuur.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">📋 Bestelling Details</h3>
      <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
      <p><strong>Package:</strong> ${data.packageName}</p>
      <p><strong>Aantal leads:</strong> ${data.quantity}</p>
      <p><strong>Totaal:</strong> ${formatPrice(data.totalPrice, data.currency.toUpperCase())}</p>
    </div>
    
    <p><strong>✅ Wat nu?</strong></p>
    <p>Je leads worden binnen 15 minuten geleverd in je portal. Log in op je account om ze te bekijken!</p>
    
    <a href="https://www.warmeleads.eu/portal" class="button">Ga naar Portal</a>
    
    <p>Heb je vragen? Neem gerust contact op via info@warmeleads.eu</p>
    
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      Met vriendelijke groet,<br>
      <strong>Team WarmeLeads</strong> 🔥
    </p>
  </div>
</body>
</html>
  `.trim();
}

