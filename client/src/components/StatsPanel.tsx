import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MonthData {
  name: string;
  month_number: number;
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  hourly_distribution: Record<string, number>;
  top_routes: Array<{ route: string; count: number }>;
}

interface StatsPanelProps {
  monthData: MonthData;
}

export default function StatsPanel({ monthData }: StatsPanelProps) {
  // Prepare hourly data
  const hourlyData = Object.entries(monthData.hourly_distribution || {})
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      rides: count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Prepare top routes data
  const topRoutesData = (monthData.top_routes || []).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-50">{monthData.total_rides.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-50">{monthData.completed_rides.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-50">{monthData.cancelled_rides.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-50">{monthData.completion_rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution Chart */}
      {hourlyData.length > 0 && (
        <Card className="bg-black/40 border-green-900">
          <CardHeader>
            <CardTitle className="text-green-100">Hourly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00853E' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="rides" fill="#00853E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Routes */}
      {topRoutesData.length > 0 && (
        <Card className="bg-black/40 border-green-900">
          <CardHeader>
            <CardTitle className="text-green-100">Top Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRoutesData.map((route, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-950/30 rounded border border-green-900/50">
                  <span className="text-sm text-green-50 flex-1 truncate">{route.route}</span>
                  <span className="text-sm font-bold text-green-400 ml-2">{route.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
