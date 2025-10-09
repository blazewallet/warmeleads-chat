/**
 * WHATSAPP BUSINESS API INTEGRATION
 * 
 * Hybrid approach:
 * 1. Warmeleads WhatsApp Business (default, gratis)
 * 2. Customer own WhatsApp Business (premium, €750 setup)
 */

// WhatsApp API - Server-side only
// Note: whatsapp-web.js is not compatible with Next.js client-side
// This will be implemented as server-side API routes only
import { put, del } from '@vercel/blob';

// WhatsApp Configuration Interface
export interface WhatsAppConfig {
  customerId: string;
  enabled: boolean;
  useOwnNumber: boolean; // false = Warmeleads nummer, true = klant eigen nummer
  businessName: string;
  businessPhone?: string; // Klant eigen nummer (alleen als useOwnNumber = true)
  
  // Warmeleads WhatsApp Business (default)
  warmeleadsNumber: string; // +31 6 12345678 (Warmeleads nummer)
  
  // Klant eigen WhatsApp Business (premium)
  customerCredentials?: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    verified: boolean;
    setupCost: number; // €750
  };
  
  // Message Templates
  templates: {
    newLead: string;
    followUp: string;
    reminder: string;
  };
  
  // Timing Settings
  timing: {
    newLead: 'immediate' | '1hour' | '24hours';
    followUp: number; // hours
    reminder: number; // hours
  };
  
  // Usage Tracking
  usage: {
    messagesSent: number;
    messagesDelivered: number;
    messagesRead: number;
    messagesFailed: number;
    lastReset: string; // ISO date
  };
  
  // Billing
  billing: {
    plan: 'basic' | 'pro' | 'enterprise';
    messagesLimit: number;
    setupPaid: boolean; // €750 voor eigen nummer
  };
  
  // Message History for Analytics
  messageHistory?: WhatsAppMessage[];
}

// Message Status Interface
export interface WhatsAppMessage {
  id: string;
  leadId: string;
  customerId: string;
  phoneNumber: string;
  message: string;
  template: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  timestamp: string; // For analytics compatibility
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
  type?: string;
  templateName?: string;
  direction?: 'incoming' | 'outgoing';
}

// Default Templates
export const DEFAULT_TEMPLATES = {
  newLead: `Hallo {{leadName}}, dit is {{businessName}} via Warmeleads.

Wij hebben uw interesse in {{product}} gezien en willen graag contact met u opnemen.

Graag nemen wij binnenkort contact met u op voor een vrijblijvend gesprek!

Met vriendelijke groet,
{{businessName}} via Warmeleads

📱 WhatsApp: {{businessPhone}}
🌐 Website: {{businessWebsite}}`,

  followUp: `Hallo {{leadName}},

Wij hebben u eerder gecontacteerd over {{product}}.

Heeft u nog vragen of interesse in een offerte?

Graag horen wij van u!

{{businessName}} via Warmeleads`,

  reminder: `Hallo {{leadName}},

Een vriendelijke herinnering over uw interesse in {{product}}.

Wij staan klaar om u te helpen met een offerte of meer informatie.

Neem gerust contact met ons op!

{{businessName}} via Warmeleads`
};

// WhatsApp Service - Server-side only implementation
// All WhatsApp functionality will be handled via API routes
export class WhatsAppService {
  // Process template variables
  public static processTemplate(template: string, config: WhatsAppConfig, leadName?: string, product?: string): string {
    return template
      .replace(/\{\{businessName\}\}/g, config.businessName)
      .replace(/\{\{businessPhone\}\}/g, config.useOwnNumber ? config.businessPhone || '' : config.warmeleadsNumber)
      .replace(/\{\{businessWebsite\}\}/g, 'www.warmeleads.eu')
      .replace(/\{\{leadName\}\}/g, leadName || '{{leadName}}')
      .replace(/\{\{product\}\}/g, product || '{{product}}');
  }

  // Log outgoing message
  public static async logMessage(message: WhatsAppMessage): Promise<void> {
    try {
      await put(`whatsapp/messages/outgoing/${message.id}.json`, JSON.stringify(message), { access: 'public' });
    } catch (error) {
      console.error('❌ Failed to log message:', error);
    }
  }

  // Get message status
  public static async getMessageStatus(messageId: string): Promise<WhatsAppMessage | null> {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/whatsapp/messages/outgoing/${messageId}.json`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get message status:', error);
      return null;
    }
  }

  // Update message status
  public static async updateMessageStatus(messageId: string, status: WhatsAppMessage['status']): Promise<void> {
    try {
      const message = await this.getMessageStatus(messageId);
      if (message) {
        message.status = status;
        if (status === 'delivered') message.deliveredAt = new Date().toISOString();
        if (status === 'read') message.readAt = new Date().toISOString();
        
        await put(`whatsapp/messages/outgoing/${messageId}.json`, JSON.stringify(message), { access: 'public' });
      }
    } catch (error) {
      console.error('❌ Failed to update message status:', error);
    }
  }
}

// Export static service
export const whatsappService = WhatsAppService;
