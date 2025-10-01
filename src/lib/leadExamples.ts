export interface LeadExample {
  id: string;
  industry: string;
  type: 'exclusive' | 'shared';
  contact: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
  interest: {
    level: number; // 1-10
    description: string;
    budget: string;
    timeline: string;
  };
  notes: string;
  generated: string;
}

export const leadExamples: Record<string, LeadExample[]> = {
  'Thuisbatterijen': [
    {
      id: 'TB-001',
      industry: 'Thuisbatterijen',
      type: 'exclusive',
      contact: {
        name: 'Familie van der Berg',
        phone: '06-12345678',
        email: 'j.vandenberg@email.nl',
        location: 'Utrecht, 3512 AB'
      },
      interest: {
        level: 9,
        description: 'Wil onafhankelijk van energiemaatschappij worden',
        budget: '€8.000 - €12.000',
        timeline: 'Binnen 3 maanden'
      },
      notes: 'Heeft al zonnepanelen, zoekt nu batterij. Zeer geïnteresseerd.',
      generated: '2 minuten geleden'
    },
    {
      id: 'TB-002', 
      industry: 'Thuisbatterijen',
      type: 'shared',
      contact: {
        name: 'Mark en Sandra Jansen',
        phone: '06-87654321',
        email: 'mark.jansen@gmail.com',
        location: 'Amsterdam, 1012 KL'
      },
      interest: {
        level: 7,
        description: 'Energiekosten besparen, duurzaamheid belangrijk',
        budget: '€5.000 - €8.000',
        timeline: 'Binnen 6 maanden'
      },
      notes: 'Vergelijkt verschillende opties, wil advies op locatie.',
      generated: '8 minuten geleden'
    }
  ],
  'Zonnepanelen': [
    {
      id: 'ZP-001',
      industry: 'Zonnepanelen',
      type: 'exclusive',
      contact: {
        name: 'Peter Hendriks',
        phone: '010-2345678',
        email: 'p.hendriks@bedrijf.nl',
        location: 'Rotterdam, 3011 AD'
      },
      interest: {
        level: 8,
        description: 'Wil zonnepanelen voor bedrijfspand',
        budget: '€15.000 - €25.000',
        timeline: 'Voor zomer 2024'
      },
      notes: 'Groot dak beschikbaar, zoekt betrouwbare installateur.',
      generated: '5 minuten geleden'
    }
  ],
  'Warmtepompen': [
    {
      id: 'WP-001',
      industry: 'Warmtepompen',
      type: 'exclusive',
      contact: {
        name: 'Familie Vermeulen',
        phone: '06-34567890',
        email: 'info@vermeulen-woning.nl',
        location: 'Eindhoven, 5611 BC'
      },
      interest: {
        level: 9,
        description: 'CV-ketel vervangen door warmtepomp',
        budget: '€12.000 - €18.000',
        timeline: 'Dit najaar'
      },
      notes: 'Subsidie aangevraagd, wacht op goedkeuring. Zeer serieus.',
      generated: '1 minuut geleden'
    }
  ]
};

export function getRandomLeadExample(industry: string, type?: 'exclusive' | 'shared'): LeadExample | null {
  const examples = leadExamples[industry];
  if (!examples || examples.length === 0) return null;
  
  let filteredExamples = examples;
  if (type) {
    filteredExamples = examples.filter(lead => lead.type === type);
  }
  
  if (filteredExamples.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * filteredExamples.length);
  return filteredExamples[randomIndex];
}

export function formatLeadExample(lead: LeadExample): string {
  return `Hier is een voorbeeld van een ${lead.type === 'exclusive' ? 'exclusieve' : 'gedeelde'} lead die ${lead.generated} binnenkwam:

👤 ${lead.contact.name}
📍 ${lead.contact.location}
📞 ${lead.contact.phone}
📧 ${lead.contact.email}

💡 Interesse: ${lead.interest.description}
💰 Budget: ${lead.interest.budget}
⏰ Timeline: ${lead.interest.timeline}
📊 Interest level: ${lead.interest.level}/10

📝 "${lead.notes}"

Dit is het type kwaliteit dat u kunt verwachten!`;
}
