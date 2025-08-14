import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, X, Filter, Package, CreditCard, Percent } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

interface DiscountFilterSectionProps {
  data: SalesData[];
  onFiltersChange: (filters: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Utility function to get previous month's date range
const getPreviousMonthDateRange = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const firstDay = new Date(prevYear, prevMonth, 1);
  const lastDay = new Date(prevYear, prevMonth + 1, 0);
  
  return {
    from: firstDay,
    to: lastDay
  };
};

export const DiscountFilterSection: React.FC<DiscountFilterSectionProps> = ({
  data,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [selectedSoldBy, setSelectedSoldBy] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([]);
  const [minDiscountAmount, setMinDiscountAmount] = useState<string>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(getPreviousMonthDateRange());

  // Extract unique values for filters
  const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
  const categories = Array.from(new Set(discountedData.map(item => item.cleanedCategory))).filter(Boolean).sort();
  const products = Array.from(new Set(discountedData.map(item => item.cleanedProduct))).filter(Boolean).sort();
  const soldByOptions = Array.from(new Set(discountedData.map(item => item.soldBy === '-' ? 'Online/System' : item.soldBy))).filter(Boolean).sort();
  const paymentMethods = Array.from(new Set(discountedData.map(item => item.paymentMethod))).filter(Boolean).sort();

  // Update parent component when filters change
  useEffect(() => {
    const filterData = {
      dateRange: [dateRange.from, dateRange.to],
      locations: [],
      categories: selectedCategory,
      discountTypes: [],
      minDiscountAmount: minDiscountAmount ? parseFloat(minDiscountAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : 10000
    };
    
    console.log('Discount filters changed:', filterData);
    onFiltersChange(filterData);
  }, [selectedCategory, selectedProduct, selectedSoldBy, selectedPaymentMethod, 
      minDiscountAmount, maxDiscountAmount, dateRange, onFiltersChange]);

  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedProduct([]);
    setSelectedSoldBy([]);
    setSelectedPaymentMethod([]);
    setMinDiscountAmount('');
    setMaxDiscountAmount('');
    setDateRange(getPreviousMonthDateRange());
  };

  const hasActiveFilters = selectedCategory.length > 0 || selectedProduct.length > 0 || 
    selectedSoldBy.length > 0 || selectedPaymentMethod.length > 0 ||
    minDiscountAmount || maxDiscountAmount ||
    (dateRange.from && dateRange.to);

  const handleMultiSelectChange = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    if (currentArray.includes(value)) {
      setter(currentArray.filter(item => item !== value));
    } else {
      setter([...currentArray, value]);
    }
  };

  
  if (isCollapsed) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-white via-orange-50/30 to-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-slate-700">Discount Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {[selectedCategory, selectedProduct, selectedSoldBy, selectedPaymentMethod]
                  .filter(arr => arr.length > 0).length + 
                 [minDiscountAmount, maxDiscountAmount]
                  .filter(f => f).length +
                 (dateRange.from || dateRange.to ? 1 : 0)} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-orange-600 hover:text-orange-700"
          >
            Show Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-gradient-to-br from-white via-orange-50/30 to-white border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg font-bold text-slate-800">Discount Filters & Analytics</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-600 hover:text-slate-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-orange-600 hover:text-orange-700"
              >
                Hide Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Date Range
            </label>
            <DatePickerWithRange 
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
            />
          </div>

          {/* Multi-select filters grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                Categories ({selectedCategory.length})
              </label>
              <Select value="" onValueChange={(value) => handleMultiSelectChange(value, selectedCategory, setSelectedCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory.length > 0 ? `${selectedCategory.length} selected` : "Select categories"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedCategory.includes(category)}
                          readOnly
                        />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedCategory.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                      <button onClick={() => setSelectedCategory(prev => prev.filter(c => c !== cat))} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                Products ({selectedProduct.length})
              </label>
              <Select value="" onValueChange={(value) => handleMultiSelectChange(value, selectedProduct, setSelectedProduct)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.length > 0 ? `${selectedProduct.length} selected` : "Select products"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product} value={product}>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedProduct.includes(product)}
                          readOnly
                        />
                        {product}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedProduct.map(prod => (
                    <Badge key={prod} variant="secondary" className="text-xs">
                      {prod}
                      <button onClick={() => setSelectedProduct(prev => prev.filter(p => p !== prod))} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                Sold By ({selectedSoldBy.length})
              </label>
              <Select value="" onValueChange={(value) => handleMultiSelectChange(value, selectedSoldBy, setSelectedSoldBy)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedSoldBy.length > 0 ? `${selectedSoldBy.length} selected` : "Select staff"} />
                </SelectTrigger>
                <SelectContent>
                  {soldByOptions.map((soldBy) => (
                    <SelectItem key={soldBy} value={soldBy}>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSoldBy.includes(soldBy)}
                          readOnly
                        />
                        {soldBy}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSoldBy.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSoldBy.map(staff => (
                    <Badge key={staff} variant="secondary" className="text-xs">
                      {staff}
                      <button onClick={() => setSelectedSoldBy(prev => prev.filter(s => s !== staff))} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                Payment Methods ({selectedPaymentMethod.length})
              </label>
              <Select value="" onValueChange={(value) => handleMultiSelectChange(value, selectedPaymentMethod, setSelectedPaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedPaymentMethod.length > 0 ? `${selectedPaymentMethod.length} selected` : "Select methods"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPaymentMethod.includes(method)}
                          readOnly
                        />
                        {method}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPaymentMethod.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPaymentMethod.map(method => (
                    <Badge key={method} variant="secondary" className="text-xs">
                      {method}
                      <button onClick={() => setSelectedPaymentMethod(prev => prev.filter(m => m !== method))} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Discount amount filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Min Discount Amount</label>
              <Input
                type="number"
                placeholder="₹0"
                value={minDiscountAmount}
                onChange={(e) => setMinDiscountAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Max Discount Amount</label>
              <Input
                type="number"
                placeholder="₹10000"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
