// Admin configuration
// Use environment variables where possible, with fallbacks for development

export const ADMIN_CONFIG = {
  // List of admin emails who can access admin features
  adminEmails: process.env.ADMIN_EMAILS?.split(',') || [
    'h.schlimback@gmail.com',
    'rick@warmeleads.eu'
  ],
  
  // Demo account (only for development/testing)
  demoAccount: {
    email: process.env.DEMO_EMAIL || 'demo@warmeleads.eu',
    password: process.env.DEMO_PASSWORD || 'demo123',
    name: 'Demo User',
    company: 'Demo Company'
  }
};

// Helper function to check if email is admin
export function isAdminEmail(email: string): boolean {
  return ADMIN_CONFIG.adminEmails.includes(email);
}

// Helper function to get first admin email
export function getFirstAdminEmail(): string {
  return ADMIN_CONFIG.adminEmails[0];
}

