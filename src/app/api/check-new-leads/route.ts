import { NextRequest, NextResponse } from 'next/server';
import { crmSystem } from '@/lib/crmSystem';
import { readCustomerLeads } from '@/lib/googleSheetsAPI';

// Deze API route wordt aangeroepen door een Vercel Cron Job
// om periodiek te checken op nieuwe leads en email notificaties te versturen

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Cron job started: Checking for new leads...');
    
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron job attempt');
      console.log('Expected:', `Bearer ${cronSecret}`);
      console.log('Received:', authHeader);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Cron secret verified');

    const customers = crmSystem.getAllCustomers();
    const results = [];
    
    for (const customer of customers) {
      // Skip customers without Google Sheets or without email notifications enabled
      if (!customer.googleSheetUrl || !customer.emailNotifications?.enabled) {
        continue;
      }

      try {
        console.log(`📊 Checking leads for customer: ${customer.name || customer.email}`);
        
        // Haal Google Sheets URL op uit blob storage
        let googleSheetUrl = customer.googleSheetUrl;
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.warmeleads.eu'}/api/customer-sheets?customerId=${customer.id}`);
          if (response.ok) {
            const data = await response.json();
            googleSheetUrl = data.googleSheetUrl;
            console.log(`✅ Loaded Google Sheets URL from blob for ${customer.email}`);
          }
        } catch (error) {
          console.log(`ℹ️ Using localStorage URL for ${customer.email}`);
        }

        // Lees leads uit Google Sheets
        const sheetLeads = await readCustomerLeads(googleSheetUrl);
        const existingLeads = customer.leadData || [];
        
        // Vind nieuwe leads
        const existingRowNumbers = new Set(existingLeads.map(lead => lead.sheetRowNumber));
        const newLeads = sheetLeads.filter(sheetLead => 
          sheetLead.sheetRowNumber && !existingRowNumbers.has(sheetLead.sheetRowNumber)
        );
        
        if (newLeads.length > 0) {
          console.log(`🆕 Found ${newLeads.length} new leads for ${customer.email}`);
          
          let emailsSent = 0;
          let emailsFailed = 0;
          
          // Voeg nieuwe leads toe aan CRM en verstuur aparte email per lead
          for (const leadData of newLeads) {
            const leadToAdd = {
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
              company: leadData.company,
              address: leadData.address,
              city: leadData.city,
              interest: leadData.interest,
              budget: leadData.budget,
              timeline: leadData.timeline,
              notes: leadData.notes,
              status: leadData.status,
              assignedTo: leadData.assignedTo,
              source: 'import' as const,
              sheetRowNumber: leadData.sheetRowNumber,
              branchData: leadData.branchData
            };
            
            crmSystem.addLeadToCustomer(customer.id, leadToAdd);
            
            // Verstuur aparte email voor deze specifieke lead
            if (customer.emailNotifications?.newLeads) {
              try {
                console.log(`📧 Sending individual email for lead: ${leadData.name}`);
                
                await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.warmeleads.eu'}/api/send-lead-notification`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerEmail: customer.email,
                    customerName: customer.name,
                    lead: {
                      name: leadData.name,
                      email: leadData.email,
                      phone: leadData.phone,
                      interest: leadData.interest,
                      budget: leadData.budget,
                      company: leadData.company,
                      timeline: leadData.timeline,
                      notes: leadData.notes,
                      branchData: leadData.branchData
                    }
                  })
                });
                
                emailsSent++;
                console.log(`✅ Email sent for lead: ${leadData.name}`);
              } catch (emailError) {
                emailsFailed++;
                console.error(`❌ Failed to send email for lead ${leadData.name}:`, emailError);
              }
            }
          }
          
          // Update lastNotificationSent
          crmSystem.updateCustomer(customer.id, {
            emailNotifications: {
              ...customer.emailNotifications,
              lastNotificationSent: new Date()
            }
          });
          
          console.log(`✅ Processed ${newLeads.length} leads for ${customer.email}: ${emailsSent} emails sent, ${emailsFailed} failed`);
          
          results.push({
            customerId: customer.id,
            customerEmail: customer.email,
            newLeadsCount: newLeads.length,
            emailsSent,
            emailsFailed
          });
        } else {
          console.log(`ℹ️ No new leads for ${customer.email}`);
        }
      } catch (error) {
        console.error(`❌ Error checking leads for ${customer.email}:`, error);
        results.push({
          customerId: customer.id,
          customerEmail: customer.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`✅ Cron job completed. Processed ${customers.length} customers, found new leads for ${results.filter(r => r.newLeadsCount).length}`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      customersChecked: customers.length,
      results
    });
  } catch (error) {
    console.error('❌ Error in cron job:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Ook beschikbaar als POST voor manuele triggers (development/testing)
export async function POST(request: NextRequest) {
  return GET(request);
}

