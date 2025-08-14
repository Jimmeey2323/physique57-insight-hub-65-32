
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Percent, Info, Calculator, BarChart3, BookOpen, AlertCircle } from 'lucide-react';

interface DiscountRevenueAnalysisProps {
  data: SalesData[];
  allData: SalesData[];
}

export const DiscountRevenueAnalysis: React.FC<DiscountRevenueAnalysisProps> = ({ data, allData }) => {
  const [activeView, setActiveView] = useState<'comparison' | 'distribution' | 'correlation'>('comparison');

  const analysisData = useMemo(() => {
    const discountedItems = allData.filter(item => (item.discountAmount || 0) > 0);
    const regularItems = allData.filter(item => (item.discountAmount || 0) === 0);

    // Discount range analysis
    const discountRanges = [
      { min: 0, max: 0, label: 'No Discount' },
      { min: 0.1, max: 10, label: '0-10%' },
      { min: 10.1, max: 20, label: '10-20%' },
      { min: 20.1, max: 30, label: '20-30%' },
      { min: 30.1, max: 50, label: '30-50%' },
      { min: 50.1, max: 100, label: '50%+' }
    ];

    const rangeData = discountRanges.map(range => {
      const itemsInRange = allData.filter(item => {
        const discountPercent = item.discountPercentage || 0;
        if (range.min === 0 && range.max === 0) {
          return discountPercent === 0;
        }
        return discountPercent >= range.min && discountPercent <= range.max;
      });

      const totalRevenue = itemsInRange.reduce((sum, item) => sum + (item.grossRevenue || item.paymentValue || 0), 0);
      const totalDiscounts = itemsInRange.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
      const avgOrderValue = itemsInRange.length > 0 ? totalRevenue / itemsInRange.length : 0;

      return {
        range: range.label,
        transactions: itemsInRange.length,
        totalRevenue,
        totalDiscounts,
        netRevenue: totalRevenue - totalDiscounts,
        avgOrderValue,
        discountRate: totalRevenue > 0 ? (totalDiscounts / totalRevenue) * 100 : 0
      };
    });

    // Comparison data
    const comparisonData = [
      {
        type: 'Discounted',
        transactions: discountedItems.length,
        totalRevenue: discountedItems.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
        avgOrderValue: discountedItems.length > 0 ? discountedItems.reduce((sum, item) => sum + (item.paymentValue || 0), 0) / discountedItems.length : 0,
        totalDiscounts: discountedItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
      },
      {
        type: 'Regular',
        transactions: regularItems.length,
        totalRevenue: regularItems.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
        avgOrderValue: regularItems.length > 0 ? regularItems.reduce((sum, item) => sum + (item.paymentValue || 0), 0) / regularItems.length : 0,
        totalDiscounts: 0
      }
    ];

    return { rangeData, comparisonData };
  }, [allData]);

  const scatterData = useMemo(() => {
    return data
      .filter(item => (item.discountAmount || 0) > 0)
      .map(item => ({
        discountPercent: item.discountPercentage || 0,
        revenue: item.grossRevenue || item.paymentValue || 0,
        discountAmount: item.discountAmount || 0,
        product: item.cleanedProduct
      }))
      .slice(0, 100);
  }, [data]);

  const renderChart = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analysisData.comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'transactions' ? formatNumber(value as number) : formatCurrency(value as number),
                  name === 'totalRevenue' ? 'Total Revenue' : 
                  name === 'avgOrderValue' ? 'Avg Order Value' : 
                  name === 'totalDiscounts' ? 'Total Discounts' : name
                ]}
              />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#10b981" name="Total Revenue" />
              <Bar dataKey="avgOrderValue" fill="#3b82f6" name="Avg Order Value" />
              <Bar dataKey="totalDiscounts" fill="#ef4444" name="Total Discounts" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analysisData.rangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'transactions' ? formatNumber(value as number) : formatCurrency(value as number),
                  name === 'totalRevenue' ? 'Gross Revenue' :
                  name === 'totalDiscounts' ? 'Discounts Given' :
                  name === 'netRevenue' ? 'Net Revenue' : name
                ]}
              />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#10b981" name="Gross Revenue" />
              <Bar dataKey="totalDiscounts" fill="#ef4444" name="Discounts Given" />
              <Bar dataKey="netRevenue" fill="#3b82f6" name="Net Revenue" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'correlation':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="discountPercent" 
                name="Discount %" 
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="revenue" 
                name="Revenue"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'discountPercent' ? `${value}%` : formatCurrency(value as number),
                  name === 'discountPercent' ? 'Discount %' : 'Revenue'
                ]}
                labelFormatter={() => ''}
              />
              <Scatter dataKey="revenue" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Detailed Summary Section */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Revenue Impact Analysis Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Understanding Revenue Impact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">What This Analysis Shows:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Revenue Comparison:</strong> Direct comparison between discounted and regular price transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Distribution Analysis:</strong> How different discount ranges perform in terms of revenue generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Correlation Insights:</strong> Relationship between discount percentage and transaction value</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">How to Read the Charts:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Green Bars:</strong> Gross revenue generated (before discounts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Red Bars:</strong> Total discount amount given away</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                    <span><strong>Blue Bars:</strong> Net revenue (after discounts) or average order value</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Key Insights & Interpretations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-700">Comparison View</h4>
                <p className="text-sm text-amber-700">
                  Compare how discounted transactions perform against regular-priced ones. 
                  Look for differences in average order value and total revenue generation.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-700">Distribution View</h4>
                <p className="text-sm text-amber-700">
                  Understand which discount ranges generate the most revenue. 
                  Higher net revenue in a range indicates better discount efficiency.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-700">Correlation View</h4>
                <p className="text-sm text-amber-700">
                  Each dot represents a transaction. Clusters reveal patterns - 
                  high revenue with low discounts suggests premium pricing power.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50/50 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Actionable Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Optimize Discount Strategy:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Focus on discount ranges with highest net revenue</li>
                  <li>• Reduce discount percentages that don't drive proportional volume</li>
                  <li>• Test smaller discounts on high-performing categories</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Revenue Protection:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Monitor discount penetration rates vs. revenue impact</li>
                  <li>• Set maximum discount thresholds per category</li>
                  <li>• Track correlation between discount depth and customer retention</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Controls */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Interactive Revenue Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeView === 'comparison' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('comparison')}
              >
                Comparison
              </Button>
              <Button
                variant={activeView === 'distribution' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('distribution')}
              >
                Distribution
              </Button>
              <Button
                variant={activeView === 'correlation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('correlation')}
              >
                Correlation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Calculation Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-green-700 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Revenue Impact Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Revenue Impact Formula:</p>
                <p className="text-gray-600">Total Discounts Given = Sum of all discount amounts</p>
                <p className="text-gray-600">Potential Revenue = Actual Revenue + Total Discounts</p>
                <p className="text-gray-600">Impact % = (Total Discounts / Potential Revenue) × 100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-purple-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Order Value Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">AOV Comparison:</p>
                <p className="text-gray-600">Discounted AOV = Total Discounted Revenue / Discounted Transactions</p>
                <p className="text-gray-600">Regular AOV = Total Regular Revenue / Regular Transactions</p>
                <p className="text-gray-600">Impact = Discounted AOV - Regular AOV</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/20 border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-orange-700 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Discount Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Effectiveness Metrics:</p>
                <p className="text-gray-600">Penetration Rate = Discounted Transactions / Total Transactions</p>
                <p className="text-gray-600">Avg Discount % = Sum of Discount % / Discounted Transactions</p>
                <p className="text-gray-600">Efficiency = Revenue Generated per Discount Dollar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Key Revenue Impact Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisData.comparisonData.map((item, index) => (
              <div key={item.type} className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-2">{item.type} Transactions</h4>
                <div className="space-y-1 text-sm">
                  <p>Count: {formatNumber(item.transactions)}</p>
                  <p>Revenue: {formatCurrency(item.totalRevenue)}</p>
                  <p>AOV: {formatCurrency(item.avgOrderValue)}</p>
                  {item.totalDiscounts > 0 && (
                    <p className="text-red-600">Discounts: {formatCurrency(item.totalDiscounts)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
