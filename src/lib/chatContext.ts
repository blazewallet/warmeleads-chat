// Chat Context Manager for WarmeLeads
export interface ChatContext {
  entryPoint: 'landing' | 'direct' | 'learn' | 'questions';
  userIntent?: string;
  previousStep?: string;
  sessionId?: string;
}

export class ChatContextManager {
  private static context: ChatContext = {
    entryPoint: 'landing'
  };

  static setContext(context: Partial<ChatContext>) {
    this.context = { ...this.context, ...context };
  }

  static getContext(): ChatContext {
    return { ...this.context };
  }

  static resetContext() {
    this.context = {
      entryPoint: 'landing'
    };
  }

  static setEntryPoint(entryPoint: ChatContext['entryPoint']) {
    this.context.entryPoint = entryPoint;
  }

  static setUserIntent(intent: string) {
    this.context.userIntent = intent;
  }

  static setPreviousStep(step: string) {
    this.context.previousStep = step;
  }

  static setSessionId(sessionId: string) {
    this.context.sessionId = sessionId;
  }
}