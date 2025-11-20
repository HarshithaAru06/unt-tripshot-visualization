import { useState, useEffect } from 'react';
import { APP_LOGO } from '@/const';
import Papa from 'papaparse';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ComposedChart, Cell, PieChart, Pie, Legend
} from 'recharts';

interface RideData {
  Region: string;
  Day: string;
  Rider: string;
  Driver: string;
  Vehicle: string;
  'Pickup Stop': string;
  'Dropoff Stop': string;
  'Scheduled Pickup': string;
  'Driver Arrived': string;
  'Scheduled Dropoff': string;
  'Actual Pickup': string;
  'Actual Dropoff': string;
  State: string;
  '# Pooled Rides': string;
  Month: string;
}

interface ProcessedRide extends RideData {
  cleanedPickup: string;
  cleanedDropoff: string;
  hour: number;
  weekday: string;
  waitMinutes: number;
  tripMinutes: number;
}

const COLORS = ['#00853E', '#006B2F', '#4CAF50', '#81C784', '#A5D6A7'];
const NIGHT_FLIGHT_HOURS = [19, 20, 21, 22, 23, 0, 1];

export default function HomeReport() {
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<any>({});
  const [stats, setStats] = useState({ total: 0, months: 0 });

  useEffect(() => {
    loadAndProcessData();
  }, []);

  // Clean stop names - combine variations
  const cleanStopName = (stopName: string): string => {
    if (!stopName) return stopName;
    
    // Eagle Landing variations
    if (stopName.includes('Eagle Landing')) {
      return 'Eagle Landing (combined)';
    }
    
    // Add more cleaning rules as needed
    return stopName.trim();
  };

  const loadAndProcessData = async () => {
    try {
      const response = await fetch('/night_flight_all_months.csv');
      const text = await response.text();
      
      Papa.parse<RideData>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Keep ALL rows with valid timestamps for completed rides
          const completedRides = results.data.filter(row => 
            row.State === 'Complete' && 
            row['Actual Pickup'] && 
            row['Actual Pickup'].trim() !== '' &&
            row['Actual Dropoff'] && 
            row['Actual Dropoff'].trim() !== ''
          );
          
          // Also get cancelled rides for Chart 12
          const cancelledRides = results.data.filter(row => row.State === 'Cancelled');
          
          console.log(`Parsed ${results.data.length} total rows, ${completedRides.length} completed, ${cancelledRides.length} cancelled`);
          processAllCharts(completedRides, cancelledRides);
        },
        error: (error: Error) => {
          console.error('CSV parsing error:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const processAllCharts = (data: RideData[], cancelledData: RideData[] = []) => {
    console.log(`Processing ${data.length} completed rides`);
    
    // Process each ride with calculated fields
    const processedData: ProcessedRide[] = data.map(ride => {
      const actualPickup = new Date(ride['Actual Pickup']);
      const scheduledPickup = new Date(ride['Scheduled Pickup']);
      const actualDropoff = new Date(ride['Actual Dropoff']);
      
      const waitMinutes = (actualPickup.getTime() - scheduledPickup.getTime()) / (1000 * 60);
      const tripMinutes = (actualDropoff.getTime() - actualPickup.getTime()) / (1000 * 60);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return {
        ...ride,
        cleanedPickup: cleanStopName(ride['Pickup Stop']),
        cleanedDropoff: cleanStopName(ride['Dropoff Stop']),
        hour: actualPickup.getHours(),
        weekday: dayNames[actualPickup.getDay()],
        waitMinutes: waitMinutes > 0 && waitMinutes < 60 ? waitMinutes : 0, // Filter outliers
        tripMinutes: tripMinutes > 0 && tripMinutes < 60 ? tripMinutes : 0
      };
    });

    // Chart 1: Spring vs Fall Comparison
    const springMonths = ['January', 'February', 'March', 'April', 'May'];
    const fallMonths = ['August', 'September', 'October'];
    
    const springRides = processedData.filter(d => springMonths.includes(d.Month)).length;
    const fallRides = processedData.filter(d => fallMonths.includes(d.Month)).length;
    
    const semesterChart = [
      { semester: 'Spring', rides: springRides },
      { semester: 'Fall', rides: fallRides }
    ];

    // Chart 2: Total Rides by Day of Week
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayChart = dayOrder.map(day => ({
      day,
      rides: processedData.filter(d => d.weekday === day).length
    }));

    // Chart 3: Rides by Hour (Night Flight hours only)
    const hourChart = NIGHT_FLIGHT_HOURS.map(hour => ({
      hour,
      hourLabel: hour === 0 ? '00:00' : `${hour}:00`,
      rides: processedData.filter(d => d.hour === hour).length
    }));

    // Chart 4: Heatmap data - Rides by Day and Hour
    const heatmapData = dayOrder.flatMap(day =>
      NIGHT_FLIGHT_HOURS.map(hour => ({
        day,
        hour,
        rides: processedData.filter(d => d.weekday === day && d.hour === hour).length
      }))
    );

    // Chart 5: Top Pickup Stops
    const pickupCounts: Record<string, number> = {};
    processedData.forEach(d => {
      pickupCounts[d.cleanedPickup] = (pickupCounts[d.cleanedPickup] || 0) + 1;
    });
    const topPickups = Object.entries(pickupCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([stop, count]) => ({ stop, count }));

    // Chart 6: Top Dropoff Stops
    const dropoffCounts: Record<string, number> = {};
    processedData.forEach(d => {
      dropoffCounts[d.cleanedDropoff] = (dropoffCounts[d.cleanedDropoff] || 0) + 1;
    });
    const topDropoffs = Object.entries(dropoffCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([stop, count]) => ({ stop, count }));

    // Chart 7: Average Wait Time by Pickup Stop
    const waitByStop: Record<string, number[]> = {};
    processedData.forEach(d => {
      if (d.waitMinutes > 0) {
        if (!waitByStop[d.cleanedPickup]) waitByStop[d.cleanedPickup] = [];
        waitByStop[d.cleanedPickup].push(d.waitMinutes);
      }
    });
    const avgWaitChart = Object.entries(waitByStop)
      .map(([stop, waits]) => ({
        stop,
        avgWait: waits.reduce((a, b) => a + b, 0) / waits.length
      }))
      .sort((a, b) => b.avgWait - a.avgWait)
      .slice(0, 12);

    // Chart 8: Distribution of Wait Times
    const waitBins = [
      { range: '0-2', min: 0, max: 2, count: 0 },
      { range: '2-4', min: 2, max: 4, count: 0 },
      { range: '4-6', min: 4, max: 6, count: 0 },
      { range: '6-8', min: 6, max: 8, count: 0 },
      { range: '8-10', min: 8, max: 10, count: 0 },
      { range: '10+', min: 10, max: 100, count: 0 }
    ];
    processedData.forEach(d => {
      if (d.waitMinutes > 0) {
        const bin = waitBins.find(b => d.waitMinutes >= b.min && d.waitMinutes < b.max);
        if (bin) bin.count++;
      }
    });

    // Chart 9: Trip Duration Overview
    const tripBins = [
      { range: '0-3', min: 0, max: 3, count: 0 },
      { range: '3-5', min: 3, max: 5, count: 0 },
      { range: '5-7', min: 5, max: 7, count: 0 },
      { range: '7-10', min: 7, max: 10, count: 0 },
      { range: '10-15', min: 10, max: 15, count: 0 },
      { range: '15+', min: 15, max: 100, count: 0 }
    ];
    processedData.forEach(d => {
      if (d.tripMinutes > 0) {
        const bin = tripBins.find(b => d.tripMinutes >= b.min && d.tripMinutes < b.max);
        if (bin) bin.count++;
      }
    });

    // Chart 10: Monthly Trend with Rides per Active Day
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'August', 'September', 'October'];
    const monthlyTrend = monthOrder.map(month => {
      const monthRides = processedData.filter(d => d.Month === month);
      const uniqueDays = new Set(monthRides.map(d => d.Day)).size;
      return {
        month,
        totalRides: monthRides.length,
        ridesPerDay: uniqueDays > 0 ? monthRides.length / uniqueDays : 0
      };
    });

    // Chart 11: Rides per Driver
    const driverCounts: Record<string, number> = {};
    processedData.forEach(d => {
      driverCounts[d.Driver] = (driverCounts[d.Driver] || 0) + 1;
    });
    const driverChart = Object.entries(driverCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([driver, count]) => ({ driver: `Driver ${Object.keys(driverCounts).indexOf(driver) + 1}`, count }));

    // Chart 12: Cancelled Rate per Month
    const cancelledRateChart = monthOrder.map(month => {
      const completed = processedData.filter(d => d.Month === month).length;
      const cancelled = cancelledData.filter(d => d.Month === month).length;
      const total = completed + cancelled;
      const rate = total > 0 ? (cancelled / total) : 0;
      
      return {
        month,
        completed,
        cancelled,
        rate: rate * 100, // Convert to percentage
        rateDecimal: rate
      };
    }).filter(d => d.completed > 0 || d.cancelled > 0); // Only months with data

    setCharts({
      semesterChart,
      dayChart,
      hourChart,
      heatmapData,
      topPickups,
      topDropoffs,
      avgWaitChart,
      waitBins,
      tripBins,
      monthlyTrend,
      driverChart,
      cancelledRateChart
    });
    
    setStats({
      total: processedData.length,
      months: monthOrder.filter(m => processedData.some(d => d.Month === m)).length
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading and processing {stats.total > 0 ? stats.total.toLocaleString() : ''} rides...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#00853E] to-[#006B2F] text-white py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <img src={APP_LOGO} alt="UNT Shuttle" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h1 className="text-2xl font-bold">UNT Night Flight Service – Final Visualization Report</h1>
              <p className="text-sm opacity-90">CSCE 5320 – Scientific Data Visualization | Student: Harshitha Arugonda | UNT ID: 11814029</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div><span className="opacity-75">Total Completed Rides:</span> <span className="font-bold">{stats.total.toLocaleString()}</span></div>
            <div><span className="opacity-75">Months Analyzed:</span> <span className="font-bold">{stats.months}</span></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Introduction */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <div className="text-gray-700 space-y-2 text-sm">
            <p>
              In this project, I worked with real data from the UNT Night Flight shuttle service. Night Flight is the late-night shuttle 
              that helps students and staff move safely between campus and nearby housing. I wanted to see when people ride, which stops 
              are the busiest, and how long trips and waits usually take.
            </p>
            <p>
              This report shows {stats.total.toLocaleString()} completed rides across {stats.months} months (January, February, March, April, May, August, September, and October). 
              I tried to keep all charts simple and clean so that even someone who does not normally work with data can still look at a graph and quickly understand the pattern.
            </p>
          </div>
        </section>

        {/* Chart 1: Spring vs Fall */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 1 – Spring vs Fall Semester Comparison</h2>
          <p className="text-sm text-gray-600 mb-4">
            This chart compares total rides between Spring semester (January-May) and Fall semester (August-October). 
            Spring shows higher total rides, but Fall months are more concentrated.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.semesterChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="semester" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rides" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-3 italic">
            Spring semester has {charts.semesterChart[0].rides.toLocaleString()} rides across 5 months, 
            while Fall has {charts.semesterChart[1].rides.toLocaleString()} rides across 3 months.
          </p>
        </section>

        {/* Chart 2: Day of Week */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 2 – Total Rides by Day of Week</h2>
          <p className="text-sm text-gray-600 mb-4">
            This chart groups rides by weekday. Monday through Thursday show strong demand. 
            Friday and Saturday are noticeably lower.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.dayChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rides" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 3: Hourly Distribution */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 3 – Rides by Hour (Night Flight Service Hours)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Night Flight operates mainly from 7 PM to 2 AM. Peak demand occurs between 11 PM and midnight.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.hourChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="hourLabel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rides" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 4: Heatmap */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 4 – Heatmap: Rides by Day and Hour</h2>
          <p className="text-sm text-gray-600 mb-4">
            This heatmap shows when Night Flight is busiest. Darker colors mean more rides. 
            Sunday-Thursday evenings (21:00-23:00) show the highest demand.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 text-xs">Day / Hour</th>
                  {NIGHT_FLIGHT_HOURS.map(h => (
                    <th key={h} className="border p-2 bg-gray-100 text-xs">{h === 0 ? '00' : h}:00</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <tr key={day}>
                    <td className="border p-2 font-medium text-xs">{day}</td>
                    {NIGHT_FLIGHT_HOURS.map(hour => {
                      const cell = charts.heatmapData.find((d: any) => d.day === day && d.hour === hour);
                      const rides = cell ? cell.rides : 0;
                      const maxRides = Math.max(...charts.heatmapData.map((d: any) => d.rides));
                      const intensity = rides / maxRides;
                      const bgColor = `rgba(0, 133, 62, ${intensity})`;
                      return (
                        <td key={hour} className="border p-2 text-center text-xs" style={{ backgroundColor: bgColor, color: intensity > 0.5 ? 'white' : 'black' }}>
                          {rides}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Chart 5: Top Pickup Stops */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 5 – Top Pickup Stops</h2>
          <p className="text-sm text-gray-600 mb-4">
            These are the most common pickup locations. Victory Hall is the busiest stop.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={charts.topPickups} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" />
              <YAxis dataKey="stop" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 6: Top Dropoff Stops */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 6 – Top Dropoff Stops</h2>
          <p className="text-sm text-gray-600 mb-4">
            These are the most common dropoff locations. Many mirror the top pickup stops.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={charts.topDropoffs} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" />
              <YAxis dataKey="stop" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 7: Average Wait Time */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 7 – Average Wait Time by Pickup Stop</h2>
          <p className="text-sm text-gray-600 mb-4">
            Most major stops have average wait times of 2-5 minutes. Some less frequent stops show higher waits.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.avgWaitChart} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="stop" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} min`} />
              <Bar dataKey="avgWait" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 8: Wait Time Distribution */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 8 – Distribution of Wait Times</h2>
          <p className="text-sm text-gray-600 mb-4">
            Most students wait 0-4 minutes. The concentration is around 2 minutes.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.waitBins} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="range" label={{ value: 'Wait Time (minutes)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Rides', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 9: Trip Duration */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 9 – Trip Duration Overview</h2>
          <p className="text-sm text-gray-600 mb-4">
            Most trips are 3-7 minutes. Short trips (under 3 minutes) and longer trips (over 10 minutes) are less common.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.tripBins} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="range" label={{ value: 'Trip Duration (minutes)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Rides', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 10: Monthly Trend */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 10 – Monthly Ride Trend & Rides per Active Day</h2>
          <p className="text-sm text-gray-600 mb-4">
            Bars show total rides per month. The line shows rides per active day. April and October are the busiest months.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={charts.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="totalRides" fill="#00853E" name="Total Rides" />
              <Line yAxisId="right" type="monotone" dataKey="ridesPerDay" stroke="#006B2F" strokeWidth={2} name="Rides per Day" />
            </ComposedChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 11: Rides per Driver */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Chart 11 – Rides per Driver (Top 10)</h2>
          <p className="text-sm text-gray-600 mb-4">
            This shows the distribution of rides across drivers. Driver names are anonymized for privacy.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.driverChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="driver" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00853E" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Chart 12: Cancelled Rate per Month */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-3 text-center">7. Service Reliability</h2>
          
          <h3 className="text-lg font-bold mb-2">Chart 12 – Cancelled Ride Rate per Month</h3>
          <p className="text-sm text-gray-600 mb-4">
            This chart shows the cancellation rate for each month. A higher rate means more rides were cancelled compared to completed rides.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.cancelledRateChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis 
                label={{ value: 'Cancelled Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                domain={[0, 100]}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-sm text-xs">
                        <p className="font-semibold mb-1">{data.month}</p>
                        <p className="text-green-700">Completed: {data.completed.toLocaleString()}</p>
                        <p className="text-orange-600">Cancelled: {data.cancelled.toLocaleString()}</p>
                        <p className="font-semibold mt-1">Cancelled Rate: {data.rate.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="rate" fill="#E07B39" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Conclusion */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-3">3. Conclusion</h2>
          <div className="text-gray-700 space-y-2 text-sm">
            <p>
              For me personally, the biggest learning is how much context good visualizations can bring. The raw CSV had {stats.total.toLocaleString()} rows, 
              but by grouping and filtering, I could see clear patterns: weeknights are busier than weekends, 11 PM is the peak hour, 
              and most waits are under 5 minutes.
            </p>
            <p>
              I also learned that cleaning data matters a lot. Combining stop name variations and filtering outliers made the charts much clearer. 
              I hope these visualizations help UNT Transportation Services understand demand patterns and plan better schedules.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
