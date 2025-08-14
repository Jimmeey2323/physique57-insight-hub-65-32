
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { SessionData } from '@/hooks/useSessionsData';
import { TrendingDown, AlertTriangle, Calendar, Clock } from 'lucide-react';

interface LateCancellationChartsProps {
  data: SessionData[];
}

export const LateCancellationCharts: React.FC<LateCancellationChartsProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter for sessions with late cancellations
    const lateCancellations = data.filter(session => {
      return session.lateCancelledCount > 0;
    });

    console.log('Chart data - Late cancellations found:', lateCancellations.length);

    // Daily trends
    const dailyTrends = lateCancellations.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      acc[day] = (acc[day] || 0) + session.lateCancelledCount;
      return acc;
    }, {} as Record<string, number>);

    const dailyData = Object.entries(dailyTrends).map(([day, count]) => ({ 
      day, 
      count,
      percentage: ((count / lateCancellations.reduce((sum, s) => sum + s.lateCancelledCount, 0)) * 100).toFixed(1)
    }));

    // Time slot trends
    const timeSlotTrends = lateCancellations.reduce((acc, session) => {
      const time = session.time || 'Unknown';
      acc[time] = (acc[time] || 0) + session.lateCancelledCount;
      return acc;
    }, {} as Record<string, number>);

    const timeSlotData = Object.entries(timeSlotTrends)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([time, count]) => ({ 
        time, 
        count,
        percentage: ((count / lateCancellations.reduce((sum, s) => sum + s.lateCancelledCount, 0)) * 100).toFixed(1)
      }));

    // Monthly trends (simulated from dates)
    const monthlyTrends = lateCancellations.reduce((acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + session.lateCancelledCount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = Object.entries(monthlyTrends)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ 
        month: month.substring(5), // Just month part
        count,
        trend: Math.random() > 0.5 ? 'up' : 'down' // Simulated trend
      }));

    // Class type breakdown
    const classBreakdown = lateCancellations.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      acc[className] = (acc[className] || 0) + session.lateCancelledCount;
      return acc;
    }, {} as Record<string, number>);

    const classData = Object.entries(classBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([className, count]) => ({ 
        className, 
        count,
        percentage: ((count / lateCancellations.reduce((sum, s) => sum + s.lateCancelledCount, 0)) * 100).toFixed(1)
      }));

    return {
      dailyData,
      timeSlotData,
      monthlyData,
      classData,
      totalCancellations: lateCancellations.reduce((sum, s) => sum + s.lateCancelledCount, 0)
    };
  }, [data]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  if (!chartData || chartData.totalCancellations === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold text-green-600">No Late Cancellations!</p>
              <p className="text-sm text-gray-500">Great attendance performance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Trends */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            Late Cancellations by Day
            <Badge variant="destructive" className="ml-2">
              {chartData.totalCancellations} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Cancellations']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Slot Trends */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Cancellations by Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Cancellations']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            Monthly Cancellation Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Cancellations']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Class Breakdown Pie Chart */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Cancellations by Class Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.classData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ className, percentage }) => `${className}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, 'Cancellations']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
