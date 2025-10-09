// Find messaging services in Twilio account
const findMessagingServices = async () => {
  console.log('🔍 Finding messaging services in Twilio account...');
  
  const twilioAccountSid = 'AC54f6486702031fe911e41470f8e3c12c';
  const twilioAuthToken = '04c945fa494fc2403d131ddb0456a6b6';
  
  try {
    // Get all messaging services
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Services.json`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Found messaging services:', data.services.length);
      
      data.services.forEach((service, index) => {
        console.log(`📡 Service ${index + 1}:`);
        console.log(`  - SID: ${service.sid}`);
        console.log(`  - Name: ${service.friendly_name}`);
        console.log(`  - Status: ${service.status}`);
        console.log(`  - Created: ${service.date_created}`);
        console.log('');
      });
      
      if (data.services.length === 0) {
        console.log('❌ No messaging services found. You need to create one in Twilio Console.');
        console.log('📋 Steps to create a messaging service:');
        console.log('1. Go to https://console.twilio.com/us1/develop/sms/services');
        console.log('2. Click "Create Messaging Service"');
        console.log('3. Choose "Send messages to multiple recipients"');
        console.log('4. Add your WhatsApp Business number (+31850477067)');
        console.log('5. Copy the Service SID and update the code');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Error fetching messaging services:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
findMessagingServices();


