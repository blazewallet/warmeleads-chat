/**
 * WHATSAPP BUSINESS API INTEGRATION
 * 
 * Hybrid approach:
 * 1. Warmeleads WhatsApp Business (default, gratis)
 * 2. Customer own WhatsApp Business (premium, €750 setup)
 */

import { Client, MessageMedia, LocalAuth } from 'whatsapp-web.js';
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
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
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

// WhatsApp Service Class
export class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Initialize WhatsApp Client (Warmeleads number)
  public async initializeWarmeleadsClient(): Promise<boolean> {
    try {
      if (this.isInitialized && this.client) {
        return true;
      }

      console.log('🔄 Initializing Warmeleads WhatsApp Business...');
      
      this.client = new Client({
        authStrategy: new LocalAuth({ clientId: 'warmeleads-business' }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      // Event listeners
      this.client.on('qr', (qr) => {
        console.log('📱 WhatsApp QR Code generated:', qr);
        // Store QR code in blob storage for admin to scan
        this.storeQRCode(qr);
      });

      this.client.on('ready', () => {
        console.log('✅ Warmeleads WhatsApp Business is ready!');
        this.isInitialized = true;
      });

      this.client.on('message', (message) => {
        console.log('📨 Message received:', message.body);
        // Handle incoming messages
        this.handleIncomingMessage(message);
      });

      await this.client.initialize();
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
      return false;
    }
  }

  // Send message using Warmeleads number
  public async sendMessageWarmeleads(
    phoneNumber: string, 
    message: string, 
    config: WhatsAppConfig
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.client || !this.isInitialized) {
        await this.initializeWarmeleadsClient();
      }

      if (!this.client) {
        throw new Error('WhatsApp client not initialized');
      }

      // Format phone number (remove + and add @c.us)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '') + '@c.us';
      
      // Replace template variables
      const processedMessage = this.processTemplate(message, config);
      
      console.log(`📤 Sending WhatsApp message to ${formattedNumber}`);
      console.log(`📝 Message: ${processedMessage}`);
      
      const result = await this.client.sendMessage(formattedNumber, processedMessage);
      
      // Log message
      await this.logMessage({
        id: result.id.id,
        leadId: '', // Will be set by caller
        customerId: config.customerId,
        phoneNumber,
        message: processedMessage,
        template: 'newLead',
        status: 'sent',
        sentAt: new Date().toISOString(),
        retryCount: 0
      });

      return { success: true, messageId: result.id.id };
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send message using customer's own WhatsApp Business API
  public async sendMessageCustomerAPI(
    phoneNumber: string,
    message: string,
    config: WhatsAppConfig
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!config.customerCredentials) {
        throw new Error('Customer credentials not configured');
      }

      const { accessToken, phoneNumberId } = config.customerCredentials;
      
      // Process template
      const processedMessage = this.processTemplate(message, config);
      
      // Send via Meta Business API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber.replace(/[^0-9]/g, ''),
            type: 'text',
            text: { body: processedMessage }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send message');
      }

      // Log message
      await this.logMessage({
        id: result.messages[0].id,
        leadId: '', // Will be set by caller
        customerId: config.customerId,
        phoneNumber,
        message: processedMessage,
        template: 'newLead',
        status: 'sent',
        sentAt: new Date().toISOString(),
        retryCount: 0
      });

      return { success: true, messageId: result.messages[0].id };
    } catch (error) {
      console.error('❌ Failed to send customer API message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Process template variables
  private processTemplate(template: string, config: WhatsAppConfig): string {
    return template
      .replace(/\{\{businessName\}\}/g, config.businessName)
      .replace(/\{\{businessPhone\}\}/g, config.useOwnNumber ? config.businessPhone || '' : config.warmeleadsNumber)
      .replace(/\{\{businessWebsite\}\}/g, 'www.warmeleads.eu')
      .replace(/\{\{leadName\}\}/g, '{{leadName}}') // Will be replaced by caller
      .replace(/\{\{product\}\}/g, '{{product}}'); // Will be replaced by caller
  }

  // Store QR code in blob storage
  private async storeQRCode(qrCode: string): Promise<void> {
    try {
      await put('whatsapp/qr-code.json', JSON.stringify({
        qrCode,
        timestamp: new Date().toISOString()
      }), { access: 'public' });
    } catch (error) {
      console.error('❌ Failed to store QR code:', error);
    }
  }

  // Handle incoming messages
  private async handleIncomingMessage(message: any): Promise<void> {
    try {
      console.log('📨 Processing incoming message:', {
        from: message.from,
        body: message.body,
        timestamp: message.timestamp
      });
      
      // Store incoming message in blob storage
      await put(`whatsapp/messages/incoming/${message.id.id}.json`, JSON.stringify({
        id: message.id.id,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        receivedAt: new Date().toISOString()
      }), { access: 'public' });
    } catch (error) {
      console.error('❌ Failed to handle incoming message:', error);
    }
  }

  // Log outgoing message
  private async logMessage(message: WhatsAppMessage): Promise<void> {
    try {
      await put(`whatsapp/messages/outgoing/${message.id}.json`, JSON.stringify(message), { access: 'public' });
    } catch (error) {
      console.error('❌ Failed to log message:', error);
    }
  }

  // Get message status
  public async getMessageStatus(messageId: string): Promise<WhatsAppMessage | null> {
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
  public async updateMessageStatus(messageId: string, status: WhatsAppMessage['status']): Promise<void> {
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

  // Cleanup
  public async destroy(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const whatsappService = WhatsAppService.getInstance();
