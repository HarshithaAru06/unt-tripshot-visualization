import { useEffect, useState } from 'react';
import { APP_LOGO, APP_TITLE } from '@/const';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, Phone, Smartphone, Car, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyStats {
  month: string;
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  riders_with_app: number;
  riders_via_call: number;
  app_adoption_rate: number;
  pooled_rides: number;
  avg_pool_size: number;
  unique_riders: number;
  unique_drivers: number;
  unique_vehicles: number;
  peak_hour: number;
}

interface AnalyticsData {
  monthly_stats: MonthlyStats[];
  rider_analysis: {
    total_unique_riders: number;
    top_riders: Array<{ name: string; rides: number }>;
    frequent_riders: number;
    occasional_riders: number;
  };
  driver_analysis: {
    total_drivers: number;
    top_drivers: Array<{ name: string; rides: number }>;
  };
  vehicle_analysis: {
    total_vehicles: number;
    vehicle_usage: Array<{ vehicle: string; rides: number }>;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/tripshot_analytics.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-400">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <div className="text-center text-red-400">
          <p className="text-xl">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalRides = data.monthly_stats.reduce((sum, m) => sum + m.total_rides, 0);
  const totalCompleted = data.monthly_stats.reduce((sum, m) => sum + m.completed_rides, 0);
  const totalCancelled = data.monthly_stats.reduce((sum, m) => sum + m.cancelled_rides, 0);
  const totalAppRides = data.monthly_stats.reduce((sum, m) => sum + m.riders_with_app, 0);
  const totalCallRides = data.monthly_stats.reduce((sum, m) => sum + m.riders_via_call, 0);
  const totalPooledRides = data.monthly_stats.reduce((sum, m) => sum + m.pooled_rides, 0);
  
  const overallCompletionRate = ((totalCompleted / totalRides) * 100).toFixed(2);
  const overallAppAdoption = ((totalAppRides / totalRides) * 100).toFixed(2);

  // Prepare charts data
  const monthlyTrendData = data.monthly_stats.map(m => ({
    month: m.month.substring(0, 3),
    total: m.total_rides,
    completed: m.completed_rides,
    cancelled: m.cancelled_rides,
  }));

  const appVsCallData = data.monthly_stats.map(m => ({
    month: m.month.substring(0, 3),
    app: m.riders_with_app,
    call: m.riders_via_call,
    appRate: m.app_adoption_rate,
  }));

  const bookingMethodPieData = [
    { name: 'TripShot App', value: totalAppRides, color: '#00853E' },
    { name: 'Phone Call', value: totalCallRides, color: '#FFA500' },
  ];

  const rideStatusPieData = [
    { name: 'Completed', value: totalCompleted, color: '#00853E' },
    { name: 'Cancelled', value: totalCancelled, color: '#DC2626' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
      {/* Header */}
      <header className="border-b border-green-900 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="UNT Logo" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-green-100">Deep Analytics Dashboard</h1>
              <p className="text-sm text-green-400">Comprehensive TripShot Data Analysis</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-700 hover:bg-green-900/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Total Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-50">{totalRides.toLocaleString()}</div>
              <p className="text-xs text-green-300 mt-1">Across 8 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Unique Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-50">{data.rider_analysis.total_unique_riders.toLocaleString()}</div>
              <p className="text-xs text-blue-300 mt-1">{data.rider_analysis.frequent_riders} frequent users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-50">{overallCompletionRate}%</div>
              <p className="text-xs text-purple-300 mt-1">{totalCompleted.toLocaleString()} completed rides</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                App Adoption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-50">{overallAppAdoption}%</div>
              <p className="text-xs text-orange-300 mt-1">{totalAppRides.toLocaleString()} app bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100">Monthly Ride Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00853E' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#00853E" strokeWidth={2} name="Total Rides" />
                  <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="cancelled" stroke="#DC2626" strokeWidth={2} name="Cancelled" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100">App vs Call Bookings by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appVsCallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00853E' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="app" fill="#00853E" name="TripShot App" />
                  <Bar dataKey="call" fill="#FFA500" name="Phone Call" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Booking Method Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Booking Method Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingMethodPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingMethodPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00853E' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-950/30 rounded">
                  <span className="text-green-100 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    TripShot App
                  </span>
                  <span className="text-green-400 font-bold">{totalAppRides.toLocaleString()} ({overallAppAdoption}%)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-950/30 rounded">
                  <span className="text-orange-100 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Call
                  </span>
                  <span className="text-orange-400 font-bold">{totalCallRides.toLocaleString()} ({(100 - parseFloat(overallAppAdoption)).toFixed(2)}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100">Ride Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rideStatusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rideStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00853E' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-950/30 rounded">
                  <span className="text-green-100">Completed Rides</span>
                  <span className="text-green-400 font-bold">{totalCompleted.toLocaleString()} ({overallCompletionRate}%)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-950/30 rounded">
                  <span className="text-red-100">Cancelled Rides</span>
                  <span className="text-red-400 font-bold">{totalCancelled.toLocaleString()} ({((totalCancelled / totalRides) * 100).toFixed(2)}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Riders */}
          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top 10 Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {data.rider_analysis.top_riders.slice(0, 10).map((rider, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-green-950/30 rounded border border-green-900/50">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-sm">#{idx + 1}</span>
                      <span className="text-sm text-green-50">{rider.name}</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">{rider.rides} rides</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Drivers */}
          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Top Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.driver_analysis.top_drivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-blue-950/30 rounded border border-blue-900/50">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold text-sm">#{idx + 1}</span>
                      <span className="text-sm text-blue-50">{driver.name}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">{driver.rides} rides</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-950/20 rounded border border-blue-900/30">
                <p className="text-xs text-blue-300">Total Drivers: <span className="font-bold">{data.driver_analysis.total_drivers}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Usage */}
          <Card className="bg-black/40 border-green-900">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Fleet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.vehicle_analysis.vehicle_usage.map((vehicle, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-purple-950/30 rounded border border-purple-900/50">
                    <span className="text-sm text-purple-50 truncate">{vehicle.vehicle}</span>
                    <span className="text-sm font-bold text-purple-400">{vehicle.rides}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-950/20 rounded border border-purple-900/30">
                <p className="text-xs text-purple-300">Total Vehicles: <span className="font-bold">{data.vehicle_analysis.total_vehicles}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pooling Analysis */}
        <Card className="bg-black/40 border-green-900 mb-8">
          <CardHeader>
            <CardTitle className="text-green-100">Ride Pooling Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-950/30 rounded border border-green-900/50">
                <p className="text-sm text-green-300">Total Pooled Rides</p>
                <p className="text-3xl font-bold text-green-50 mt-2">{totalPooledRides.toLocaleString()}</p>
                <p className="text-xs text-green-400 mt-1">{((totalPooledRides / totalRides) * 100).toFixed(2)}% of all rides</p>
              </div>
              <div className="p-4 bg-blue-950/30 rounded border border-blue-900/50">
                <p className="text-sm text-blue-300">Average Pool Size</p>
                <p className="text-3xl font-bold text-blue-50 mt-2">
                  {(data.monthly_stats.reduce((sum, m) => sum + m.avg_pool_size, 0) / data.monthly_stats.length).toFixed(2)}
                </p>
                <p className="text-xs text-blue-400 mt-1">riders per pooled ride</p>
              </div>
              <div className="p-4 bg-purple-950/30 rounded border border-purple-900/50">
                <p className="text-sm text-purple-300">Efficiency Gain</p>
                <p className="text-3xl font-bold text-purple-50 mt-2">
                  {((totalPooledRides / totalRides) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-purple-400 mt-1">rides optimized through pooling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="bg-black/40 border-green-900">
          <CardHeader>
            <CardTitle className="text-green-100">Key Insights & Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-950/20 rounded border-l-4 border-green-500">
                <h3 className="text-green-100 font-semibold mb-2">📱 TripShot App Adoption</h3>
                <p className="text-green-300 text-sm">
                  {overallAppAdoption}% of all rides were booked through the TripShot app, showing strong digital adoption among students. 
                  This represents {totalAppRides.toLocaleString()} app-based bookings compared to {totalCallRides.toLocaleString()} phone call bookings.
                </p>
              </div>

              <div className="p-4 bg-blue-950/20 rounded border-l-4 border-blue-500">
                <h3 className="text-blue-100 font-semibold mb-2">👥 User Engagement</h3>
                <p className="text-blue-300 text-sm">
                  {data.rider_analysis.total_unique_riders.toLocaleString()} unique riders used the service across 8 months. 
                  {data.rider_analysis.frequent_riders} riders ({((data.rider_analysis.frequent_riders / data.rider_analysis.total_unique_riders) * 100).toFixed(1)}%) 
                  are frequent users (10+ rides), indicating strong service loyalty.
                </p>
              </div>

              <div className="p-4 bg-purple-950/20 rounded border-l-4 border-purple-500">
                <h3 className="text-purple-100 font-semibold mb-2">✅ Service Reliability</h3>
                <p className="text-purple-300 text-sm">
                  {overallCompletionRate}% completion rate demonstrates excellent service reliability. 
                  Out of {totalRides.toLocaleString()} total ride requests, {totalCompleted.toLocaleString()} were successfully completed.
                </p>
              </div>

              <div className="p-4 bg-orange-950/20 rounded border-l-4 border-orange-500">
                <h3 className="text-orange-100 font-semibold mb-2">🚗 Fleet Efficiency</h3>
                <p className="text-orange-300 text-sm">
                  {data.vehicle_analysis.total_vehicles} vehicles served {totalRides.toLocaleString()} rides with {data.driver_analysis.total_drivers} drivers. 
                  Ride pooling optimized {((totalPooledRides / totalRides) * 100).toFixed(1)}% of trips, improving efficiency and reducing wait times.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-green-900 bg-black/60">
        <div className="container mx-auto px-4 text-center">
          <p className="text-green-400 text-sm">
            Comprehensive analysis of UNT Night Flight TripShot service • {data.monthly_stats.length} months • {totalRides.toLocaleString()} total rides
          </p>
          <p className="text-green-600 text-xs mt-2">
            Built with React, Google Maps, and Recharts • © 2025 UNT Transportation Services
          </p>
        </div>
      </footer>
    </div>
  );
}
