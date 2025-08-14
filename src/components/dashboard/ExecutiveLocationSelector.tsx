
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';

interface ExecutiveLocationSelectorProps {
  locations: string[];
}

export const ExecutiveLocationSelector: React.FC<ExecutiveLocationSelectorProps> = ({ locations }) => {
  const { filters, updateFilters } = useGlobalFilters();
  const selectedLocation = Array.isArray(filters.location) ? filters.location[0] : filters.location;

  const handleLocationChange = (location: string) => {
    if (location === 'all') {
      updateFilters({ location: [] });
    } else {
      updateFilters({ location: [location] });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Location Filter
            </h3>
            <p className="text-sm text-slate-600">Select a location to filter all data</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={!selectedLocation ? "default" : "outline"}
            onClick={() => handleLocationChange('all')}
            className={`
              transition-all duration-300 hover:scale-105 px-6 py-3 rounded-full
              ${!selectedLocation 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
              }
            `}
          >
            <Building2 className="w-4 h-4 mr-2" />
            All Locations
            {!selectedLocation && (
              <Badge className="ml-2 bg-white/20 text-white border-white/30">
                Active
              </Badge>
            )}
          </Button>

          {locations.map((location) => (
            <Button
              key={location}
              variant={selectedLocation === location ? "default" : "outline"}
              onClick={() => handleLocationChange(location)}
              className={`
                transition-all duration-300 hover:scale-105 px-6 py-3 rounded-full
                ${selectedLocation === location 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
                }
              `}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {location}
              {selectedLocation === location && (
                <Badge className="ml-2 bg-white/20 text-white border-white/30">
                  Active
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
