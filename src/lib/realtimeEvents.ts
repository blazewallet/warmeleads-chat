// Realtime Event System for Admin Chat Monitoring
import { crmSystem } from './crmSystem';

export type RealtimeEvent = {
  type: 'chat_started' | 'chat_message' | 'customer_created' | 'invoice_created' | 'payment_completed';
  timestamp: Date;
  data: any;
};

class RealtimeEventManager {
  private listeners: Map<string, ((event: RealtimeEvent) => void)[]> = new Map();
  private eventQueue: RealtimeEvent[] = [];

  // Subscribe to realtime events
  subscribe(eventType: string, callback: (event: RealtimeEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit event to all subscribers
  emit(event: RealtimeEvent) {
    console.log('🔴 Realtime event:', event.type, event.data);
    
    // Store in queue for polling
    this.eventQueue.push(event);
    
    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }

    // Persist events to localStorage for admin monitoring
    this.persistEvent(event);

    // Notify all subscribers
    const callbacks = this.listeners.get(event.type) || [];
    const allCallbacks = this.listeners.get('*') || []; // Wildcard listeners
    
    [...callbacks, ...allCallbacks].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });

    // Store in localStorage for cross-tab communication
    this.broadcastToOtherTabs(event);
  }

  // Cross-tab communication
  private broadcastToOtherTabs(event: RealtimeEvent) {
    try {
      const eventData = {
        ...event,
        timestamp: event.timestamp.toISOString()
      };
      localStorage.setItem('warmeleads_realtime_event', JSON.stringify(eventData));
      
      // Clear after short delay to allow other tabs to read
      setTimeout(() => {
        localStorage.removeItem('warmeleads_realtime_event');
      }, 1000);
    } catch (error) {
      console.error('Error broadcasting event:', error);
    }
  }

  // Listen for events from other tabs
  listenForCrossTabEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e) => {
      if (e.key === 'warmeleads_realtime_event' && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          event.timestamp = new Date(event.timestamp);
          
          // Re-emit the event locally (without broadcasting again)
          const callbacks = this.listeners.get(event.type) || [];
          const allCallbacks = this.listeners.get('*') || [];
          
          [...callbacks, ...allCallbacks].forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              console.error('Error in cross-tab event callback:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing cross-tab event:', error);
        }
      }
    });
  }

  // Get recent events (for initial load)
  getRecentEvents(eventType?: string, limit: number = 20): RealtimeEvent[] {
    let events = this.eventQueue;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    
    return events.slice(-limit).reverse(); // Most recent first
  }

  // Persist event for admin monitoring
  private persistEvent(event: RealtimeEvent) {
    try {
      const key = 'warmeleads_admin_events';
      const stored = localStorage.getItem(key);
      const events = stored ? JSON.parse(stored) : [];
      
      // Add new event
      events.push({
        ...event,
        timestamp: event.timestamp.toISOString()
      });
      
      // Keep only last 200 events
      if (events.length > 200) {
        events.splice(0, events.length - 200);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('Error persisting event:', error);
    }
  }

  // Load persisted events for admin
  loadPersistedEvents(): RealtimeEvent[] {
    try {
      const stored = localStorage.getItem('warmeleads_admin_events');
      if (stored) {
        const events = JSON.parse(stored);
        return events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading persisted events:', error);
    }
    return [];
  }

  // Clear old events
  clearOldEvents(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.eventQueue = this.eventQueue.filter(event => event.timestamp > cutoff);
  }
}

// Singleton instance
export const realtimeEvents = new RealtimeEventManager();

// Initialize cross-tab listening
if (typeof window !== 'undefined') {
  realtimeEvents.listenForCrossTabEvents();
}

// Helper functions for common events
export const emitChatStarted = (customerEmail: string, industry?: string) => {
  realtimeEvents.emit({
    type: 'chat_started',
    timestamp: new Date(),
    data: {
      customerEmail,
      industry,
      sessionId: Math.random().toString(36).substring(7)
    }
  });
};

export const emitChatMessage = (customerEmail: string, message: string, type: 'lisa' | 'user', step?: string) => {
  realtimeEvents.emit({
    type: 'chat_message',
    timestamp: new Date(),
    data: {
      customerEmail,
      message,
      type,
      step
    }
  });
};

export const emitCustomerCreated = (customer: any) => {
  realtimeEvents.emit({
    type: 'customer_created',
    timestamp: new Date(),
    data: customer
  });
};

export const emitInvoiceCreated = (customerEmail: string, invoice: any) => {
  realtimeEvents.emit({
    type: 'invoice_created',
    timestamp: new Date(),
    data: {
      customerEmail,
      invoice
    }
  });
};

export const emitPaymentCompleted = (customerEmail: string, order: any) => {
  realtimeEvents.emit({
    type: 'payment_completed',
    timestamp: new Date(),
    data: {
      customerEmail,
      order
    }
  });
};
