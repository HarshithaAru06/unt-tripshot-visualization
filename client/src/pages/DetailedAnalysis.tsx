import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'wouter';
import { ArrowLeft, TrendingUp, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';

interface DetailedData {
  monthly_overview: Array<{month: string; total_rides: number; rides_per_active_day: number; avg_wait_time: number}>;
  hourly_rides: Array<{hour: number; total_rides: number}>;
  hourly_wait: Array<{hour: number; avg_wait: number}>;
  weekday_weekend: Array<{type: string; avg_wait: number; median_wait: number; std_wait: number}>;
  phase_hourly: Array<{phase: string; hour: number; total_rides: number}>;
  phase_wait: Array<{phase: string; avg_wait: number}>;
  top_pickup: Array<{stop: string; total_rides: number}>;
  top_dropoff: Array<{stop: string; total_rides: number}>;
  stop_wait: Array<{stop: string; avg_wait: number; ride_count: number}>;
  od_matrix: Array<{pickup: string; dropoff: string; rides: number}>;
  cumulative_wait: Array<{wait_minutes: number; cumulative_pct: number}>;
  wait_vs_ride: Array<{Wait_Minutes: number; Ride_Minutes: number; Hour: number; Month: string}>;
  pooled_distribution: Array<{pooled_count: number; total_trips: number}>;
  pooled_wait: Array<{pooled_count: number; avg_wait: number}>;
  driver_workload: Array<{driver_id: string; total_rides: number}>;
  vehicle_usage: Array<{vehicle: string; total_rides: number}>;
  cancel_by_month: Array<{month: string; cancel_rate: number}>;
  cancel_by_hour: Array<{hour: number; cancel_rate: number}>;
  cancel_by_stop: Array<{stop: string; cancel_rate: number}>;
  booking_method: Array<{method: string; total_rides: number}>;
  booking_by_month: Array<{Month: string; Booking_Method: string; total_rides: number}>;
  booking_by_hour: Array<{Hour: number; Booking_Method: string; total_rides: number}>;
}

const COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899'
};

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

export default function DetailedAnalysis() {
  const [data, setData] = useState<DetailedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/detailed_analysis_data.json')
      .then(res => res.json())
      .then(jsonData => {
        // Transform hourly data to use formatted hour labels to preserve order
        const transformHourlyData = (hourlyArray: Array<{hour?: number; Hour?: number; [key: string]: any}>) => {
          return hourlyArray.map(item => ({
            ...item,
            hourLabel: formatHour(item.hour || item.Hour || 0)
          }));
        };
        
        const transformedData = {
          ...jsonData,
          hourly_rides: transformHourlyData(jsonData.hourly_rides || []),
          hourly_wait: transformHourlyData(jsonData.hourly_wait || []),
          phase_hourly: transformHourlyData(jsonData.phase_hourly || []),
          cancel_by_hour: transformHourlyData(jsonData.cancel_by_hour || []),
          booking_by_hour: transformHourlyData(jsonData.booking_by_hour || [])
        };
        
        setData(transformedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading detailed analysis data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading detailed analysis...</div>
      </div>
    );
  }

  // Process booking by month for stacked bar
  const bookingByMonthStacked = data.booking_by_month.reduce((acc, item) => {
    const existing = acc.find(x => x.month === item.Month);
    if (existing) {
      existing[item.Booking_Method] = item.total_rides;
    } else {
      acc.push({
        month: item.Month,
        [item.Booking_Method]: item.total_rides
      });
    }
    return acc;
  }, [] as any[]);

  // Process booking by hour for grouped bar
  const bookingByHourGrouped = data.booking_by_hour.reduce((acc, item) => {
    const existing = acc.find(x => x.hour === item.Hour);
    if (existing) {
      existing[item.Booking_Method] = item.total_rides;
    } else {
      acc.push({
        hour: item.Hour,
        [item.Booking_Method]: item.total_rides
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Background shuttle image */}
      <div 
        className="fixed inset-0 opacity-5 bg-cover bg-center"
        style={{ backgroundImage: 'url(/tripshot_assets/j8m1cj8c.png)' }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/tripshot_assets/j8m1cj8c.png" alt="UNT" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-white">Detailed Analysis Dashboard</h1>
                <p className="text-sm text-gray-300">Comprehensive 30+ Visualization Suite</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/insights">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Deep Insights
                </button>
              </Link>
              <Link href="/analytics">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Analytics
                </button>
              </Link>
              <Link href="/">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Map
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Section 1: Big Overview */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              1. Big Picture Overview
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Rides */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Total Rides by Month</CardTitle>
                  <CardDescription className="text-gray-300">Vertical Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.monthly_overview}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rides per Active Day */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Rides per Active Day</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart showing daily average</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.monthly_overview}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="rides_per_active_day" stroke={COLORS.cyan} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Average Wait Time by Month */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Average Wait Time by Month</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart (minutes)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.monthly_overview}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="avg_wait_time" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Time Patterns */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-8 h-8" />
              2. Time Patterns
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Rides */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Total Rides by Hour</CardTitle>
                  <CardDescription className="text-gray-300">Vertical Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.hourly_rides}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hourLabel" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                      <Bar dataKey="total_rides" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Hourly Wait Time */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Average Wait Time by Hour</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart (minutes)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.hourly_wait}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hourLabel" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                      <Line type="monotone" dataKey="avg_wait" stroke={COLORS.pink} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekday vs Weekend */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Weekday vs Weekend Wait Times</CardTitle>
                  <CardDescription className="text-gray-300">Grouped Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.weekday_weekend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="type" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="avg_wait" fill={COLORS.primary} name="Average" />
                      <Bar dataKey="median_wait" fill={COLORS.cyan} name="Median" />
                      <Bar dataKey="std_wait" fill={COLORS.accent} name="Std Dev" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Schedule Change (Spring vs Fall) */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">3. Schedule Change Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phase Hourly Distribution */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Rides by Hour: Spring (7PM-2AM) vs Fall (9PM-2AM)</CardTitle>
                  <CardDescription className="text-gray-300">Grouped Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.phase_hourly.reduce((acc, item) => {
                      const existing = acc.find(x => x.hour === item.hour);
                      if (existing) {
                        existing[item.phase] = item.total_rides;
                      } else {
                        acc.push({ hour: item.hour, [item.phase]: item.total_rides });
                      }
                      return acc;
                    }, [] as any[])}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hourLabel" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                      <Legend />
                      <Bar dataKey="Spring (7PM-2AM)" fill={COLORS.primary} />
                      <Bar dataKey="Fall (9PM-2AM)" fill={COLORS.purple} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Phase Wait Time Comparison */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Wait Time: Spring vs Fall</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.phase_wait} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="phase" type="category" stroke="#fff" width={150} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="avg_wait" fill={COLORS.cyan} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Locations & Stops */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              4. Locations & Stops Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pickup Stops */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Top 10 Pickup Stops</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.top_pickup} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Dropoff Stops */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Top 10 Dropoff Stops</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.top_dropoff} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stops with Highest Wait Times */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Stops with Longest Wait Times</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart (min 50 rides)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.stop_wait} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="avg_wait" fill={COLORS.danger} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5: Rider Experience */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-8 h-8" />
              5. Rider Experience
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cumulative Wait Time Distribution */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cumulative Wait Time Distribution</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart showing % of rides</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.cumulative_wait}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="wait_minutes" stroke="#fff" label={{ value: 'Wait Time (min)', position: 'insideBottom', offset: -5, fill: '#fff' }} />
                      <YAxis stroke="#fff" label={{ value: '% of Rides', angle: -90, position: 'insideLeft', fill: '#fff' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="cumulative_pct" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Wait vs Ride Duration Scatter */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Wait Time vs Ride Duration</CardTitle>
                  <CardDescription className="text-gray-300">Scatter Plot (1000 sample points)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="Wait_Minutes" stroke="#fff" label={{ value: 'Wait (min)', position: 'insideBottom', offset: -5, fill: '#fff' }} />
                      <YAxis dataKey="Ride_Minutes" stroke="#fff" label={{ value: 'Ride (min)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={data.wait_vs_ride} fill={COLORS.purple} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 6: Operations & Pooling */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">6. Operations & Pooling</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pooled Rides Distribution */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Pooled Rides Distribution</CardTitle>
                  <CardDescription className="text-gray-300">Vertical Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.pooled_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="pooled_count" stroke="#fff" label={{ value: '# Pooled Rides', position: 'insideBottom', offset: -5, fill: '#fff' }} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_trips" fill={COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pooling vs Wait Time */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Wait Time by Pooling Level</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.pooled_wait}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="pooled_count" stroke="#fff" label={{ value: '# Pooled Rides', position: 'insideBottom', offset: -5, fill: '#fff' }} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="avg_wait" stroke={COLORS.pink} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Driver Workload */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Driver Workload (Top 15)</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart (Privacy Protected)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.driver_workload} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="driver_id" type="category" stroke="#fff" width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Vehicle Usage */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Vehicle Fleet Usage</CardTitle>
                  <CardDescription className="text-gray-300">Vertical Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.vehicle_usage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="vehicle" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 7: Cancellations */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8" />
              7. Cancellation Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cancellation Rate by Month */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cancellation Rate by Month</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart (%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.cancel_by_month}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="cancel_rate" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cancellation Rate by Hour */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cancellation Rate by Hour</CardTitle>
                  <CardDescription className="text-gray-300">Line Chart (%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.cancel_by_hour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hourLabel" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                      <Line type="monotone" dataKey="cancel_rate" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cancellation Rate by Stop */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Stops with Highest Cancellation Rates</CardTitle>
                  <CardDescription className="text-gray-300">Horizontal Bar Chart (min 30 rides)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.cancel_by_stop} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis type="number" stroke="#fff" />
                      <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="cancel_rate" fill={COLORS.danger} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 8: Booking Method (TripShot vs Dispatch Call) */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">8. Booking Method: TripShot vs Dispatch Call</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Booking Method Split */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Overall Booking Method Split</CardTitle>
                  <CardDescription className="text-gray-300">Vertical Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.booking_method}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="method" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="total_rides" fill={COLORS.primary}>
                        {data.booking_method.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.method === 'TripShot' ? COLORS.primary : COLORS.accent} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Booking Method by Month (Stacked Bar) */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Booking Method by Month</CardTitle>
                  <CardDescription className="text-gray-300">Stacked Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingByMonthStacked}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#fff" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="TripShot" stackId="a" fill={COLORS.primary} />
                      <Bar dataKey="Dispatch Call" stackId="a" fill={COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Booking Method by Hour (Grouped Bar) */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Booking Method by Hour</CardTitle>
                  <CardDescription className="text-gray-300">Grouped Bar Chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={bookingByHourGrouped}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hourLabel" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                      <Legend />
                      <Bar dataKey="TripShot" fill={COLORS.primary} />
                      <Bar dataKey="Dispatch Call" fill={COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-300">
              <span className="font-semibold text-white">Harshitha Arugonda</span> - Comprehensive Data Analysis
            </p>
            <p className="text-sm text-gray-400 mt-2">
              UNT TripShot Night Flight Visualization | React 19, Recharts, Tailwind CSS 4
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
