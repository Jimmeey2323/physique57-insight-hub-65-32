
import { useMemo } from 'react';
import { SessionData } from '@/hooks/useSessionsData';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';

export const useFilteredSessionsData = (data: SessionData[]) => {
  const { filters } = useSessionsFilters();

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(session => {
      // Basic exclusions (existing logic)
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasExcludedKeyword || session.checkedInCount < 2) {
        return false;
      }

      // Apply global filters
      if (filters.trainers.length > 0 && !filters.trainers.includes(session.trainerName)) {
        return false;
      }

      if (filters.classTypes.length > 0 && !filters.classTypes.includes(session.cleanedClass)) {
        return false;
      }

      if (filters.dayOfWeek.length > 0 && !filters.dayOfWeek.includes(session.dayOfWeek)) {
        return false;
      }

      if (filters.timeSlots.length > 0 && !filters.timeSlots.includes(session.time)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        if (!session.date) return false;
        
        // Handle different date formats and ensure proper parsing
        let sessionDate: Date;
        
        // Try multiple date parsing strategies for string dates
        sessionDate = new Date(session.date);
        
        // If invalid, try parsing as DD/MM/YYYY or MM/DD/YYYY
        if (isNaN(sessionDate.getTime())) {
          const parts = session.date.split(/[/-]/);
          if (parts.length === 3) {
            // Try DD/MM/YYYY format first
            const ddmmyyyy = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (!isNaN(ddmmyyyy.getTime())) {
              sessionDate = ddmmyyyy;
            } else {
              // Try MM/DD/YYYY format
              const mmddyyyy = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
              if (!isNaN(mmddyyyy.getTime())) {
                sessionDate = mmddyyyy;
              }
            }
          }
        }
        
        // Skip if date is still invalid
        if (isNaN(sessionDate.getTime())) {
          return false;
        }
        
        // Normalize dates to midnight for comparison
        const normalizedSessionDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        
        if (filters.dateRange.start) {
          const normalizedStart = new Date(filters.dateRange.start.getFullYear(), filters.dateRange.start.getMonth(), filters.dateRange.start.getDate());
          if (normalizedSessionDate < normalizedStart) {
            return false;
          }
        }
        
        if (filters.dateRange.end) {
          const normalizedEnd = new Date(filters.dateRange.end.getFullYear(), filters.dateRange.end.getMonth(), filters.dateRange.end.getDate());
          if (normalizedSessionDate > normalizedEnd) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, filters]);

  return filteredData;
};
