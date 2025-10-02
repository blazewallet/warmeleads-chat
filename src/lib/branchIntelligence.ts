// Branch Intelligence System voor Multi-Branch Lead Management
import { type Lead } from './crmSystem';

export type Branch = 'Thuisbatterijen' | 'Financial Lease' | 'Warmtepompen' | 'Zonnepanelen' | 'Airco' | 'Custom' | 'Unknown';

export interface BranchIntelligence {
  detectedBranch: Branch;
  confidence: number; // 0-100
  supportingFields: string[];
  recommendedActions: string[];
  branchSpecificInsights: {
    avgConversionRate?: number;
    priceRange?: string;
    keyFactors?: string[];
  };
}

export interface BranchAnalytics {
  branch: Branch;
  totalLeads: number;
  revenue: number;
  conversionRate: number;
  avgLeadValue: number;
  topPerformingFactors: string[];
  trends: {
    growth: number; // percentage change
    seasonalPattern?: string;
  };
}

class BranchIntelligenceEngine {
  private branchPatterns: Map<Branch, string[]> = new Map([
    ['Thuisbatterijen', [
      'zonnepanelen', 'stroomverbruik', 'dynamischContract', 
      'redenThuisbatterij', 'koopintentie', 'datumInteresse'
    ]],
    ['Financial Lease', [
      'bedrijfsomvang', 'branche', 'kredietScore'
    ]],
    ['Warmtepompen', [
      'huisgrootte', 'isolatie', 'huidigeVerwarming'
    ]],
    ['Zonnepanelen', [
      'dakoppervlak', 'dakrichting', 'schaduw'
    ]]
  ]);

  private keywordPatterns: Map<Branch, string[]> = new Map([
    ['Thuisbatterijen', ['batterij', 'energie opslag', 'thuisbatterij', 'lithium', 'opslag']],
    ['Financial Lease', ['lease', 'financiering', 'credit', 'leasing', 'financiering']],
    ['Warmtepompen', ['warmtepomp', 'pomp', 'heat pump', 'verwarming', 'cv ketel']],
    ['Zonnepanelen', ['zonnepanelen', 'solar', 'pv', 'stroom', 'watt']],
    ['Airco', ['airco', 'airconditioning', 'airconditioning', 'cooling']]
  ]);

  // Detect branche van een lead
  detectBranch(lead: Lead): BranchIntelligence {
    const confidenceScores: Map<Branch, number> = new Map();
    const detectedFields: Map<Branch, string[]> = new Map();

    // Patroon matching op branchData velden
    if (lead.branchData) {
      for (const [branch, patterns] of this.branchPatterns) {
        let score = 0;
        const matchedFields: string[] = [];
        
        patterns.forEach(pattern => {
          if (lead.branchData![pattern as keyof typeof lead.branchData]) {
            score += 25; // Elk matching veld krijgt 25 punten
            matchedFields.push(pattern);
          }
        });

        // Extra bonus voor cruciale velden
        if (branch === 'Thuisbatterijen' && lead.branchData.zonnepanelen) score += 20;
        if (branch === 'Financial Lease' && lead.branchData.bedrijfsomvang) score += 20;
        if (branch === 'Warmtepompen' && lead.branchData.huisgrootte) score += 20;

        confidenceScores.set(branch, Math.min(score, 100));
        detectedFields.set(branch, matchedFields);
      }
    }

    // Keyword matching op interest/notes/company velden
    const textFields = [
      lead.interest,
      lead.notes,
      lead.company,
      lead.branchData?.redenThuisbatterij
    ].filter(Boolean).join(' ').toLowerCase();

    for (const [branch, keywords] of this.keywordPatterns) {
      let keywordScore = 0;
      keywords.forEach(keyword => {
        if (textFields.includes(keyword.toLowerCase())) {
          keywordScore += 15; // Keywords krijgen minder gewicht dan velden
        }
      });
      
      const existingScore = confidenceScores.get(branch) || 0;
      confidenceScores.set(branch, existingScore + keywordScore);
    }

    // Bepaal beste match
    let bestBranch: Branch = 'Unknown';
    let maxConfidence = 0;

    for (const [branch, confidence] of confidenceScores) {
      if (confidence > maxConfidence && confidence > 30) { // Minimum threshold
        maxConfidence = confidence;
        bestBranch = branch;
      }
    }

    // Custom branche detectie voor ongewone combinaties
    if (maxConfidence > 45 && detectedFields.get(bestBranch)!.length > 2) {
      return {
        detectedBranch: bestBranch,
        confidence: Math.min(maxConfidence, 100),
        supportingFields: detectedFields.get(bestBranch) || [],
        recommendedActions: this.getBranchRecommendations(bestBranch),
        branchSpecificInsights: this.getBranchInsights(bestBranch, lead)
      };
    }

    // Als geen specifieke branche, check voor multi-branch
    const multiBranchScore = confidenceScores.get('Thuisbatterijen')! + 
                           confidenceScores.get('Financial Lease')! + 
                           confidenceScores.get('Warmtepompen')!;
    
    if (multiBranchScore > 60) {
      bestBranch = 'Custom'; // Multi-branch lead
      maxConfidence = 75;
    }

    return {
      detectedBranch: bestBranch,
      confidence: maxConfidence,
      supportingFields: detectedFields.get(bestBranch) || [],
      recommendedActions: this.getBranchRecommendations(bestBranch),
      branchSpecificInsights: this.getBranchInsights(bestBranch, lead)
    };
  }

  // Branch-specifieke aanbevelingen
  getBranchRecommendations(branch: Branch): string[] {
    const recommendations: Map<Branch, string[]> = new Map([
      ['Thuisbatterijen', [
        '📅 Plan bezichtiging voor zonnepanelen check',
        '💰 Verwerk energieverbruik in offerte',
        '⚡ Controleer dynamisch contract mogelijkheden',
        '🎯 Focus op ondersteuning van energietransitie'
      ]],
      ['Financial Lease', [
        '📊 Verificeer bedrijfsgegevens',
        '💳 Check kredietstatus',
        '📋 Bereid lease agreement voor',
        '🤝 Stel financieringsopties samen'
      ]],
      ['Warmtepompen', [
        '🏠 Meet huis isolatie',
        '💧 Controleer CV-installatie',
        '🌡️ Analyseer verwarmingsbehoefte',
        '📐 Bereken verwarmingscapaciteit'
      ]],
      ['Zonnepanelen', [
        '🔍 Inspecteer dak voorwaarden',
        '☀️ Meet schaduw situatie',
        '📏 Bereken rendement mogelijkheden',
        '⚡ Analyseer energieberekening'
      ]],
      ['Custom', [
        '🔍 Meer gedetailleerde branche analyse',
        '📋 Opstellen van multi-branch offerte',
        '🤝 Gesprek voor specifieke behoeften'
      ]],
      ['Unknown', [
        '📞 Bel direct voor meer informatie',
        '📋 Vraag naar specifieke interesses',
        '🔍 Verzamel meer lead informatie'
      ]]
    ]);

    return recommendations.get(branch) || ['📞 Neem contact op'];
  }

  // Branch-specifieke inzichten
  getBranchInsights(branch: Branch, lead: Lead) {
    const insights: Map<Branch, any> = new Map([
      ['Thuisbatterijen', {
        avgConversionRate: lead.branchData?.koopintentie === 'Ja' ? 45 : 25,
        priceRange: '€3.000 - €8.000',
        keyFactors: ['Heeft zonnepanelen', 'Dynamisch contract', 'Hoog verbruik']
      }],
      ['Financial Lease', {
        avgConversionRate: 35,
        priceRange: '€15.000 - €75.000',
        keyFactors: ['Bedrijfsomvang', 'Krediet score', 'Branche type']
      }],
      ['Warmtepompen', {
        avgConversionRate: 40,
        priceRange: '€8.000 - €15.000',
        keyFactors: ['Huis isolatie', 'Huidige verwarming', 'Voorkeur type']
      }],
      ['Zonnepanelen', {
        avgConversionRate: 30,
        priceRange: '€4.000 - €12.000',
        keyFactors: ['Dak geschiktheid', 'Schaduw situatie', 'Energiebehoefte']
      }]
    ]);

    return insights.get(branch) || {
      avgConversionRate: 25,
      priceRange: 'Variërend',
      keyFactors: ['Lead specifieke factoren']
    };
  }

  // Analyseer alle leads om branch analytics te genereren
  analyzeBranchPerformance(leads: Lead[]): BranchAnalytics[] {
    const branchStats: Map<Branch, any> = new Map();

    leads.forEach(lead => {
      const intelligence = this.detectBranch(lead);
      const branch = intelligence.detectedBranch;

      if (!branchStats.has(branch)) {
        branchStats.set(branch, {
          leads: [],
          revenue: 0,
          converted: 0
        });
      }

      const stats = branchStats.get(branch)!;
      stats.leads.push(lead);

      // Schat revenue gebaseerd op branch + status
      const baseRevenue = this.estimateLeadValue(lead, branch);
      stats.revenue += baseRevenue;

      if (lead.status === 'converted') {
        stats.converted++;
      }
    });

    // Converteer naar BranchAnalytics format
    const analytics: BranchAnalytics[] = [];
    for (const [branch, stats] of branchStats) {
      analytics.push({
        branch,
        totalLeads: stats.leads.length,
        revenue: stats.revenue,
        conversionRate: stats.leads.length > 0 ? (stats.converted / stats.leads.length) * 100 : 0,
        avgLeadValue: stats.leads.length > 0 ? stats.revenue / stats.leads.length : 0,
        topPerformingFactors: this.getTopFactors(branch, stats.leads),
        trends: {
          growth: this.calculateGrowth(branch, stats.leads),
          seasonalPattern: this.getSeasonalPattern(branch)
        }
      });
    }

    return analytics.sort((a, b) => b.revenue - a.revenue);
  }

  // Schat lead waarde gebaseerd op branche
  private estimateLeadValue(lead: Lead, branch: Branch): number {
    const baseValues: Map<Branch, number> = new Map([
      ['Thuisbatterijen', 4500],
      ['Financial Lease', 45000],
      ['Warmtepompen', 11500],
      ['Zonnepanelen', 8000],
      ['Airco', 3000],
      ['Custom', 25000],
      ['Unknown', 5000]
    ]);

    let value = baseValues.get(branch) || 5000;

    // Aanpassingen gebaseerd op status
    if (lead.status === 'converted') value *= 0.15; // Commission fee
    else if (lead.status === 'qualified') value *= 0.05;
    else if (lead.status === 'contacted') value *= 0.02;

    return Math.round(value);
  }

  private getTopFactors(branch: Branch, leads: Lead[]): string[] {
    // Analyseer welke factoren voorkomen in succesvolle leads
    const successfulLeads = leads.filter(l => l.status === 'converted' || l.status === 'qualified');
    
    if (successfulLeads.length === 0) return ['Geen data beschikbaar'];

    // Thuisbatterijen specifiek
    if (branch === 'Thuisbatterijen') {
      const hasZonnepanelen = successfulLeads.filter(l => l.branchData?.zonnepanelen).length;
      const hasDynamischContract = successfulLeads.filter(l => l.branchData?.dynamischContract).length;
      const koopintentie = successfulLeads.filter(l => l.branchData?.koopintentie === 'Ja').length;
      
      const factors = [];
      if (hasZonnepanelen > 0) factors.push(`Zonnepanelen eigenaar (${hasZonnepanelen})`);
      if (hasDynamischContract > 0) factors.push(`Dynamisch contract (${hasDynamischContract})`);
      if (koopintentie > 0) factors.push(`Positieve koopintentie (${koopintentie})`);
      
      return factors.length > 0 ? factors : ['Alle types succesvol'];
    }

    return ['Success factors variëren'];
  }

  private calculateGrowth(branch: Branch, leads: Lead[]): number {
    // Vereenvoudigde groei berekening - in productie zou dit op tijd gebaseerd zijn
    const recentLeads = leads.slice(-Math.floor(leads.length * 0.3));
    const olderLeads = leads.slice(0, Math.floor(leads.length * 0.7));
    
    if (olderLeads.length === 0) return 0;
    
    const recentConversion = recentLeads.filter(l => l.status === 'converted').length / recentLeads.length * 100;
    const olderConversion = olderLeads.filter(l => l.status === 'converted').length / olderLeads.length * 100;
    
    return Math.round(((recentConversion - olderConversion) / olderConversion) * 100);
  }

  private getSeasonalPattern(branch: Branch): string | undefined {
    // Vereenvoudigde seizoenanalyse
    const currentMonth = new Date().getMonth();
    
    const patterns: Map<Branch, any> = new Map([
      ['Thuisbatterijen', { peak: [3, 4, 5], low: [11, 12, 0] }], // Spring peak, winter low
      ['Warmtepompen', { peak: [8, 9, 10], low: [2, 3, 4] }], // Autumn peak, spring low
      ['Zonnepanelen', { peak: [3, 4, 5], low: [11, 12, 0] }], // Spring installation peak
      ['Financial Lease', undefined], // Less seasonal
      ['Airco', { peak: [5, 6, 7], low: [11, 12, 0] }] // Summer peak
    ]);

    const pattern = patterns.get(branch);
    if (!pattern) return undefined;

    if (pattern.peak.includes(currentMonth)) return '🌻 Seizoenpiek';
    if (pattern.low.includes(currentMonth)) return '❄️ Laag seizoen';
    return '📈 Normale periode';
  }
}

// Singleton instance
export const branchIntelligence = new BranchIntelligenceEngine();

// Helper functions
export const detectBranchIntelligence = (lead: Lead): BranchIntelligence => {
  return branchIntelligence.detectBranch(lead);
};

export const analyzeBranchPerformance = (leads: Lead[]): BranchAnalytics[] => {
  return branchIntelligence.analyzeBranchPerformance(leads);
};
