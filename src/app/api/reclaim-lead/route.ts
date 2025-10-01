import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// API route voor het afhandelen van lead reclamaties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, lead, reason, timestamp } = body;
    
    console.log('⚠️ Lead reclamation request received');
    console.log('  Customer:', customerEmail);
    console.log('  Lead:', lead.name);
    console.log('  Reason:', reason);
    
    if (!customerEmail || !lead || !reason) {
      return NextResponse.json(
        { error: 'Customer email, lead data and reason are required' },
        { status: 400 }
      );
    }

    // Verstuur email naar admin (info@warmeleads.eu)
    const adminEmail = 'info@warmeleads.eu';
    
    const emailContent = {
      from: 'WarmeLeads <leads@warmeleads.eu>',
      to: adminEmail,
      subject: `⚠️ Lead Reclamatie: ${lead.name} (${customerName})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 30px;
            }
            .alert-box {
              background: #fff9e6;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .info-section {
              background: #f8f9fa;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              margin: 10px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              min-width: 150px;
              color: #667eea;
            }
            .reason-box {
              background: #fee;
              border: 2px solid #f87171;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">⚠️ Lead Reclamatie Verzoek</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Een klant wil een lead reclameren</p>
          </div>
          
          <div class="alert-box">
            <p style="margin: 0; font-weight: bold; color: #d97706;">
              ⚠️ Actie vereist: Een klant heeft een lead reclamatieverzoek ingediend.
            </p>
          </div>
          
          <div class="info-section">
            <h3 style="margin-top: 0; color: #667eea;">👤 Klant Informatie</h3>
            <div class="info-row">
              <span class="info-label">Naam:</span>
              <span>${customerName || 'Niet opgegeven'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Datum verzoek:</span>
              <span>${new Date(timestamp).toLocaleString('nl-NL', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}</span>
            </div>
          </div>

          <div class="info-section">
            <h3 style="margin-top: 0; color: #667eea;">📋 Lead Informatie</h3>
            <div class="info-row">
              <span class="info-label">Naam:</span>
              <span>${lead.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${lead.email || 'Niet opgegeven'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Telefoon:</span>
              <span>${lead.phone || 'Niet opgegeven'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Google Sheets Rij:</span>
              <span>${lead.sheetRowNumber}</span>
            </div>
          </div>

          <div class="reason-box">
            <h3 style="margin-top: 0; color: #dc2626;">💬 Reden voor Reclamatie</h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${reason}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="margin-bottom: 15px; color: #666;">Neem zo snel mogelijk contact op met de klant om het probleem op te lossen.</p>
            <a href="mailto:${customerEmail}?subject=Re: Lead Reclamatie - ${lead.name}" class="cta-button">
              📧 Reageer op Klant
            </a>
          </div>
          
          <div class="footer">
            <p>Dit is een geautomatiseerde melding van het WarmeLeads systeem.</p>
            <p style="margin-top: 10px;">
              <strong>WarmeLeads Admin</strong><br>
              <a href="https://www.warmeleads.eu">www.warmeleads.eu</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
⚠️ LEAD RECLAMATIE VERZOEK

Een klant heeft een lead reclamatieverzoek ingediend.

KLANT INFORMATIE:
- Naam: ${customerName || 'Niet opgegeven'}
- Email: ${customerEmail}
- Datum verzoek: ${new Date(timestamp).toLocaleString('nl-NL', { dateStyle: 'full', timeStyle: 'short' })}

LEAD INFORMATIE:
- Naam: ${lead.name}
- Email: ${lead.email || 'Niet opgegeven'}
- Telefoon: ${lead.phone || 'Niet opgegeven'}
- Google Sheets Rij: ${lead.sheetRowNumber}

REDEN VOOR RECLAMATIE:
${reason}

---

Neem zo snel mogelijk contact op met de klant om het probleem op te lossen.

Reageer: ${customerEmail}

WarmeLeads Admin
www.warmeleads.eu
      `
    };

    console.log('📧 Sending reclamation email to admin:', adminEmail);
    
    // Verstuur email via Resend
    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Reclamation email sent successfully!');
    console.log('  Email ID:', data?.id);
    
    return NextResponse.json({
      success: true,
      emailSent: true,
      recipient: adminEmail,
      emailId: data?.id
    });
  } catch (error) {
    console.error('❌ Error sending reclamation email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send reclamation request', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

