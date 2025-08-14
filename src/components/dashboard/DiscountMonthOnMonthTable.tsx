
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';

interface DiscountMonthOnMonthTableProps {
  data: SalesData[];
}

interface MonthlyData {
  month: string;
  totalDiscount: number;
  transactions: number;
  avgDiscount: number;
  revenue: number;
  discountRate: number;
}

export const DiscountMonthOnMonthTable: React.FC<DiscountMonthOnMonthTableProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<keyof MonthlyData>('month');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, {
      totalDiscount: number;
      transactions: number;
      revenue: number;
    }>();

    data.forEach(item => {
      if (!item.discountAmount || item.discountAmount <= 0) return;

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
          
          const existing = monthlyMap.get(monthKey) || { totalDiscount: 0, transactions: 0, revenue: 0 };
          monthlyMap.set(monthKey, {
            totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
            transactions: existing.transactions + 1,
            revenue: existing.revenue + (item.paymentValue || 0)
          });
        }
      } catch (e) {
        console.warn('Failed to parse date:', item.paymentDate);
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0,
        revenue: data.revenue,
        discountRate: data.revenue > 0 ? (data.totalDiscount / data.revenue) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  // Calculate month-on-month growth
  const dataWithGrowth = useMemo(() => {
    return monthlyData.map((current, index) => {
      if (index === 0) {
        return { ...current, growth: null };
      }
      
      const previous = monthlyData[index - 1];
      const growth = previous.totalDiscount > 0 
        ? ((current.totalDiscount - previous.totalDiscount) / previous.totalDiscount) * 100
        : 0;
      
      return { ...current, growth };
    });
  }, [monthlyData]);

  const sortedData = useMemo(() => {
    return [...dataWithGrowth].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal === null || bVal === null) return 0;
      
      const comparison = typeof aVal === 'string' 
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [dataWithGrowth, sortBy, sortOrder]);

  const handleSort = (column: keyof MonthlyData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getGrowthIcon = (growth: number | null) => {
    if (growth === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getGrowthColor = (growth: number | null) => {
    if (growth === null) return 'text-gray-500';
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Month-on-Month Discount Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('month')}
                >
                  Month
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('totalDiscount')}
                >
                  Total Discounts
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('transactions')}
                >
                  Transactions
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avgDiscount')}
                >
                  Avg Discount
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('discountRate')}
                >
                  Discount Rate
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  MoM Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr 
                  key={row.month} 
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  style={{ height: '50px' }}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatMonth(row.month)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(row.totalDiscount)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatNumber(row.transactions)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {formatCurrency(row.avgDiscount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="outline" className="text-xs">
                      {row.discountRate.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.growth !== null ? (
                      <div className="flex items-center justify-center gap-1">
                        {getGrowthIcon(row.growth)}
                        <span className={`text-sm font-medium ${getGrowthColor(row.growth)}`}>
                          {Math.abs(row.growth).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No discount data available for month-on-month analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
};
