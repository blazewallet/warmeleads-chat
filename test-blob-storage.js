// Test Blob Storage connectivity and save customer data
const VERCEL_API_URL = 'https://warmeleads.eu';

async function testBlobStorage() {
  console.log('🧪 Testing Blob Storage...\n');

  // Test customer data
  const customerData = {
    id: 'cust_001',
    email: 'h.schlimback@gmail.com',
    name: 'Rick Schlimback',
    phone: '0643219739',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1KkbnT2JU_xq87y0BEfPdQv0pgSXYGRu_4GJiIJl_Owg/edit?gid=0#gid=0',
    emailNotifications: {
      enabled: true,
      recipients: ['h.schlimback@gmail.com']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('📤 Saving customer data to Blob Storage...');
  console.log('Customer ID:', customerData.email);
  console.log('Google Sheet URL:', customerData.googleSheetUrl);

  try {
    // Save customer data
    const saveResponse = await fetch(`${VERCEL_API_URL}/api/customer-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerData.email,
        customerData: customerData
      })
    });

    const saveData = await saveResponse.json();
    
    if (saveResponse.ok) {
      console.log('✅ Customer data saved successfully!');
      console.log('Blob URL:', saveData.blobUrl);
      console.log('');
    } else {
      console.error('❌ Failed to save customer data:', saveData);
      return;
    }

    // Retrieve customer data
    console.log('📥 Retrieving customer data from Blob Storage...');
    const getResponse = await fetch(`${VERCEL_API_URL}/api/customer-data?customerId=${encodeURIComponent(customerData.email)}`);
    const getData = await getResponse.json();

    if (getResponse.ok) {
      console.log('✅ Customer data retrieved successfully!');
      console.log('Email:', getData.customerData.email);
      console.log('Name:', getData.customerData.name);
      console.log('Google Sheet URL:', getData.customerData.googleSheetUrl);
      console.log('Email Notifications:', getData.customerData.emailNotifications?.enabled);
      console.log('');
    } else {
      console.error('❌ Failed to retrieve customer data:', getData);
      return;
    }

    // Test Google Sheets API
    console.log('📊 Testing Google Sheets API...');
    const sheetsResponse = await fetch(`${VERCEL_API_URL}/api/sheets-auth`);
    const sheetsData = await sheetsResponse.json();

    if (sheetsResponse.ok) {
      console.log('✅ Google Sheets Service Account token obtained!');
      console.log('Token type:', sheetsData.token_type);
      console.log('Expires in:', sheetsData.expires_in, 'seconds');
      console.log('');
    } else {
      console.error('❌ Failed to get Google Sheets token:', sheetsData);
      return;
    }

    console.log('🎉 All tests passed! Everything is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open https://warmeleads.eu/portal on your mobile');
    console.log('2. Login with h.schlimback@gmail.com');
    console.log('3. The leads should now load correctly from Google Sheets');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBlobStorage();

