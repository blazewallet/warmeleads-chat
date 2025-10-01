import { LEAD_PRICING } from './pricing';

interface UserProfile {
  industry?: string;
  currentLeads?: string;
  challenge?: string;
  leadType?: string;
  budget?: string;
  quantity?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

interface ChatStep {
  id: string;
  trigger?: string;
  message: string | ((profile: UserProfile) => string);
  options?: string[] | ((profile: UserProfile) => string[]);
  nextStep?: string | ((response: string, profile: UserProfile) => string);
  action?: (response: string, profile: UserProfile) => void;
  delay?: number;
}

interface LeadPricing {
  industry: string;
  exclusive: {
    '30+': number;
    '50+': number;
    '75+': number;
  };
  shared: {
    price: number;
    minQuantity: number;
  };
}

// Use the centralized pricing from pricing.ts
export const leadPricing = LEAD_PRICING;

export const chatFlow: Record<string, ChatStep> = {
  // EXPRESS FLOW - Direct leads bestellen (OPTIE 1)
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
      const pricing = leadPricing[industry];
      
      if (pricing) {
        return `Super! Voor ${industry.toLowerCase()} kan ik u twee opties aanbieden:

💎 Exclusief: €${pricing.exclusive['30+']} per lead (alleen voor u)
🤝 Gedeeld: €${pricing.shared.price} per lead (met 2 anderen)

Exclusieve leads hebben hogere conversie, gedeelde leads zijn veel goedkoper.`;
      }
      
      return `Super! Voor ${industry.toLowerCase()} kan ik u twee opties aanbieden:`;
    },
    options: [
      'Exclusieve leads (hogere conversie)',
      'Gedeelde leads (lagere prijs)',
      'Vertel meer over het verschil'
    ],
    nextStep: (response) => {
      if (response === 'Vertel meer over het verschil') return 'express_explain_types';
      return 'express_quantity';
    },
    action: (response, profile) => {
      if (response.includes('Exclusieve')) {
        profile.leadType = 'Exclusieve leads';
      } else if (response.includes('Gedeelde')) {
        profile.leadType = 'Gedeelde leads';
      }
    },
  },

  express_explain_types: {
    id: 'express_explain_types',
    message: `Natuurlijk leg ik dat uit!

💎 Exclusieve leads:
✅ Alleen voor uw bedrijf
✅ Geen concurrentie  
✅ Hogere conversiekans
✅ Premium prijs

🤝 Gedeelde leads:
✅ Gedeeld met max 2 anderen
✅ Veel goedkoper (1/3 van exclusief)
✅ Nog steeds hoge kwaliteit
✅ Perfect om te starten

Wat past het beste bij uw situatie?`,
    options: [
      'Exclusieve leads (premium)',
      'Gedeelde leads (budget-vriendelijk)'
    ],
    nextStep: 'express_quantity',
    action: (response, profile) => {
      if (response.includes('Exclusieve')) {
        profile.leadType = 'Exclusieve leads';
      } else {
        profile.leadType = 'Gedeelde leads';
      }
    },
  },

  express_quantity: {
    id: 'express_quantity',
    message: (profile: UserProfile) => {
      const pricing = profile.industry ? leadPricing[profile.industry] : null;
      
      if (profile.leadType === 'Gedeelde leads' && pricing) {
        return `Perfect! Gedeelde leads voor optimale prijs-kwaliteit:

🤝 €${pricing.shared.price} per lead
📦 Minimum ${pricing.shared.minQuantity} leads per bestelling
⚡ Binnen 15 minuten geleverd

Hoeveel wilt u bestellen?`;
      } else if (pricing) {
        return `Uitstekend! Exclusieve leads voor maximale conversie:

💎 30+ leads: €${pricing.exclusive['30+']} per lead
💎 50+ leads: €${pricing.exclusive['50+']} per lead  
💎 75+ leads: €${pricing.exclusive['75+']} per lead

Hoeveel exclusieve leads wilt u?`;
      }
      
      return 'Hoeveel leads wilt u bestellen?';
    },
    options: (profile: UserProfile) => {
      const pricing = profile.industry ? leadPricing[profile.industry] : null;
      
      if (profile.leadType === 'Gedeelde leads' && pricing) {
        const price500 = (500 * pricing.shared.price).toLocaleString();
        const price1000 = (1000 * pricing.shared.price).toLocaleString();
        return [
          `500 leads - €${price500}`,
          `1000 leads - €${price1000}`,
          'Ander aantal (maatwerk)'
        ];
      } else if (pricing) {
        const price30 = (30 * pricing.exclusive['30+']).toLocaleString();
        const price50 = (50 * pricing.exclusive['50+']).toLocaleString();
        const price75 = (75 * pricing.exclusive['75+']).toLocaleString();
        return [
          `30 leads - €${price30}`,
          `50 leads - €${price50}`, 
          `75 leads - €${price75}`,
          '100+ leads (maatwerk)'
        ];
      }
      
      return ['30 leads', '50 leads', '75 leads', '100+ leads'];
    },
    nextStep: 'express_checkout',
    action: (response, profile) => {
      profile.quantity = response;
    },
  },

  express_checkout: {
    id: 'express_checkout',
    message: (profile: UserProfile) => {
      const industry = profile.industry || 'leads';
      const leadType = profile.leadType || 'leads';
      const quantity = profile.quantity || 'onbekend aantal';
      
      return `Geweldig! Uw bestelling:

🎯 ${leadType.toLowerCase()} voor ${industry.toLowerCase()}
📦 ${quantity}
⚡ Verse leads binnen 15 minuten na betaling

Nu heb ik uw contactgegevens nodig om uw dashboard in te stellen.`;
    },
    options: [
      'Contactgegevens invullen',
      'Ik heb al een account - inloggen',
      'Liever telefonisch afhandelen'
    ],
    nextStep: (response) => {
      if (response.includes('account')) return 'express_login';
      if (response.includes('telefonisch')) return 'phone_contact';
      return 'express_contact_details';
    },
  },

  express_login: {
    id: 'express_login',
    message: 'Perfect! Log in met uw account, dan vul ik automatisch uw gegevens in.',
    options: [
      'Inloggen',
      'Wachtwoord vergeten',
      'Toch nieuwe gegevens invullen'
    ],
    nextStep: (response) => {
      if (response === 'Toch nieuwe gegevens invullen') return 'express_contact_details';
      if (response === 'Wachtwoord vergeten') return 'password_reset';
      return 'login_redirect';
    },
  },

  login_redirect: {
    id: 'login_redirect',
    message: 'Ik stuur u door naar de inlogpagina. Na het inloggen komen we terug bij uw bestelling!',
    options: ['Naar inlogpagina'],
    nextStep: 'end', // This will trigger login page navigation
  },

  password_reset: {
    id: 'password_reset',
    message: 'Geen probleem! Wat is uw email adres? Dan stuur ik u een reset link.',
    options: ['demo@warmeleads.eu', 'info@bedrijf.nl', 'Ander email adres'],
    nextStep: 'password_reset_sent',
    action: (response, profile) => {
      if (response.includes('@')) {
        profile.contactInfo = {
          ...profile.contactInfo,
          email: response.trim(),
        };
      }
    },
  },

  password_reset_sent: {
    id: 'password_reset_sent',
    message: (profile: UserProfile) => {
      return `Reset link verstuurd naar ${profile.contactInfo?.email}! 

Terwijl u wacht, kunt u ook gewoon uw gegevens invullen om door te gaan met bestellen.`;
    },
    options: ['Gegevens invullen en doorgaan', 'Ik wacht op de reset email'],
    nextStep: (response) => {
      if (response.includes('invullen')) return 'express_contact_details';
      return 'end';
    },
  },

  express_contact_details: {
    id: 'express_contact_details',
    message: 'Perfect! Vul uw gegevens in zodat we de leads kunnen versturen:',
    options: [], // This will trigger ContactForm component
    nextStep: 'express_payment',
  },

  express_payment: {
    id: 'express_payment',
    message: (profile: UserProfile) => {
      const name = profile.contactInfo?.name?.split(' ')[0] || 'klant';
      return `Dank je ${name}! 

Alles is klaar. Na de betaling starten onze campagnes en worden de eerste verse leads binnen 15 minuten ingeladen in uw dashboard.

Hoe wilt u betalen?`;
    },
    options: [
      '💳 Betalen met iDEAL',
      '💳 Betalen met creditcard', 
      '📞 Liever telefonisch afhandelen'
    ],
    nextStep: (response) => {
      if (response.includes('telefonisch')) return 'phone_contact';
      return 'express_payment_process';
    },
  },

  express_payment_process: {
    id: 'express_payment_process',
    message: (profile: UserProfile) => {
      return `Perfect! Uw betaling wordt verwerkt.

🔒 Veilige betaling via Stripe
📧 Bevestiging naar ${profile.contactInfo?.email}
⚡ Leads binnen 15 minuten na betaling

*U wordt nu doorgestuurd naar de betaalpagina*`;
    },
    options: [
      '✅ Naar betaalpagina',
      '📞 Toch liever bellen'
    ],
    nextStep: (response) => {
      if (response.includes('bellen')) return 'phone_contact';
      return 'express_complete';
    },
  },

  express_complete: {
    id: 'express_complete',
    message: 'Perfect! Alles is geregeld. Binnen 15 minuten krijgt u de eerste leads in uw inbox. Veel succes met al die nieuwe klanten!',
    options: [
      '🎉 Dank je Lisa!',
      '🔄 Nog een bestelling plaatsen',
      '🏠 Terug naar homepage'
    ],
    nextStep: (response) => {
      if (response.includes('bestelling')) return 'express_welcome';
      if (response.includes('homepage')) return 'back_to_home';
      return 'end';
    },
  },

  // Basis flow - altijd naar leads bestellen
  welcome: {
    id: 'welcome',
    message: 'Bent u ook op zoek naar groei voor uw bedrijf?',
    options: ['Ja, absoluut!', 'Nee, niet echt'],
    nextStep: (response) => response === 'Ja, absoluut!' ? 'industry' : 'reverse_psychology',
  },

  industry: {
    id: 'industry',
    message: 'Geweldig! Dan kan ik u zeker helpen. In welke branche bent u actief?',
    options: ['Zonnepanelen', 'Thuisbatterijen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Anders'],
    nextStep: 'current_leads',
    action: (response, profile) => {
      profile.industry = response;
    },
  },

  reverse_psychology: {
    id: 'reverse_psychology',
    message: 'Ah, u heeft al genoeg klanten? Dat is fantastisch! 🎉 Maar stel dat u met dezelfde tijd en moeite 50% meer omzet zou kunnen maken... zou dat interessant zijn?',
    options: ['Ja, dat wel!', 'Vertel meer', 'Nee, echt niet'],
    nextStep: 'industry',
  },

  current_leads: {
    id: 'current_leads',
    message: (profile: UserProfile) => `Perfect! ${profile.industry} is een geweldige markt. Hoeveel leads neemt u nu gemiddeld per maand af?`,
    options: ['0-10 leads', '10-50 leads', '50-100 leads', '100+ leads', 'Nog geen leads'],
    nextStep: 'challenges',
    action: (response, profile) => {
      profile.currentLeads = response;
    },
  },

  challenges: {
    id: 'challenges',
    message: 'Dank je! En wat is momenteel uw grootste uitdaging bij het krijgen van nieuwe klanten?',
    options: [
      'Leads zijn te duur',
      'Slechte kwaliteit leads',
      'Te weinig volume',
      'Geen tijd voor acquisitie',
      'Onbetrouwbare leveranciers'
    ],
    nextStep: 'solution_intro',
    action: (response, profile) => {
      profile.challenge = response;
    },
  },

  solution_intro: {
    id: 'solution_intro',
    message: 'Dat herken ik! Laat me u onze oplossing tonen. Wij hebben twee soorten leads: exclusieve leads (alleen voor u) en gedeelde leads (gedeeld met 2 andere bedrijven). Wat spreekt u meer aan?',
    options: ['Exclusieve leads', 'Gedeelde leads', 'Vertel meer over beide'],
    nextStep: (response) => {
      if (response === 'Vertel meer over beide') return 'explain_both';
      return 'pricing_presentation';
    },
    action: (response, profile) => {
      profile.leadType = response;
    },
  },

  explain_both: {
    id: 'explain_both',
    message: 'Natuurlijk! Exclusieve leads: Alleen voor u, hogere conversiekans, premium prijs. Gedeelde leads: Gedeeld met 2 anderen, lagere prijs (1/3e van exclusief), nog steeds hoge kwaliteit. Wat past beter bij u?',
    options: ['Exclusieve leads', 'Gedeelde leads'],
    nextStep: 'pricing_presentation',
    action: (response, profile) => {
      profile.leadType = response;
    },
  },

  pricing_presentation: {
    id: 'pricing_presentation',
    message: (profile: UserProfile) => {
      const pricing = profile.industry ? leadPricing[profile.industry] : null;
      if (!pricing) return 'custom_proposal';

      if (profile.leadType === 'Exclusieve leads') {
        return `Perfect! Voor exclusieve ${profile.industry?.toLowerCase()} leads hebben wij:

💎 30+ leads: €${pricing.exclusive['30+']} per lead
💎 50+ leads: €${pricing.exclusive['50+']} per lead  
💎 75+ leads: €${pricing.exclusive['75+']} per lead

✅ Verse leads binnen 15 minuten
✅ 100% exclusief voor u
✅ Hoge conversiekans`;
      } else {
        return `Uitstekende keuze! Voor gedeelde ${profile.industry?.toLowerCase()} leads:

🤝 Prijs: €${pricing.shared.price} per lead
🤝 Minimum: ${pricing.shared.minQuantity} leads per bestelling
🤝 Gedeeld met: Maximaal 2 andere bedrijven

✅ Verse leads binnen 15 minuten
✅ Uitstekende prijs-kwaliteit verhouding`;
      }
    },
    nextStep: 'pricing_options',
  },

  // Continue with essential steps...
  pricing_options: {
    id: 'pricing_options',
    message: 'Wat vindt u van dit aanbod?',
    options: ['Perfect, ik wil bestellen!', 'Kan het nog goedkoper?', 'Meer informatie eerst'],
    nextStep: (response) => {
      if (response === 'Perfect, ik wil bestellen!') return 'quantity_selection';
      if (response === 'Kan het nog goedkoper?') return 'discount_offer';
      return 'more_info';
    },
  },

  quantity_selection: {
    id: 'quantity_selection',
    message: (profile: UserProfile) => {
      if (profile.leadType === 'Gedeelde leads') {
        return 'Perfect! Gedeelde leads worden per 500 stuks geleverd voor de beste prijs-kwaliteit verhouding. Hoeveel wilt u bestellen?';
      } else {
        return 'Uitstekend! Hoeveel exclusieve leads wilt u per maand?';
      }
    },
    options: (profile: UserProfile) => {
      if (profile.leadType === 'Gedeelde leads') {
        return [
          '500 leads - €6.250 totaal',
          '1000 leads - €12.500 totaal',
          'Ander aantal (maatwerk)'
        ];
      } else {
        return [
          '30 leads',
          '50 leads', 
          '75 leads',
          '100+ leads (maatwerk)'
        ];
      }
    },
    nextStep: 'order_process',
    action: (response, profile) => {
      profile.quantity = response;
    },
  },

  order_process: {
    id: 'order_process',
    message: 'Fantastisch! Om te starten heb ik wat gegevens nodig. Kunt u mij uw contactgegevens geven?',
    options: ['Jan de Vries, ABC Solar BV', 'Geef mijn gegevens in', 'Bel mij liever'],
    nextStep: (response) => {
      if (response === 'Bel mij liever') return 'phone_contact';
      return 'contact_confirmation';
    },
    action: (response, profile) => {
      if (response.includes(',')) {
        const parts = response.split(',');
        profile.contactInfo = {
          name: parts[0]?.trim(),
          company: parts[1]?.trim() || '',
        };
      }
    },
  },

  contact_confirmation: {
    id: 'contact_confirmation',
    message: 'Perfect! En wat is uw email adres zodat ik de leads kan versturen?',
    options: ['jan@abcsolar.nl', 'info@mijnbedrijf.nl', 'Geef email adres'],
    nextStep: 'payment_ready',
    action: (response, profile) => {
      if (response.includes('@')) {
        profile.contactInfo = {
          ...profile.contactInfo,
          email: response.trim(),
        };
      }
    },
  },

  payment_ready: {
    id: 'payment_ready',
    message: (profile: UserProfile) => {
      return `Uitstekend ${profile.contactInfo?.name}! 🎉

Ik heb alles klaar:
✅ Leads voor: ${profile.industry}
✅ Type: ${profile.leadType}
✅ Email: ${profile.contactInfo?.email}

Zodra u betaalt, krijgt u binnen 15 minuten uw eerste verse leads!`;
    },
    options: ['💳 Betalen & Direct Starten', 'Eerst meer details', 'Liever telefonisch afhandelen'],
    nextStep: (response) => {
      if (response === '💳 Betalen & Direct Starten') return 'payment_redirect';
      if (response === 'Liever telefonisch afhandelen') return 'phone_contact';
      return 'more_details';
    },
  },

  payment_redirect: {
    id: 'payment_redirect',
    message: 'Perfect! Ik stuur u nu door naar onze beveiligde betaalpagina. Na betaling ontvangt u direct uw eerste leads! 🚀',
    options: ['Naar betaalpagina', 'Toch liever telefonisch'],
    nextStep: 'end',
  },

  phone_contact: {
    id: 'phone_contact',
    message: 'Natuurlijk! Wat is uw telefoonnummer? Dan bel ik u binnen 30 minuten om alles af te handelen! 📞',
    options: ['+31 85 047 7067', '010-1234567', 'Geef telefoonnummer'],
    nextStep: 'phone_confirmation',
    action: (response, profile) => {
      profile.contactInfo = {
        ...profile.contactInfo,
        phone: response.trim(),
      };
    },
  },

  phone_confirmation: {
    id: 'phone_confirmation',
    message: (profile: UserProfile) => {
      return `Geweldig! Ik bel u binnen 30 minuten op ${profile.contactInfo?.phone} om uw leadpakket af te handelen.

U krijgt:
🎯 Aangepaste leads voor uw branche
⚡ Eerste leads binnen 15 minuten na akkoord
🎁 Speciale nieuwe klant korting

Tot zo! 👋`;
    },
    options: ['Perfect, ik wacht op uw telefoontje!', 'Stuur me ook een email'],
    nextStep: 'end',
  },

  // Lead examples flow
  lead_examples: {
    id: 'lead_examples',
    message: `Hier ziet u hoe een verse lead eruit ziet! 📊

🎯 Voorbeeld Thuisbatterij Lead:

👤 Naam: Jan de Vries
📞 Telefoon: +31 85 047 7067  
📧 Email: jan@email.nl
📍 Adres: Kerkstraat 123, Utrecht
💡 Interesse: Thuisbatterij voor zonnepanelen
🎯 Motivatie: Energie onafhankelijkheid
💰 Budget: €5.000 - €8.000
⏰ Tijdlijn: Binnen 3 maanden
⚡ Status: Verse lead (15 min geleden gegenereerd)

📈 Wat krijgt u:
✅ Volledige contactgegevens
✅ Interesse niveau en motivatie  
✅ Budget indicatie
✅ Tijdlijn voor aankoop
✅ Real-time status updates

🚀 Verse leads = Hogere conversie!`,
    options: ['Dit ziet er goed uit!', 'Meer voorbeelden', 'Hoe ontvang ik de leads?'],
    nextStep: (response) => {
      if (response === 'Hoe ontvang ik de leads?') return 'lead_delivery_info';
      if (response === 'Meer voorbeelden') return 'more_lead_examples';
      return 'order_process';
    },
  },

  lead_delivery_info: {
    id: 'lead_delivery_info',
    message: `📋 Hoe werkt onze lead generatie?

🎯 Verse Lead Campagnes:
✅ Wij draaien actieve campagnes op verschillende platformen
✅ Echte geïnteresseerde prospects die reageren op onze advertenties
✅ Specifiek voor uw product (thuisbatterij, zonnepanelen, etc.)
✅ Geen doorverkoop van oude leads

⚡ Realtime Lead Delivery:
✅ Leads worden gegenereerd door onze campagnes
✅ Direct ingeladen in uw dashboard (kwartier nauwkeurig)
✅ U bent als eerste bij deze verse prospects
✅ Maximale conversiekans door verse interesse

📊 Uw Persoonlijke Dashboard:
✅ Realtime updates wanneer nieuwe leads binnenkomen
✅ Volledige contactgegevens en interesse details
✅ Kies hoeveel leads per week
✅ Automatische delivery tot uw limiet

💳 Klaar om verse leads te ontvangen?`,
    options: ['Ja, ik wil bestellen!', 'Meer vragen', 'Terug naar voorbeelden'],
    nextStep: (response) => {
      if (response === 'Ja, ik wil bestellen!') return 'order_process';
      if (response === 'Terug naar voorbeelden') return 'lead_examples';
      return 'questions';
    },
  },

  // Context-specific flows
  faq_followup: {
    id: 'faq_followup',
    message: 'Ik help u graag met uw vraag! Wat wilt u specifiek weten?',
    options: ['Prijzen voor mijn branche', 'Kwaliteit voorbeelden', 'Leveringstijd', 'CRM koppelingen', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Prijzen voor mijn branche') return 'industry';
      if (response === 'Kwaliteit voorbeelden') return 'lead_examples';
      if (response === 'Leveringstijd') return 'delivery_explanation';
      if (response === 'CRM koppelingen') return 'crm_integration';
      return 'order_process';
    },
  },

  quality_explanation: {
    id: 'quality_explanation',
    message: `Onze kwaliteitsgarantie is gebaseerd op 4 pijlers:

✅ Verse leads binnen 15 minuten - Maximale conversiekans
✅ Kwaliteitscontrole proces - Elke lead wordt gevalideerd
✅ Geld terug garantie - 30 dagen niet-goed-geld-terug
✅ Nederlandse prospects - Alleen relevante, lokale leads

Wilt u dit testen met een kleine bestelling?`,
    options: ['Ja, ik wil testen', 'Vertel meer over het proces', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      if (response === 'Vertel meer over het proces') return 'quality_process';
      return 'test_order';
    },
  },

  quality_process: {
    id: 'quality_process',
    message: `Ons kwaliteitscontrole proces:

🔍 Stap 1: Lead wordt gegenereerd via onze kanalen
✅ Stap 2: Automatische validatie van contactgegevens
🎯 Stap 3: Interesse niveau wordt geverifieerd
📞 Stap 4: Telefoonnummer wordt gecontroleerd
⚡ Stap 5: Binnen 15 minuten naar u verstuurd

98% van onze leads voldoet aan kwaliteitseisen!`,
    options: ['Dat klinkt goed!', 'Wat bij slechte leads?', 'Toon me voorbeelden', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Wat bij slechte leads?') return 'quality_guarantee';
      if (response === 'Toon me voorbeelden') return 'lead_examples';
      if (response === 'Direct bestellen') return 'order_process';
      return 'test_order';
    },
  },

  quality_guarantee: {
    id: 'quality_guarantee',
    message: `Bij slechte leads krijgt u:

🔄 Gratis vervanging - Binnen 24 uur nieuwe leads
💰 Geld terug - Als vervanging niet voldoet
📊 Credit systeem - Slechte leads tellen niet mee
🎯 Persoonlijke aandacht - Direct contact met mij

Gemiddeld vervangen we <2% van onze leads!`,
    options: ['Perfect, dat geeft vertrouwen', 'Hoe meld ik slechte leads?', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Hoe meld ik slechte leads?') return 'complaint_process';
      return 'order_process';
    },
  },

  pricing_explanation: {
    id: 'pricing_explanation',
    message: `Onze prijzen zijn transparant en gebaseerd op volume:

🎯 Exclusieve leads: €30-50 per lead (afhankelijk van branche)
🤝 Gedeelde leads: €12-18 per lead (min. 500 stuks)

Voor welke branche wilt u een specifieke prijsopgave?`,
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      return 'specific_pricing';
    },
    action: (response, profile) => {
      if (response !== 'Direct bestellen') {
        profile.industry = response;
      }
    },
  },

  specific_pricing: {
    id: 'specific_pricing',
    message: (profile: UserProfile) => {
      const industry = profile.industry;
      const pricing = industry ? leadPricing[industry] : null;
      
      if (!pricing) {
        return 'Voor deze branche maken we een aangepaste prijsopgave. Laat me dat voor u uitrekenen!';
      }
      
      return `Voor ${industry} hebben we deze tarieven:

💎 Exclusieve leads:
✅ 30+ leads: €${pricing.exclusive['30+']} per lead
✅ 50+ leads: €${pricing.exclusive['50+']} per lead  
✅ 75+ leads: €${pricing.exclusive['75+']} per lead

🤝 Gedeelde leads:
✅ €${pricing.shared.price} per lead
✅ Minimum ${pricing.shared.minQuantity} leads per bestelling

Welke optie spreekt u aan?`;
    },
    options: ['Exclusieve leads', 'Gedeelde leads', 'Bereken ROI voor mij', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Bereken ROI voor mij') return 'roi_calculator';
      if (response === 'Direct bestellen') return 'order_process';
      return 'solution_intro';
    },
    action: (response, profile) => {
      if (response !== 'Bereken ROI voor mij' && response !== 'Direct bestellen') {
        profile.leadType = response;
      }
    },
  },

  roi_calculator: {
    id: 'roi_calculator',
    message: 'Perfect! Laat me een ROI calculator voor u maken op basis van uw branche. Hiermee kunt u het ideale aantal leads berekenen voor maximale winst.',
    options: [], // This will trigger ROI calculator component
    nextStep: (response) => {
      // Response will be from ROI calculator with format: "Ja, ik wil X leads bestellen voor €Y"
      if (response.includes('wil') && response.includes('bestellen')) {
        return 'roi_order_confirmation';
      }
      return 'order_process';
    },
    action: (response, profile) => {
      // ROI calculator will have already updated the profile
      console.log('ROI Calculator response:', response);
    },
  },

  roi_order_confirmation: {
    id: 'roi_order_confirmation',
    message: (profile: UserProfile) => {
      const quantity = profile.quantity?.match(/\d+/)?.[0] || 'onbekend aantal';
      const leadType = profile.leadType || 'leads';
      const budget = profile.budget || 'wordt berekend';
      
      return `Uitstekende keuze! 🎉

Op basis van uw ROI berekening:
✅ ${quantity} ${leadType.toLowerCase()}
✅ Investering: ${budget}
✅ Verwachte ROI: Zeer positief!

Laten we uw bestelling afhandelen. Ik heb uw contactgegevens nodig om de leads te kunnen versturen.`;
    },
    options: ['Contactgegevens invullen', 'Liever telefonisch afhandelen'],
    nextStep: (response) => {
      if (response === 'Liever telefonisch afhandelen') return 'phone_contact';
      return 'contact_details';
    },
  },

  contact_details: {
    id: 'contact_details',
    message: 'Perfect! Wat is uw naam en email? Dan neem ik binnen 2 uur contact met u op! 📞',
    options: [], // Free text input
    nextStep: 'confirmation',
    action: (response, profile) => {
      const parts = response.split(',');
      profile.contactInfo = {
        name: parts[0]?.trim(),
        email: parts[1]?.trim(),
      };
    },
  },

  confirmation: {
    id: 'confirmation',
    message: (profile: UserProfile) => {
      return `Bedankt ${profile.contactInfo?.name}! 🙏

Ik heb uw gegevens genoteerd:
✅ Branche: ${profile.industry}
✅ Email: ${profile.contactInfo?.email}

U hoort binnen 2 uur van mij met een gepersonaliseerd voorstel. Tot snel! 👋`;
    },
    options: ['Dank je Lisa!', 'Nog een vraag'],
    nextStep: 'end',
  },

  delivery_explanation: {
    id: 'delivery_explanation',
    message: `Zo werkt onze verse lead generatie:

🎯 Actieve Campagnes: Wij draaien campagnes op Facebook, Google en andere platformen
⚡ Verse Prospects: Echte geïnteresseerde klanten die reageren op onze advertenties
🔄 Realtime Delivery: Leads worden direct ingeladen zodra ze gegenereerd zijn (kwartier nauwkeurig)
📊 Uw Dashboard: Persoonlijke toegang tot alle verse leads met volledige details
🔗 CRM Integratie: Automatische sync met uw bestaande systemen mogelijk

Wilt u verse leads uit onze campagnes ontvangen?`,
    options: ['Ja, start vandaag', 'Meer over CRM integratie', 'Demo aanvragen'],
    nextStep: (response) => {
      if (response === 'Ja, start vandaag') return 'order_process';
      if (response === 'Demo aanvragen') return 'demo_request';
      return 'crm_integration';
    },
  },

  branches_explanation: {
    id: 'branches_explanation',
    message: `Wij zijn gespecialiseerd in:

🏠 Zonnepanelen: Huiseigenaren met interesse in solar
🔋 Thuisbatterijen: Energie-onafhankelijkheid zoekers
🌡️ Warmtepompen: Verduurzaming en besparing
❄️ Airco's: Comfort en klimaatbeheersing
💰 Financial Lease: Bedrijven zoekend naar financiering

Plus maatwerk voor andere branches op aanvraag!`,
    options: ['Vertel meer over mijn branche', 'Direct bestellen', 'Maatwerk aanvragen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      if (response === 'Maatwerk aanvragen') return 'custom_branches';
      return 'branch_details';
    },
  },

  branch_details: {
    id: 'branch_details',
    message: (profile: UserProfile) => {
      const industry = profile.industry || 'uw branche';
      const pricing = leadPricing[industry];
      
      if (!pricing) {
        return `Voor ${industry} maken we graag een aangepast aanbod. Onze maatwerk service zorgt voor:

🎯 Specifieke lead criteria
💰 Aangepaste prijzen
⚡ Flexibele levering
🤝 Persoonlijke begeleiding

Wilt u een offerte voor maatwerk?`;
      }
      
      return `Voor ${industry.toLowerCase()} hebben we uitgebreide ervaring:

💎 Exclusieve leads: €${pricing.exclusive['30+']} - €${pricing.exclusive['75+']} per lead
🤝 Gedeelde leads: €${pricing.shared.price} per lead (min. ${pricing.shared.minQuantity})

🎯 Specialisaties:
✅ Gerichte interesse filtering
✅ Lokale geografische targeting
✅ Budget en tijdlijn matching

Wilt u direct starten?`;
    },
    options: ['Ja, direct starten', 'Meer over maatwerk', 'ROI berekenen'],
    nextStep: (response) => {
      if (response === 'ROI berekenen') return 'roi_calculator';
      if (response === 'Meer over maatwerk') return 'custom_branches';
      return 'order_process';
    },
  },

  crm_integration: {
    id: 'crm_integration',
    message: `Excellent! CRM integratie maakt alles veel makkelijker. Wij ondersteunen:

🔗 HubSpot - Direct API koppeling
🔗 Salesforce - Real-time sync
🔗 Pipedrive - Automatische import
🔗 Custom CRM - Webhook/API
🔗 Excel/CSV - Automatische export

Welke CRM gebruikt u?`,
    options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Anders/Custom', 'Gewoon Excel', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      return 'crm_setup_details';
    },
    action: (response, profile) => {
      profile.contactInfo = {
        ...profile.contactInfo,
        company: `${profile.contactInfo?.company || 'Bedrijf'} (CRM: ${response})`,
      };
    },
  },

  crm_setup_details: {
    id: 'crm_setup_details',
    message: (profile: UserProfile) => {
      const crm = profile.contactInfo?.company?.includes('CRM:') ? 
        profile.contactInfo.company.split('CRM: ')[1]?.replace(')', '') : 'uw CRM';
      
      return `Perfect! Voor ${crm} kunnen we de integratie opzetten:

⚡ Setup tijd: 15 minuten
🔧 Onze service: Gratis setup  
📊 Real-time sync: Automatisch
🎯 Lead matching: Intelligent

Zullen we dit opzetten met uw eerste leadpakket?`;
    },
    options: ['Ja, setup met leads', 'Eerst alleen leads', 'Meer CRM info'],
    nextStep: (response) => {
      if (response === 'Meer CRM info') return 'crm_integration';
      return 'order_process';
    },
  },

  customer_service: {
    id: 'customer_service',
    message: 'Hoe kan ik u vandaag helpen?',
    options: ['Nieuwe leads bestellen', 'Account vragen', 'Kwaliteit problemen', 'Factuur vragen', 'Technische support'],
    nextStep: (response) => {
      if (response === 'Nieuwe leads bestellen') return 'express_welcome';
      if (response === 'Account vragen') return 'account_support';
      if (response === 'Kwaliteit problemen') return 'quality_support';
      if (response === 'Factuur vragen') return 'billing_support';
      return 'technical_support';
    },
  },

  // Support flows
  account_support: {
    id: 'account_support',
    message: 'Ik help u graag met uw account! Wat is uw vraag?',
    options: ['Wachtwoord vergeten', 'Gegevens wijzigen', 'Facturen bekijken', 'Account verwijderen', 'Terug naar leads bestellen'],
    nextStep: (response) => {
      if (response === 'Terug naar leads bestellen') return 'express_welcome';
      return 'account_help';
    },
  },

  account_help: {
    id: 'account_help',
    message: 'Ik heb uw account probleem opgelost. Terwijl u wacht, wilt u misschien alvast nieuwe leads bestellen?',
    options: ['Ja, graag!', 'Nee, ik wacht eerst', 'Meer account hulp'],
    nextStep: (response) => {
      if (response === 'Ja, graag!') return 'express_welcome';
      return 'account_help';
    },
  },

  more_details: {
    id: 'more_details',
    message: `Natuurlijk! Hier zijn meer details over uw bestelling:

📋 Wat u krijgt:
✅ Volledige contactgegevens per lead
✅ Interesse niveau en motivatie
✅ Budget indicatie en tijdlijn
✅ Real-time dashboard toegang

⚡ Levering:
✅ Binnen 15 minuten na betaling
✅ Direct naar uw email
✅ Automatische updates

Klaar om te starten?`,
    options: ['Ja, ik ben overtuigd!', 'Nog meer vragen', 'Liever telefonisch'],
    nextStep: (response) => {
      if (response === 'Ja, ik ben overtuigd!') return 'payment_redirect';
      if (response === 'Liever telefonisch') return 'phone_contact';
      return 'questions';
    },
  },

  demo_request: {
    id: 'demo_request',
    message: `Perfect! Ik zet graag een demo voor u klaar. U krijgt:

🎯 Live demo van 5 verse leads
📊 Persoonlijke ROI berekening
💬 15 minuten persoonlijk gesprek
📧 Demo binnen 2 uur in uw inbox

Wat is uw email adres voor de demo?`,
    options: ['demo@warmeleads.eu', 'info@bedrijf.nl', 'Geef email adres'],
    nextStep: 'demo_confirmation',
    action: (response, profile) => {
      if (response.includes('@')) {
        profile.contactInfo = {
          ...profile.contactInfo,
          email: response.trim(),
        };
      }
    },
  },

  demo_confirmation: {
    id: 'demo_confirmation',
    message: (profile: UserProfile) => {
      return `Geweldig! Uw demo wordt klaargemaakt en verstuurd naar ${profile.contactInfo?.email}.

✅ 5 verse leads als voorbeeld
✅ Persoonlijke ROI berekening
✅ Binnen 2 uur in uw inbox

Terwijl u wacht, wilt u misschien alvast een kleine test bestelling doen?`;
    },
    options: ['Ja, test bestelling', 'Nee, ik wacht op de demo', 'Liever direct bellen'],
    nextStep: (response) => {
      if (response === 'Ja, test bestelling') return 'test_order';
      if (response === 'Liever direct bellen') return 'phone_contact';
      return 'end';
    },
  },

  test_order: {
    id: 'test_order',
    message: `Perfect! Voor een test bestelling raad ik aan:

🎯 50 gedeelde leads voor uw branche
💰 Speciale testprijs (20% korting)
⚡ Binnen 15 minuten uw eerste leads
🎁 Gratis onboarding en support

Zullen we uw test bestelling samenstellen?`,
    options: ['Ja, laten we starten', 'Ander aantal', 'Liever exclusieve leads'],
    nextStep: (response) => {
      if (response === 'Ja, laten we starten') return 'order_process';
      return 'quantity_selection';
    },
  },

  custom_proposal: {
    id: 'custom_proposal',
    message: 'Voor uw branche maken we graag een aangepast voorstel! Laat me even de beste opties voor u berekenen...',
    options: ['Bereken aangepast pakket', 'Liever standaard opties', 'Direct contact'],
    nextStep: (response) => {
      if (response === 'Liever standaard opties') return 'industry';
      if (response === 'Direct contact') return 'phone_contact';
      return 'custom_package';
    },
    delay: 2000,
  },

  custom_package: {
    id: 'custom_package',
    message: (profile: UserProfile) => {
      return `Op basis van uw budget van ${profile.budget} kan ik een aangepast pakket voor u samenstellen. Laat me even rekenen... 🧮

Ik kom zo terug met een perfect voorstel dat binnen uw budget past!`;
    },
    options: ['Graag!', 'Oké, ben benieuwd'],
    nextStep: 'final_offer',
    delay: 3000,
  },

  final_offer: {
    id: 'final_offer',
    message: (profile: UserProfile) => {
      return `Perfect! Hier is mijn voorstel:

🎯 Starter Pakket voor ${profile.industry}
💰 Aangepaste prijs binnen uw budget
🎁 Eerste week gratis proberen
📞 Persoonlijke onboarding
⚡ Leads binnen 15 minuten

Zullen we een korte call inplannen om de details te bespreken?`;
    },
    options: ['Ja, plan een call!', 'Stuur me meer info', 'Ik denk er over na'],
    nextStep: 'contact_details',
  },

  custom_branches: {
    id: 'custom_branches',
    message: 'Voor maatwerk branches maken we een speciaal aanbod!',
    options: ['Vertel meer over maatwerk', 'Direct bestellen', 'Terug naar standaard branches'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      if (response === 'Terug naar standaard branches') return 'branches_explanation';
      return 'custom_branches_info';
    },
  },

  custom_branches_info: {
    id: 'custom_branches_info',
    message: `Maatwerk betekent:

🎯 Aangepaste lead criteria
💰 Speciale prijzen
⚡ Flexibele delivery
🤝 Persoonlijke begeleiding

Wilt u een offerte voor maatwerk?`,
    options: ['Ja, maak offerte', 'Nee, liever standaard', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      return 'custom_branches';
    },
  },

  complaint_process: {
    id: 'complaint_process',
    message: `Om slechte leads te melden:

📧 Email: info@warmeleads.eu
📞 Telefoon: +31 85 047 7067
⏰ Response: Binnen 2 uur

Terwijl u wacht, kunt u alvast nieuwe leads bestellen!`,
    options: ['Ja, nieuwe leads bestellen', 'Nee, ik wacht eerst', 'Meer support info'],
    nextStep: (response) => {
      if (response === 'Ja, nieuwe leads bestellen') return 'express_welcome';
      return 'complaint_process';
    },
  },

  more_info: {
    id: 'more_info',
    message: 'Natuurlijk! Wat wilt u graag weten?',
    options: ['Hoe werkt de lead delivery?', 'Wat als ik niet tevreden ben?', 'Kan ik meer leads bijbestellen?', 'Toch maar direct bestellen'],
    nextStep: (response) => {
      if (response === 'Toch maar direct bestellen') return 'quantity_selection';
      return 'info_answer';
    },
  },

  info_answer: {
    id: 'info_answer',
    message: (profile: UserProfile) => {
      return `Goede vraag! Onze leads worden:

⚡ Binnen 15 minuten geleverd via email
🎯 Gefilterd op uw specifieke criteria
📞 Voorzien van contactgegevens en interesse
✅ Gegarandeerd vers (max 24u oud)

Als u niet tevreden bent, krijgt u uw geld terug of gratis vervanging!

Zullen we uw leadpakket nu activeren?`;
    },
    options: ['Ja, laten we starten!', 'Nog een vraag', 'Liever telefonisch contact'],
    nextStep: (response) => {
      if (response === 'Ja, laten we starten!') return 'quantity_selection';
      if (response === 'Liever telefonisch contact') return 'phone_contact';
      return 'more_info';
    },
  },

  questions: {
    id: 'questions',
    message: 'Natuurlijk! Ik beantwoord graag al uw vragen. Wat wilt u weten?',
    options: ['Prijzen', 'Kwaliteit van leads', 'Hoe snel?', 'Andere vraag'],
    nextStep: (response) => {
      if (response === 'Prijzen') return 'pricing_info';
      if (response === 'Kwaliteit van leads') return 'quality_info';
      if (response === 'Hoe snel?') return 'speed_info';
      return 'custom_question';
    },
  },

  custom_question: {
    id: 'custom_question',
    message: 'Ik luister! Wat is uw vraag?',
    options: ['Hoe ziet een lead eruit?', 'Wat is de ROI?', 'Andere vraag'],
    nextStep: (response) => {
      if (response === 'Hoe ziet een lead eruit?') return 'lead_examples';
      if (response === 'Wat is de ROI?') return 'roi_info';
      return 'general_answer';
    },
  },

  general_answer: {
    id: 'general_answer',
    message: (profile: UserProfile) => {
      return `Goede vraag! Onze leads worden:

⚡ Binnen 15 minuten geleverd via email
🎯 Gefilterd op uw specifieke criteria
📞 Voorzien van contactgegevens en interesse
✅ Gegarandeerd vers (max 24u oud)

Als u niet tevreden bent, krijgt u uw geld terug of gratis vervanging!

Zullen we uw leadpakket nu activeren?`;
    },
    options: ['Ja, laten we starten!', 'Nog een vraag', 'Liever telefonisch contact'],
    nextStep: (response) => {
      if (response === 'Ja, laten we starten!') return 'quantity_selection';
      if (response === 'Liever telefonisch contact') return 'phone_contact';
      return 'questions';
    },
  },

  pricing_info: {
    id: 'pricing_info',
    message: `Onze prijzen zijn transparant en gebaseerd op volume:

🎯 Exclusieve leads: €30-50 per lead
🤝 Gedeelde leads: €12-18 per lead (min. 500)

Hoeveel leads heeft u ongeveer nodig?`,
    options: ['30-50 leads', '50-100 leads', '100+ leads', 'Meer info'],
    nextStep: (response) => {
      if (response.includes('leads')) return 'volume_based_pricing';
      return 'pricing_details';
    },
  },

  pricing_details: {
    id: 'pricing_details',
    message: `Onze prijzen zijn gebaseerd op volume:

🎯 Exclusieve leads: €30-50 per lead (afhankelijk van branche)
🤝 Gedeelde leads: €12-18 per lead (min. 500 stuks)

Voor welke branche wilt u een specifieke prijsopgave?`,
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      return 'specific_pricing';
    },
    action: (response, profile) => {
      if (response !== 'Direct bestellen') {
        profile.industry = response;
      }
    },
  },

  volume_based_pricing: {
    id: 'volume_based_pricing',
    message: `Onze prijzen zijn gebaseerd op volume:

🎯 Exclusieve leads: €30-50 per lead (afhankelijk van branche)
🤝 Gedeelde leads: €12-18 per lead (min. 500 stuks)

Voor welke branche wilt u een specifieke prijsopgave?`,
    options: ['Thuisbatterijen', 'Zonnepanelen', 'Warmtepompen', 'Airco\'s', 'Financial Lease', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      return 'specific_pricing';
    },
    action: (response, profile) => {
      if (response !== 'Direct bestellen') {
        profile.industry = response;
      }
    },
  },

  quality_info: {
    id: 'quality_info',
    message: `Onze leads zijn van topkwaliteit:

✅ Verse leads (max 24u oud)
🎯 Gefilterd op interesse en budget
📞 Volledige contactgegevens
⚡ Binnen 15 minuten geleverd

Wilt u een voorbeeld zien?`,
    options: ['Ja, toon voorbeeld', 'Vertel meer', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Ja, toon voorbeeld') return 'lead_examples';
      if (response === 'Direct bestellen') return 'order_process';
      return 'quality_details';
    },
  },

  quality_details: {
    id: 'quality_details',
    message: `Onze kwaliteitsgarantie is gebaseerd op 4 pijlers:

✅ Verse leads binnen 15 minuten - Maximale conversiekans
✅ Kwaliteitscontrole proces - Elke lead wordt gevalideerd
✅ Geld terug garantie - 30 dagen niet-goed-geld-terug
✅ Nederlandse prospects - Alleen relevante, lokale leads

Wilt u dit testen met een kleine bestelling?`,
    options: ['Ja, ik wil testen', 'Vertel meer over het proces', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Direct bestellen') return 'order_process';
      if (response === 'Vertel meer over het proces') return 'quality_process';
      return 'test_order';
    },
  },

  speed_info: {
    id: 'speed_info',
    message: `Snelheid is cruciaal voor leadkwaliteit:

⚡ Verse leads binnen 15 minuten
🕐 Real-time updates op kwartier nauwkeurig
📱 Direct naar uw dashboard
🚀 Geen vertraging door administratie

Wilt u dit zelf ervaren?`,
    options: ['Ja, start vandaag', 'Meer info', 'Demo aanvragen'],
    nextStep: (response) => {
      if (response === 'Ja, start vandaag') return 'order_process';
      if (response === 'Demo aanvragen') return 'demo_request';
      return 'questions';
    },
  },

  roi_info: {
    id: 'roi_info',
    message: `Uitstekende vraag! De ROI van onze leads is gemiddeld:

📊 Exclusieve leads: 250-400% ROI
📊 Gedeelde leads: 150-250% ROI

🎯 Waarom zo hoog?
✅ Verse leads (max 24u oud)
✅ Hoge conversiekans
✅ Nederlandse prospects
✅ Snelle levering

Wilt u uw eigen ROI berekenen?`,
    options: ['Ja, bereken mijn ROI', 'Toon me voorbeelden', 'Direct bestellen'],
    nextStep: (response) => {
      if (response === 'Ja, bereken mijn ROI') return 'roi_calculator';
      if (response === 'Toon me voorbeelden') return 'lead_examples';
      return 'order_process';
    },
  },

  more_lead_examples: {
    id: 'more_lead_examples',
    message: `Hier ziet u nog meer voorbeelden van leads! 📊

🎯 Voorbeeld Zonnepanelen Lead:

👤 Naam: Pietje Puk
📞 Telefoon: +31 85 047 7067
📧 Email: pietje@email.nl  
📍 Adres: Keizersgracht 45, Amsterdam
💡 Interesse: Zonnepanelen voor huiseigenaren
🎯 Motivatie: Energie besparing en duurzaamheid
💰 Budget: €10.000 - €15.000
⏰ Tijdlijn: Binnen 2 maanden
⚡ Status: Verse lead (10 min geleden gegenereerd)

📈 Wat krijgt u:
✅ Volledige contactgegevens
✅ Interesse niveau en motivatie
✅ Budget indicatie  
✅ Tijdlijn voor aankoop
✅ Real-time status updates

🚀 Verse leads = Hogere conversie!`,
    options: ['Dit ziet er goed uit!', 'Meer voorbeelden', 'Hoe ontvang ik de leads?'],
    nextStep: (response) => {
      if (response === 'Hoe ontvang ik de leads?') return 'lead_delivery_info';
      if (response === 'Meer voorbeelden') return 'more_lead_examples';
      return 'order_process';
    },
  },

  discount_offer: {
    id: 'discount_offer',
    message: 'Ik begrijp het! Goed nieuws: voor nieuwe klanten hebben we deze maand nog 20% korting beschikbaar. En als u vandaag besluit, krijgt u de eerste 10 leads gratis om de kwaliteit te testen! 🎁',
    options: ['Dat is interessant!', 'Vertel meer over de gratis test', 'Nog steeds te duur'],
    nextStep: (response) => {
      if (response === 'Nog steeds te duur') return 'budget_discussion';
      return 'quantity_selection';
    },
  },

  budget_discussion: {
    id: 'budget_discussion',
    message: 'Ik begrijp uw situatie. Wat zou voor u een realistische investering per maand zijn voor leadgeneratie?',
    options: ['€500-1000', '€1000-2500', '€2500-5000', '€5000+', 'Minder dan €500'],
    nextStep: 'custom_package',
    action: (response, profile) => {
      profile.budget = response;
    },
  },

  // Essential support flows
  quality_support: {
    id: 'quality_support',
    message: 'Ik begrijp dat u problemen heeft met de kwaliteit. Laat me u helpen!',
    options: ['Leads zijn niet relevant', 'Contactgegevens kloppen niet', 'Te weinig conversie', 'Terug naar leads bestellen'],
    nextStep: (response) => {
      if (response === 'Terug naar leads bestellen') return 'express_welcome';
      return 'quality_help';
    },
  },

  quality_help: {
    id: 'quality_help',
    message: 'Ik heb uw kwaliteitsprobleem opgelost. Om dit te voorkomen, raad ik aan om exclusieve leads te proberen. Wilt u dat?',
    options: ['Ja, exclusieve leads proberen', 'Nee, liever niet', 'Meer uitleg'],
    nextStep: (response) => {
      if (response === 'Ja, exclusieve leads proberen') return 'express_welcome';
      return 'quality_help';
    },
  },

  billing_support: {
    id: 'billing_support',
    message: 'Ik help u graag met factuur vragen!',
    options: ['Factuur niet ontvangen', 'Verkeerd bedrag', 'Betaling mislukt', 'Terug naar leads bestellen'],
    nextStep: (response) => {
      if (response === 'Terug naar leads bestellen') return 'express_welcome';
      return 'billing_help';
    },
  },

  billing_help: {
    id: 'billing_help',
    message: 'Ik heb uw factuur probleem opgelost. Terwijl u wacht, kunt u alvast nieuwe leads bestellen!',
    options: ['Ja, graag!', 'Nee, ik wacht eerst', 'Meer factuur hulp'],
    nextStep: (response) => {
      if (response === 'Ja, graag!') return 'express_welcome';
      return 'billing_help';
    },
  },

  technical_support: {
    id: 'technical_support',
    message: 'Voor technische ondersteuning kan ik u helpen!',
    options: ['Dashboard werkt niet', 'Leads laden niet', 'CRM koppeling problemen', 'Terug naar leads bestellen'],
    nextStep: (response) => {
      if (response === 'Terug naar leads bestellen') return 'express_welcome';
      return 'technical_help';
    },
  },

  technical_help: {
    id: 'technical_help',
    message: 'Ik heb uw technische probleem opgelost. Terwijl u wacht, kunt u alvast nieuwe leads bestellen!',
    options: ['Ja, graag!', 'Nee, ik wacht eerst', 'Meer technische hulp'],
    nextStep: (response) => {
      if (response === 'Ja, graag!') return 'express_welcome';
      return 'technical_help';
    },
  },

  // End flows
  end: {
    id: 'end',
    message: `Dank u wel voor uw interesse in WarmeLeads! 🙏

Heeft u nog vragen of wilt u toch een bestelling plaatsen?`,
    options: ['Nieuwe bestelling starten', 'Contact opnemen', 'Terug naar homepage'],
    nextStep: (response) => {
      if (response === 'Nieuwe bestelling starten') return 'express_welcome';
      if (response === 'Contact opnemen') return 'phone_contact';
      return 'back_to_home';
    },
  },

  back_to_home: {
    id: 'back_to_home',
    message: 'Bedankt voor uw bezoek! Tot ziens! 👋',
    options: ['Ga naar homepage'],
    nextStep: 'end',
  },
};

export function getNextMessage(currentStep: string, userResponse: string, userProfile: UserProfile) {
  const step = chatFlow[currentStep];
  if (!step) return null;

  // Check for lead examples questions
  if (userResponse.toLowerCase().includes('hoe ziet') && userResponse.toLowerCase().includes('lead')) {
    const nextStep = chatFlow['lead_examples'];
    return {
      id: 'lead_examples',
      message: typeof nextStep.message === 'function' ? nextStep.message(userProfile) : nextStep.message,
      options: nextStep.options || [],
      delay: nextStep.delay || 1500,
    };
  }

  if (userResponse.toLowerCase().includes('lead') && userResponse.toLowerCase().includes('uit')) {
    const nextStep = chatFlow['lead_examples'];
    return {
      id: 'lead_examples',
      message: typeof nextStep.message === 'function' ? nextStep.message(userProfile) : nextStep.message,
      options: nextStep.options || [],
      delay: nextStep.delay || 1500,
    };
  }

  if (userResponse.toLowerCase().includes('voorbeeld') && userResponse.toLowerCase().includes('lead')) {
    const nextStep = chatFlow['lead_examples'];
    return {
      id: 'lead_examples',
      message: typeof nextStep.message === 'function' ? nextStep.message(userProfile) : nextStep.message,
      options: nextStep.options || [],
      delay: nextStep.delay || 1500,
    };
  }

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

  const nextStep = chatFlow[nextStepId];
  if (!nextStep) return null;

  // Generate message (can be function of profile)
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
    delay: nextStep.delay || 1500,
  };
}

export function generatePersonalizedRecommendation(profile: UserProfile): string {
      const industry = profile.industry;
  const challenge = profile.challenge;
  const currentLeads = profile.currentLeads;

  if (challenge === 'Leads zijn te duur' || currentLeads === 'Nog geen leads') {
    const price = industry ? leadPricing[industry]?.shared.price || 15 : 15;
    return `Op basis van uw situatie raad ik gedeelde leads aan. Deze zijn betaalbaar (€${price}/lead) en perfect om mee te starten!`;
  }

  if (currentLeads === '100+ leads' || challenge === 'Te weinig volume') {
    return `Voor uw schaal raad ik exclusieve leads aan. Hogere conversie en meer controle over uw pipeline!`;
  }

  return `Ik raad een mix van beide aan: start met gedeelde leads om te testen, schakel over naar exclusieve leads voor uw beste campagnes!`;
}
