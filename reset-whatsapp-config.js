// Reset WhatsApp config by deleting the blob
const resetWhatsAppConfig = async () => {
  const customerId = 'h.schlimback@gmail.com';
  
  console.log('🗑️ Resetting WhatsApp config for customer:', customerId);
  
  try {
    // Delete the existing blob
    const deleteResponse = await fetch(`https://www.warmeleads.eu/api/whatsapp/config?customerId=${customerId}`, {
      method: 'DELETE'
    });
    
    console.log('📡 Delete response status:', deleteResponse.status);
    const deleteResult = await deleteResponse.json();
    console.log('📡 Delete result:', deleteResult);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test loading config (should return default)
    console.log('📥 Loading config after reset...');
    const loadResponse = await fetch(`https://www.warmeleads.eu/api/whatsapp/config?customerId=${customerId}`);
    
    console.log('📡 Load response status:', loadResponse.status);
    const loadResult = await loadResponse.json();
    console.log('📡 Load result:', loadResult);
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
};

// Run the reset
resetWhatsAppConfig();
