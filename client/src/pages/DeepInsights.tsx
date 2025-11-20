import { useState, useEffect } from 'react';
import { APP_LOGO, APP_TITLE } from '@/const';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Activity, BarChart3, Map as MapIcon, FileBarChart } from 'lucide-react';
import { Link } from 'wouter';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

interface CancellationByBookingMethod {
  booking_method: string;
  completed: number;
  cancelled: number;
  total: number;
  completion_rate: number;
  cancellation_rate: number;
}

interface DeepInsightsData {
  heatmap: Array<{ day: string; hour: number; rides: number }>;
  scatter: Array<{ wait_time: number; ride_duration: number; status: string; month: string }>;
  monthly_trends: Array<{
    month: string;
    total_rides: number;
    completed: number;
    cancelled: number;
    completion_rate: number;
    avg_wait_time: number;
    avg_ride_duration: number;
  }>;
  grouped_bar: Array<{
    month: string;
    day: string;
    total: number;
    completed: number;
    completion_rate: number;
  }>;
  stacked_bar: Array<{
    hour: number;
    completed: number;
    cancelled: number;
    total: number;
  }>;
}

export default function DeepInsights() {
  const [data, setData] = useState<DeepInsightsData | null>(null);
  const [bookingMethodData, setBookingMethodData] = useState<CancellationByBookingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load deep insights data
    fetch('/deep_insights_data.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deep insights:', err);
        setLoading(false);
      });
    
    // Load booking method cancellation data
    fetch('/cancellation_by_booking_method.json')
      .then(res => res.json())
      .then(jsonData => {
        setBookingMethodData(jsonData.cancellation_by_booking_method);
      })
      .catch(err => {
        console.error('Error loading booking method data:', err);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading Deep Insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center text-red-400">
          <p className="text-xl">Failed to load deep insights data</p>
        </div>
      </div>
    );
  }

  // Heatmap removed per girlfriend's feedback
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Prepare grouped bar data for day comparison
  const dayComparison = days.map(day => {
    const dayData = data.grouped_bar.filter(d => d.day === day);
    const totalRides = dayData.reduce((sum, d) => sum + d.total, 0);
    const completedRides = dayData.reduce((sum, d) => sum + d.completed, 0);
    return {
      day: day.substring(0, 3),
      total: totalRides,
      completed: completedRides,
      cancelled: totalRides - completedRides,
      completion_rate: totalRides > 0 ? (completedRides / totalRides * 100) : 0
    };
  });

  // Prepare horizontal bar data (top hours)
  const hourlyTotals = data.stacked_bar
    .map(d => ({
      hour: d.hour,
      total: d.total
    }))
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 opacity-5 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/shuttle-1.png)' }}
      />
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-900 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="UNT Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-purple-100">Completed and Cancelled Rides</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/analytics">
                <Button variant="outline" className="border-purple-700 hover:bg-purple-900/50">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/detailed">
                <Button variant="outline" className="border-blue-700 hover:bg-blue-900/50">
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Detailed Analysis
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-purple-700 hover:bg-purple-900/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Map
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Line Chart - Monthly Trends */}
          <Card className="mb-8 bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
            <CardHeader>
              <CardTitle className="text-purple-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Line Chart: Monthly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#a78bfa" />
                  <YAxis stroke="#a78bfa" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #a78bfa' }}
                    labelStyle={{ color: '#a78bfa' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total_rides" stroke="#a78bfa" strokeWidth={3} name="Total Rides" />
                  <Line type="monotone" dataKey="completed" stroke="#00ff00" strokeWidth={3} name="Completed" />
                  <Line type="monotone" dataKey="cancelled" stroke="#ff4444" strokeWidth={3} name="Cancelled" />
                  <Line type="monotone" dataKey="avg_wait_time" stroke="#fbbf24" strokeWidth={2} name="Avg Wait (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vertical and Horizontal Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Vertical Bar Chart */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vertical Bar: Day of Week Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#93c5fd" />
                    <YAxis stroke="#93c5fd" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #93c5fd' }}
                      labelStyle={{ color: '#93c5fd' }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#00ff00" name="Completed" />
                    <Bar dataKey="cancelled" fill="#ff4444" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


          </div>

          {/* Grouped Bar Chart */}
          <Card className="mb-8 bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grouped Bar: Completion Rate by Day Across Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.grouped_bar.filter(d => d.total > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#86efac" />
                  <YAxis stroke="#86efac" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #86efac' }}
                    labelStyle={{ color: '#86efac' }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#86efac" name="Total Rides" />
                  <Bar dataKey="completed" fill="#00ff00" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cancellation Rate by Booking Method */}
          {bookingMethodData.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
              <CardHeader>
                <CardTitle className="text-orange-100 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Cancellation Rate: Dispatch Calls vs TripShot App
                </CardTitle>
                <p className="text-sm text-orange-300 mt-2">
                  Dispatch call bookings show {bookingMethodData[0]?.cancellation_rate}% cancellation rate compared to {bookingMethodData[1]?.cancellation_rate}% for app bookings - a {(bookingMethodData[1]?.cancellation_rate - bookingMethodData[0]?.cancellation_rate).toFixed(2)} percentage point difference
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bar Chart Comparison */}
                  <div>
                    <h3 className="text-orange-200 text-center mb-4 font-semibold">Cancellation Rate Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingMethodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="booking_method" 
                          stroke="#fdba74"
                          tick={{ fill: '#fdba74' }}
                        />
                        <YAxis 
                          stroke="#fdba74"
                          label={{ value: 'Cancellation Rate (%)', angle: -90, position: 'insideLeft', fill: '#fdba74' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #fdba74' }}
                          labelStyle={{ color: '#fdba74' }}
                          formatter={(value: any) => `${value}%`}
                        />
                        <Bar dataKey="cancellation_rate" name="Cancellation Rate">
                          {bookingMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Grouped Bar Chart - Completed vs Cancelled */}
                  <div>
                    <h3 className="text-orange-200 text-center mb-4 font-semibold">Completed vs Cancelled Rides</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingMethodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="booking_method" 
                          stroke="#fdba74"
                          tick={{ fill: '#fdba74' }}
                        />
                        <YAxis 
                          stroke="#fdba74"
                          label={{ value: 'Number of Rides', angle: -90, position: 'insideLeft', fill: '#fdba74' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #fdba74' }}
                          labelStyle={{ color: '#fdba74' }}
                        />
                        <Legend />
                        <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                        <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics Summary */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {bookingMethodData.map((method, index) => (
                    <div key={index} className="bg-black/40 p-4 rounded-lg border border-orange-700/50">
                      <h4 className="text-orange-200 font-semibold mb-2">{method.booking_method}</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">Total Rides: <span className="text-white font-semibold">{method.total.toLocaleString()}</span></p>
                        <p className="text-green-400">Completed: <span className="text-white font-semibold">{method.completed.toLocaleString()}</span> ({method.completion_rate}%)</p>
                        <p className="text-red-400">Cancelled: <span className="text-white font-semibold">{method.cancelled.toLocaleString()}</span> ({method.cancellation_rate}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
