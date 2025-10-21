/**
 * Pipeline Stages Management
 * 
 * Handles custom pipeline stages for each customer
 * Stores in localStorage and syncs with lead statuses
 */

export interface CustomStage {
  id: string;
  name: string;
  order: number;
  color: string;
  icon: string; // emoji
  isDefault: boolean;
  customerId: string;
}

// Default stages that every customer starts with
export const DEFAULT_STAGES: Omit<CustomStage, 'customerId'>[] = [
  {
    id: 'new_lead',
    name: 'Nieuwe lead',
    order: 0,
    color: 'bg-blue-500',
    icon: '🆕',
    isDefault: true
  },
  {
    id: 'contact_made',
    name: 'Contact opgenomen',
    order: 1,
    color: 'bg-yellow-500',
    icon: '📞',
    isDefault: true
  },
  {
    id: 'proposal_sent',
    name: 'Voorstel verstuurd',
    order: 2,
    color: 'bg-purple-500',
    icon: '📄',
    isDefault: true
  },
  {
    id: 'deal_closed',
    name: 'Deal gesloten',
    order: 3,
    color: 'bg-green-500',
    icon: '✅',
    isDefault: true
  },
  {
    id: 'aftercare',
    name: 'Nazorg',
    order: 4,
    color: 'bg-indigo-500',
    icon: '🤝',
    isDefault: true
  }
];

const STORAGE_KEY_PREFIX = 'pipeline_stages_';

export class PipelineStagesManager {
  private customerId: string;
  
  constructor(customerId: string) {
    this.customerId = customerId;
  }
  
  /**
   * Get all stages for this customer
   */
  getStages(): CustomStage[] {
    if (typeof window === 'undefined') return this.getDefaultStages();
    
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${this.customerId}`);
    
    if (stored) {
      try {
        const stages: CustomStage[] = JSON.parse(stored);
        return stages.sort((a, b) => a.order - b.order);
      } catch (error) {
        console.error('Error parsing stored stages:', error);
        return this.getDefaultStages();
      }
    }
    
    // First time - initialize with defaults
    const defaultStages = this.getDefaultStages();
    this.saveStages(defaultStages);
    return defaultStages;
  }
  
  /**
   * Get default stages with customerId
   */
  private getDefaultStages(): CustomStage[] {
    return DEFAULT_STAGES.map(stage => ({
      ...stage,
      customerId: this.customerId
    }));
  }
  
  /**
   * Save stages to localStorage
   */
  private saveStages(stages: CustomStage[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${this.customerId}`,
      JSON.stringify(stages)
    );
  }
  
  /**
   * Add a new custom stage
   */
  addStage(name: string, color: string = 'bg-gray-500', icon: string = '📋'): CustomStage {
    const stages = this.getStages();
    const maxOrder = Math.max(...stages.map(s => s.order), -1);
    
    const newStage: CustomStage = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      order: maxOrder + 1,
      color,
      icon,
      isDefault: false,
      customerId: this.customerId
    };
    
    stages.push(newStage);
    this.saveStages(stages);
    
    return newStage;
  }
  
  /**
   * Update an existing stage
   */
  updateStage(stageId: string, updates: Partial<Omit<CustomStage, 'id' | 'customerId'>>): boolean {
    const stages = this.getStages();
    const index = stages.findIndex(s => s.id === stageId);
    
    if (index === -1) return false;
    
    stages[index] = {
      ...stages[index],
      ...updates
    };
    
    this.saveStages(stages);
    return true;
  }
  
  /**
   * Delete a stage (only non-default stages can be deleted)
   */
  deleteStage(stageId: string): boolean {
    const stages = this.getStages();
    const stage = stages.find(s => s.id === stageId);
    
    if (!stage || stage.isDefault) {
      return false; // Cannot delete default stages
    }
    
    const updatedStages = stages.filter(s => s.id !== stageId);
    this.saveStages(updatedStages);
    
    return true;
  }
  
  /**
   * Reorder stages
   */
  reorderStages(stageIds: string[]): boolean {
    const stages = this.getStages();
    
    // Create a map of current stages
    const stageMap = new Map(stages.map(s => [s.id, s]));
    
    // Reorder based on the new order
    const reorderedStages: CustomStage[] = [];
    
    stageIds.forEach((id, index) => {
      const stage = stageMap.get(id);
      if (stage) {
        reorderedStages.push({
          ...stage,
          order: index
        });
      }
    });
    
    // Add any stages that weren't in the reorder list (shouldn't happen, but safety)
    stages.forEach(stage => {
      if (!stageIds.includes(stage.id)) {
        reorderedStages.push(stage);
      }
    });
    
    this.saveStages(reorderedStages);
    return true;
  }
  
  /**
   * Get stage by ID
   */
  getStageById(stageId: string): CustomStage | undefined {
    const stages = this.getStages();
    return stages.find(s => s.id === stageId);
  }
  
  /**
   * Map old status to new stage ID (for migration)
   */
  mapStatusToStageId(status: string): string {
    const mapping: Record<string, string> = {
      'new': 'new_lead',
      'contacted': 'contact_made',
      'qualified': 'contact_made',
      'proposal': 'proposal_sent',
      'negotiation': 'proposal_sent',
      'converted': 'deal_closed',
      'geclosed': 'deal_closed',
      'lost': 'aftercare'
    };
    
    return mapping[status] || 'new_lead';
  }
}





