// Environment configuration checker
export function checkEnvironmentConfig() {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check Google Sheets API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY) {
    warnings.push('Google Sheets API key not configured (NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY)');
  }

  // Check Blob Storage token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    issues.push('Blob Storage token not configured (BLOB_READ_WRITE_TOKEN)');
  }

  // Check Twilio credentials
  if (!process.env.TWILIO_ACCOUNT_SID) {
    issues.push('Twilio Account SID not configured (TWILIO_ACCOUNT_SID)');
  }

  if (!process.env.TWILIO_AUTH_TOKEN) {
    issues.push('Twilio Auth Token not configured (TWILIO_AUTH_TOKEN)');
  }

  if (!process.env.TWILIO_MESSAGING_SERVICE_SID) {
    issues.push('Twilio Messaging Service SID not configured (TWILIO_MESSAGING_SERVICE_SID)');
  }

  // Check Vercel KV
  if (!process.env.KV_REST_API_URL) {
    warnings.push('Vercel KV not configured (KV_REST_API_URL)');
  }

  return {
    issues,
    warnings,
    hasIssues: issues.length > 0,
    hasWarnings: warnings.length > 0
  };
}

// Log environment status (only in development)
export function logEnvironmentStatus() {
  if (process.env.NODE_ENV === 'development') {
    const config = checkEnvironmentConfig();
    
    if (config.hasIssues) {
      console.error('🚨 Environment Issues:', config.issues);
    }
    
    if (config.hasWarnings) {
      console.warn('⚠️ Environment Warnings:', config.warnings);
    }
    
    if (!config.hasIssues && !config.hasWarnings) {
      console.log('✅ All environment variables configured correctly');
    }
  }
}
