
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Filter, X, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { DateRange } from 'react-day-picker';

interface LateCancellationFilterSectionProps {
  data: SessionData[];
  onFiltersChange: (filters: {
    dateRange: DateRange | undefined;
    trainers: string[];
    classes: string[];
    locations: string[];
    timeSlots: string[];
  }) => void;
  filters: {
    dateRange: DateRange | undefined;
    trainers: string[];
    classes: string[];
    locations: string[];
    timeSlots: string[];
  };
}

export const LateCancellationFilterSection: React.FC<LateCancellationFilterSectionProps> = ({
  data,
  onFiltersChange,
  filters
}) => {
  const uniqueOptions = useMemo(() => {
    if (!data) return { trainers: [], classes: [], locations: [], timeSlots: [] };
    
    return {
      trainers: [...new Set(data.map(item => item.trainerName))].filter(Boolean).sort(),
      classes: [...new Set(data.map(item => item.cleanedClass))].filter(Boolean).sort(),
      locations: [...new Set(data.map(item => item.location))].filter(Boolean).sort(),
      timeSlots: [...new Set(data.map(item => item.time))].filter(Boolean).sort()
    };
  }, [data]);

  const hasActiveFilters = filters.trainers.length > 0 || 
    filters.classes.length > 0 || 
    filters.locations.length > 0 || 
    filters.timeSlots.length > 0 ||
    filters.dateRange?.from || 
    filters.dateRange?.to;

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      trainers: [],
      classes: [],
      locations: [],
      timeSlots: []
    });
  };

  const updateFilter = (key: string, value: string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateDateRange = (dateRange: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-600" />
            Late Cancellation Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {[
                  filters.trainers.length,
                  filters.classes.length,
                  filters.locations.length,
                  filters.timeSlots.length,
                  filters.dateRange?.from ? 1 : 0,
                  filters.dateRange?.to ? 1 : 0
                ].filter(count => count > 0).length} active
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={updateDateRange}
            />
          </div>

          {/* Trainer Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Trainers
            </label>
            <Select
              value={filters.trainers[0] || ''}
              onValueChange={(value) => updateFilter('trainers', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trainer..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">All Trainers</SelectItem>
                {uniqueOptions.trainers.map(trainer => (
                  <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Classes</label>
            <Select
              value={filters.classes[0] || ''}
              onValueChange={(value) => updateFilter('classes', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">All Classes</SelectItem>
                {uniqueOptions.classes.map(className => (
                  <SelectItem key={className} value={className}>{className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Locations
            </label>
            <Select
              value={filters.locations[0] || ''}
              onValueChange={(value) => updateFilter('locations', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">All Locations</SelectItem>
                {uniqueOptions.locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slot Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Slots
            </label>
            <Select
              value={filters.timeSlots[0] || ''}
              onValueChange={(value) => updateFilter('timeSlots', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">All Times</SelectItem>
                {uniqueOptions.timeSlots.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
