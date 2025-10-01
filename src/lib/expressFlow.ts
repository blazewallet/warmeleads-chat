import { calculateOrderTotal } from './pricing';

interface UserProfile {
  industry?: string;
  leadType?: string;
  quantity?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

interface ExpressStep {
  id: string;
  message: string | ((profile: UserProfile) => string);
  options?: string[] | ((profile: UserProfile) => string[]);
  nextStep?: string | ((response: string, profile: UserProfile) => string);
  action?: (response: string, profile: UserProfile) => void;
  delay?: number;
}

export const expressFlow: Record<string, ExpressStep> = {
  express_welcome: {
    id: 'express_welcome',
    message: 'Perfect! Laten we snel uw leadpakket samenstellen. Voor welke branche wilt u leads?',
    options: [
      'Thuisbatterijen',
      'Zonnepanelen', 
      'Warmtepompen',
      'Airco\'s',
      'Financial lease',
      'Anders'
    ],
    nextStep: 'express_lead_type',
    action: (response, profile) => {
      profile.industry = response;
    },
  },

  express_lead_type: {
    id: 'express_lead_type',
    message: (profile: UserProfile) => {
      const industry = profile.industry || 'leads';
      return `Super! Voor ${industry.toLowerCase()} kan ik u twee opties aanbieden:`;
    },
    options: [
      'Exclusief €42,50/lead (alleen voor u)',
      'Gedeeld €12,50/lead (met 2 anderen)',
      'Vertel meer over het verschil'
    ],
    nextStep: (response) => {
      if (response === 'Vertel meer over het verschil') return 'express_explain_types';
      return 'express_quantity';
    },
    action: (response, profile) => {
      if (response.includes('Exclusief')) {
        profile.leadType = 'Exclusief';
      } else if (response.includes('Gedeeld')) {
        profile.leadType = 'Gedeeld';
      }
    },
  },

  express_explain_types: {
    id: 'express_explain_types',
    message: `Natuurlijk leg ik dat uit!

Exclusieve leads krijgt alleen uw bedrijf - geen concurrentie, hogere conversiekans, maar wel premium prijs.

Gedeelde leads delen we met maximaal 2 andere bedrijven. Dat maakt ze veel goedkoper (ongeveer 1/3 van de prijs) maar ze zijn nog steeds van hoge kwaliteit.

Wat past het beste bij uw situatie?`,
    options: [
      'Exclusief €42,50/lead',
      'Gedeeld €12,50/lead',
      'Toon me een voorbeeld lead'
    ],
    nextStep: (response) => {
      if (response.includes('voorbeeld')) return 'show_lead_example';
      return 'express_quantity';
    },
    action: (response, profile) => {
      if (response.includes('Exclusief')) {
        profile.leadType = 'Exclusief';
      } else {
        profile.leadType = 'Gedeeld';
      }
    },
  },

  show_lead_example: {
    id: 'show_lead_example',
    message: (profile: UserProfile) => {
      // Import the lead examples function here
      const industry = profile.industry || 'Thuisbatterijen';
      
      // For now, show a static example - in real implementation would use getRandomLeadExample
      return `Hier is een voorbeeld van een ${industry.toLowerCase()} lead die 2 minuten geleden binnenkwam:

👤 Familie van der Berg
📍 Utrecht, 3512 AB  
📞 06-12345678
📧 j.vandenberg@email.nl

💡 Interesse: Wil onafhankelijk van energiemaatschappij worden
💰 Budget: €8.000 - €12.000
⏰ Timeline: Binnen 3 maanden
📊 Interest level: 9/10

📝 "Heeft al zonnepanelen, zoekt nu batterij. Zeer geïnteresseerd."

Dit is het type kwaliteit dat u kunt verwachten! Wilt u nu exclusieve of gedeelde leads?`;
    },
    options: [
      'Exclusief €42,50/lead',
      'Gedeeld €12,50/lead'
    ],
    nextStep: 'express_quantity',
    action: (response, profile) => {
      if (response.includes('Exclusief')) {
        profile.leadType = 'Exclusief';
      } else {
        profile.leadType = 'Gedeeld';
      }
    },
  },

  express_quantity: {
    id: 'express_quantity',
    message: (profile: UserProfile) => {
      if (profile.leadType === 'Gedeeld') {
        return 'Perfect! Gedeelde leads worden per 500 stuks geleverd voor de beste prijs-kwaliteit verhouding.';
      } else {
        return 'Uitstekend! Hoeveel exclusieve leads wilt u per maand?';
      }
    },
    options: (profile: UserProfile) => {
      if (profile.leadType === 'Gedeeld') {
        return [
          '500 leads - €6.250 totaal',
          'Ander aantal (maatwerk)',
          'Eerst 100 leads testen'
        ];
      } else {
        return [
          '30 leads - €1.275',
          '50 leads - €2.000', 
          '75 leads - €2.813',
          '100+ leads (maatwerk)',
          '🧮 Bereken ideale aantal voor mijn ROI'
        ];
      }
    },
    nextStep: (response) => {
      if (response.includes('Bereken ideale aantal')) return 'roi_calculator';
      return 'express_checkout';
    },
    action: (response, profile) => {
      profile.quantity = response;
      // BACKUP to localStorage to prevent overwrites
      localStorage.setItem('warmeleads_selected_quantity', response);
    },
  },

  roi_calculator: {
    id: 'roi_calculator',
    message: 'Perfect! Laat me een ROI calculator voor u maken op basis van uw branche. Hiermee kunt u het ideale aantal leads berekenen voor maximale winst.',
    options: [], // This will trigger ROI calculator component
    nextStep: 'express_checkout',
    action: (response, profile) => {
      // Response will contain ROI calculation results
      if (response.includes('leads')) {
        profile.quantity = response;
      }
    },
  },

  express_checkout: {
    id: 'express_checkout',
    message: (profile: UserProfile) => {
      const industry = profile.industry || 'leads';
      const leadType = profile.leadType || 'leads';
      const quantity = profile.quantity || 'onbekend aantal';
      const total = calculateTotal(profile);
      
      return `Geweldig! Dan gaan we voor ${leadType.toLowerCase()} ${industry.toLowerCase()}.

${quantity} voor ${total} - dat is een uitstekende keuze!

📋 Hoe ontvangt u uw leads?

🎯 Persoonlijke Spreadsheet:
✅ U krijgt toegang tot uw eigen dashboard
✅ Real-time updates op kwartier nauwkeurig
✅ Alle leads worden automatisch ingeladen
✅ Volledige contactgegevens en details

⚡ Verse leads binnen 15 minuten:
✅ Leads worden direct na generatie toegevoegd
✅ U bent altijd als eerste bij verse prospects
✅ Geen concurrentie van andere bedrijven
✅ Maximale conversiekans

📊 Flexibele ontvangst:
✅ Kies hoeveel leads per week
✅ Automatische delivery tot uw limiet
✅ U bepaalt het tempo
✅ Geen verrassingen

Om de leads naar u te versturen heb ik uw contactgegevens nodig. Vult u die hieronder in?`;
    },
    options: [
      'Gegevens invullen',
      'Liever telefonisch afhandelen'
    ],
    nextStep: (response) => {
      if (response === 'Liever telefonisch afhandelen') return 'express_phone';
      return 'express_contact_details';
    },
  },

  express_contact_details: {
    id: 'express_contact_details',
    message: 'Perfect! Vul uw gegevens in zodat we de leads kunnen versturen:',
    options: [], // This will trigger text input
    nextStep: 'express_payment',
    action: (response, profile) => {
      if (response.includes('@') && response.includes(',')) {
        const parts = response.split(',');
        profile.contactInfo = {
          name: parts[0]?.trim(),
          email: parts[1]?.trim(),
          phone: parts[2]?.trim(),
        };
      }
    },
  },

  express_payment: {
    id: 'express_payment',
    message: (profile: UserProfile) => {
      const name = profile.contactInfo?.name?.split(' ')[0] || 'klant';
      return `Dank je ${name}! 

Alles is klaar. Na de betaling stuur ik binnen 15 minuten de eerste leads naar ${profile.contactInfo?.email}.

Hoe wilt u betalen?`;
    },
    options: [
      '💳 Betalen met iDEAL',
      '💳 Betalen met creditcard', 
      '📞 Liever telefonisch afhandelen',
      '✏️ Bestelling aanpassen'
    ],
    nextStep: (response) => {
      if (response.includes('telefonisch')) return 'express_phone';
      if (response.includes('aanpassen')) return 'express_lead_type';
      return 'express_payment_process';
    },
  },

  express_payment_process: {
    id: 'express_payment_process',
    message: (profile: UserProfile) => {
      const paymentMethod = profile.contactInfo?.phone ? 'iDEAL' : 'creditcard';
      return `Perfect! Uw betaling wordt verwerkt via ${paymentMethod}.

🔒 Veilige betaling via Stripe
📧 Bevestiging naar ${profile.contactInfo?.email}
⚡ Leads binnen 15 minuten na betaling

*Demo mode: In de echte versie wordt u doorgestuurd naar de betaalpagina*`;
    },
    options: [
      '✅ Betaling gesimuleerd - leads onderweg!',
      '📞 Toch liever bellen',
      '🔄 Terug naar bestelling'
    ],
    nextStep: (response) => {
      if (response.includes('bellen')) return 'express_phone';
      if (response.includes('bestelling')) return 'express_checkout';
      return 'express_complete';
    },
  },

  express_phone: {
    id: 'express_phone',
    message: 'Natuurlijk! Wat is uw telefoonnummer? Ik bel u binnen 15 minuten om alles af te handelen.',
    options: [
      '06-12345678',
      '010-1234567', 
      'Ander nummer'
    ],
    nextStep: 'express_phone_confirm',
    action: (response, profile) => {
      profile.contactInfo = {
        ...profile.contactInfo,
        phone: response,
      };
    },
  },

  express_phone_confirm: {
    id: 'express_phone_confirm',
    message: (profile: UserProfile) => {
      return `Perfect! Ik bel u binnen 15 minuten op ${profile.contactInfo?.phone}.

Uw leadpakket:
🎯 ${profile.industry} leads
${profile.leadType === 'Exclusief' ? '💎' : '🤝'} ${profile.leadType}
📦 ${profile.quantity}

U hoort zo van mij! 📞`;
    },
    options: [
      'Perfect, ik wacht op uw telefoontje!',
      'Stuur ook een bevestiging per email'
    ],
    nextStep: 'express_complete',
  },

  express_complete: {
    id: 'express_complete',
    message: 'Perfect! Alles is geregeld. Binnen 15 minuten krijgt u de eerste leads in uw inbox. Veel succes met al die nieuwe klanten!',
    options: [
      '🎉 Dank je Lisa!',
      '🔄 Nog een bestelling plaatsen',
      '🏠 Terug naar homepage',
      '📞 Contact opnemen voor vragen'
    ],
    nextStep: (response) => {
      if (response.includes('bestelling')) return 'express_welcome';
      if (response.includes('homepage')) return 'back_to_home';
      return 'end';
    },
  },
};

function calculateTotal(profile: UserProfile): string {
  // Use the centralized pricing calculator
  return calculateOrderTotal(profile);
}

export function getExpressMessage(currentStep: string, userResponse: string, userProfile: UserProfile) {
  const step = expressFlow[currentStep];
  if (!step) return null;

  // Execute action if defined
  if (step.action) {
    step.action(userResponse, userProfile);
  }

  // Determine next step
  let nextStepId: string;
  if (typeof step.nextStep === 'function') {
    nextStepId = step.nextStep(userResponse, userProfile);
  } else {
    nextStepId = step.nextStep || 'end';
  }

  const nextStep = expressFlow[nextStepId];
  if (!nextStep) return null;

  // Generate message
  let message: string;
  if (typeof nextStep.message === 'function') {
    message = nextStep.message(userProfile);
  } else {
    message = nextStep.message;
  }

  // Generate options
  let options: string[];
  if (typeof nextStep.options === 'function') {
    options = nextStep.options(userProfile);
  } else {
    options = nextStep.options || [];
  }

  return {
    id: nextStepId,
    message,
    options,
    delay: nextStep.delay || 1000, // Faster delays for express flow
  };
}
