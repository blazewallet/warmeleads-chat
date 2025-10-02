/**
 * 🎨 DRAG & DROP PIPELINE MANAGEMENT
 * 
 * Enterprise-grade visual pipeline met:
 * - Drag & drop lead beweging tussen stages
 * - Real-time collaboration indicators
 * - AI-suggesties voor volgende stappen
 * - Branch-specific pipeline configuratie
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  CurrencyEuroIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import type { Lead } from '@/lib/crmSystem';
import { branchIntelligence, type Branch } from '@/lib/branchIntelligence';

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  icon: React.ComponentType<any>;
  leads: Lead[];
  aiPrompt?: string;
}

interface PipelineBoardProps {
  leads: Lead[];
  branch?: Branch;
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onStageCreate?: (name: string) => void;
}

export function PipelineBoard({ leads, branch = 'Thuisbatterijen', onLeadUpdate, onStageCreate }: PipelineBoardProps) {
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<Record<string, string[]>>({});
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const newStageInputRef = useRef<HTMLInputElement>(null);

  // Initialize pipeline stages
  useEffect(() => {
    const defaultStages: PipelineStage[] = [
      {
        id: 'new',
        name: 'Nieuwe Leads',
        order: 0,
        color: 'bg-blue-500',
        icon: PlusIcon,
        leads: leads.filter(lead => lead.status === 'new')
      },
      {
        id: 'contacted',
        name: 'Eerste Contact',
        order: 1,
        color: 'bg-yellow-500',
        icon: ChatBubbleLeftRightIcon,
        leads: leads.filter(lead => lead.status === 'contacted'),
        aiPrompt: `Genereer eerste contact script voor ${branch} lead`
      },
      {
        id: 'qualified',
        name: 'Gesprek',
        order: 2,
        color: 'bg-orange-500',
        icon: PhoneIcon,
        leads: leads.filter(lead => lead.status === 'qualified'),
        aiPrompt: `Vraag de juiste kwalificatie vragen voor ${branch}`
      },
      {
        id: 'proposal',
        name: 'Offer Opgemaakt',
        order: 3,
        color: 'bg-purple-500',
        icon: CurrencyEuroIcon,
        leads: leads.filter(lead => lead.status === 'proposal'),
        aiPrompt: `Maak gepersonaliseerd offer voor ${branch} klant`
      },
      {
        id: 'negotiation',
        name: 'Onderhandeling',
        order: 4,
        color: 'bg-red-500',
        icon: UserPlusIcon,
        leads: leads.filter(lead => lead.status === 'negotiation'),
        aiPrompt: `Onthul onderhandeling mogelijkheden voor ${branch}`
      },
      {
        id: 'closed-won',
        name: 'Gesloten',
        order: 5,
        color: 'bg-green-500',
        icon: CheckCircleIcon,
        leads: leads.filter(lead => lead.status === 'converted')
      }
    ];

    setPipelineStages(defaultStages);
  }, [leads, branch]);

  // Generate AI suggestions for each stage
  useEffect(() => {
    const suggestions: Record<string, string[]> = {};
    
    pipelineStages.forEach(stage => {
      if (stage.aiPrompt) {
        suggestions[stage.id] = branchIntelligence.getBranchRecommendations(branch);
      }
    });
    
    setAISuggestions(suggestions);
  }, [pipelineStages, branch]);

  // Handle drag end
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the lead being moved
    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    // Map pipeline stage IDs to lead status
    const stageToStatusMap: Record<string, Lead['status']> = {
      'new': 'new',
      'contacted': 'contacted', 
      'qualified': 'qualified',
      'proposal': 'proposal',
      'negotiation': 'negotiation',
      'closed-won': 'converted'
    };

    const newStatus = stageToStatusMap[destination.droppableId];
    if (newStatus && newStatus !== lead.status) {
      console.log(`🔄 Moving lead ${lead.name} from ${lead.status} to ${newStatus}`);
      onLeadUpdate(lead.id, { status: newStatus });
    }
  };

  // Create new stage
  const handleCreateStage = () => {
    if (newStageName.trim() && onStageCreate) {
      onStageCreate(newStageName.trim());
      setNewStageName('');
      setIsCreatingStage(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{branch} Pipeline</h2>
          <p className="text-white/70">Sleep leads tussen fases voor optimale workflow</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreatingStage(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nieuwe Fase</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <AnimatePresence>
            {pipelineStages
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-2xl p-4 min-h-[600px] transition-all duration-200 ${
                          snapshot.isDraggingOver 
                            ? 'bg-white/20 border-2 border-dashed border-white/50' 
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        {/* Stage Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${stage.color} rounded-lg flex items-center justify-center`}>
                              <stage.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{stage.name}</h3>
                              <span className="text-xs text-white/60">{stage.leads.length} leads</span>
                            </div>
                          </div>
                          
                          {aiSuggestions[stage.id] && (
                            <SparklesIcon className="w-5 h-5 text-purple-400" />
                          )}
                        </div>

                        {/* AI Suggestions */}
                        {aiSuggestions[stage.id] && (
                          <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                            <h4 className="text-sm font-medium text-purple-300 mb-2">AI Suggesties:</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiSuggestions[stage.id].slice(0, 3).map((suggestion, idx) => (
                                <span key={idx} className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
                                  {suggestion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Leads */}
                        <div className="space-y-3">
                          <AnimatePresence>
                            {stage.leads.map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 rounded-xl cursor-move transition-all ${
                                      snapshot.isDragging 
                                        ? 'bg-white shadow-lg shadow-black/25' 
                                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      {/* Lead Header */}
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-white">
                                          {lead.name}
                                        </div>
                                        <div className="flex items-center space-x-1 text-xs text-white/60">
                                          <FlagIcon className="w-3 h-3" />
                                          <span>{branchIntelligence.detectBranch(lead).confidence}%</span>
                                        </div>
                                      </div>

                                      {/* Lead Details */}
                                      <div className="space-y-1 text-xs text-white/70">
                                        <div className="flex items-center space-x-2">
                                          <UserIcon className="w-3 h-3" />
                                          <span>{lead.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <PhoneIcon className="w-3 h-3" />
                                          <span>{lead.phone || 'Geen telefoon'}</span>
                                        </div>
                                        {lead.budget && (
                                          <div className="flex items-center space-x-2">
                                            <CurrencyEuroIcon className="w-3 h-3" />
                                            <span>Budget: {lead.budget}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Timeline */}
                                      <div className="flex items-center space-x-2 text-xs text-white/50">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>
                                          {lead.createdAt 
                                            ? new Date(lead.createdAt).toLocaleDateString('nl-NL')
                                            : 'N.v.t.'
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
          </AnimatePresence>

          {/* Create New Stage */}
          {isCreatingStage && (
            <div className="flex-shrink-0 w-80 bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-white">Nieuwe Fase</h3>
                <input
                  ref={newStageInputRef}
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateStage()}
                  placeholder="Fase naam..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateStage}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg py-2 text-sm font-medium transition-colors"
                  >
                    Aanmaken
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingStage(false);
                      setNewStageName('');
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
