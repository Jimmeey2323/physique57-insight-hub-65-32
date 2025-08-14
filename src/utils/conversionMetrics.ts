
import { NewClientData } from '@/types/dashboard';
import { format, parseISO, isValid } from 'date-fns';

export const calculateConversionMetrics = (data: NewClientData[]) => {
  console.log('Calculating conversion metrics for:', data.length, 'records');

  if (!data || data.length === 0) {
    return {
      totalClients: 0,
      newClients: 0,
      convertedClients: 0,
      retainedClients: 0,
      trialsCompleted: 0,
      conversionRate: 0,
      retentionRate: 0,
      newClientConversionRate: 0,
      leadToTrialConversion: 0,
      trialToMemberConversion: 0,
      averageLTV: 0,
      totalLTV: 0,
      averageConversionSpan: 0,
      averageVisitsPostTrial: 0
    };
  }

  const totalClients = data.length;
  
  // New clients - those where "Is New" contains the word "New"
  const newClients = data.filter(client => {
    const isNewValue = String(client.isNew || '').trim().toLowerCase();
    return isNewValue.includes('new');
  });
  
  // Converted clients - those where "Conversion Status" is "Converted" 
  const convertedClients = data.filter(client => {
    const conversionStatus = String(client.conversionStatus || '').trim();
    return conversionStatus === 'Converted';
  });
  
  // Retained clients - those where "Retention Status" is "Retained"
  const retainedClients = data.filter(client => {
    const retentionStatus = String(client.retentionStatus || '').trim();
    return retentionStatus === 'Retained';
  });
  
  // Trials completed - clients with visits post trial > 0
  const trialsCompleted = data.filter(client => (client.visitsPostTrial || 0) > 0);
  
  // New clients who converted
  const newClientsConverted = data.filter(client => {
    const isNewValue = String(client.isNew || '').trim().toLowerCase();
    const conversionStatus = String(client.conversionStatus || '').trim();
    return isNewValue.includes('new') && conversionStatus === 'Converted';
  });

  // Calculate rates
  const conversionRate = totalClients > 0 ? (convertedClients.length / totalClients) * 100 : 0;
  const retentionRate = totalClients > 0 ? (retainedClients.length / totalClients) * 100 : 0;
  const newClientConversionRate = newClients.length > 0 ? (newClientsConverted.length / newClients.length) * 100 : 0;
  const leadToTrialConversion = totalClients > 0 ? (trialsCompleted.length / totalClients) * 100 : 0;
  const trialToMemberConversion = trialsCompleted.length > 0 ? (convertedClients.length / trialsCompleted.length) * 100 : 0;

  // Calculate LTV metrics
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const averageLTV = totalClients > 0 ? totalLTV / totalClients : 0;

  // Calculate conversion span for converted clients only
  const convertedWithSpan = convertedClients.filter(client => (client.conversionSpan || 0) > 0);
  const averageConversionSpan = convertedWithSpan.length > 0 
    ? convertedWithSpan.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / convertedWithSpan.length
    : 0;

  // Calculate average visits post trial
  const clientsWithVisits = trialsCompleted.filter(client => (client.visitsPostTrial || 0) > 0);
  const averageVisitsPostTrial = clientsWithVisits.length > 0
    ? clientsWithVisits.reduce((sum, client) => sum + (client.visitsPostTrial || 0), 0) / clientsWithVisits.length
    : 0;

  return {
    totalClients,
    newClients: newClients.length,
    convertedClients: convertedClients.length,
    retainedClients: retainedClients.length,
    trialsCompleted: trialsCompleted.length,
    conversionRate,
    retentionRate,
    newClientConversionRate,
    leadToTrialConversion,
    trialToMemberConversion,
    averageLTV,
    totalLTV,
    averageConversionSpan,
    averageVisitsPostTrial
  };
};

export const calculateConversionFunnelData = (data: NewClientData[]) => {
  const metrics = calculateConversionMetrics(data);
  
  return [
    {
      stage: 'Total Leads',
      count: metrics.totalClients,
      rate: 100,
      color: 'blue'
    },
    {
      stage: 'Trials Completed',
      count: metrics.trialsCompleted,
      rate: metrics.leadToTrialConversion,
      color: 'purple'
    },
    {
      stage: 'Converted',
      count: metrics.convertedClients,
      rate: metrics.conversionRate,
      color: 'green'
    },
    {
      stage: 'Retained',
      count: metrics.retainedClients,
      rate: metrics.retentionRate,
      color: 'emerald'
    }
  ];
};

export const calculateSourcePerformance = (data: NewClientData[]) => {
  const sourceStats = data.reduce((acc, client) => {
    const source = client.firstVisitEntityName || 'Unknown';
    
    if (!acc[source]) {
      acc[source] = {
        source,
        totalLeads: 0,
        newClients: 0,
        trialsCompleted: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        totalConversionSpan: 0,
      };
    }
    
    acc[source].totalLeads++;
    
    // Check if new client
    const isNewValue = String(client.isNew || '').trim();
    if (isNewValue !== 'Not New' && isNewValue !== '') {
      acc[source].newClients++;
    }
    
    // Check if trial completed
    if ((client.visitsPostTrial || 0) > 0) {
      acc[source].trialsCompleted++;
    }
    
    // Check if converted
    if (String(client.conversionStatus || '').trim() === 'Converted') {
      acc[source].conversions++;
    }
    
    // Check if retained
    if (String(client.retentionStatus || '').trim() === 'Retained') {
      acc[source].retained++;
    }
    
    acc[source].totalLTV += client.ltv || 0;
    acc[source].totalConversionSpan += client.conversionSpan || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate derived metrics
  return Object.values(sourceStats).map((stats: any) => ({
    ...stats,
    conversionRate: stats.totalLeads > 0 ? (stats.conversions / stats.totalLeads) * 100 : 0,
    retentionRate: stats.totalLeads > 0 ? (stats.retained / stats.totalLeads) * 100 : 0,
    leadToTrialRate: stats.totalLeads > 0 ? (stats.trialsCompleted / stats.totalLeads) * 100 : 0,
    trialToMemberRate: stats.trialsCompleted > 0 ? (stats.conversions / stats.trialsCompleted) * 100 : 0,
    avgLTV: stats.totalLeads > 0 ? stats.totalLTV / stats.totalLeads : 0,
    avgConversionSpan: stats.conversions > 0 ? stats.totalConversionSpan / stats.conversions : 0,
  })).sort((a, b) => b.totalLeads - a.totalLeads);
};
