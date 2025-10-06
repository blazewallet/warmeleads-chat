// Test Twilio configuration
const testTwilioConfig = async () => {
  console.log('🧪 Testing Twilio configuration...');
  
  const twilioAccountSid = 'AC54f6486702031fe911e41470f8e3c12c';
  const twilioAuthToken = '04c945fa494fc2403d131ddb0456a6b6';
  const twilioWhatsAppNumber = 'whatsapp:+31850477067';
  const twilioMessagingServiceSid = 'MGdd1866d87a5fd62a061cd3a0d35af598';
  
  console.log('📡 Twilio Account SID:', twilioAccountSid);
  console.log('📡 Twilio Auth Token:', twilioAuthToken ? '***' + twilioAuthToken.slice(-4) : 'NOT SET');
  console.log('📡 WhatsApp Number:', twilioWhatsAppNumber);
  console.log('📡 Messaging Service SID:', twilioMessagingServiceSid);
  
  try {
    // Test 1: Check account status
    console.log('📤 Testing Twilio account access...');
    const accountResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`
      }
    });
    
    console.log('📡 Account response status:', accountResponse.status);
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('✅ Twilio account accessible:', accountData.friendly_name);
    } else {
      const errorData = await accountResponse.json();
      console.error('❌ Twilio account error:', errorData);
    }
    
    // Test 2: Check messaging service
    console.log('📤 Testing messaging service...');
    const serviceResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Services/${twilioMessagingServiceSid}.json`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`
      }
    });
    
    console.log('📡 Service response status:', serviceResponse.status);
    if (serviceResponse.ok) {
      const serviceData = await serviceResponse.json();
      console.log('✅ Messaging service accessible:', serviceData.friendly_name);
    } else {
      const errorData = await serviceResponse.json();
      console.error('❌ Messaging service error:', errorData);
    }
    
    // Test 3: Send test message
    console.log('📤 Sending test WhatsApp message...');
    const messageResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        MessagingServiceSid: twilioMessagingServiceSid,
        To: 'whatsapp:+31643219739',
        Body: 'Test message from Twilio API'
      })
    });
    
    console.log('📡 Message response status:', messageResponse.status);
    const messageData = await messageResponse.json();
    console.log('📡 Message response:', messageData);
    
    if (messageResponse.ok) {
      console.log('✅ Test message sent successfully:', messageData.sid);
    } else {
      console.error('❌ Test message failed:', messageData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testTwilioConfig();
