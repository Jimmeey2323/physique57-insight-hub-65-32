
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, Percent, Users, ShoppingBag, Target, Award } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { MetricTooltip } from '@/components/ui/MetricTooltip';
import { DiscountMetrics } from '@/hooks/useDiscountMetrics';
import { SalesData } from '@/types/dashboard';

interface DiscountOverviewProps {
  metrics: DiscountMetrics;
  salesData: SalesData[];
}

export const DiscountOverview: React.FC<DiscountOverviewProps> = ({ metrics, salesData }) => {
  // Calculate comprehensive metrics
  const comprehensiveMetrics = useMemo(() => {
    const allTransactions = salesData || [];
    const discountedTransactions = allTransactions.filter(item => (item.discountAmount || 0) > 0);
    const regularTransactions = allTransactions.filter(item => (item.discountAmount || 0) === 0);

    const discountedRevenue = discountedTransactions.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const regularRevenue = regularTransactions.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalRevenue = discountedRevenue + regularRevenue;

    const avgDiscountedOrderValue = discountedTransactions.length > 0 ? discountedRevenue / discountedTransactions.length : 0;
    const avgRegularOrderValue = regularTransactions.length > 0 ? regularRevenue / regularTransactions.length : 0;

    const totalDiscountAmount = discountedTransactions.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const potentialRevenue = discountedRevenue + totalDiscountAmount;

    return {
      totalTransactions: allTransactions.length,
      discountedTransactions: discountedTransactions.length,
      regularTransactions: regularTransactions.length,
      discountPenetration: allTransactions.length > 0 ? (discountedTransactions.length / allTransactions.length) * 100 : 0,
      totalDiscountAmount,
      avgDiscountAmount: discountedTransactions.length > 0 ? totalDiscountAmount / discountedTransactions.length : 0,
      avgDiscountPercentage: discountedTransactions.length > 0 
        ? discountedTransactions.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedTransactions.length 
        : 0,
      discountedRevenue,
      regularRevenue,
      totalRevenue,
      avgDiscountedOrderValue,
      avgRegularOrderValue,
      orderValueImpact: avgDiscountedOrderValue - avgRegularOrderValue,
      revenueImpact: totalDiscountAmount,
      revenueEfficiency: totalRevenue > 0 ? (totalDiscountAmount / totalRevenue) * 100 : 0,
      potentialRevenue,
      revenueRealization: potentialRevenue > 0 ? (totalRevenue / potentialRevenue) * 100 : 0
    };
  }, [salesData]);

  const metricCards = [
    {
      title: 'Total Discounts Given',
      value: formatCurrency(comprehensiveMetrics.totalDiscountAmount),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      description: 'Total monetary value of all discounts provided to customers during the selected period.',
      comparison: `${comprehensiveMetrics.revenueEfficiency.toFixed(1)}% of revenue`,
      trend: 'neutral'
    },
    {
      title: 'Discount Penetration Rate',
      value: `${comprehensiveMetrics.discountPenetration.toFixed(1)}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      description: 'Percentage of total transactions that received any form of discount.',
      comparison: `${comprehensiveMetrics.discountedTransactions} of ${comprehensiveMetrics.totalTransactions} transactions`,
      trend: 'neutral'
    },
    {
      title: 'Average Discount Amount',
      value: formatCurrency(comprehensiveMetrics.avgDiscountAmount),
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      description: 'Average monetary discount value per transaction that received a discount.',
      comparison: `${comprehensiveMetrics.avgDiscountPercentage.toFixed(1)}% avg percentage`,
      trend: 'neutral'
    },
    {
      title: 'Discounted vs Regular AOV',
      value: formatCurrency(comprehensiveMetrics.avgDiscountedOrderValue),
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      description: 'Average order value comparison between discounted and regular transactions.',
      comparison: `vs ${formatCurrency(comprehensiveMetrics.avgRegularOrderValue)} regular`,
      trend: comprehensiveMetrics.orderValueImpact > 0 ? 'positive' : 'negative'
    },
    {
      title: 'Revenue Impact',
      value: formatCurrency(comprehensiveMetrics.revenueImpact),
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      description: 'Total revenue impact from discount activities.',
      comparison: `${comprehensiveMetrics.revenueRealization.toFixed(1)}% revenue realization`,
      trend: 'neutral'
    },
    {
      title: 'Customers Affected',
      value: formatNumber(metrics.uniqueCustomers || 0),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      description: 'Number of unique customers who received at least one discount during the period.',
      comparison: `${((metrics.uniqueCustomers || 0) / Math.max(comprehensiveMetrics.discountedTransactions, 1)).toFixed(1)} avg discounts per customer`,
      trend: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${metric.iconBg}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <Badge variant="outline" className={`${metric.color} border-current`}>
                  {metric.trend === 'positive' ? '↗' : metric.trend === 'negative' ? '↘' : '→'}
                </Badge>
              </div>
              
              <MetricTooltip
                title={metric.title}
                description={metric.description}
              >
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">{metric.title}</h3>
                  <p className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</p>
                  <p className="text-xs text-slate-500">{metric.comparison}</p>
                </div>
              </MetricTooltip>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Transaction Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="font-medium">Total Transactions</span>
              <span className="font-bold">{formatNumber(comprehensiveMetrics.totalTransactions)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Discounted</span>
              <span className="font-bold text-green-600">{formatNumber(comprehensiveMetrics.discountedTransactions)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Regular Price</span>
              <span className="font-bold text-blue-600">{formatNumber(comprehensiveMetrics.regularTransactions)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="font-medium">Total Revenue</span>
              <span className="font-bold">{formatCurrency(comprehensiveMetrics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">Discount Impact</span>
              <span className="font-bold text-red-600">-{formatCurrency(comprehensiveMetrics.revenueImpact)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium">Potential Revenue</span>
              <span className="font-bold text-purple-600">{formatCurrency(comprehensiveMetrics.potentialRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-800">Top Discounted Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(metrics.topDiscountCategories || []).slice(0, 5).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600">{formatCurrency(category.totalDiscount)}</div>
                    <div className="text-xs text-amber-700">{category.transactions} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-800">Top Discounted Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(metrics.topDiscountProducts || []).slice(0, 5).map((product, index) => (
                <div key={product.product} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{product.product}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(product.totalDiscount)}</div>
                    <div className="text-xs text-green-700">{product.transactions} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
