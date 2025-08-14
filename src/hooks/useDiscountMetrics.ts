
import { useMemo } from 'react';
import { SalesData } from '@/types/dashboard';

export interface DiscountMetrics {
  totalDiscountAmount: number;
  totalTransactions: number;
  discountedTransactions: number;
  discountPenetrationRate: number;
  avgDiscountAmount: number;
  avgDiscountPercentage: number;
  totalRevenue: number;
  totalPotentialRevenue: number;
  revenueImpact: number;
  uniqueCustomers: number;
  topDiscountCategories: Array<{
    category: string;
    totalDiscount: number;
    transactions: number;
    avgDiscount: number;
  }>;
  topDiscountProducts: Array<{
    product: string;
    totalDiscount: number;
    transactions: number;
    avgDiscount: number;
  }>;
  discountsByLocation: Array<{
    location: string;
    totalDiscount: number;
    transactions: number;
    avgDiscount: number;
  }>;
  discountsByPaymentMethod: Array<{
    method: string;
    totalDiscount: number;
    transactions: number;
    avgDiscount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalDiscount: number;
    transactions: number;
    avgDiscount: number;
  }>;
}

export const useDiscountMetrics = (data: SalesData[], filters?: any) => {
  return useMemo(() => {
    console.log('useDiscountMetrics - Processing data:', data?.length, 'items');
    
    if (!data || data.length === 0) {
      console.log('useDiscountMetrics - No data available');
      return {
        totalDiscountAmount: 0,
        totalTransactions: 0,
        discountedTransactions: 0,
        discountPenetrationRate: 0,
        avgDiscountAmount: 0,
        avgDiscountPercentage: 0,
        totalRevenue: 0,
        totalPotentialRevenue: 0,
        revenueImpact: 0,
        uniqueCustomers: 0,
        topDiscountCategories: [],
        topDiscountProducts: [],
        discountsByLocation: [],
        discountsByPaymentMethod: [],
        monthlyTrends: []
      } as DiscountMetrics;
    }

    const totalTransactions = data.length;
    const discountedTransactions = data.filter(item => {
      const discount = item.discountAmount || 0;
      return discount > 0;
    });
    const discountedCount = discountedTransactions.length;

    console.log('useDiscountMetrics - Discount analysis:', {
      totalTransactions,
      discountedCount,
      sampleDiscounts: discountedTransactions.slice(0, 5).map(item => ({
        discountAmount: item.discountAmount,
        paymentValue: item.paymentValue,
        cleanedCategory: item.cleanedCategory,
        calculatedLocation: item.calculatedLocation
      }))
    });

    const totalDiscountAmount = discountedTransactions.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalPotentialRevenue = data.reduce((sum, item) => sum + (item.mrpPostTax || item.paymentValue || 0), 0);

    const discountPenetrationRate = totalTransactions > 0 ? (discountedCount / totalTransactions) * 100 : 0;
    const avgDiscountAmount = discountedCount > 0 ? totalDiscountAmount / discountedCount : 0;
    const avgDiscountPercentage = discountedCount > 0 
      ? discountedTransactions.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedCount 
      : 0;
    const revenueImpact = totalPotentialRevenue - totalRevenue;
    const uniqueCustomers = new Set(discountedTransactions.map(item => item.customerEmail).filter(Boolean)).size;

    // Category analysis
    const categoryMap = new Map<string, { totalDiscount: number; transactions: number }>();
    discountedTransactions.forEach(item => {
      const category = item.cleanedCategory || item.paymentCategory || 'Unknown';
      const existing = categoryMap.get(category) || { totalDiscount: 0, transactions: 0 };
      categoryMap.set(category, {
        totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
        transactions: existing.transactions + 1
      });
    });

    const topDiscountCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0
      }))
      .sort((a, b) => b.totalDiscount - a.totalDiscount)
      .slice(0, 10);

    // Product analysis
    const productMap = new Map<string, { totalDiscount: number; transactions: number }>();
    discountedTransactions.forEach(item => {
      const product = item.cleanedProduct || item.paymentItem || 'Unknown';
      const existing = productMap.get(product) || { totalDiscount: 0, transactions: 0 };
      productMap.set(product, {
        totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
        transactions: existing.transactions + 1
      });
    });

    const topDiscountProducts = Array.from(productMap.entries())
      .map(([product, data]) => ({
        product,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0
      }))
      .sort((a, b) => b.totalDiscount - a.totalDiscount)
      .slice(0, 10);

    // Location analysis
    const locationMap = new Map<string, { totalDiscount: number; transactions: number }>();
    discountedTransactions.forEach(item => {
      const location = item.calculatedLocation || 'Unknown';
      const existing = locationMap.get(location) || { totalDiscount: 0, transactions: 0 };
      locationMap.set(location, {
        totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
        transactions: existing.transactions + 1
      });
    });

    const discountsByLocation = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0
      }))
      .sort((a, b) => b.totalDiscount - a.totalDiscount);

    // Payment method analysis
    const paymentMap = new Map<string, { totalDiscount: number; transactions: number }>();
    discountedTransactions.forEach(item => {
      const method = item.paymentMethod || 'Unknown';
      const existing = paymentMap.get(method) || { totalDiscount: 0, transactions: 0 };
      paymentMap.set(method, {
        totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
        transactions: existing.transactions + 1
      });
    });

    const discountsByPaymentMethod = Array.from(paymentMap.entries())
      .map(([method, data]) => ({
        method,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0
      }))
      .sort((a, b) => b.totalDiscount - a.totalDiscount);

    // Monthly trends
    const monthlyMap = new Map<string, { totalDiscount: number; transactions: number }>();
    discountedTransactions.forEach(item => {
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
          
          const existing = monthlyMap.get(monthKey) || { totalDiscount: 0, transactions: 0 };
          monthlyMap.set(monthKey, {
            totalDiscount: existing.totalDiscount + (item.discountAmount || 0),
            transactions: existing.transactions + 1
          });
        }
      } catch (e) {
        console.warn('Failed to parse date:', item.paymentDate);
      }
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        totalDiscount: data.totalDiscount,
        transactions: data.transactions,
        avgDiscount: data.transactions > 0 ? data.totalDiscount / data.transactions : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const result = {
      totalDiscountAmount,
      totalTransactions,
      discountedTransactions: discountedCount,
      discountPenetrationRate,
      avgDiscountAmount,
      avgDiscountPercentage,
      totalRevenue,
      totalPotentialRevenue,
      revenueImpact,
      uniqueCustomers,
      topDiscountCategories,
      topDiscountProducts,
      discountsByLocation,
      discountsByPaymentMethod,
      monthlyTrends
    } as DiscountMetrics;

    console.log('useDiscountMetrics - Final result:', {
      totalDiscountAmount,
      discountPenetrationRate,
      topCategoriesCount: topDiscountCategories.length,
      topProductsCount: topDiscountProducts.length,
      locationsCount: discountsByLocation.length,
      monthlyTrendsCount: monthlyTrends.length
    });

    return result;
  }, [data, filters]);
};
