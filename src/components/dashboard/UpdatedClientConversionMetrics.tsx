
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Clock, DollarSign, Calendar, Percent } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { calculateConversionMetrics } from '@/utils/conversionMetrics';

interface UpdatedClientConversionMetricsProps {
  data: NewClientData[];
}

export const UpdatedClientConversionMetrics: React.FC<UpdatedClientConversionMetricsProps> = ({ data }) => {
  const metrics = calculateConversionMetrics(data);

  const metricCards = [
    {
      title: "Total Clients",
      value: formatNumber(metrics.totalClients),
      icon: Users,
      color: "blue",
      description: "Total client records in dataset"
    },
    {
      title: "New Clients",
      value: formatNumber(metrics.newClients),
      icon: Users,
      color: "indigo",
      description: "Clients with 'New' in Is New field"
    },
    {
      title: "Conversion Rate", 
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: "green",
      description: `${metrics.convertedClients} out of ${metrics.totalClients} converted`
    },
    {
      title: "Retention Rate", 
      value: `${metrics.retentionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "purple",
      description: `${metrics.retainedClients} clients retained`
    },
    {
      title: "New Client Conv. Rate",
      value: `${metrics.newClientConversionRate.toFixed(1)}%`,
      icon: Percent,
      color: "teal",
      description: "Conversion rate for new clients only"
    },
    {
      title: "Lead → Trial Rate",
      value: `${metrics.leadToTrialConversion.toFixed(1)}%`,
      icon: Target,
      color: "cyan",
      description: "Leads who completed trials"
    },
    {
      title: "Trial → Member Rate",
      value: `${metrics.trialToMemberConversion.toFixed(1)}%`,
      icon: Target,
      color: "emerald",
      description: "Trials who became members"
    },
    {
      title: "Average LTV",
      value: formatCurrency(metrics.averageLTV),
      icon: DollarSign,
      color: "emerald",
      description: `Total LTV: ${formatCurrency(metrics.totalLTV)}`
    },
    {
      title: "Avg Conversion Time",
      value: `${Math.round(metrics.averageConversionSpan)} days`,
      icon: Clock,
      color: "orange",
      description: "Average days from first visit to conversion"
    },
    {
      title: "Avg Visits Post Trial",
      value: metrics.averageVisitsPostTrial.toFixed(1),
      icon: Calendar,
      color: "pink",
      description: "Average visits after trial period"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(metrics.totalClients)}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.retentionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Retention Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.averageLTV)}</div>
          <div className="text-sm text-gray-600">Avg LTV</div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                  <Badge variant="outline" className={`text-${metric.color}-600 border-${metric.color}-200`}>
                    Live
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calculation Details */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">Calculation Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div><strong>New Clients:</strong> Records where "Is New" field contains the word "New"</div>
          <div><strong>Converted:</strong> Records where "Conversion Status" equals "Converted"</div>
          <div><strong>Retained:</strong> Records where "Retention Status" equals "Retained"</div>
          <div><strong>Trials Completed:</strong> Records where "Visits Post Trial" &gt; 0</div>
          <div><strong>Conversion Rate:</strong> Converted clients ÷ Total clients × 100</div>
          <div><strong>Retention Rate:</strong> Retained clients ÷ Total clients × 100</div>
        </CardContent>
      </Card>
    </div>
  );
};
