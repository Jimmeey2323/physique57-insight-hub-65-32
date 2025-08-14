
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';
import { DiscountMetrics } from '@/hooks/useDiscountMetrics';

interface DiscountAnalyticsChartsProps {
  data: SalesData[];
  metrics: DiscountMetrics;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const DiscountAnalyticsCharts: React.FC<DiscountAnalyticsChartsProps> = ({ data, metrics }) => {
  const monthlyTrendData = useMemo(() => {
    const monthlyMap = new Map<string, { discountAmount: number; revenue: number; transactions: number }>();
    
    data.forEach(item => {
      try {
        let date: Date;
        if (item.paymentDate.includes(',')) {
          const [datePart] = item.paymentDate.split(',');
          date = new Date(datePart.trim());
        } else if (item.paymentDate.includes('/')) {
          const [datePart] = item.paymentDate.split(' ')[0];
          const [day, month, year] = datePart.split('/');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          date = new Date(item.paymentDate);
        }
        
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          const existing = monthlyMap.get(monthKey) || { discountAmount: 0, revenue: 0, transactions: 0 };
          monthlyMap.set(monthKey, {
            discountAmount: existing.discountAmount + (item.discountAmount || 0),
            revenue: existing.revenue + (item.paymentValue || 0),
            transactions: existing.transactions + 1
          });
        }
      } catch (e) {
        console.warn('Failed to parse date:', item.paymentDate);
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        discountAmount: data.discountAmount,
        revenue: data.revenue,
        transactions: data.transactions,
        discountRate: data.revenue > 0 ? (data.discountAmount / data.revenue) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [data]);

  const productDistribution = useMemo(() => {
    const productMap = new Map<string, { value: number; transactions: number }>();
    
    data.forEach(item => {
      const product = item.cleanedProduct || 'Unknown Product';
      const existing = productMap.get(product) || { value: 0, transactions: 0 };
      productMap.set(product, {
        value: existing.value + (item.discountAmount || 0),
        transactions: existing.transactions + 1
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.value,
        transactions: data.transactions
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data]);

  const discountRangeData = useMemo(() => {
    const ranges = [
      { min: 0, max: 10, label: '0-10%' },
      { min: 10, max: 20, label: '10-20%' },
      { min: 20, max: 30, label: '20-30%' },
      { min: 30, max: 50, label: '30-50%' },
      { min: 50, max: 100, label: '50%+' }
    ];

    return ranges.map(range => {
      const itemsInRange = data.filter(item => {
        const discount = item.discountPercentage || 0;
        return discount >= range.min && discount < range.max;
      });

      return {
        range: range.label,
        transactions: itemsInRange.length,
        totalDiscount: itemsInRange.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
        avgDiscount: itemsInRange.length > 0 ? itemsInRange.reduce((sum, item) => sum + (item.discountAmount || 0), 0) / itemsInRange.length : 0,
        totalRevenue: itemsInRange.reduce((sum, item) => sum + (item.paymentValue || 0), 0)
      };
    });
  }, [data]);

  const locationData = useMemo(() => {
    const locationMap = new Map<string, { totalDiscount: number; transactions: number; revenue: number }>();
    
    data.forEach(item => {
      const location = item.calculatedLocation || 'Unknown Location';
      const existing = locationMap.get(location) || { totalDiscount: 0, transactions: 0, revenue: 0 };
      locationMap.set(location, {
        totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
        transactions: existing.transactions + 1,
        revenue: existing.revenue + (item.paymentValue || 0)
      });
    });

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        revenue: data.revenue,
        discountRate: data.revenue > 0 ? (data.totalDiscount / data.revenue) * 100 : 0
      }))
      .sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Discount Trends */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Monthly Discount Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'discountRate' ? `${(value as number).toFixed(1)}%` : formatCurrency(value as number),
                  name === 'discountAmount' ? 'Discount Amount' : 
                  name === 'revenue' ? 'Revenue' : 'Discount Rate'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="discountAmount" fill="#3b82f6" name="Discount Amount" />
              <Line yAxisId="right" type="monotone" dataKey="discountRate" stroke="#ef4444" strokeWidth={3} name="Discount Rate %" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Distribution */}
      <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-purple-600" />
            Discount Distribution by Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Discount Range Analysis */}
      <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            Discount Range Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={discountRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === 'totalDiscount' ? 'Total Discount' : 'Average Discount'
                ]}
              />
              <Legend />
              <Bar dataKey="totalDiscount" fill="#10b981" name="Total Discount" />
              <Bar dataKey="avgDiscount" fill="#06b6d4" name="Average Discount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Location Performance */}
      <Card className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/20 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Discount by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === 'totalDiscount' ? 'Total Discount' : 'Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="totalDiscount" fill="#f59e0b" name="Total Discount" />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
