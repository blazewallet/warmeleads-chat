import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Mock database for demo purposes
const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'demo@warmeleads.eu',
    name: 'Demo Gebruiker',
    company: 'Demo BV',
    phone: '+31 85 047 7067',
    createdAt: new Date(),
    lastLogin: new Date(),
    isGuest: false,
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
  },
  {
    id: 'user_2',
    email: 'h.schlimback@gmail.com',
    name: 'Rick Schlimback',
    company: 'WarmeLeads BV',
    phone: '+31 61 392 7338',
    createdAt: new Date('2025-09-20'),
    lastLogin: new Date(),
    isGuest: false,
    orders: [
      {
        id: 'order_rick_1',
        type: 'Exclusieve Thuisbatterij Leads',
        quantity: 30,
        status: 'delivered',
        date: '2025-09-29',
        amount: 1200,
        leads: 31,
        conversions: 8
      }
    ]
  },
  {
    id: 'user_3',
    email: 'rick@warmeleads.eu',
    name: 'Rick Admin',
    company: 'WarmeLeads',
    phone: '+31 85 047 7067',
    createdAt: new Date(),
    lastLogin: new Date(),
    isGuest: false,
    orders: []
  }
];
let nextUserId = 4;

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const existingUser = mockUsers.find(u => u.email === email);
        
        if (!existingUser) {
          throw new Error('Gebruiker niet gevonden');
        }
        
        // Check password based on user type
        let validPassword = false;
        if (email === 'demo@warmeleads.eu' && password === 'demo123') {
          validPassword = true;
        } else if (email === 'h.schlimback@gmail.com' && password === 'Ab49n805!') {
          validPassword = true;
        } else if (email === 'rick@warmeleads.eu' && password === 'Ab49n805!') {
          validPassword = true;
        }
        
        if (!validPassword) {
          throw new Error('Ongeldig wachtwoord');
        }
        
        const user = { ...existingUser, lastLogin: new Date() };
        
        console.log('🔐 LOGIN SUCCESS:', { email, isAuthenticated: true });
        
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
        
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Login mislukt', 
          isLoading: false 
        });
      }
    },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const existingUser = mockUsers.find(u => u.email === userData.email);
          
          if (existingUser) {
            throw new Error('Email is al in gebruik');
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
            orders: []
          };
          
          mockUsers.push(newUser);
          
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
        console.log('🚨 EXPLICIT LOGOUT - Stack trace:', new Error().stack);
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        
        // Clear all auth data
        localStorage.removeItem('warmeleads-auth');
        localStorage.removeItem('warmeleads_visited');
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
              set({
                user: parsed.user,
                isAuthenticated: parsed.isAuthenticated,
                isLoading: false,
                error: null
              });
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
