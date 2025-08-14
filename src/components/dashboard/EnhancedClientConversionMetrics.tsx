
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Percent, Clock, UserCheck, Award, UserPlus, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface EnhancedClientConversionMetricsProps {
  data: NewClientData[];
}

export const EnhancedClientConversionMetrics: React.FC<EnhancedClientConversionMetricsProps> = ({ data }) => {
  // Calculate comprehensive metrics
  const totalClients = data.length;
  
  // New members calculation - check if "Is New" column contains "New" but not "Not New"
  const newMembers = data.filter(client => {
    const isNewValue = String(client.isNew || '').trim();
    // Must contain "New" and should not be "Not New"
    return isNewValue.includes('New') && isNewValue !== 'Not New';
  }).length;
  
  // Converted members - check if "Conversion Status" contains "Converted"
  const convertedMembers = data.filter(client => {
    const conversionStatus = String(client.conversionStatus || '').trim();
    return conversionStatus.includes('Converted') && conversionStatus !== 'Not Converted';
  }).length;
  
  // Retained members - check if "Retention Status" contains "Retained"
  const retainedMembers = data.filter(client => {
    const retentionStatus = String(client.retentionStatus || '').trim();
    return retentionStatus.includes('Retained') && retentionStatus !== 'Not Retained';
  }).length;
  
  // Trials completed - clients with visits post trial > 0
  const trialsCompleted = data.filter(client => (client.visitsPostTrial || 0) > 0).length;
  
  // Lead to trial conversion (clients with first visit to those with visits post trial)
  const leadToTrialConversion = totalClients > 0 ? (trialsCompleted / totalClients) * 100 : 0;
  
  // Trial to member conversion (trials completed to converted members)
  const trialToMemberConversion = trialsCompleted > 0 ? (convertedMembers / trialsCompleted) * 100 : 0;
  
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgLTV = totalClients > 0 ? totalLTV / totalClients : 0;
  const avgConversionTime = data.length > 0 
    ? data.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / data.length 
    : 0;

  const metrics = [
    {
      title: 'New Members',
      value: formatNumber(newMembers),
      icon: UserPlus,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Recently acquired clients',
      change: '+12.5%'
    },
    {
      title: 'Converted Members',
      value: formatNumber(convertedMembers),
      icon: Award,
      gradient: 'from-green-500 to-teal-600',
      description: 'Trial to paid conversions',
      change: '+8.3%'
    },
    {
      title: 'Retained Members',
      value: formatNumber(retainedMembers),
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Active retained clients',
      change: '+15.2%'
    },
    {
      title: 'Trials Completed',
      value: formatNumber(trialsCompleted),
      icon: Target,
      gradient: 'from-orange-500 to-red-600',
      description: 'Trial sessions completed',
      change: '+6.7%'
    },
    {
      title: 'Lead → Trial Conv',
      value: `${leadToTrialConversion.toFixed(1)}%`,
      icon: ArrowRight,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Lead to trial conversion',
      change: '+3.1%'
    },
    {
      title: 'Trial → Member Conv',
      value: `${trialToMemberConversion.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Trial to member conversion',
      change: '+4.8%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                <metric.icon className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <metric.icon className="w-5 h-5" />
                  <h3 className="font-semibold text-xs">{metric.title}</h3>
                </div>
                <p className="text-2xl font-bold mb-1">{metric.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-90">{metric.description}</p>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-1">
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
