import { useState, useEffect } from 'react';
import { APP_LOGO, APP_TITLE } from '@/const';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Activity, BarChart3, Map as MapIcon } from 'lucide-react';
import { Link } from 'wouter';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Prepare heatmap visualization data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const heatmapMatrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  
  data.heatmap.forEach(item => {
    const dayIndex = days.indexOf(item.day);
    if (dayIndex >= 0) {
      heatmapMatrix[dayIndex][item.hour] = item.rides;
    }
  });

  // Get max value for color scaling
  const maxRides = Math.max(...data.heatmap.map(d => d.rides));

  // Get color based on value
  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#1a1a2e';
    const intensity = value / maxRides;
    if (intensity < 0.2) return '#1e3a5f';
    if (intensity < 0.4) return '#2d5a8f';
    if (intensity < 0.6) return '#3d7abf';
    if (intensity < 0.8) return '#4d9aef';
    return '#00ff00';
  };

  // Prepare grouped bar data for day comparison
  const dayComparison = days.map(day => {
    const dayData = data.grouped_bar.filter(d => d.day === day.substring(0, 3));
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
                <h1 className="text-2xl font-bold text-purple-100">Deep Insights Dashboard</h1>
                <p className="text-sm text-purple-400">Tableau-Style Advanced Visualizations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/analytics">
                <Button variant="outline" className="border-purple-700 hover:bg-purple-900/50">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
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

            {/* Horizontal Bar Chart */}
            <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-700">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Horizontal Bar: Top 10 Busiest Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyTotals} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#67e8f9" />
                    <YAxis type="category" dataKey="hour" stroke="#67e8f9" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #67e8f9' }}
                      labelStyle={{ color: '#67e8f9' }}
                    />
                    <Bar dataKey="total" fill="#67e8f9" name="Total Rides" />
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

          {/* Stacked Bar Chart */}
          <Card className="mb-8 bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
            <CardHeader>
              <CardTitle className="text-orange-100 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Stacked Bar: Ride Status Distribution by Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.stacked_bar.filter(d => d.total > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="hour" stroke="#fdba74" />
                  <YAxis stroke="#fdba74" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #fdba74' }}
                    labelStyle={{ color: '#fdba74' }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#00ff00" name="Completed" />
                  <Bar dataKey="cancelled" stackId="a" fill="#ff4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card className="mb-8 bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700">
            <CardHeader>
              <CardTitle className="text-pink-100 flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Heatmap: Ride Density by Day and Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex mb-2">
                    <div className="w-24"></div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="w-8 text-center text-xs text-pink-300">
                        {i}
                      </div>
                    ))}
                  </div>
                  {days.map((day, dayIndex) => (
                    <div key={day} className="flex mb-1">
                      <div className="w-24 text-sm text-pink-100 flex items-center">
                        {day}
                      </div>
                      {heatmapMatrix[dayIndex].map((value, hour) => (
                        <div
                          key={hour}
                          className="w-8 h-8 border border-gray-700 flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: getHeatmapColor(value) }}
                          title={`${day} ${hour}:00 - ${value} rides`}
                        >
                          {value > 0 ? value : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="mt-4 flex items-center gap-4 text-xs text-pink-300">
                    <span>Low</span>
                    <div className="flex gap-1">
                      <div className="w-8 h-4" style={{ backgroundColor: '#1a1a2e' }}></div>
                      <div className="w-8 h-4" style={{ backgroundColor: '#1e3a5f' }}></div>
                      <div className="w-8 h-4" style={{ backgroundColor: '#2d5a8f' }}></div>
                      <div className="w-8 h-4" style={{ backgroundColor: '#3d7abf' }}></div>
                      <div className="w-8 h-4" style={{ backgroundColor: '#4d9aef' }}></div>
                      <div className="w-8 h-4" style={{ backgroundColor: '#00ff00' }}></div>
                    </div>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="text-center py-6 text-purple-400 text-sm">
            <p>Advanced data visualization for UNT Transportation Services • Tableau-style analytics</p>
            <p className="mt-2 text-purple-300">Harshitha Arugonda - Comprehensive Data Analysis</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
