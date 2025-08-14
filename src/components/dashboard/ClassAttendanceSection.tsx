
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, AlertTriangle, Users, Target, Filter, MapPin, Building2, Home, Calendar } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { LateCancellationFilterSection } from './LateCancellationFilterSection';
import { LateCancellationAnalytics } from './LateCancellationAnalytics';
import { LateCancellationCharts } from './LateCancellationCharts';
import { LateCancellationDataTable } from './LateCancellationDataTable';
import { FloatingNoteIcon } from '@/components/ui/FloatingNoteIcon';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ClassAttendanceSection: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState<{
    dateRange: DateRange | undefined;
    trainers: string[];
    classes: string[];
    locations: string[];
    timeSlots: string[];
  }>({
    dateRange: undefined,
    trainers: [],
    classes: [],
    locations: [],
    timeSlots: []
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;

    // Apply location filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.location === activeLocation);
    }

    // Apply advanced filters
    if (filters.dateRange?.from) {
      filtered = filtered.filter(item => new Date(item.date) >= filters.dateRange!.from!);
    }
    if (filters.dateRange?.to) {
      filtered = filtered.filter(item => new Date(item.date) <= filters.dateRange!.to!);
    }
    if (filters.trainers.length > 0) {
      filtered = filtered.filter(item => filters.trainers.includes(item.trainerName));
    }
    if (filters.classes.length > 0) {
      filtered = filtered.filter(item => filters.classes.includes(item.cleanedClass));
    }
    if (filters.locations.length > 0) {
      filtered = filtered.filter(item => filters.locations.includes(item.location));
    }
    if (filters.timeSlots.length > 0) {
      filtered = filtered.filter(item => filters.timeSlots.includes(item.time));
    }

    return filtered;
  }, [data, activeLocation, filters]);

  const lateCancellationSummary = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return {
      totalSessions: 0,
      totalLateCancellations: 0,
      cancellationRate: 0,
      impactedCapacity: 0
    };

    const lateCancellations = filteredData.filter(session => {
      const hasLateCancellation = 
        session.attendanceStatus?.toLowerCase().includes('cancelled') ||
        session.attendanceStatus?.toLowerCase().includes('late') ||
        session.bookingStatus?.toLowerCase().includes('cancelled') ||
        session.bookingStatus?.toLowerCase().includes('late') ||
        (session.checkedIn === false && session.booked === true);
      
      return hasLateCancellation;
    });

    const totalSessions = filteredData.length;
    const totalLateCancellations = lateCancellations.length;
    const cancellationRate = totalSessions > 0 ? (totalLateCancellations / totalSessions) * 100 : 0;
    const impactedCapacity = lateCancellations.reduce((sum, session) => 
      sum + (session.bookedCount - session.checkedInCount), 0
    );

    return {
      totalSessions,
      totalLateCancellations,
      cancellationRate,
      impactedCapacity
    };
  }, [filteredData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-slate-600">Loading late cancellation data...</p>
      </div>
    </div>;
  }

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-slate-600">No session data available for late cancellation analysis</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <FloatingNoteIcon tabId="late-cancellations" />
      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-600">{lateCancellationSummary.totalSessions}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late Cancellations</p>
                  <p className="text-3xl font-bold text-red-600">{lateCancellationSummary.totalLateCancellations}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancellation Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{lateCancellationSummary.cancellationRate.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lost Attendance</p>
                  <p className="text-3xl font-bold text-purple-600">{lateCancellationSummary.impactedCapacity}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-3xl overflow-hidden">
              {locations.map(location => 
                <TabsTrigger key={location.id} value={location.id} className="relative rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <div className="text-center">
                      <div className="font-bold">{location.name.split(',')[0]}</div>
                      {location.name.includes(',') && <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>}
                    </div>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {locations.map(location => 
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Collapsible Filters */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Filter className="w-5 h-5 text-red-600" />
                          Late Cancellation Filters
                        </CardTitle>
                        {isFilterExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <LateCancellationFilterSection 
                        data={filteredData}
                        filters={filters}
                        onFiltersChange={setFilters}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Analytics Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <LateCancellationAnalytics data={filteredData} />
              </div>

              {/* Charts Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden p-6">
                <LateCancellationCharts data={filteredData} />
              </div>

              {/* Data Table Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <LateCancellationDataTable data={filteredData} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
