// Script to list all accounts in Blob Storage
require('dotenv').config({ path: '.env.local' });
const { list } = require('@vercel/blob');

async function listAllAccounts() {
  try {
    console.log('🔍 Fetching all accounts from Blob Storage...\n');
    
    // List all accounts
    const { blobs } = await list({
      prefix: 'auth-accounts/',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log(`✅ Found ${blobs.length} account(s) in Blob Storage\n`);
    console.log('='.repeat(80));
    
    if (blobs.length === 0) {
      console.log('⚠️  No accounts found in Blob Storage');
      return;
    }
    
    // Fetch and display each account
    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i];
      
      try {
        const response = await fetch(blob.url);
        const data = await response.json();
        
        console.log(`\n📧 Account ${i + 1}:`);
        console.log(`   Email:       ${data.email}`);
        console.log(`   Name:        ${data.name || 'Niet opgegeven'}`);
        console.log(`   Company:     ${data.company || 'Niet opgegeven'}`);
        console.log(`   Phone:       ${data.phone || 'Niet opgegeven'}`);
        console.log(`   Created:     ${new Date(data.createdAt).toLocaleString('nl-NL')}`);
        console.log(`   Is Guest:    ${data.isGuest ? 'Ja' : 'Nee'}`);
        console.log(`   Is Active:   ${data.isActive !== false ? 'Ja' : 'Nee'}`);
        console.log(`   Blob Path:   ${blob.pathname}`);
        console.log(`   Blob URL:    ${blob.url.substring(0, 60)}...`);
        console.log('-'.repeat(80));
      } catch (error) {
        console.error(`   ❌ Error fetching data for ${blob.pathname}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total accounts: ${blobs.length}`);
    console.log(`   Blob prefix: auth-accounts/`);
    console.log(`   Environment: ${process.env.VERCEL_ENV || 'development'}`);
    
  } catch (error) {
    console.error('❌ Error listing accounts:', error);
    console.error('Details:', error.message);
  }
}

listAllAccounts();

