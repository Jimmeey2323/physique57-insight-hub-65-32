
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface SalesMetricCardsProps {
  data: SalesData[];
}

export const SalesMetricCards: React.FC<SalesMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        netSaleTotal: 0,
        totalVAT: 0,
        averageTransactionValue: 0,
        totalTransactions: 0
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalVAT = data.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    const netSaleTotal = totalRevenue - totalVAT;
    const totalTransactions = data.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      netSaleTotal,
      totalVAT,
      averageTransactionValue,
      totalTransactions
    };
  }, [data]);

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      description: 'Total gross revenue from all sales',
      rawValue: metrics.totalRevenue
    },
    {
      title: 'Net Sale Total',
      value: formatCurrency(metrics.netSaleTotal),
      change: '+10.2%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      description: 'Net revenue after VAT deduction',
      rawValue: metrics.netSaleTotal
    },
    {
      title: 'Total VAT',
      value: formatCurrency(metrics.totalVAT),
      change: '+11.8%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'from-red-500 to-pink-600',
      description: 'Total VAT collected from sales',
      rawValue: metrics.totalVAT
    },
    {
      title: 'Average Transaction Value',
      value: formatCurrency(metrics.averageTransactionValue),
      change: '+4.7%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      description: 'Average value per transaction',
      rawValue: metrics.averageTransactionValue
    }
  ];

  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-gray-100 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={`${
                  card.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } transition-colors font-semibold`}>
                  {card.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {card.change}
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-slate-900 mb-1">{card.value}</p>
              <p className="text-xs text-slate-500">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
