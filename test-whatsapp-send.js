// Test script to verify WhatsApp send API works correctly
const fetch = require('node-fetch');

async function testWhatsAppSend() {
  const baseUrl = 'https://www.warmeleads.eu';
  const customerId = 'h.schlimback@gmail.com';
  const phoneNumber = '+31643219739';
  const message = 'Test bericht via Twilio WhatsApp API';
  
  console.log('🧪 Testing WhatsApp Send API...');
  console.log('Base URL:', baseUrl);
  console.log('Customer ID:', customerId);
  console.log('Phone Number:', phoneNumber);
  console.log('Message:', message);
  
  try {
    // Test 1: Send WhatsApp message
    console.log('\n📡 Test 1: Sending WhatsApp message...');
    const sendResponse = await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        phoneNumber,
        message,
        template: 'newLead',
        leadName: 'Test Lead',
        product: 'Test Product'
      })
    });
    
    console.log('Response status:', sendResponse.status);
    console.log('Response headers:', Object.fromEntries(sendResponse.headers.entries()));
    
    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      console.log('✅ WhatsApp message sent successfully');
      console.log('Response:', sendData);
      
      if (sendData.success) {
        console.log('🎉 SUCCESS: Message was sent via Twilio!');
        console.log('Message ID:', sendData.messageId);
      } else {
        console.log('❌ FAILURE: Message was not sent');
        console.log('Error:', sendData.error);
      }
    } else {
      console.log('❌ Failed to send WhatsApp message');
      const errorText = await sendResponse.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testWhatsAppSend();
