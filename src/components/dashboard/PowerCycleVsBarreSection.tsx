
import React, { useState, useMemo } from 'react';
import { useSessionsData } from '@/hooks/useSessionsData';
import { PowerCycleVsBarreFilterSection } from './PowerCycleVsBarreFilterSection';
import { PowerCycleVsBarreComparison } from './PowerCycleVsBarreComparison';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTopBottomListsWrapper } from './PowerCycleVsBarreTopBottomListsWrapper';
import { DrillDownModal } from './DrillDownModal';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';
import { SessionData as DashboardSessionData } from '@/types/dashboard';

export const PowerCycleVsBarreSection: React.FC = () => {
  const { data, loading, error } = useSessionsData();
  const { setLoading } = useGlobalLoading();
  const { filters } = useSessionsFilters();
  
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    data: null as any,
    type: 'metric' as any
  });

  React.useEffect(() => {
    setLoading(loading, 'Loading PowerCycle vs Barre data...');
  }, [loading, setLoading]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    let result = [...data];

    try {
      // Apply date filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;
        
        result = result.filter(session => {
          if (!session.date) return false;
          const sessionDate = new Date(session.date);
          if (isNaN(sessionDate.getTime())) return false;
          if (startDate && sessionDate < startDate) return false;
          if (endDate && sessionDate > endDate) return false;
          return true;
        });
      }

      // Apply trainers filter
      if (filters.trainers && filters.trainers.length > 0) {
        result = result.filter(session => 
          session.trainerName && filters.trainers.includes(session.trainerName)
        );
      }

      // Apply class types filter
      if (filters.classTypes && filters.classTypes.length > 0) {
        result = result.filter(session => 
          session.cleanedClass && filters.classTypes.includes(session.cleanedClass)
        );
      }

      // Apply day of week filter
      if (filters.dayOfWeek && filters.dayOfWeek.length > 0) {
        result = result.filter(session => 
          session.dayOfWeek && filters.dayOfWeek.includes(session.dayOfWeek)
        );
      }

      // Apply time slots filter
      if (filters.timeSlots && filters.timeSlots.length > 0) {
        result = result.filter(session => 
          session.time && filters.timeSlots.includes(session.time)
        );
      }

      return result;
    } catch (err) {
      console.error('Error filtering data:', err);
      return [];
    }
  }, [data, filters]);

  // Convert hook SessionData to dashboard SessionData format
  const convertToDashboardFormat = (sessions: typeof data): DashboardSessionData[] => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.map(session => {
      try {
        return {
          sessionId: session.sessionId || '',
          date: session.date || '',
          time: session.time || '',
          classType: session.sessionName || '',
          cleanedClass: session.cleanedClass || '',
          instructor: session.trainerName || '',
          location: session.location || '',
          capacity: session.capacity || 0,
          booked: session.bookedCount || 0,
          checkedIn: session.checkedInCount || 0,
          checkedInCount: session.checkedInCount || 0,
          waitlisted: 0,
          waitlist: 0,
          noShows: Math.max(0, (session.bookedCount || 0) - (session.checkedInCount || 0)),
          fillPercentage: session.fillPercentage || 0,
          sessionCount: 1,
          totalAttendees: session.checkedInCount || 0
        };
      } catch (err) {
        console.error('Error converting session:', session, err);
        return {
          sessionId: '',
          date: '',
          time: '',
          classType: '',
          cleanedClass: '',
          instructor: '',
          location: '',
          capacity: 0,
          booked: 0,
          checkedIn: 0,
          checkedInCount: 0,
          waitlisted: 0,
          waitlist: 0,
          noShows: 0,
          fillPercentage: 0,
          sessionCount: 1,
          totalAttendees: 0
        };
      }
    });
  };

  const powerCycleData = useMemo(() => {
    try {
      const filtered = filteredData.filter(session => {
        const className = (session.cleanedClass || '').toLowerCase();
        return className.includes('powercycle') || 
               className.includes('power cycle') ||
               className.includes('cycle');
      });
      console.log('PowerCycle data filtered:', filtered.length, 'sessions');
      return convertToDashboardFormat(filtered);
    } catch (err) {
      console.error('Error processing PowerCycle data:', err);
      return [];
    }
  }, [filteredData]);

  const barreData = useMemo(() => {
    try {
      const filtered = filteredData.filter(session => {
        const className = (session.cleanedClass || '').toLowerCase();
        return className.includes('barre');
      });
      console.log('Barre data filtered:', filtered.length, 'sessions');
      return convertToDashboardFormat(filtered);
    } catch (err) {
      console.error('Error processing Barre data:', err);
      return [];
    }
  }, [filteredData]);

  // Calculate metrics for PowerCycle
  const powerCycleMetrics = useMemo(() => {
    try {
      const totalSessions = powerCycleData.length;
      const totalAttendance = powerCycleData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
      const totalCapacity = powerCycleData.reduce((sum, session) => sum + (session.capacity || 0), 0);
      const totalBookings = powerCycleData.reduce((sum, session) => sum + (session.booked || 0), 0);
      const emptySessions = powerCycleData.filter(session => (session.checkedInCount || 0) === 0).length;
      const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
      const avgSessionSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;
      const nonEmptySessions = totalSessions - emptySessions;
      const avgSessionSizeExclEmpty = nonEmptySessions > 0 ? totalAttendance / nonEmptySessions : 0;
      const noShows = Math.max(0, totalBookings - totalAttendance);

      return {
        totalSessions,
        totalAttendance,
        totalCapacity,
        totalBookings,
        emptySessions,
        avgFillRate,
        avgSessionSize,
        avgSessionSizeExclEmpty,
        noShows
      };
    } catch (err) {
      console.error('Error calculating PowerCycle metrics:', err);
      return {
        totalSessions: 0,
        totalAttendance: 0,
        totalCapacity: 0,
        totalBookings: 0,
        emptySessions: 0,
        avgFillRate: 0,
        avgSessionSize: 0,
        avgSessionSizeExclEmpty: 0,
        noShows: 0
      };
    }
  }, [powerCycleData]);

  // Calculate metrics for Barre
  const barreMetrics = useMemo(() => {
    try {
      const totalSessions = barreData.length;
      const totalAttendance = barreData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
      const totalCapacity = barreData.reduce((sum, session) => sum + (session.capacity || 0), 0);
      const totalBookings = barreData.reduce((sum, session) => sum + (session.booked || 0), 0);
      const emptySessions = barreData.filter(session => (session.checkedInCount || 0) === 0).length;
      const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
      const avgSessionSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;
      const nonEmptySessions = totalSessions - emptySessions;
      const avgSessionSizeExclEmpty = nonEmptySessions > 0 ? totalAttendance / nonEmptySessions : 0;
      const noShows = Math.max(0, totalBookings - totalAttendance);

      return {
        totalSessions,
        totalAttendance,
        totalCapacity,
        totalBookings,
        emptySessions,
        avgFillRate,
        avgSessionSize,
        avgSessionSizeExclEmpty,
        noShows
      };
    } catch (err) {
      console.error('Error calculating Barre metrics:', err);
      return {
        totalSessions: 0,
        totalAttendance: 0,
        totalCapacity: 0,
        totalBookings: 0,
        emptySessions: 0,
        avgFillRate: 0,
        avgSessionSize: 0,
        avgSessionSizeExclEmpty: 0,
        noShows: 0
      };
    }
  }, [barreData]);

  const handleDrillDown = (item: any) => {
    setDrillDownModal({
      isOpen: true,
      data: item,
      type: 'metric'
    });
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading PowerCycle vs Barre analysis..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-600 p-8">
        <p>No session data available</p>
      </div>
    );
  }

  console.log('PowerCycle vs Barre Section - PowerCycle:', powerCycleData.length, 'Barre:', barreData.length);

  return (
    <div className="space-y-6">
      <PowerCycleVsBarreFilterSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerCycleVsBarreComparison 
          powerCycleMetrics={powerCycleMetrics}
          barreMetrics={barreMetrics}
          onItemClick={handleDrillDown}
        />
        <PowerCycleVsBarreCharts 
          powerCycleData={powerCycleData}
          barreData={barreData}
        />
      </div>

      <PowerCycleVsBarreTopBottomListsWrapper 
        powerCycleData={powerCycleData}
        barreData={barreData}
      />

      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({
          isOpen: false,
          data: null,
          type: 'metric'
        })}
        data={drillDownModal.data}
        type={drillDownModal.type}
      />
    </div>
  );
};
