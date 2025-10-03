// Test in-memory storage
const testInMemoryStorage = async () => {
  const customerId = 'h.schlimback@gmail.com';
  const testConfig = {
    enabled: true,
    businessName: 'Test Company',
    useOwnNumber: false,
    warmeleadsNumber: '+31850477067',
    templates: {
      newLead: 'Test message',
      followUp: 'Follow up message',
      reminder: 'Reminder message'
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

  console.log('🧪 Testing in-memory storage...');
  
  try {
    // Test 1: Save config
    console.log('📤 Saving config...');
    const saveResponse = await fetch('https://www.warmeleads.eu/api/whatsapp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, config: testConfig })
    });
    
    console.log('📡 Save response status:', saveResponse.status);
    const saveResult = await saveResponse.json();
    console.log('📡 Save result:', saveResult);
    
    // Test 2: Load config
    console.log('📥 Loading config...');
    const loadResponse = await fetch(`https://www.warmeleads.eu/api/whatsapp/config?customerId=${customerId}`);
    
    console.log('📡 Load response status:', loadResponse.status);
    const loadResult = await loadResponse.json();
    console.log('📡 Load result:', loadResult);
    
    // Test 3: Send test message
    if (loadResult.config && loadResult.config.enabled) {
      console.log('📤 Sending test message...');
      const sendResponse = await fetch('https://www.warmeleads.eu/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          phoneNumber: '+31643219739',
          message: 'Test message from in-memory storage',
          leadName: 'Test Lead',
          product: 'Test Product'
        })
      });
      
      console.log('📡 Send response status:', sendResponse.status);
      const sendResult = await sendResponse.json();
      console.log('📡 Send result:', sendResult);
    } else {
      console.log('❌ Config not enabled, skipping send test');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testInMemoryStorage();
