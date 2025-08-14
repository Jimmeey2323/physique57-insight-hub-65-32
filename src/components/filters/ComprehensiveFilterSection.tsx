
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';

interface ComprehensiveFilterSectionProps {
  availableLocations: string[];
  availableCategories?: string[];
  availableProducts?: string[];
  availableSoldBy?: string[];
  availablePaymentMethods?: string[];
  showAdvancedFilters?: boolean;
}

export const ComprehensiveFilterSection: React.FC<ComprehensiveFilterSectionProps> = ({
  availableLocations,
  availableCategories = [],
  availableProducts = [],
  availableSoldBy = [],
  availablePaymentMethods = [],
  showAdvancedFilters = false
}) => {
  const { filters, updateFilters, clearFilters, resetToDefaultDates } = useGlobalFilters();

  const handleLocationChange = (location: string) => {
    const currentLocations = filters.location || [];
    const updatedLocations = currentLocations.includes(location)
      ? currentLocations.filter(l => l !== location)
      : [...currentLocations, location];
    updateFilters({ location: updatedLocations });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilters({ [key]: updatedValues });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location?.length) count += filters.location.length;
    if (filters.category?.length) count += filters.category.length;
    if (filters.product?.length) count += filters.product.length;
    if (filters.soldBy?.length) count += filters.soldBy.length;
    if (filters.paymentMethod?.length) count += filters.paymentMethod.length;
    return count;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Comprehensive Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date Range</label>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !filters.dateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.start ? format(new Date(filters.dateRange.start), "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                  onSelect={(date) => date && updateFilters({ 
                    dateRange: { ...filters.dateRange, start: date.toISOString().split('T')[0] }
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !filters.dateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.end ? format(new Date(filters.dateRange.end), "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                  onSelect={(date) => date && updateFilters({ 
                    dateRange: { ...filters.dateRange, end: date.toISOString().split('T')[0] }
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              onClick={resetToDefaultDates}
              className="px-3"
            >
              Reset to Previous Month
            </Button>
          </div>
        </div>

        {/* Location Tabs */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Locations</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!filters.location?.length ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ location: [] })}
              className="h-8"
            >
              All Locations
            </Button>
            {availableLocations.map((location) => (
              <Button
                key={location}
                variant={filters.location?.includes(location) ? "default" : "outline"}
                size="sm"
                onClick={() => handleLocationChange(location)}
                className="h-8"
              >
                {location}
                {filters.location?.includes(location) && (
                  <X 
                    className="ml-2 h-3 w-3" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationChange(location);
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Categories</label>
                <Select onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.category?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.category.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => handleFilterChange('category', cat)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {availableProducts.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Products</label>
                <Select onValueChange={(value) => handleFilterChange('product', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableProducts.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.product?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.product.map((prod) => (
                      <Badge key={prod} variant="secondary" className="text-xs">
                        {prod}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => handleFilterChange('product', prod)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {availablePaymentMethods.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Methods</label>
                <Select onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availablePaymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.paymentMethod?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.paymentMethod.map((method) => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => handleFilterChange('paymentMethod', method)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {availableSoldBy.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Sold By</label>
                <Select onValueChange={(value) => handleFilterChange('soldBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableSoldBy.map((seller) => (
                      <SelectItem key={seller} value={seller}>
                        {seller}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.soldBy?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.soldBy.map((seller) => (
                      <Badge key={seller} variant="secondary" className="text-xs">
                        {seller}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => handleFilterChange('soldBy', seller)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-600">
            {getActiveFiltersCount() > 0 && `${getActiveFiltersCount()} filter(s) applied`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
