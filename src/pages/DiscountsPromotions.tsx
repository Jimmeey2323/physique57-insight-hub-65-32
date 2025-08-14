import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Calendar, Filter, Percent, Users, DollarSign } from 'lucide-react';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { DiscountFilterSection } from '@/components/dashboard/DiscountFilterSection';
import { DiscountOverview } from '@/components/dashboard/DiscountOverview';
import { DiscountRevenueAnalysis } from '@/components/dashboard/DiscountRevenueAnalysis';
import { DiscountMonthOnMonthTable } from '@/components/dashboard/DiscountMonthOnMonthTable';
import { DiscountYearOnYearTable } from '@/components/dashboard/DiscountYearOnYearTable';
import { DiscountAnalyticsCharts } from '@/components/dashboard/DiscountAnalyticsCharts';
import { DiscountTopBottomLists } from '@/components/dashboard/DiscountTopBottomLists';
import { DiscountDataTable } from '@/components/dashboard/DiscountDataTable';
import { useSalesData } from '@/hooks/useSalesData';
import { useDiscountMetrics } from '@/hooks/useDiscountMetrics';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';

interface DiscountFilters {
  dateRange: [Date | undefined, Date | undefined];
  locations: string[];
  categories: string[];
  discountTypes: string[];
  minDiscountAmount: number;
  maxDiscountAmount: number;
}

const DiscountsPromotionsContent = () => {
  const { data: salesData = [], loading, error } = useSalesData();
  const { filters: globalFilters } = useGlobalFilters();

  // Get previous month's first and last dates as default
  const getPreviousMonthRange = (): [Date, Date] => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    return [firstDay, lastDay];
  };

  const [filters, setFilters] = useState<DiscountFilters>({
    dateRange: getPreviousMonthRange(),
    locations: [],
    categories: [],
    discountTypes: [],
    minDiscountAmount: 0,
    maxDiscountAmount: 10000
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter data based on current filters + global filters
  const filteredData = useMemo(() => {
    if (!salesData?.length) return [];

    return salesData.filter(item => {
      // Only include items with discounts
      if (!item.discountAmount || item.discountAmount <= 0) return false;

      // Date range filter - use local filter primarily, fallback to global
      const effectiveDateRange = (filters.dateRange[0] && filters.dateRange[1]) 
        ? filters.dateRange 
        : [new Date(globalFilters.dateRange.start), new Date(globalFilters.dateRange.end)];
      
      if (effectiveDateRange[0] && effectiveDateRange[1]) {
        const itemDate = new Date(item.paymentDate);
        if (itemDate < effectiveDateRange[0] || itemDate > effectiveDateRange[1]) {
          return false;
        }
      }

      // Location filter - combine local and global filters
      const effectiveLocations = filters.locations.length > 0 
        ? filters.locations 
        : globalFilters.location;
      if (effectiveLocations.length > 0 && !effectiveLocations.includes(item.calculatedLocation || '')) {
        return false;
      }

      // Category filter - combine local and global filters
      const effectiveCategories = filters.categories.length > 0 
        ? filters.categories 
        : globalFilters.category;
      if (effectiveCategories.length > 0 && !effectiveCategories.includes(item.cleanedCategory || '')) {
        return false;
      }

      // Discount amount range filter
      if (item.discountAmount < filters.minDiscountAmount || item.discountAmount > filters.maxDiscountAmount) {
        return false;
      }

      return true;
    });
  }, [salesData, filters, globalFilters]);

  // Get discount metrics using the hook
  const discountMetrics = useDiscountMetrics(filteredData);

  // For temporal analysis, we want to show historical data but still respect date filters
  // This allows comparing filtered periods across time
  const temporalData = useMemo(() => {
    let baseData = salesData.filter(item => item.discountAmount && item.discountAmount > 0);
    
    // Apply location and category filters to temporal data as well
    if (filters.locations && filters.locations.length > 0) {
      baseData = baseData.filter(item => filters.locations.includes(item.calculatedLocation || ''));
    }
    
    if (filters.categories && filters.categories.length > 0) {
      baseData = baseData.filter(item => filters.categories.includes(item.cleanedCategory || ''));
    }
    
    // Apply discount amount range filter
    baseData = baseData.filter(item => 
      (item.discountAmount || 0) >= filters.minDiscountAmount && 
      (item.discountAmount || 0) <= filters.maxDiscountAmount
    );
    
    return baseData;
  }, [salesData, filters.locations, filters.categories, filters.minDiscountAmount, filters.maxDiscountAmount]);

  // Calculate hero stats
  const heroStats = useMemo(() => {
    const totalDiscountAmount = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const discountedTransactions = filteredData.length;
    const totalTransactions = salesData.length;
    const penetrationRate = totalTransactions > 0 ? (discountedTransactions / totalTransactions) * 100 : 0;

    return [
      {
        value: formatCurrency(totalDiscountAmount),
        label: 'Total Discounts Given',
        icon: DollarSign
      },
      {
        value: formatNumber(discountedTransactions),
        label: 'Discounted Transactions',
        icon: BarChart3
      },
      {
        value: `${penetrationRate.toFixed(1)}%`,
        label: 'Discount Penetration Rate',
        icon: Percent
      }
    ];
  }, [filteredData, salesData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading discount data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <ModernHeroSection
        title="Discounts & Promotions Analytics"
        subtitle="Comprehensive Discount Performance Analysis"
        description="Deep dive into discount usage patterns, revenue impact, and promotional effectiveness across all channels and categories."
        badgeText="Discount Intelligence"
        badgeIcon={Percent}
        gradient="orange"
        stats={heroStats}
      />

      <div className="p-6 space-y-6">
        {/* Filter Section */}
        <DiscountFilterSection
          data={salesData}
          onFiltersChange={setFilters}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue Impact
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Temporal Analysis
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DiscountOverview metrics={discountMetrics} salesData={filteredData} />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <DiscountRevenueAnalysis data={filteredData} allData={salesData} />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <div className="space-y-6">
              <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Calendar className="w-5 h-5" />
                     Temporal Analysis - Historical Trends
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                     Historical trends with location, category, and discount range filters applied
                   </p>
                 </CardHeader>
              </Card>
              
              <div className="space-y-6">
                <DiscountMonthOnMonthTable data={temporalData} />
                <DiscountYearOnYearTable data={temporalData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DiscountAnalyticsCharts data={filteredData} metrics={discountMetrics} />
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6">
            <DiscountTopBottomLists data={filteredData} />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DiscountDataTable data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const DiscountsPromotions = () => {
  return (
    <GlobalFiltersProvider>
      <DiscountsPromotionsContent />
    </GlobalFiltersProvider>
  );
};

export default DiscountsPromotions;
