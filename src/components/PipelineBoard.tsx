/**
 * 🎨 CUSTOM PIPELINE BOARD - Pipedrive Style
 * 
 * Features:
 * - Horizontale layout zonder scrollen
 * - Custom stages die klanten zelf kunnen maken/verwijderen
 * - Drag & drop tussen stages
 * - Responsive voor alle schermformaten
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import type { Lead } from '@/lib/crmSystem';
import { PipelineStagesManager, type CustomStage } from '@/lib/pipelineStages';

interface PipelineBoardProps {
  leads: Lead[];
  customerId: string;
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onStagesChange?: (stages: CustomStage[]) => void;
}

export function PipelineBoard({ leads, customerId, onLeadUpdate, onStagesChange }: PipelineBoardProps) {
  const [stagesManager] = useState(() => new PipelineStagesManager(customerId));
  const [stages, setStages] = useState<CustomStage[]>([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [editStageName, setEditStageName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📋');
  const [selectedColor, setSelectedColor] = useState('bg-gray-500');

  // Available emojis for stages
  const availableEmojis = ['🆕', '📞', '💬', '📄', '💰', '✅', '🤝', '📊', '🎯', '⭐', '🚀', '💡', '📈', '🔥', '💪', '👍'];
  
  // Available colors
  const availableColors = [
    { name: 'Blauw', class: 'bg-blue-500' },
    { name: 'Groen', class: 'bg-green-500' },
    { name: 'Geel', class: 'bg-yellow-500' },
    { name: 'Rood', class: 'bg-red-500' },
    { name: 'Paars', class: 'bg-purple-500' },
    { name: 'Roze', class: 'bg-pink-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Oranje', class: 'bg-orange-500' },
    { name: 'Grijs', class: 'bg-gray-500' }
  ];

  // Load stages on mount
  useEffect(() => {
    const loadedStages = stagesManager.getStages();
    setStages(loadedStages);
    onStagesChange?.(loadedStages);
  }, [customerId]);

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    
    stages.forEach(stage => {
      grouped[stage.id] = leads.filter(lead => {
        // Map lead status to stage ID
        const mappedStageId = stagesManager.mapStatusToStageId(lead.status);
        return mappedStageId === stage.id;
      });
    });
    
    return grouped;
  }, [leads, stages]);

  // Handle drag end
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = draggableId;
    const newStageId = destination.droppableId;

    // Update lead with new stage (we'll store stage ID in a custom field)
    onLeadUpdate(leadId, {
      status: newStageId as any, // Store stage ID as status for now
      updatedAt: new Date()
    });
  };

  // Add new stage
  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    
    const newStage = stagesManager.addStage(newStageName.trim(), selectedColor, selectedEmoji);
    const updatedStages = stagesManager.getStages();
    setStages(updatedStages);
    onStagesChange?.(updatedStages);
    
    // Reset form
    setNewStageName('');
    setSelectedEmoji('📋');
    setSelectedColor('bg-gray-500');
    setIsAddingStage(false);
  };

  // Update stage
  const handleUpdateStage = (stageId: string) => {
    if (!editStageName.trim()) return;
    
    stagesManager.updateStage(stageId, { name: editStageName.trim() });
    const updatedStages = stagesManager.getStages();
    setStages(updatedStages);
    onStagesChange?.(updatedStages);
    setEditingStage(null);
  };

  // Delete stage
  const handleDeleteStage = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    
    if (stage.isDefault) {
      alert('Default fases kunnen niet worden verwijderd');
      return;
    }
    
    const leadsInStage = leadsByStage[stageId] || [];
    if (leadsInStage.length > 0) {
      if (!confirm(`Deze fase bevat ${leadsInStage.length} lead(s). Weet je zeker dat je deze fase wilt verwijderen?`)) {
        return;
      }
    }
    
    stagesManager.deleteStage(stageId);
    const updatedStages = stagesManager.getStages();
    setStages(updatedStages);
    onStagesChange?.(updatedStages);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Pipeline Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Overzicht</h3>
            <p className="text-sm text-gray-600 mt-1">{leads.length} leads in totaal</p>
          </div>
          <button
            onClick={() => setIsAddingStage(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nieuwe fase</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stages - Horizontale layout */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full flex gap-3 p-4">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex flex-col"
                style={{ 
                  flex: `1 1 ${100 / stages.length}%`,
                  minWidth: 0,
                  maxWidth: `calc(${100 / stages.length}% - ${(stages.length - 1) * 12 / stages.length}px)`
                }}
              >
                {/* Stage Header */}
                <div className={`${stage.color} rounded-t-xl px-3 py-2 text-white`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xl">{stage.icon}</span>
                      {editingStage === stage.id ? (
                        <input
                          type="text"
                          value={editStageName}
                          onChange={(e) => setEditStageName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateStage(stage.id);
                            if (e.key === 'Escape') setEditingStage(null);
                          }}
                          className="px-2 py-0.5 text-xs rounded border-2 border-white text-gray-900 focus:outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <h4 className="font-semibold text-sm truncate">{stage.name}</h4>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {editingStage === stage.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateStage(stage.id)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStage(null)}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingStage(stage.id);
                              setEditStageName(stage.name);
                            }}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Naam aanpassen"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {!stage.isDefault && (
                            <button
                              onClick={() => handleDeleteStage(stage.id)}
                              className="p-1 hover:bg-white/20 rounded"
                              title="Fase verwijderen"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-90">
                    {leadsByStage[stage.id]?.length || 0} leads
                  </div>
                </div>

                {/* Stage Content - Droppable */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 bg-gray-100 rounded-b-xl p-2 overflow-y-auto ${
                        snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                      }`}
                      style={{ minHeight: '300px', maxHeight: 'calc(100vh - 280px)' }}
                    >
                      <div className="space-y-2">
                        {(leadsByStage[stage.id] || []).map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move ${
                                  snapshot.isDragging ? 'ring-2 ring-brand-purple shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <h5 className="font-semibold text-gray-900 text-xs flex-1 pr-1 leading-tight">
                                    {lead.name}
                                  </h5>
                                  <Bars3Icon className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                </div>
                                
                                {lead.company && (
                                  <p className="text-[10px] text-gray-600 mb-1.5 truncate">{lead.company}</p>
                                )}
                                
                                <div className="text-[10px] text-gray-500 space-y-0.5">
                                  {lead.email && (
                                    <div className="truncate">📧 {lead.email}</div>
                                  )}
                                  {lead.phone && (
                                    <div className="truncate">📱 {lead.phone}</div>
                                  )}
                                </div>
                                
                                {lead.budget && (
                                  <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                                    <span className="text-[10px] font-medium text-green-600 truncate block">
                                      💰 {lead.budget}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {(!leadsByStage[stage.id] || leadsByStage[stage.id].length === 0) && (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            Sleep leads hierheen
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Add Stage Modal */}
      <AnimatePresence>
        {isAddingStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsAddingStage(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Nieuwe fase toevoegen</h3>
                <button
                  onClick={() => setIsAddingStage(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Stage Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fase naam
                  </label>
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Bijv. 'Demo gepland'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                    autoFocus
                  />
                </div>

                {/* Emoji Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icoon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {availableEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                          selectedEmoji === emoji ? 'bg-brand-purple/10 ring-2 ring-brand-purple' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kleur
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color.class}
                        onClick={() => setSelectedColor(color.class)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          selectedColor === color.class
                            ? 'border-brand-purple bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.class}`} />
                        <span className="text-sm text-gray-700">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voorbeeld
                  </label>
                  <div className={`${selectedColor} rounded-lg px-4 py-3 text-white`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{selectedEmoji}</span>
                      <span className="font-semibold">{newStageName || 'Nieuwe fase'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsAddingStage(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleAddStage}
                    disabled={!newStageName.trim()}
                    className="flex-1 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
