// Smart CRM System for WarmeLeads
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  type: 'lisa' | 'user';
  content: string;
  timestamp: Date;
  step?: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  lastActivity: Date;
  status: 'lead' | 'contacted' | 'customer' | 'inactive';
  source: 'chat' | 'direct' | 'landing_page';
  chatHistory: ChatMessage[];
  orders: Order[];
  openInvoices: OpenInvoice[];
  dataHistory: DataChange[];
  hasAccount: boolean;
  accountCreatedAt?: Date;
  googleSheetId?: string;
  googleSheetUrl?: string;
  leadData?: Lead[];
  emailNotifications?: {
    enabled: boolean;
    newLeads: boolean;
    lastNotificationSent?: Date;
  };
}

export interface Order {
  id: string;
  customerId: string;
  industry: string;
  leadType: 'exclusive' | 'shared';
  quantity: number;
  amount: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

export interface OpenInvoice {
  id: string;
  customerId: string;
  industry: string;
  leadType: string;
  quantity: string;
  amount: string;
  createdAt: Date;
  lastReminderSent?: Date;
  reminderCount: number;
  status: 'draft' | 'sent' | 'overdue' | 'abandoned';
}

export interface DataChange {
  field: string;
  oldValue: string | undefined;
  newValue: string;
  timestamp: Date;
  source: 'chat' | 'form' | 'admin';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  interest: string;
  budget?: string;
  timeline?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'campaign' | 'manual' | 'import';
  sheetRowNumber?: number; // For Google Sheets sync
  
  // Branch-specific fields
  branchData?: {
    // Thuisbatterijen specifiek
    datumInteresse?: string;
    postcode?: string;
    huisnummer?: string;
    zonnepanelen?: string;
    dynamischContract?: string;
    stroomverbruik?: string;
    nieuwsbrief?: string;
    redenThuisbatterij?: string;
    koopintentie?: string;
    
    // Zonnepanelen specifiek (voor later)
    dakoppervlak?: string;
    dakrichting?: string;
    schaduw?: string;
    
    // Warmtepompen specifiek (voor later)
    huisgrootte?: string;
    isolatie?: string;
    huidigeVerwarming?: string;
    
    // Financial lease specifiek (voor later)
    bedrijfsomvang?: string;
    branche?: string;
    kredietScore?: string;
  };
}

class CRMSystem {
  private customers: Map<string, Customer> = new Map();
  private customersByEmail: Map<string, string> = new Map(); // email -> customerId

  // Initialize with data from localStorage (in production: database)
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('warmeleads_crm_data');
      if (stored) {
        const { customers, customersByEmail } = JSON.parse(stored);
        
        // Properly restore customers with dates and branchData
        this.customers = new Map(customers.map(([id, customer]: [string, any]) => [id, {
          ...customer,
          createdAt: new Date(customer.createdAt),
          lastActivity: new Date(customer.lastActivity),
          accountCreatedAt: customer.accountCreatedAt ? new Date(customer.accountCreatedAt) : undefined,
          chatHistory: customer.chatHistory.map((msg: any) => ({ 
            ...msg, 
            timestamp: new Date(msg.timestamp) 
          })),
          dataHistory: customer.dataHistory.map((change: any) => ({ 
            ...change, 
            timestamp: new Date(change.timestamp) 
          })),
          leadData: customer.leadData?.map((lead: any) => ({ 
            ...lead, 
            createdAt: new Date(lead.createdAt), 
            updatedAt: new Date(lead.updatedAt),
            // Ensure branchData is preserved correctly
            branchData: lead.branchData || {}
          })) || []
        }]));
        
        this.customersByEmail = new Map(customersByEmail);
        
        console.log('📊 CRM data loaded from storage with branch data preservation');
      }
    } catch (error) {
      console.error('Error loading CRM data:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        customers: Array.from(this.customers.entries()),
        customersByEmail: Array.from(this.customersByEmail.entries())
      };
      localStorage.setItem('warmeleads_crm_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving CRM data:', error);
    }
  }

  // Smart customer creation/update system
  createOrUpdateCustomer(data: {
    email?: string;
    name?: string;
    phone?: string;
    company?: string;
    source?: 'chat' | 'direct' | 'landing_page';
  }): Customer {
    let customer: Customer;
    let customerId: string;

    // Find existing customer by email
    if (data.email && this.customersByEmail.has(data.email)) {
      customerId = this.customersByEmail.get(data.email)!;
      customer = this.customers.get(customerId)!;
    } else {
      // Create new customer
      customerId = uuidv4();
      customer = {
        id: customerId,
        email: data.email || '',
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'lead',
        source: data.source || 'chat',
        chatHistory: [],
        orders: [],
        openInvoices: [],
        dataHistory: [],
        hasAccount: false,
        leadData: []
      };
      
      this.customers.set(customerId, customer);
      if (data.email) {
        this.customersByEmail.set(data.email, customerId);
      }
    }

    // Smart data updates with history tracking
    const updates: Partial<Customer> = {};
    const dataChanges: DataChange[] = [];

    // Track all field changes
    if (data.name && data.name !== customer.name) {
      dataChanges.push({
        field: 'name',
        oldValue: customer.name,
        newValue: data.name,
        timestamp: new Date(),
        source: 'form'
      });
      updates.name = data.name;
    }

    if (data.phone && data.phone !== customer.phone) {
      dataChanges.push({
        field: 'phone',
        oldValue: customer.phone,
        newValue: data.phone,
        timestamp: new Date(),
        source: 'form'
      });
      updates.phone = data.phone;
    }

    if (data.company && data.company !== customer.company) {
      dataChanges.push({
        field: 'company',
        oldValue: customer.company,
        newValue: data.company,
        timestamp: new Date(),
        source: 'form'
      });
      updates.company = data.company;
    }

    if (data.email && data.email !== customer.email) {
      // Update email mapping
      if (customer.email) {
        this.customersByEmail.delete(customer.email);
      }
      this.customersByEmail.set(data.email, customerId);
      
      dataChanges.push({
        field: 'email',
        oldValue: customer.email,
        newValue: data.email,
        timestamp: new Date(),
        source: 'form'
      });
      updates.email = data.email;
    }

    // Apply updates
    Object.assign(customer, updates);
    customer.lastActivity = new Date();
    customer.dataHistory.push(...dataChanges);

    this.saveToStorage();
    return customer;
  }

  // Log chat messages
  logChatMessage(customerEmail: string, message: ChatMessage) {
    const customerId = this.customersByEmail.get(customerEmail);
    if (customerId) {
      const customer = this.customers.get(customerId);
      if (customer) {
        customer.chatHistory.push(message);
        customer.lastActivity = new Date();
        this.saveToStorage();
      }
    }
  }

  // Create open invoice (before payment)
  createOpenInvoice(customerEmail: string, invoiceData: {
    industry: string;
    leadType: string;
    quantity: string;
    amount: string;
  }): OpenInvoice {
    const customer = this.getOrCreateCustomerByEmail(customerEmail);
    
    const invoice: OpenInvoice = {
      id: uuidv4(),
      customerId: customer.id,
      industry: invoiceData.industry,
      leadType: invoiceData.leadType,
      quantity: invoiceData.quantity,
      amount: invoiceData.amount,
      createdAt: new Date(),
      reminderCount: 0,
      status: 'draft'
    };

    customer.openInvoices.push(invoice);
    customer.lastActivity = new Date();
    this.saveToStorage();

    return invoice;
  }

  // Convert open invoice to paid order
  convertInvoiceToOrder(invoiceId: string, stripeData: {
    sessionId?: string;
    paymentIntentId?: string;
  }): Order | null {
    for (const customer of this.customers.values()) {
      const invoiceIndex = customer.openInvoices.findIndex(inv => inv.id === invoiceId);
      if (invoiceIndex !== -1) {
        const invoice = customer.openInvoices[invoiceIndex];
        
        // Create order from invoice
        const order: Order = {
          id: uuidv4(),
          customerId: customer.id,
          industry: invoice.industry,
          leadType: invoice.leadType.toLowerCase().includes('exclusief') ? 'exclusive' : 'shared',
          quantity: parseInt(invoice.quantity.match(/\d+/)?.[0] || '0'),
          amount: parseFloat(invoice.amount.replace(/[€.,]/g, '')) || 0,
          status: 'paid',
          createdAt: invoice.createdAt,
          paidAt: new Date(),
          stripeSessionId: stripeData.sessionId,
          stripePaymentIntentId: stripeData.paymentIntentId
        };

        // Add order and remove open invoice
        customer.orders.push(order);
        customer.openInvoices.splice(invoiceIndex, 1);
        customer.status = 'customer';
        customer.lastActivity = new Date();

        this.saveToStorage();
        return order;
      }
    }
    return null;
  }

  // Get customer by email (create if not exists)
  private getOrCreateCustomerByEmail(email: string): Customer {
    let customerId = this.customersByEmail.get(email);
    if (!customerId) {
      return this.createOrUpdateCustomer({ email, source: 'chat' });
    }
    return this.customers.get(customerId)!;
  }

  // Get all customers for admin
  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values()).sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  // Get customers with open invoices
  getCustomersWithOpenInvoices(): Customer[] {
    return this.getAllCustomers().filter(customer => customer.openInvoices.length > 0);
  }

  // Get overdue invoices (older than 24 hours)
  getOverdueInvoices(): { customer: Customer; invoice: OpenInvoice }[] {
    const overdueList: { customer: Customer; invoice: OpenInvoice }[] = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const customer of this.customers.values()) {
      for (const invoice of customer.openInvoices) {
        if (new Date(invoice.createdAt) < oneDayAgo && invoice.status !== 'abandoned') {
          overdueList.push({ customer, invoice });
        }
      }
    }

    return overdueList.sort((a, b) => 
      new Date(a.invoice.createdAt).getTime() - new Date(b.invoice.createdAt).getTime()
    );
  }

  // Mark invoice as reminder sent
  markReminderSent(invoiceId: string) {
    for (const customer of this.customers.values()) {
      const invoice = customer.openInvoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.lastReminderSent = new Date();
        invoice.reminderCount += 1;
        invoice.status = 'sent';
        this.saveToStorage();
        break;
      }
    }
  }

  // Get customer by ID
  getCustomerById(customerId: string): Customer | null {
    return this.customers.get(customerId) || null;
  }

  // Update customer status
  updateCustomerStatus(customerId: string, status: Customer['status']) {
    const customer = this.customers.get(customerId);
    if (customer) {
      customer.status = status;
      customer.lastActivity = new Date();
      this.saveToStorage();
    }
  }

  // Update customer data (generic)
  updateCustomer(customerId: string, updates: Partial<Customer>): boolean {
    const customer = this.customers.get(customerId);
    if (customer) {
      Object.assign(customer, updates);
      customer.lastActivity = new Date();
      this.saveToStorage();
      console.log(`✅ Customer ${customerId} updated with:`, updates);
      return true;
    }
    return false;
  }

  // Account management
  createAccount(customerId: string): boolean {
    const customer = this.customers.get(customerId);
    if (customer && !customer.hasAccount) {
      customer.hasAccount = true;
      customer.accountCreatedAt = new Date();
      customer.status = 'customer';
      customer.lastActivity = new Date();
      
      // Add data change log
      customer.dataHistory.push({
        field: 'hasAccount',
        oldValue: 'false',
        newValue: 'true',
        timestamp: new Date(),
        source: 'admin'
      });

      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Google Sheets integration
  linkGoogleSheet(customerId: string, sheetUrl: string): boolean {
    const customer = this.customers.get(customerId);
    if (customer && customer.hasAccount) {
      // Extract sheet ID from URL
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const sheetId = match[1];
        customer.googleSheetId = sheetId;
        customer.googleSheetUrl = sheetUrl;
        customer.lastActivity = new Date();
        
        // Add data change log
        customer.dataHistory.push({
          field: 'googleSheetId',
          oldValue: customer.googleSheetId || undefined,
          newValue: sheetId,
          timestamp: new Date(),
          source: 'admin'
        });

        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Lead management
  addLeadToCustomer(customerId: string, leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead | null {
    const customer = this.customers.get(customerId);
    if (customer) {
      console.log(`🔧 CRM: Adding lead ${leadData.name} with branchData:`, leadData.branchData);
      
      const lead: Lead = {
        id: uuidv4(),
        ...leadData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log(`🔧 CRM: Created lead object:`, lead);
      console.log(`🔧 CRM: Lead has branchData:`, !!lead.branchData);

      if (!customer.leadData) {
        customer.leadData = [];
      }
      customer.leadData.push(lead);
      customer.lastActivity = new Date();
      
      console.log(`🔧 CRM: Customer now has ${customer.leadData.length} leads`);
      console.log(`🔧 CRM: Last added lead branchData:`, customer.leadData[customer.leadData.length - 1].branchData);
      
      this.saveToStorage();
      return lead;
    }
    return null;
  }

  // Update lead in customer account
  updateCustomerLead(customerId: string, leadId: string, updates: Partial<Lead>): boolean {
    const customer = this.customers.get(customerId);
    if (customer && customer.leadData) {
      const leadIndex = customer.leadData.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        customer.leadData[leadIndex] = {
          ...customer.leadData[leadIndex],
          ...updates,
          updatedAt: new Date()
        };
        customer.lastActivity = new Date();
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Remove lead from customer account
  removeLeadFromCustomer(customerId: string, leadId: string): boolean {
    const customer = this.customers.get(customerId);
    if (customer && customer.leadData) {
      const leadIndex = customer.leadData.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        const removedLead = customer.leadData[leadIndex];
        customer.leadData.splice(leadIndex, 1);
        customer.lastActivity = new Date();
        this.saveToStorage();
        console.log(`🗑️ CRM: Removed lead ${removedLead.name} (${leadId}) from customer ${customerId}`);
        return true;
      }
    }
    return false;
  }

  // Get customers with accounts
  getCustomersWithAccounts(): Customer[] {
    return this.getAllCustomers().filter(c => c.hasAccount);
  }

  // Get customers without accounts
  getCustomersWithoutAccounts(): Customer[] {
    return this.getAllCustomers().filter(c => !c.hasAccount);
  }

  // Get analytics data
  getAnalytics() {
    const customers = this.getAllCustomers();
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status !== 'inactive').length;
    const customersWithAccounts = customers.filter(c => c.hasAccount).length;
    const totalOrders = customers.reduce((sum, c) => sum + c.orders.length, 0);
    const totalRevenue = customers.reduce((sum, c) => 
      sum + c.orders.reduce((orderSum, o) => orderSum + o.amount, 0), 0
    );
    const openInvoices = customers.reduce((sum, c) => sum + c.openInvoices.length, 0);
    const overdueInvoices = this.getOverdueInvoices().length;
    const totalLeads = customers.reduce((sum, c) => sum + (c.leadData?.length || 0), 0);

    return {
      totalCustomers,
      activeCustomers,
      customersWithAccounts,
      customersWithoutAccounts: totalCustomers - customersWithAccounts,
      totalOrders,
      totalRevenue,
      openInvoices,
      overdueInvoices,
      totalLeads,
      conversionRate: totalCustomers > 0 ? (totalOrders / totalCustomers * 100) : 0
    };
  }
}

// Singleton instance
export const crmSystem = new CRMSystem();

// Helper functions for easy access
export const logChatMessage = (customerEmail: string, message: ChatMessage) => {
  crmSystem.logChatMessage(customerEmail, message);
};

export const createOrUpdateCustomer = (data: Parameters<typeof crmSystem.createOrUpdateCustomer>[0]) => {
  return crmSystem.createOrUpdateCustomer(data);
};

export const createOpenInvoice = (customerEmail: string, invoiceData: Parameters<typeof crmSystem.createOpenInvoice>[1]) => {
  return crmSystem.createOpenInvoice(customerEmail, invoiceData);
};

export const getAllCustomers = () => {
  return crmSystem.getAllCustomers();
};

export const getCustomersWithOpenInvoices = () => {
  return crmSystem.getCustomersWithOpenInvoices();
};

export const getOverdueInvoices = () => {
  return crmSystem.getOverdueInvoices();
};

export const getCRMAnalytics = () => {
  return crmSystem.getAnalytics();
};
