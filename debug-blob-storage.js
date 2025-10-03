// Debug blob storage directly
const debugBlobStorage = async () => {
  const customerId = 'h.schlimback@gmail.com';
  const blobName = `whatsapp-config/${customerId}.json`;
  
  console.log('🔍 Debugging blob storage...');
  console.log('📁 Blob name:', blobName);
  
  try {
    // Try to fetch the blob directly
    const response = await fetch(`https://blob.vercel-storage.com/${blobName}`);
    console.log('📡 Direct blob fetch status:', response.status);
    
    if (response.ok) {
      const blobContent = await response.text();
      console.log('📡 Raw blob content:', blobContent);
      
      try {
        const parsedContent = JSON.parse(blobContent);
        console.log('📡 Parsed blob content:', parsedContent);
        console.log('📡 Enabled status:', parsedContent.enabled, 'type:', typeof parsedContent.enabled);
      } catch (parseError) {
        console.error('❌ Failed to parse blob content:', parseError);
      }
    } else {
      console.log('❌ Blob not found or error:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Run the debug
debugBlobStorage();
