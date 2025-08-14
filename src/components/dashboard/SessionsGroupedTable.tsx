
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { SessionData } from '@/hooks/useSessionsData';
import { Calendar, Users, TrendingUp, Clock, ArrowUpDown } from 'lucide-react';

interface SessionsGroupedTableProps {
  data: SessionData[];
}

export const SessionsGroupedTable: React.FC<SessionsGroupedTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Group sessions by different criteria
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return { byTrainer: [], byClass: [], byTime: [], byDay: [] };

    // Group by trainer
    const trainerGroups = data.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainer,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          avgFillRate: 0,
          sessions: []
        };
      }
      acc[trainer].totalSessions += 1;
      acc[trainer].totalAttendance += session.checkedInCount || 0;
      acc[trainer].totalCapacity += session.capacity || 0;
      acc[trainer].sessions.push(session);
      return acc;
    }, {} as Record<string, any>);

    const byTrainer = Object.values(trainerGroups).map((group: any) => ({
      ...group,
      avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0
    }));

    // Group by class
    const classGroups = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      if (!acc[className]) {
        acc[className] = {
          className,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          avgFillRate: 0,
          sessions: []
        };
      }
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      acc[className].sessions.push(session);
      return acc;
    }, {} as Record<string, any>);

    const byClass = Object.values(classGroups).map((group: any) => ({
      ...group,
      avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0
    }));

    // Group by time
    const timeGroups = data.reduce((acc, session) => {
      const time = session.time || 'Unknown';
      if (!acc[time]) {
        acc[time] = {
          time,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          avgFillRate: 0,
          sessions: []
        };
      }
      acc[time].totalSessions += 1;
      acc[time].totalAttendance += session.checkedInCount || 0;
      acc[time].totalCapacity += session.capacity || 0;
      acc[time].sessions.push(session);
      return acc;
    }, {} as Record<string, any>);

    const byTime = Object.values(timeGroups).map((group: any) => ({
      ...group,
      avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0
    }));

    // Group by day
    const dayGroups = data.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      if (!acc[day]) {
        acc[day] = {
          day,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          avgFillRate: 0,
          sessions: []
        };
      }
      acc[day].totalSessions += 1;
      acc[day].totalAttendance += session.checkedInCount || 0;
      acc[day].totalCapacity += session.capacity || 0;
      acc[day].sessions.push(session);
      return acc;
    }, {} as Record<string, any>);

    const byDay = Object.values(dayGroups).map((group: any) => ({
      ...group,
      avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0
    }));

    return { byTrainer, byClass, byTime, byDay };
  }, [data]);

  const handleSort = (key: string, dataArray: any[]) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    
    return [...dataArray].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
  };

  const trainerColumns = [
    {
      key: 'trainer' as keyof any,
      header: 'Trainer',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'totalSessions' as keyof any,
      header: 'Total Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-blue-50">
          {value}
        </Badge>
      )
    },
    {
      key: 'totalAttendance' as keyof any,
      header: 'Total Attendance',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'avgFillRate' as keyof any,
      header: 'Avg Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">{Math.round(value)}%</span>
        </div>
      )
    }
  ];

  const classColumns = [
    {
      key: 'className' as keyof any,
      header: 'Class Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'totalSessions' as keyof any,
      header: 'Total Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-orange-50">
          {value}
        </Badge>
      )
    },
    {
      key: 'totalAttendance' as keyof any,
      header: 'Total Attendance',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'avgFillRate' as keyof any,
      header: 'Avg Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">{Math.round(value)}%</span>
        </div>
      )
    }
  ];

  const timeColumns = [
    {
      key: 'time' as keyof any,
      header: 'Time Slot',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'totalSessions' as keyof any,
      header: 'Total Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-indigo-50">
          {value}
        </Badge>
      )
    },
    {
      key: 'totalAttendance' as keyof any,
      header: 'Total Attendance',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'avgFillRate' as keyof any,
      header: 'Avg Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">{Math.round(value)}%</span>
        </div>
      )
    }
  ];

  const dayColumns = [
    {
      key: 'day' as keyof any,
      header: 'Day of Week',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'totalSessions' as keyof any,
      header: 'Total Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-green-50">
          {value}
        </Badge>
      )
    },
    {
      key: 'totalAttendance' as keyof any,
      header: 'Total Attendance',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'avgFillRate' as keyof any,
      header: 'Avg Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">{Math.round(value)}%</span>
        </div>
      )
    }
  ];

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No session data available for grouping analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-blue-600" />
          Sessions Analysis - Grouped Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trainers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trainers">By Trainer</TabsTrigger>
            <TabsTrigger value="classes">By Class</TabsTrigger>
            <TabsTrigger value="times">By Time</TabsTrigger>
            <TabsTrigger value="days">By Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trainers" className="space-y-4">
            <OptimizedTable
              data={groupedData.byTrainer}
              columns={trainerColumns}
              maxHeight="400px"
              stickyHeader={true}
            />
          </TabsContent>
          
          <TabsContent value="classes" className="space-y-4">
            <OptimizedTable
              data={groupedData.byClass}
              columns={classColumns}
              maxHeight="400px"
              stickyHeader={true}
            />
          </TabsContent>
          
          <TabsContent value="times" className="space-y-4">
            <OptimizedTable
              data={groupedData.byTime}
              columns={timeColumns}
              maxHeight="400px"
              stickyHeader={true}
            />
          </TabsContent>
          
          <TabsContent value="days" className="space-y-4">
            <OptimizedTable
              data={groupedData.byDay}
              columns={dayColumns}
              maxHeight="400px"
              stickyHeader={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
