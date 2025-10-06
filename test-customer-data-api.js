// Test script to verify customer data API works correctly
const fetch = require('node-fetch');

async function testCustomerDataAPI() {
  const customerId = 'h.schlimback@gmail.com';
  const baseUrl = 'https://www.warmeleads.eu';
  
  console.log('🧪 Testing Customer Data API...');
  console.log('Customer ID:', customerId);
  console.log('Base URL:', baseUrl);
  
  try {
    // Test 1: Get customer data
    console.log('\n📡 Test 1: Getting customer data...');
    const getResponse = await fetch(`${baseUrl}/api/customer-data?customerId=${customerId}`);
    console.log('Response status:', getResponse.status);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Customer data retrieved successfully');
      console.log('Response structure:', Object.keys(getData));
      console.log('Has WhatsApp config:', !!getData.customerData?.whatsappConfig);
      
      if (getData.customerData?.whatsappConfig) {
        console.log('WhatsApp config enabled:', getData.customerData.whatsappConfig.enabled);
        console.log('WhatsApp config business name:', getData.customerData.whatsappConfig.businessName);
      }
    } else {
      console.log('❌ Failed to get customer data');
      const errorText = await getResponse.text();
      console.log('Error response:', errorText);
    }
    
    // Test 2: Save WhatsApp config
    console.log('\n📡 Test 2: Saving WhatsApp config...');
    const whatsappConfig = {
      customerId,
      enabled: true,
      useOwnNumber: false,
      businessName: 'WarmeLeads Test',
      warmeleadsNumber: '+31850477067',
      templates: {
        newLead: 'Hallo {{leadName}}, dit is {{businessName}} via Warmeleads WhatsApp: {{businessPhone}} Website: {{businessWebsite}}',
        followUp: 'Hallo {{leadName}}, Wij hebben u eerder gecontacteerd over {{product}}. Heeft u nog vragen? Horen wij van u! {{businessName}} via Warmeleads',
        reminder: 'Hallo {{leadName}}, Een vriendelijke herinnering over {{product}}. Neem contact met ons op! {{businessName}} via Warmeleads'
      },
      timing: {
        newLead: 'immediate',
        followUp: 24,
        reminder: 72
      },
      usage: {
        messagesSent: 0,
        messagesDelivered: 0,
        messagesRead: 0,
        messagesFailed: 0,
        lastReset: new Date().toISOString()
      },
      billing: {
        plan: 'basic',
        messagesLimit: 50,
        setupPaid: false
      }
    };
    
    const postResponse = await fetch(`${baseUrl}/api/customer-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        whatsappConfig
      })
    });
    
    console.log('Response status:', postResponse.status);
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ WhatsApp config saved successfully');
      console.log('Response:', postData);
    } else {
      console.log('❌ Failed to save WhatsApp config');
      const errorText = await postResponse.text();
      console.log('Error response:', errorText);
    }
    
    // Test 3: Verify WhatsApp config was saved
    console.log('\n📡 Test 3: Verifying WhatsApp config was saved...');
    const verifyResponse = await fetch(`${baseUrl}/api/customer-data?customerId=${customerId}`);
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Customer data retrieved after save');
      
      if (verifyData.customerData?.whatsappConfig) {
        console.log('WhatsApp config enabled:', verifyData.customerData.whatsappConfig.enabled);
        console.log('WhatsApp config business name:', verifyData.customerData.whatsappConfig.businessName);
        
        if (verifyData.customerData.whatsappConfig.enabled === true) {
          console.log('🎉 SUCCESS: WhatsApp config is correctly saved and retrieved!');
        } else {
          console.log('❌ FAILURE: WhatsApp config enabled is not true');
        }
      } else {
        console.log('❌ FAILURE: No WhatsApp config found in customer data');
      }
    } else {
      console.log('❌ Failed to verify WhatsApp config');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testCustomerDataAPI();
