
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { SessionData } from '@/hooks/useSessionsData';
import { AlertTriangle, Users, Calendar, Clock, MapPin, User } from 'lucide-react';

interface LateCancellationDataTableProps {
  data: SessionData[];
}

export const LateCancellationDataTable: React.FC<LateCancellationDataTableProps> = ({ data }) => {
  const lateCancellationData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter for sessions with late cancellations and format for table
    const lateCancellations = data.filter(session => {
      return session.lateCancelledCount > 0;
    });

    return lateCancellations.map(session => ({
      ...session,
      cancellationType: session.lateCancelledCount > 0 ? 'Late Cancellation' : 'No Show',
      impactScore: ((session.lateCancelledCount) / session.capacity) * 100
    }));
  }, [data]);

  const columns = [
    {
      key: 'date' as keyof SessionData,
      header: 'Date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'time' as keyof SessionData,
      header: 'Time',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-600" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'cleanedClass' as keyof SessionData,
      header: 'Class',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'trainerName' as keyof SessionData,
      header: 'Trainer',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'location' as keyof SessionData,
      header: 'Location',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'lateCancelledCount' as keyof SessionData,
      header: 'Late Cancelled',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="destructive">
          {value}
        </Badge>
      )
    },
    {
      key: 'bookedCount' as keyof SessionData,
      header: 'Booked',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'checkedInCount' as keyof SessionData,
      header: 'Attended',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    }
  ];

  if (lateCancellationData.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-600" />
            Late Cancellation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-semibold text-green-600">No Late Cancellations Found!</p>
            <p className="text-sm text-gray-500">Excellent attendance performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Late Cancellation Details
          <Badge variant="destructive" className="ml-2">
            {lateCancellationData.length} sessions affected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OptimizedTable
          data={lateCancellationData}
          columns={columns}
          maxHeight="500px"
          stickyHeader={true}
        />
      </CardContent>
    </Card>
  );
};
