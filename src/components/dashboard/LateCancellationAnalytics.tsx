
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SessionData } from '@/hooks/useSessionsData';

interface LateCancellationAnalyticsProps {
  data: SessionData[];
}

export const LateCancellationAnalytics: React.FC<LateCancellationAnalyticsProps> = ({ data }) => {
  console.log('LateCancellationAnalytics received data:', data?.length || 0, 'records');

  const lateCancellationMetrics = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No data available for late cancellation analysis');
      return {
        totalLateCancellations: 0,
        lateCancellationRate: 0,
        dailyTrends: [],
        classTrends: [],
        trainerTrends: [],
        totalSessions: 0
      };
    }

    console.log('Processing late cancellation data...');
    
    // Filter for late cancellations - assuming we look for status indicators
    const lateCancellations = data.filter(session => {
      // Check various fields that might indicate late cancellation
      const hasLateCancellation = 
        session.attendanceStatus?.toLowerCase().includes('cancelled') ||
        session.attendanceStatus?.toLowerCase().includes('late') ||
        session.bookingStatus?.toLowerCase().includes('cancelled') ||
        session.bookingStatus?.toLowerCase().includes('late') ||
        (session.checkedIn === false && session.booked === true);
      
      return hasLateCancellation;
    });

    console.log('Found late cancellations:', lateCancellations.length);

    const totalSessions = data.length;
    const totalLateCancellations = lateCancellations.length;
    const lateCancellationRate = totalSessions > 0 ? (totalLateCancellations / totalSessions) * 100 : 0;

    // Daily trends
    const dailyTrends = lateCancellations.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Class trends
    const classTrends = lateCancellations.reduce((acc, session) => {
      const className = session.cleanedClass || session.className || 'Unknown';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trainer trends
    const trainerTrends = lateCancellations.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      acc[trainer] = (acc[trainer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLateCancellations,
      lateCancellationRate,
      totalSessions,
      dailyTrends: Object.entries(dailyTrends).map(([day, count]) => ({ day, count })),
      classTrends: Object.entries(classTrends)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([className, count]) => ({ className, count })),
      trainerTrends: Object.entries(trainerTrends)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trainer, count]) => ({ trainer, count }))
    };
  }, [data]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Late Cancellation Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No session data available for late cancellation analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Late Cancellation Analytics
            <Badge variant="outline" className="ml-2">
              {lateCancellationMetrics.totalLateCancellations} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Late Cancellations</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {lateCancellationMetrics.totalLateCancellations}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Cancellation Rate</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {lateCancellationMetrics.lateCancellationRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Sessions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {lateCancellationMetrics.totalSessions}
              </div>
            </div>
          </div>

          {/* Charts */}
          {lateCancellationMetrics.totalLateCancellations > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Trends */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Late Cancellations by Day</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={lateCancellationMetrics.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Class Trends */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Top Classes with Late Cancellations</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={lateCancellationMetrics.classTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-semibold">Great News!</p>
                <p className="text-sm">No late cancellations detected in the current data</p>
              </div>
            </div>
          )}

          {/* Trainer Impact */}
          {lateCancellationMetrics.trainerTrends.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Trainers with Most Late Cancellations</h4>
              <div className="space-y-2">
                {lateCancellationMetrics.trainerTrends.map((trainer, index) => (
                  <div key={trainer.trainer} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{trainer.trainer}</span>
                    <Badge variant="destructive">{trainer.count} cancellations</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
