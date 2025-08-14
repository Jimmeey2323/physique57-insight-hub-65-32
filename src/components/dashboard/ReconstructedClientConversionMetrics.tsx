
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Percent, Clock, UserCheck, Award, UserPlus, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { calculateConversionMetrics } from '@/utils/conversionMetrics';

interface ReconstructedClientConversionMetricsProps {
  data: NewClientData[];
}

export const ReconstructedClientConversionMetrics: React.FC<ReconstructedClientConversionMetricsProps> = ({ data }) => {
  const metrics = calculateConversionMetrics(data);

  const metricCards = [
    {
      title: 'Total Clients',
      value: formatNumber(metrics.totalClients),
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All client records',
      change: '+12.5%'
    },
    {
      title: 'New Clients',
      value: formatNumber(metrics.newClients),
      icon: UserPlus,
      gradient: 'from-emerald-500 to-green-600',
      description: 'Clients with "New" in Is New field',
      change: '+8.3%'
    },
    {
      title: 'Converted Clients',
      value: formatNumber(metrics.convertedClients),
      icon: Award,
      gradient: 'from-green-500 to-teal-600',
      description: 'Status = "Converted"',
      change: '+15.2%'
    },
    {
      title: 'Retained Clients',
      value: formatNumber(metrics.retainedClients),
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Status = "Retained"',
      change: '+6.7%'
    },
    {
      title: 'Trials Completed',
      value: formatNumber(metrics.trialsCompleted),
      icon: Target,
      gradient: 'from-orange-500 to-red-600',
      description: 'Visits Post Trial &gt; 0',
      change: '+3.1%'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Converted / Total clients',
      change: '+4.8%'
    },
    {
      title: 'Lead → Trial',
      value: `${metrics.leadToTrialConversion.toFixed(1)}%`,
      icon: ArrowRight,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Trials / Total leads',
      change: '+2.3%'
    },
    {
      title: 'Trial → Member',
      value: `${metrics.trialToMemberConversion.toFixed(1)}%`,
      icon: Percent,
      gradient: 'from-amber-500 to-yellow-600',
      description: 'Converted / Trials',
      change: '+7.1%'
    },
    {
      title: 'Average LTV',
      value: formatCurrency(metrics.averageLTV),
      icon: DollarSign,
      gradient: 'from-indigo-500 to-purple-600',
      description: 'Lifetime value per client',
      change: '+9.4%'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalLTV),
      icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-600',
      description: 'Sum of all LTV',
      change: '+18.2%'
    },
    {
      title: 'Avg Conv Time',
      value: `${Math.round(metrics.averageConversionSpan)} days`,
      icon: Clock,
      gradient: 'from-teal-500 to-cyan-600',
      description: 'Time to convert',
      change: '-2.1%'
    },
    {
      title: 'Avg Post-Trial Visits',
      value: metrics.averageVisitsPostTrial.toFixed(1),
      icon: Target,
      gradient: 'from-violet-500 to-purple-600',
      description: 'Visits after trial',
      change: '+5.6%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(metrics.totalClients)}</div>
          <div className="text-sm text-blue-700">Total Records</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-green-700">Conversion Rate</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{metrics.retentionRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-700">Retention Rate</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.averageLTV)}</div>
          <div className="text-sm text-orange-700">Avg LTV</div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
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

      {/* Debug Information */}
      <Card className="bg-gray-50 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Data Processing Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-500 space-y-1">
          <div>Total records processed: {metrics.totalClients}</div>
          <div>New clients (contains "New"): {metrics.newClients}</div>
          <div>Converted clients (status = "Converted"): {metrics.convertedClients}</div>
          <div>Retained clients (status = "Retained"): {metrics.retainedClients}</div>
          <div>Trials completed (visits &gt; 0): {metrics.trialsCompleted}</div>
        </CardContent>
      </Card>
    </div>
  );
};
