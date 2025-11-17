import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
  // Determine service hours based on month
  // Jan-May: 7 PM (19:00) to 2 AM (02:00)
  // Aug-Oct: 10 PM (22:00) to 2 AM (02:00)
  const isEarlyMonths = ['January', 'February', 'March', 'April', 'May'].includes(monthData.name);
  const serviceHourOrder = isEarlyMonths 
    ? [19, 20, 21, 22, 23, 0, 1, 2]  // 7 PM to 2 AM
    : [22, 23, 0, 1, 2];              // 10 PM to 2 AM
  
  const hourlyData = serviceHourOrder
    .map(hour => {
      const count = monthData.hourly_distribution?.[hour.toString()] || 0;
      // Format display hour
      let displayHour;
      if (hour === 0) displayHour = '0:00';
      else if (hour === 1) displayHour = '1:00';
      else if (hour === 2) displayHour = '2:00';
      else displayHour = `${hour}:00`;
      
      return {
        hour: displayHour,
        rides: count,
      };
    });

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
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00853E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00853E" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#888" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#888" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid #00853E',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#00853E' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rides" 
                  stroke="#00853E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRides)" 
                  animationDuration={1500}
                />
              </AreaChart>
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
