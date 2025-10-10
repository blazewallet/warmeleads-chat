// Revenue calculation utilities
import { Lead } from './crmSystem';

export interface RevenueStats {
  totalRevenue: number;
  closedDeals: number;
  averageDealValue: number;
  conversionRate: number;
}

/**
 * Calculate revenue from closed deals
 */
export function calculateRevenueFromLeads(leads: Lead[]): RevenueStats {
  const closedLeads = leads.filter(lead => lead.status === 'geclosed' && lead.dealValue);
  
  const totalRevenue = closedLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
  const closedDeals = closedLeads.length;
  const averageDealValue = closedDeals > 0 ? totalRevenue / closedDeals : 0;
  
  // Calculate conversion rate (closed deals / total leads)
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0;
  
  return {
    totalRevenue,
    closedDeals,
    averageDealValue,
    conversionRate
  };
}

/**
 * Format revenue for display
 */
export function formatRevenue(amount: number): string {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}K`;
  } else {
    return `€${amount.toFixed(0)}`;
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: Lead['status']): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'qualified':
      return 'bg-purple-100 text-purple-800';
    case 'proposal':
      return 'bg-indigo-100 text-indigo-800';
    case 'negotiation':
      return 'bg-orange-100 text-orange-800';
    case 'converted':
      return 'bg-green-100 text-green-800';
    case 'geclosed':
      return 'bg-emerald-100 text-emerald-800';
    case 'lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status label for UI
 */
export function getStatusLabel(status: Lead['status']): string {
  switch (status) {
    case 'new':
      return 'Nieuw';
    case 'contacted':
      return 'Gecontacteerd';
    case 'qualified':
      return 'Gekwalificeerd';
    case 'proposal':
      return 'Voorstel';
    case 'negotiation':
      return 'Onderhandeling';
    case 'converted':
      return 'Geconverteerd';
    case 'geclosed':
      return 'Geclosed';
    case 'lost':
      return 'Verloren';
    default:
      return 'Onbekend';
  }
}
