
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricTooltip } from '@/components/ui/MetricTooltip';

interface DiscountYearOnYearTableProps {
  data: SalesData[];
}

interface YearOnYearData {
  month: string;
  years: {
    [year: string]: {
      totalDiscounts: number;
      discountCount: number;
      avgDiscountAmount: number;
      avgDiscountPercentage: number;
      totalRevenue: number;
      discountPenetration: number;
    };
  };
}

export const DiscountYearOnYearTable: React.FC<DiscountYearOnYearTableProps> = ({ data }) => {
  const yearOnYearData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by month and year
    const grouped = data.reduce((acc, item) => {
      if (!item.discountAmount || item.discountAmount <= 0) return acc;

      const date = new Date(item.paymentDate);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear().toString();

      if (!acc[month]) {
        acc[month] = { month, years: {} };
      }

      if (!acc[month].years[year]) {
        acc[month].years[year] = {
          totalDiscounts: 0,
          discountCount: 0,
          avgDiscountAmount: 0,
          avgDiscountPercentage: 0,
          totalRevenue: 0,
          discountPenetration: 0,
        };
      }

      acc[month].years[year].totalDiscounts += item.discountAmount;
      acc[month].years[year].discountCount += 1;
      acc[month].years[year].totalRevenue += item.grossRevenue || 0;

      return acc;
    }, {} as { [key: string]: YearOnYearData });

    // Calculate averages and percentages
    Object.values(grouped).forEach(monthData => {
      Object.values(monthData.years).forEach(yearData => {
        yearData.avgDiscountAmount = yearData.discountCount > 0 
          ? yearData.totalDiscounts / yearData.discountCount 
          : 0;
        
        // Calculate average discount percentage
        const relevantTransactions = data.filter(item => {
          const date = new Date(item.paymentDate);
          const month = date.toLocaleString('default', { month: 'long' });
          const year = date.getFullYear().toString();
          const monthKey = Object.keys(grouped).find(key => grouped[key] === monthData);
          return month === monthKey && year in monthData.years && item.discountAmount > 0;
        });
        
        yearData.avgDiscountPercentage = relevantTransactions.length > 0
          ? relevantTransactions.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / relevantTransactions.length
          : 0;

        // Calculate discount penetration (assuming we have total transactions data)
        yearData.discountPenetration = yearData.discountCount > 0 ? yearData.discountCount : 0;
      });
    });

    return Object.values(grouped);
  }, [data]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    yearOnYearData.forEach(monthData => {
      Object.keys(monthData.years).forEach(year => years.add(year));
    });
    return Array.from(years).sort();
  }, [yearOnYearData]);

  const calculateYoYChange = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-green-500" />;
    return null;
  };

  const getChangeBadge = (change: number) => {
    const isPositive = change > 0;
    return (
      <Badge variant={isPositive ? "destructive" : "default"} className="text-xs">
        {getChangeIcon(change)}
        {formatPercentage(Math.abs(change))}
      </Badge>
    );
  };

  if (yearOnYearData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Year-on-Year Discount Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No discount data available for year-on-year comparison.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Year-on-Year Discount Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare discount metrics across the same months in different years
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Month
                </th>
                {availableYears.map(year => (
                  <th key={year} colSpan={4} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-l">
                    {year}
                  </th>
                ))}
              </tr>
              <tr className="bg-muted/30">
                <th className="px-6 py-2"></th>
                {availableYears.map(year => (
                  <React.Fragment key={year}>
                    <th className="px-3 py-2 text-left text-xs text-muted-foreground border-l">
                      <MetricTooltip
                        title="Total Discounts"
                        description="Total monetary value of discounts given"
                        formula="SUM(discount_amount)"
                        example="₹10,000 in discounts given"
                        importance="Shows direct impact on revenue"
                      >
                        <span>Total</span>
                      </MetricTooltip>
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-muted-foreground">
                      <MetricTooltip
                        title="Average Amount"
                        description="Average discount amount per transaction"
                        formula="Total Discounts ÷ Discount Count"
                        example="₹10,000 ÷ 50 transactions = ₹200 avg"
                        importance="Helps optimize discount sizing"
                      >
                        <span>Avg Amt</span>
                      </MetricTooltip>
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-muted-foreground">
                      <MetricTooltip
                        title="Average Percentage"
                        description="Average discount percentage applied"
                        formula="SUM(discount_percentage) ÷ Count"
                        example="15% + 20% + 10% ÷ 3 = 15% avg"
                        importance="Key for margin analysis"
                      >
                        <span>Avg %</span>
                      </MetricTooltip>
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-muted-foreground">
                      <MetricTooltip
                        title="Transaction Count"
                        description="Number of transactions with discounts"
                        formula="COUNT(transactions_with_discounts)"
                        example="50 transactions received discounts"
                        importance="Shows promotional reach"
                      >
                        <span>Count</span>
                      </MetricTooltip>
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearOnYearData.map((monthData, index) => (
                <tr key={monthData.month} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {monthData.month}
                  </td>
                  {availableYears.map((year, yearIndex) => {
                    const yearData = monthData.years[year];
                    const previousYear = availableYears[yearIndex - 1];
                    const previousYearData = previousYear ? monthData.years[previousYear] : null;

                    if (!yearData) {
                      return (
                        <React.Fragment key={year}>
                          <td className="px-3 py-4 text-sm text-muted-foreground border-l" colSpan={4}>
                            No data
                          </td>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={year}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm border-l">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatCurrency(yearData.totalDiscounts)}</span>
                            {previousYearData && (
                              <div className="mt-1">
                                {getChangeBadge(calculateYoYChange(yearData.totalDiscounts, previousYearData.totalDiscounts))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatCurrency(yearData.avgDiscountAmount)}</span>
                            {previousYearData && (
                              <div className="mt-1">
                                {getChangeBadge(calculateYoYChange(yearData.avgDiscountAmount, previousYearData.avgDiscountAmount))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{yearData.avgDiscountPercentage.toFixed(1)}%</span>
                            {previousYearData && (
                              <div className="mt-1">
                                {getChangeBadge(calculateYoYChange(yearData.avgDiscountPercentage, previousYearData.avgDiscountPercentage))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatNumber(yearData.discountCount)}</span>
                            {previousYearData && (
                              <div className="mt-1">
                                {getChangeBadge(calculateYoYChange(yearData.discountCount, previousYearData.discountCount))}
                              </div>
                            )}
                          </div>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
