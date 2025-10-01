import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  type: 'lisa' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface UserProfile {
  industry?: string;
  currentLeads?: string;
  challenge?: string;
  leadType?: string;
  budget?: string;
  timeline?: string;
  companySize?: string;
  interactions?: number;
  quantity?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

interface ChatState {
  userProfile: UserProfile;
  currentStep: string;
  conversationId: string;
  isTyping: boolean;
  messages: Message[];
  analytics: {
    startTime: Date;
    stepTimes: Record<string, Date>;
    interactions: number;
    completionRate: number;
  };
}

interface ChatActions {
  updateProfile: (updates: Partial<UserProfile>) => void;
  setCurrentStep: (step: string) => void;
  setIsTyping: (typing: boolean) => void;
  addMessage: (message: Message) => void;
  clearChat: () => void;
  trackInteraction: () => void;
  getRecommendation: () => string;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // Initial State
      userProfile: {},
      currentStep: 'welcome',
      conversationId: Math.random().toString(36).substring(7),
      isTyping: false,
      messages: [],
      analytics: {
        startTime: new Date(),
        stepTimes: {},
        interactions: 0,
        completionRate: 0,
      },

      // Actions
      updateProfile: (updates) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          currentStep: step,
          analytics: {
            ...state.analytics,
            stepTimes: {
              ...state.analytics.stepTimes,
              [step]: new Date(),
            },
          },
        })),

      setIsTyping: (typing) =>
        set({ isTyping: typing }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearChat: () =>
        set({
          userProfile: {},
          currentStep: 'welcome',
          conversationId: Math.random().toString(36).substring(7),
          isTyping: false,
          messages: [],
          analytics: {
            startTime: new Date(),
            stepTimes: {},
            interactions: 0,
            completionRate: 0,
          },
        }),

      trackInteraction: () =>
        set((state) => ({
          analytics: {
            ...state.analytics,
            interactions: state.analytics.interactions + 1,
          },
        })),

      getRecommendation: () => {
        const { userProfile } = get();
        
        // AI-powered recommendation logic
        if (userProfile.challenge === 'Leads zijn te duur' || userProfile.currentLeads === 'Nog geen leads') {
          return 'gedeelde';
        } else if (userProfile.currentLeads === '100+ leads' || userProfile.challenge === 'Te weinig volume') {
          return 'exclusieve';
        } else {
          return 'mixed';
        }
      },
    }),
    {
      name: 'warmeleads-chat-store',
      partialize: (state) => ({
        userProfile: state.userProfile,
        currentStep: state.currentStep,
        conversationId: state.conversationId,
        analytics: state.analytics,
      }),
    }
  )
);
