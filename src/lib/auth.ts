import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_CONFIG } from '@/config/admin';

export interface UserPermissions {
  canViewLeads: boolean;
  canViewOrders: boolean;
  canManageEmployees: boolean;
  canCheckout: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  createdAt: Date;
  lastLogin: Date;
  isGuest: boolean;
  orders: Order[];
  
  // Employee system fields
  role?: 'owner' | 'employee';
  companyId?: string; // Email of the owner
  ownerEmail?: string; // Email of the owner
  permissions?: UserPermissions;
}

export interface Order {
  id: string;
  type: string;
  quantity: number;
  status: 'pending' | 'active' | 'delivered' | 'cancelled';
  date: string;
  amount: number;
  leads?: number;
  conversions?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginAsGuest: (guestData: GuestData) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  createAccountFromGuest: (userData: RegisterData) => Promise<void>;
  clearError: () => void;
  init: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface GuestData {
  email: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface EmployeeAccount {
  email: string;
  name: string;
  role: 'employee';
  permissions: UserPermissions;
  invitedAt: string;
  acceptedAt?: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  ownerEmail: string;
  companyName: string;
  employees: EmployeeAccount[];
  createdAt: string;
}

// Mock database for demo purposes - dynamically generated from config
const getMockUsers = (): User[] => {
  const users: User[] = [];
  
  // Add demo account if configured
  if (ADMIN_CONFIG.demoAccount) {
    users.push({
      id: 'user_demo',
      email: ADMIN_CONFIG.demoAccount.email,
      name: ADMIN_CONFIG.demoAccount.name,
      company: ADMIN_CONFIG.demoAccount.company,
      phone: '+31 85 047 7067',
      createdAt: new Date(),
      lastLogin: new Date(),
      isGuest: false,
      role: 'owner',
      permissions: {
        canViewLeads: true,
        canViewOrders: true,
        canManageEmployees: true,
        canCheckout: true,
      },
      orders: [
        {
          id: 'order_1',
          type: 'Exclusieve Thuisbatterij Leads',
          quantity: 50,
          status: 'delivered',
          date: '2024-01-15',
          amount: 2000,
          leads: 47,
          conversions: 12
        },
        {
          id: 'order_2',
          type: 'Gedeelde Zonnepaneel Leads',
          quantity: 500,
          status: 'active',
          date: '2024-01-20',
          amount: 7500,
          leads: 423,
          conversions: 89
        }
      ]
    });
  }
  
  // Add admin accounts
  ADMIN_CONFIG.adminEmails.forEach((adminEmail, index) => {
    users.push({
      id: `user_admin_${index}`,
      email: adminEmail,
      name: adminEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      company: 'WarmeLeads BV',
      phone: '+31 61 392 7338',
      createdAt: new Date('2025-09-20'),
      lastLogin: new Date(),
      isGuest: false,
      role: 'owner',
      permissions: {
        canViewLeads: true,
        canViewOrders: true,
        canManageEmployees: true,
        canCheckout: true,
      },
      orders: []
    });
  });
  
  return users;
};

const mockUsers: User[] = getMockUsers();
let nextUserId = 4;

// Helper function to get default permissions for owners
const getDefaultOwnerPermissions = (): UserPermissions => ({
  canViewLeads: true,
  canViewOrders: true,
  canManageEmployees: true,
  canCheckout: true,
});

// Helper function to get default permissions for employees
const getDefaultEmployeePermissions = (): UserPermissions => ({
  canViewLeads: true,
  canViewOrders: true,
  canManageEmployees: false,
  canCheckout: false,
});

// Helper function to load employee/company data
const loadUserWithCompanyData = async (user: User): Promise<User> => {
  try {
    // If user has companyId/ownerEmail, load company data
    if (user.companyId || user.ownerEmail) {
      const companyResponse = await fetch(`/api/auth/company?ownerEmail=${encodeURIComponent(user.companyId || user.ownerEmail || '')}`);
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData.success && companyData.company) {
          // Merge company info into user
          user.company = user.company || companyData.company.companyName;
        }
      }
    }
    
    // Ensure permissions are set
    if (!user.permissions) {
      user.permissions = user.role === 'owner' 
        ? getDefaultOwnerPermissions() 
        : getDefaultEmployeePermissions();
    }
    
    return user;
  } catch (error) {
    console.error('Error loading company data:', error);
    // Return user with default permissions if loading fails
    if (!user.permissions) {
      user.permissions = user.role === 'owner' 
        ? getDefaultOwnerPermissions() 
        : getDefaultEmployeePermissions();
    }
    return user;
  }
};

// Simple auth store without complex state management
let authState = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

// Listeners for state changes
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    login: async (email: string, password: string) => {
      console.log('🔐 LOGIN ATTEMPT:', { email });
      
      // Update local state
      authState.isLoading = true;
      authState.error = null;
      set({ isLoading: true, error: null });
      
      try {
        // First check for hardcoded demo accounts (backwards compatibility)
        let user: User | null = null;
        const existingUser = mockUsers.find(u => u.email === email);
        
        if (existingUser) {
          // Check password for existing mock users
          let validPassword = false;
          
          // Check demo account
          if (ADMIN_CONFIG.demoAccount && 
              email === ADMIN_CONFIG.demoAccount.email && 
              password === ADMIN_CONFIG.demoAccount.password) {
            validPassword = true;
          }
          
          // Check if it's an admin account (they all use the same password for now)
          if (ADMIN_CONFIG.adminEmails.includes(email) && password === 'Ab49n805!') {
            validPassword = true;
          }
          
          if (validPassword) {
            user = { ...existingUser, lastLogin: new Date() };
            
            // Try to get updated profile data from Blob Storage for demo/admin accounts too
            try {
              const profileResponse = await fetch(`/api/auth/get-profile?email=${encodeURIComponent(email)}`);
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData.success && profileData.user) {
                  // Merge updated profile data including role/permissions
                  user = {
                    ...user,
                    name: profileData.user.name || user.name,
                    company: profileData.user.company || user.company,
                    phone: profileData.user.phone || user.phone,
                    role: profileData.user.role || user.role || 'owner',
                    companyId: profileData.user.companyId || user.companyId,
                    ownerEmail: profileData.user.ownerEmail || user.ownerEmail,
                    permissions: profileData.user.permissions || user.permissions,
                  };
                  console.log('✅ Updated profile data loaded from Blob Storage for demo/admin account');
                }
              }
            } catch (profileError) {
              console.log('ℹ️ Could not load updated profile data for demo/admin account, using mock data:', profileError);
            }
          }
        }
        
        // If not a mock user, try real API login
        if (!user) {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Ongeldig emailadres of wachtwoord');
          }
          
          // Create base user from API response
          user = {
            id: data.user.email,
            email: data.user.email,
            name: data.user.name,
            company: data.user.company,
            phone: data.user.phone,
            createdAt: new Date(data.user.createdAt),
            lastLogin: new Date(),
            isGuest: false,
            orders: [],
            role: data.user.role || 'owner',
            companyId: data.user.companyId,
            ownerEmail: data.user.ownerEmail,
            permissions: data.user.permissions
          };

          // Try to get updated profile data from Blob Storage
          try {
            const profileResponse = await fetch(`/api/auth/get-profile?email=${encodeURIComponent(email)}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.success && profileData.user) {
                // Merge updated profile data including role/permissions
                user = {
                  ...user,
                  name: profileData.user.name || user.name,
                  company: profileData.user.company || user.company,
                  phone: profileData.user.phone || user.phone,
                  role: profileData.user.role || user.role || 'owner',
                  companyId: profileData.user.companyId || user.companyId,
                  ownerEmail: profileData.user.ownerEmail || user.ownerEmail,
                  permissions: profileData.user.permissions || user.permissions,
                };
                console.log('✅ Updated profile data loaded from Blob Storage');
              }
            }
          } catch (profileError) {
            console.log('ℹ️ Could not load updated profile data, using API response:', profileError);
          }
        }
        
        if (!user) {
          throw new Error('Ongeldig emailadres of wachtwoord');
        }
        
        // Load company data and ensure permissions are set
        user = await loadUserWithCompanyData(user);
        
        console.log('🔐 LOGIN SUCCESS:', { email, isAuthenticated: true, role: user.role });
        
        // Update local state
        authState.user = user;
        authState.isAuthenticated = true;
        authState.isLoading = false;
        authState.error = null;
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
        
        // Store in localStorage manually for persistence
        localStorage.setItem('warmeleads-auth', JSON.stringify({
          user,
          isAuthenticated: true,
          timestamp: Date.now()
        }));
        
        notifyListeners();
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login mislukt';
        
        // Update local state
        authState.error = errorMessage;
        authState.isLoading = false;
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        // IMPORTANT: Re-throw the error so LoginForm knows login failed
        throw error;
      }
    },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Call real API to register in Blob Storage
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Registratie mislukt');
          }
          
          const newUser: User = {
            id: data.user.email,
            email: data.user.email,
            name: data.user.name,
            company: data.user.company,
            phone: data.user.phone,
            createdAt: new Date(data.user.createdAt),
            lastLogin: new Date(),
            isGuest: false,
            orders: []
          };
          
          // ALSO add to CRM system so the customer appears in admin
          try {
            const { crmSystem } = await import('./crmSystem');
            
            // Use createOrUpdateCustomer to add/update in CRM
            const customer = crmSystem.createOrUpdateCustomer({
              email: userData.email,
              name: userData.name,
              company: userData.company,
              phone: userData.phone,
              source: 'direct'
            });
            
            // Mark as having account
            crmSystem.updateCustomer(customer.id, {
              hasAccount: true,
              accountCreatedAt: new Date()
            });
            
            console.log('✅ Customer synced to CRM system:', userData.email);
          } catch (crmError) {
            console.error('⚠️ Error syncing customer to CRM:', crmError);
            // Don't fail the registration if CRM sync fails
          }
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registratie mislukt', 
            isLoading: false 
          });
          throw error;
        }
      },

      loginAsGuest: (guestData: GuestData) => {
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          email: guestData.email,
          name: guestData.name,
          company: guestData.company,
          phone: guestData.phone,
          createdAt: new Date(),
          lastLogin: new Date(),
          isGuest: true,
          orders: []
        };
        
        set({ 
          user: guestUser, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      },

      logout: () => {
        console.log('🚨 EXPLICIT LOGOUT CALLED - Stack trace:', new Error().stack);
        console.log('🚨 Current state before logout:', authState);
        
        // Update local state
        authState.user = null;
        authState.isAuthenticated = false;
        authState.isLoading = false;
        authState.error = null;
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        
        // Clear all auth data
        localStorage.removeItem('warmeleads-auth');
        localStorage.removeItem('warmeleads_visited');
        
        console.log('🚨 State after logout:', authState);
        notifyListeners();
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          set({ user: updatedUser });
        }
      },

      createAccountFromGuest: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const existingUser = mockUsers.find(u => u.email === userData.email);
          
          if (existingUser) {
            throw new Error('Email is al in gebruik');
          }
          
          const currentUser = get().user;
          if (!currentUser?.isGuest) {
            throw new Error('Alleen gasten kunnen een account aanmaken');
          }
          
          const newUser: User = {
            id: `user_${nextUserId++}`,
            email: userData.email,
            name: userData.name,
            company: userData.company,
            phone: userData.phone,
            createdAt: new Date(),
            lastLogin: new Date(),
            isGuest: false,
            orders: currentUser.orders // Transfer guest orders
          };
          
          mockUsers.push(newUser);
          
          // ALSO add to CRM system so the customer appears in admin
          try {
            const { crmSystem } = await import('./crmSystem');
            
            // Use createOrUpdateCustomer to add/update in CRM
            const customer = crmSystem.createOrUpdateCustomer({
              email: userData.email,
              name: userData.name,
              company: userData.company,
              phone: userData.phone,
              source: 'direct'
            });
            
            // Mark as having account
            crmSystem.updateCustomer(customer.id, {
              hasAccount: true,
              accountCreatedAt: new Date()
            });
            
            console.log('✅ Customer synced to CRM system (from guest):', userData.email);
          } catch (crmError) {
            console.error('⚠️ Error syncing customer to CRM:', crmError);
            // Don't fail the registration if CRM sync fails
          }
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Account aanmaken mislukt', 
            isLoading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state from localStorage
      init: () => {
        try {
          const authData = localStorage.getItem('warmeleads-auth');
          if (authData) {
            const parsed = JSON.parse(authData);
            // Check if auth data is not too old (24 hours)
            if (parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
              console.log('🔄 RESTORING AUTH FROM LOCALSTORAGE:', { 
                email: parsed.user?.email, 
                isAuthenticated: parsed.isAuthenticated 
              });
              
              // Update local state
              authState.user = parsed.user;
              authState.isAuthenticated = parsed.isAuthenticated;
              authState.isLoading = false;
              authState.error = null;
              
              set({
                user: parsed.user,
                isAuthenticated: parsed.isAuthenticated,
                isLoading: false,
                error: null
              });
              
              notifyListeners();
            } else {
              console.log('🕐 AUTH DATA TOO OLD, CLEARING');
              localStorage.removeItem('warmeleads-auth');
            }
          }
        } catch (error) {
          console.error('Error restoring auth:', error);
          localStorage.removeItem('warmeleads-auth');
        }
      }
    })
);
