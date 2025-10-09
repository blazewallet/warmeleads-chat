// Echte database functies voor admin backend

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  industry: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  status: 'active' | 'inactive' | 'vip';
  joinDate: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  industry: string;
  leadType: string;
  quantity: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  orderDate: string;
  deliveryDate?: string;
  paymentMethod: string;
  paymentIntentId?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  leadType: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
  assignedTo?: string;
  notes?: string;
  customerId?: string;
}

export interface ChatSession {
  id: string;
  customerName?: string;
  industry?: string;
  status: 'active' | 'completed' | 'abandoned';
  currentStep: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  lastMessage?: string;
  userProfile: any;
  messages: any[];
}

// In-memory storage (later te vervangen door echte database)
let customers: Customer[] = [];
let orders: Order[] = [];
let leads: Lead[] = [];
let chatSessions: ChatSession[] = [];

// Customer functions
export async function getCustomers(): Promise<Customer[]> {
  // Laad klanten uit localStorage of database
  const stored = localStorage?.getItem('warmeleads_customers');
  if (stored) {
    customers = JSON.parse(stored);
  }
  return customers;
}

export async function addCustomer(customer: Omit<Customer, 'id' | 'joinDate'>): Promise<Customer> {
  const newCustomer: Customer = {
    ...customer,
    id: `cust_${Date.now()}`,
    joinDate: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  localStorage?.setItem('warmeleads_customers', JSON.stringify(customers));
  
  return newCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  customers[index] = { ...customers[index], ...updates };
  localStorage?.setItem('warmeleads_customers', JSON.stringify(customers));
  
  return customers[index];
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  customers.splice(index, 1);
  localStorage?.setItem('warmeleads_customers', JSON.stringify(customers));
  
  return true;
}

// Order functions
export async function getOrders(): Promise<Order[]> {
  const stored = localStorage?.getItem('warmeleads_orders');
  if (stored) {
    orders = JSON.parse(stored);
  }
  return orders;
}

export async function addOrder(order: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>): Promise<Order> {
  const orderNumber = `WL-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
  
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}`,
    orderNumber,
    orderDate: new Date().toISOString()
  };
  
  orders.push(newOrder);
  localStorage?.setItem('warmeleads_orders', JSON.stringify(orders));
  
  // Update customer stats
  const customer = customers.find(c => c.id === order.customerId);
  if (customer) {
    customer.totalOrders++;
    customer.totalSpent += order.amount;
    customer.lastOrder = newOrder.orderDate;
    localStorage?.setItem('warmeleads_customers', JSON.stringify(customers));
  }
  
  return newOrder;
}

// Lead functions
export async function getLeads(): Promise<Lead[]> {
  const stored = localStorage?.getItem('warmeleads_leads');
  if (stored) {
    leads = JSON.parse(stored);
  }
  return leads;
}

export async function addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const newLead: Lead = {
    ...lead,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  leads.push(newLead);
  localStorage?.setItem('warmeleads_leads', JSON.stringify(leads));
  
  return newLead;
}

// Chat functions
export async function getChatSessions(): Promise<ChatSession[]> {
  const stored = localStorage?.getItem('warmeleads_chats');
  if (stored) {
    chatSessions = JSON.parse(stored);
  }
  return chatSessions;
}

export async function addChatSession(session: Omit<ChatSession, 'id'>): Promise<ChatSession> {
  const newSession: ChatSession = {
    ...session,
    id: `chat_${Date.now()}`
  };
  
  chatSessions.push(newSession);
  localStorage?.setItem('warmeleads_chats', JSON.stringify(chatSessions));
  
  return newSession;
}

// Analytics functions
export async function getAnalytics() {
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const conversionRate = totalCustomers > 0 ? (completedOrders / totalCustomers) * 100 : 0;

  return {
    overview: {
      totalVisitors: totalCustomers * 10, // Estimate
      totalLeads: leads.length,
      totalRevenue,
      conversionRate: parseFloat(conversionRate.toFixed(2))
    },
    customers: totalCustomers,
    orders: totalOrders,
    revenue: totalRevenue
  };
}

// Initialize with real data from Stripe/existing orders if available
export async function initializeRealData() {
  // Als er nog geen data is, maak dan een lege state
  if (customers.length === 0) {
    console.log('📊 Initializing empty database - ready for real customer data');
  }
  
  return {
    customers: customers.length,
    orders: orders.length,
    leads: leads.length,
    chats: chatSessions.length
  };
}


