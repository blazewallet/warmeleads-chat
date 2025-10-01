// Automatische blog content generator voor WarmeLeads

interface BlogTopic {
  title: string;
  slug: string;
  category: string;
  keywords: string[];
  targetBranche: string;
  contentType: 'marktanalyse' | 'tips' | 'trends' | 'case-study' | 'technisch';
}

// Content topics pool - rotates wekelijks
export const contentTopics: BlogTopic[] = [
  // Week 1
  {
    title: "Thuisbatterij Installatie Trends Q4 2025",
    slug: "thuisbatterij-installatie-trends-q4-2025",
    category: "Marktanalyse",
    keywords: ["thuisbatterij trends", "battery storage 2025", "energie opslag markt"],
    targetBranche: "thuisbatterijen",
    contentType: "trends"
  },
  {
    title: "5 Fouten die Zonnepanelen Installateurs Maken bij Lead Follow-up",
    slug: "zonnepanelen-installateur-fouten-lead-followup",
    category: "Tips & Tricks", 
    keywords: ["zonnepanelen leads", "solar installateur tips", "lead follow-up"],
    targetBranche: "zonnepanelen",
    contentType: "tips"
  },
  {
    title: "Warmtepomp Markt Explosie: Cijfers en Vooruitzichten",
    slug: "warmtepomp-markt-explosie-cijfers-2025",
    category: "Marktanalyse",
    keywords: ["warmtepomp markt", "HVAC trends", "warmtepomp groei"],
    targetBranche: "warmtepompen", 
    contentType: "marktanalyse"
  },
  
  // Week 2
  {
    title: "Airco Leads Genereren in Winter: Onverwachte Kansen",
    slug: "airco-leads-winter-onverwachte-kansen",
    category: "Strategie",
    keywords: ["airco leads winter", "airco marketing", "HVAC seizoen"],
    targetBranche: "airco",
    contentType: "tips"
  },
  {
    title: "Financial Lease vs Koop: Wat Kiezen MKB Bedrijven?",
    slug: "financial-lease-vs-koop-mkb-bedrijven",
    category: "B2B Insights",
    keywords: ["financial lease trends", "MKB financiering", "lease vs koop"],
    targetBranche: "financial-lease",
    contentType: "marktanalyse"
  },
  {
    title: "Lead Scoring: Welke Prospects Converteren het Beste?",
    slug: "lead-scoring-welke-prospects-converteren-beste",
    category: "Conversie",
    keywords: ["lead scoring", "prospect kwalificatie", "conversie optimalisatie"],
    targetBranche: "algemeen",
    contentType: "technisch"
  },

  // Week 3
  {
    title: "Zonnepanelen + Thuisbatterij Combinatie: De Perfecte Lead",
    slug: "zonnepanelen-thuisbatterij-combinatie-perfecte-lead",
    category: "Cross-selling",
    keywords: ["zonnepanelen thuisbatterij", "solar battery combo", "energie systeem"],
    targetBranche: "zonnepanelen",
    contentType: "tips"
  },
  {
    title: "Nederlandse Energietransitie: Kansen voor Installateurs",
    slug: "nederlandse-energietransitie-kansen-installateurs",
    category: "Trends",
    keywords: ["energietransitie Nederland", "duurzame energie trends", "installateur kansen"],
    targetBranche: "algemeen",
    contentType: "trends"
  },

  // Week 4 
  {
    title: "Warmtepomp Installatie Kosten 2025: Wat Betalen Klanten?",
    slug: "warmtepomp-installatie-kosten-2025-klanten",
    category: "Marktanalyse",
    keywords: ["warmtepomp kosten", "HVAC prijzen", "installatie kosten"],
    targetBranche: "warmtepompen",
    contentType: "marktanalyse"
  },
  {
    title: "B2B Lead Nurturing: Van Interesse naar Contract",
    slug: "b2b-lead-nurturing-interesse-naar-contract",
    category: "B2B Strategy",
    keywords: ["B2B lead nurturing", "business leads", "B2B conversie"],
    targetBranche: "financial-lease",
    contentType: "tips"
  }
];

// Functie om volgende week content te bepalen
export function getWeeklyContent(weekNumber: number): BlogTopic[] {
  const startIndex = (weekNumber % 4) * 3; // 4 weken cyclus, 3 artikelen per week
  return contentTopics.slice(startIndex, startIndex + 3);
}

// Content template generator
export function generateArticleContent(topic: BlogTopic): string {
  const templates: Record<string, string> = {
    marktanalyse: `Expert marktanalyse content voor ${topic.title}`,
    tips: `Praktische tips content voor ${topic.title}`,
    trends: `Trend analyse content voor ${topic.title}`,
    'case-study': `Case study content voor ${topic.title}`,
    technisch: `Technische content voor ${topic.title}`
  };

  return templates[topic.contentType] || templates.tips;
}

// SEO optimalisatie functie
export function optimizeForSEO(content: string, topic: BlogTopic): string {
  // Voeg SEO elementen toe
  let optimizedContent = content;
  
  // Voeg keywords natuurlijk toe
  topic.keywords.forEach(keyword => {
    if (!optimizedContent.toLowerCase().includes(keyword.toLowerCase())) {
      optimizedContent += `\n\n### ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}\n[Content over ${keyword}]`;
    }
  });

  // Voeg internal links toe
  optimizedContent += `\n\n### Gerelateerde Services\n`;
  optimizedContent += `- [${topic.targetBranche.charAt(0).toUpperCase() + topic.targetBranche.slice(1)} Leads](/leads-${topic.targetBranche})\n`;
  optimizedContent += `- [Maatwerk Leadgeneratie](/maatwerk-leads)\n`;
  optimizedContent += `- [ROI Calculator](/)\n`;

  return optimizedContent;
}
