
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Target, Activity, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface ExecutiveChartsGridProps {
  data: {
    sales: any[];
    sessions: any[];
    payroll: any[];
    newClients: any[];
    leads: any[];
  };
  showTrends?: boolean;
}

export const ExecutiveChartsGrid: React.FC<ExecutiveChartsGridProps> = ({ data, showTrends = false }) => {
  // Process real data for charts
  const revenueData = useMemo(() => {
    const daily = data.sales.reduce((acc, sale) => {
      const date = new Date(sale.paymentDate).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, transactions: 0 };
      }
      acc[date].revenue += sale.paymentValue || 0;
      acc[date].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(daily).slice(0, 7); // Last 7 days
  }, [data.sales]);

  const conversionData = useMemo(() => {
    const sources = data.leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = { source, leads: 0, conversions: 0, rate: 0 };
      }
      acc[source].leads += 1;
      if (lead.conversionStatus === 'Converted') {
        acc[source].conversions += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(sources).map((s: any) => ({
      ...s,
      rate: s.leads > 0 ? (s.conversions / s.leads) * 100 : 0
    }));
  }, [data.leads]);

  const sessionTypeData = useMemo(() => {
    const types = data.sessions.reduce((acc, session) => {
      const type = session.cleanedClass || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
    
    return Object.entries(types).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [data.sessions]);

  const trainerPerformance = useMemo(() => {
    return data.payroll
      .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
      .slice(0, 5)
      .map(trainer => ({
        trainer: trainer.teacherName || 'Unknown',
        revenue: trainer.totalPaid || 0,
        sessions: trainer.totalSessions || 0,
        customers: trainer.totalCustomers || 0
      }));
  }, [data.payroll]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {showTrends ? 'Performance Trends' : 'Business Analytics Charts'}
        </h2>
        <p className="text-slate-600">Visual insights from previous month's real data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Revenue Trend
              <Badge className="bg-white/20 text-white">Last 7 Days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  name="Transactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion by Source */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Lead Conversion by Source
              <Badge className="bg-white/20 text-white">{data.leads.length} leads</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#94A3B8" name="Total Leads" />
                <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Type Distribution */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Class Type Distribution
              <Badge className="bg-white/20 text-white">{data.sessions.length} sessions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Trainer Performance */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Trainer Revenue
              <Badge className="bg-white/20 text-white">Top 5</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trainer" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => 
                  name === 'revenue' ? formatCurrency(value) : value
                } />
                <Legend />
                <Bar dataKey="revenue" fill="#F59E0B" name="Revenue ($)" />
                <Bar dataKey="sessions" fill="#8B5CF6" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
