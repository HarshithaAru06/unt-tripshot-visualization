import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

interface FilteredData {
  jan_may_hourly_rides: Array<{hour: number; total_rides: number}>;
  jan_may_hourly_wait: Array<{hour: number; avg_wait: number}>;
  jan_may_top_pickup: Array<{stop: string; total_rides: number}>;
  jan_may_top_dropoff: Array<{stop: string; total_rides: number}>;
  jan_may_cancel_by_hour: Array<{hour: number; cancel_rate: number}>;
  jan_may_booking_by_hour: Array<{Hour: number; Booking_Method: string; total_rides: number}>;
  jan_may_stats: {total_rides: number; completed_rides: number; cancelled_rides: number; avg_wait_minutes: number};
  
  aug_oct_hourly_rides: Array<{hour: number; total_rides: number}>;
  aug_oct_hourly_wait: Array<{hour: number; avg_wait: number}>;
  aug_oct_top_pickup: Array<{stop: string; total_rides: number}>;
  aug_oct_top_dropoff: Array<{stop: string; total_rides: number}>;
  aug_oct_cancel_by_hour: Array<{hour: number; cancel_rate: number}>;
  aug_oct_booking_by_hour: Array<{Hour: number; Booking_Method: string; total_rides: number}>;
  aug_oct_stats: {total_rides: number; completed_rides: number; cancelled_rides: number; avg_wait_minutes: number};
}

const COLORS = {
  janMay: '#10b981',
  augOct: '#a855f7',
  accent: '#f59e0b',
  danger: '#ef4444',
  cyan: '#06b6d4'
};

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

export default function ScheduleComparison() {
  const [data, setData] = useState<FilteredData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/filtered_analysis_data.json')
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
          jan_may_hourly_rides: transformHourlyData(jsonData.jan_may_hourly_rides || []),
          jan_may_hourly_wait: transformHourlyData(jsonData.jan_may_hourly_wait || []),
          jan_may_cancel_by_hour: transformHourlyData(jsonData.jan_may_cancel_by_hour || []),
          aug_oct_hourly_rides: transformHourlyData(jsonData.aug_oct_hourly_rides || []),
          aug_oct_hourly_wait: transformHourlyData(jsonData.aug_oct_hourly_wait || []),
          aug_oct_cancel_by_hour: transformHourlyData(jsonData.aug_oct_cancel_by_hour || [])
        };
        
        setData(transformedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading filtered analysis data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading schedule comparison...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/unt-logo.png" alt="UNT" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-white">Schedule Comparison</h1>
                <p className="text-sm text-emerald-400">Jan-May (7PM-2AM) vs Aug-Oct (9PM-2AM)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/deep-insights">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Deep Insights
                </button>
              </Link>
              <Link href="/analytics">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Analytics
                </button>
              </Link>
              <Link href="/">
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Map
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jan-May Stats */}
            <Card className="bg-emerald-900/30 backdrop-blur-md border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Jan-May (7PM-2AM) - Spring Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-emerald-400 text-sm">Total Rides</div>
                    <div className="text-white text-3xl font-bold">{data.jan_may_stats.total_rides.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-emerald-400 text-sm">Avg Wait</div>
                    <div className="text-white text-3xl font-bold">{data.jan_may_stats.avg_wait_minutes.toFixed(1)} min</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-emerald-400 text-sm">Completed</div>
                    <div className="text-white text-2xl font-bold">{data.jan_may_stats.completed_rides.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-emerald-400 text-sm">Cancelled</div>
                    <div className="text-white text-2xl font-bold">{data.jan_may_stats.cancelled_rides.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aug-Oct Stats */}
            <Card className="bg-purple-900/30 backdrop-blur-md border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Aug-Oct (9PM-2AM) - Fall Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-purple-400 text-sm">Total Rides</div>
                    <div className="text-white text-3xl font-bold">{data.aug_oct_stats.total_rides.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-purple-400 text-sm">Avg Wait</div>
                    <div className="text-white text-3xl font-bold">{data.aug_oct_stats.avg_wait_minutes.toFixed(1)} min</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-purple-400 text-sm">Completed</div>
                    <div className="text-white text-2xl font-bold">{data.aug_oct_stats.completed_rides.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="text-purple-400 text-sm">Cancelled</div>
                    <div className="text-white text-2xl font-bold">{data.aug_oct_stats.cancelled_rides.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Busiest Hours Comparison */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Busiest Hours Comparison
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jan-May Busiest Hours */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Jan-May: Rides by Hour</CardTitle>
                <CardDescription className="text-gray-300">7PM - 2AM</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.jan_may_hourly_rides}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="hourLabel" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="total_rides" fill={COLORS.janMay} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aug-Oct Busiest Hours */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Aug-Oct: Rides by Hour</CardTitle>
                <CardDescription className="text-gray-300">9PM - 2AM</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.aug_oct_hourly_rides}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="hourLabel" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="total_rides" fill={COLORS.augOct} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Top Locations Comparison */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Top Pickup Locations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jan-May Top Pickups */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Jan-May: Top 10 Pickup Stops</CardTitle>
                <CardDescription className="text-gray-300">Eagle Landing is Combined</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.jan_may_top_pickup} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis type="number" stroke="#fff" />
                    <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="total_rides" fill={COLORS.janMay} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aug-Oct Top Pickups */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Aug-Oct: Top 10 Pickup Stops</CardTitle>
                <CardDescription className="text-gray-300">Eagle Landing is Combined</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.aug_oct_top_pickup} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis type="number" stroke="#fff" />
                    <YAxis dataKey="stop" type="category" stroke="#fff" width={150} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="total_rides" fill={COLORS.augOct} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cancellation Rates Comparison */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Cancellation Rates by Hour</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jan-May Cancellations */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Jan-May: Cancellation Rate</CardTitle>
                <CardDescription className="text-gray-300">Percentage (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.jan_may_cancel_by_hour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="hourLabel" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                    <Line type="monotone" dataKey="cancel_rate" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aug-Oct Cancellations */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Aug-Oct: Cancellation Rate</CardTitle>
                <CardDescription className="text-gray-300">Percentage (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.aug_oct_cancel_by_hour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="hourLabel" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelFormatter={formatHour} />
                    <Line type="monotone" dataKey="cancel_rate" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>


    </div>
  );
}
