'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  leadType: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
  assignedTo?: string;
  notes?: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Piet Janssen',
    email: 'piet@email.nl',
    phone: '+31 6 1111 2222',
    industry: 'Zonnepanelen',
    leadType: 'Exclusieve lead',
    source: 'Google Ads',
    status: 'new',
    createdAt: '2025-09-26 10:15',
    notes: 'Interesse in 20 panelen, budget €15.000'
  },
  {
    id: '2',
    name: 'Maria van Dijk',
    email: 'maria@vandijk.nl',
    phone: '+31 6 3333 4444',
    industry: 'Thuisbatterijen',
    leadType: 'Gedeelde lead',
    source: 'Facebook Ads',
    status: 'contacted',
    createdAt: '2025-09-26 09:30',
    assignedTo: 'Sales Team',
    notes: 'Heeft al zonnepanelen, wil batterij erbij'
  },
  {
    id: '3',
    name: 'Hans Bakker',
    email: 'hans@bakker.com',
    phone: '+31 6 5555 6666',
    industry: 'Warmtepompen',
    leadType: 'Exclusieve lead',
    source: 'Website Direct',
    status: 'qualified',
    createdAt: '2025-09-26 08:45',
    assignedTo: 'HVAC Specialist',
    notes: 'Woning van 1975, CV ketel vervanging'
  },
  {
    id: '4',
    name: 'Sophie Wit',
    email: 'sophie@bedrijf.nl',
    phone: '+31 6 7777 8888',
    industry: 'Financial Lease',
    leadType: 'Exclusieve lead',
    source: 'LinkedIn Ads',
    status: 'converted',
    createdAt: '2025-09-25 16:20',
    assignedTo: 'Lease Advisor',
    notes: 'Contract getekend voor €50.000 lease'
  }
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    const matchesIndustry = selectedIndustry === 'all' || lead.industry === selectedIndustry;
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🆕';
      case 'contacted': return '📞';
      case 'qualified': return '✅';
      case 'converted': return '🎉';
      case 'lost': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <p className="text-gray-600 mt-1">
          Overzicht en beheer van alle gegenereerde leads
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-blue-600">{leads.filter(l => l.status === 'new').length}</div>
          <div className="text-gray-600">Nieuwe Leads</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-yellow-600">{leads.filter(l => l.status === 'contacted').length}</div>
          <div className="text-gray-600">Benaderd</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-purple-600">{leads.filter(l => l.status === 'qualified').length}</div>
          <div className="text-gray-600">Gekwalificeerd</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-green-600">{leads.filter(l => l.status === 'converted').length}</div>
          <div className="text-gray-600">Geconverteerd</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-brand-purple">{Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100)}%</div>
          <div className="text-gray-600">Conversie Rate</div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
          >
            <option value="all">Alle Branches</option>
            <option value="Zonnepanelen">Zonnepanelen</option>
            <option value="Thuisbatterijen">Thuisbatterijen</option>
            <option value="Warmtepompen">Warmtepompen</option>
            <option value="Financial Lease">Financial Lease</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
          >
            <option value="all">Alle Statussen</option>
            <option value="new">Nieuw</option>
            <option value="contacted">Benaderd</option>
            <option value="qualified">Gekwalificeerd</option>
            <option value="converted">Geconverteerd</option>
            <option value="lost">Verloren</option>
          </select>
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        className="admin-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bron
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString('nl-NL')}</div>
                    {lead.assignedTo && (
                      <div className="text-xs text-blue-600">→ {lead.assignedTo}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {lead.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.industry}</div>
                    <div className="text-sm text-gray-500">{lead.leadType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)} {lead.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-brand-purple hover:text-brand-pink transition-colors">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
