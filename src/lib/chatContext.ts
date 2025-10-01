import { contextLogger } from './logger';

export type ChatContext = 
  | 'direct' 
  | 'info' 
  | 'faq' 
  | 'customer' 
  | 'quality' 
  | 'pricing' 
  | 'delivery' 
  | 'examples' 
  | 'roi' 
  | 'branches';

export interface ChatContextConfig {
  context: ChatContext;
  initialStep: string;
  flow: 'express' | 'educational' | 'support';
  welcomeMessage: string;
  introMessage: string;
  questionMessage: string;
  options: string[];
}

export const CHAT_CONTEXTS: Record<ChatContext, ChatContextConfig> = {
  direct: {
    context: 'direct',
    initialStep: 'express_welcome',
    flow: 'express',
    welcomeMessage: 'Hoi! Lisa hier van WarmeLeads',
    introMessage: 'Ik zie dat u direct leads wilt bestellen - perfect!',
    questionMessage: 'Voor welke branche wilt u leads?',
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial lease', 'Anders']
  },
  info: {
    context: 'info',
    initialStep: 'industry',
    flow: 'educational',
    welcomeMessage: 'Perfect! U heeft de info gelezen',
    introMessage: 'Nu u alles weet over WarmeLeads, laten we uw situatie bespreken.',
    questionMessage: 'In welke branche bent u actief?',
    options: ['Zonnepanelen', 'Thuisbatterijen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Anders']
  },
  faq: {
    context: 'faq',
    initialStep: 'faq_followup',
    flow: 'educational',
    welcomeMessage: 'Hoi! Ik zie dat u vragen had',
    introMessage: 'Laat me u persoonlijk helpen met een perfect advies!',
    questionMessage: 'Wat was uw belangrijkste vraag over onze leads?',
    options: ['Prijzen en kosten', 'Lead kwaliteit', 'Levering en timing', 'CRM integratie', 'Direct bestellen']
  },
  customer: {
    context: 'customer',
    initialStep: 'customer_service',
    flow: 'support',
    welcomeMessage: 'Welkom terug!',
    introMessage: 'Fijn dat u er weer bent. Hoe kan ik u vandaag helpen?',
    questionMessage: 'Wat wilt u vandaag doen?',
    options: ['Nieuwe leads bestellen', 'Vragen over mijn account', 'Hulp met huidige leads', 'Prijzen wijzigen']
  },
  quality: {
    context: 'quality',
    initialStep: 'quality_explanation',
    flow: 'educational',
    welcomeMessage: 'U heeft vragen over onze kwaliteitsgarantie!',
    introMessage: 'Laat me u uitleggen hoe wij de beste leads garanderen.',
    questionMessage: 'Welk aspect van kwaliteit interesseert u het meest?',
    options: ['Verse leads binnen 15 minuten', 'Kwaliteitscontrole proces', 'Geld terug garantie', 'Nederlandse prospects', 'Direct bestellen']
  },
  pricing: {
    context: 'pricing',
    initialStep: 'pricing_explanation',
    flow: 'educational',
    welcomeMessage: 'U wilt meer weten over onze prijzen!',
    introMessage: 'Ik help u graag met een transparante prijsopgave.',
    questionMessage: 'Voor welke branche wilt u prijzen weten?',
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Direct bestellen']
  },
  delivery: {
    context: 'delivery',
    initialStep: 'delivery_explanation',
    flow: 'educational',
    welcomeMessage: 'U wilt weten hoe de lead delivery werkt!',
    introMessage: 'Laat me u uitleggen hoe u binnen 15 minuten uw leads ontvangt.',
    questionMessage: 'Wat wilt u weten over de delivery?',
    options: ['Persoonlijke spreadsheet', 'Real-time updates', '15 minuten garantie', 'CRM integratie', 'Direct bestellen']
  },
  examples: {
    context: 'examples',
    initialStep: 'lead_examples',
    flow: 'educational',
    welcomeMessage: 'U wilt voorbeelden van onze leads zien!',
    introMessage: 'Ik toon u graag hoe een verse lead eruit ziet.',
    questionMessage: 'Voor welke branche wilt u een voorbeeld?',
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Direct bestellen']
  },
  roi: {
    context: 'roi',
    initialStep: 'roi_calculator',
    flow: 'educational',
    welcomeMessage: 'U wilt weten wat de ROI is van onze leads!',
    introMessage: 'Laat me u helpen berekenen wat leads voor u kunnen betekenen.',
    questionMessage: 'Wat is uw huidige situatie?',
    options: ['Ik heb nog geen leads', 'Ik koop al leads', 'Ik wil meer volume', 'Ik wil exclusieve leads', 'Direct bestellen']
  },
  branches: {
    context: 'branches',
    initialStep: 'branches_explanation',
    flow: 'educational',
    welcomeMessage: 'U wilt weten welke branches wij ondersteunen!',
    introMessage: 'Ik vertel u graag over onze specialisaties.',
    questionMessage: 'In welke branche bent u actief?',
    options: ['Zonnepanelen', 'Thuisbatterijen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Anders', 'Direct bestellen']
  }
};

export class ChatContextManager {
  private static readonly STORAGE_KEY = 'warmeleads_chat_context';
  
  static setContext(context: ChatContext): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, context);
      contextLogger.debug('Context opgeslagen', { context });
    } catch (error) {
      contextLogger.error('Failed to save chat context', { error, context });
    }
  }
  
  static getContext(): ChatContext {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && stored in CHAT_CONTEXTS) {
        contextLogger.debug('Context opgehaald', { stored });
        return stored as ChatContext;
      }
    } catch (error) {
      contextLogger.error('Failed to get chat context', { error });
    }
    
    contextLogger.debug('Fallback naar direct context');
    return 'direct';
  }
  
  static clearContext(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      contextLogger.debug('Context gewist');
    } catch (error) {
      contextLogger.error('Failed to clear chat context', { error });
    }
  }
  
  static getContextConfig(context?: ChatContext): ChatContextConfig {
    const actualContext = context || this.getContext();
    return CHAT_CONTEXTS[actualContext];
  }
  
  static shouldUseExpressFlow(context: ChatContext): boolean {
    return CHAT_CONTEXTS[context].flow === 'express';
  }
  
  static shouldUseEducationalFlow(context: ChatContext): boolean {
    return CHAT_CONTEXTS[context].flow === 'educational';
  }
  
  static shouldUseSupportFlow(context: ChatContext): boolean {
    return CHAT_CONTEXTS[context].flow === 'support';
  }
}
