import { useEffect, useState } from 'react';
import { APP_LOGO, APP_TITLE } from '@/const';
import GoogleMaps3D from '@/components/GoogleMaps3D';
import StatsPanel from '@/components/StatsPanel';
import MonthSelector from '@/components/MonthSelector';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Info, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Location {
  x: number;
  y: number;
  z: number;
}

interface MonthData {
  name: string;
  month_number: number;
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  hourly_distribution: Record<string, number>;
  top_routes: Array<{ route: string; count: number }>;
  top_pickup_locations: Record<string, number>;
  top_dropoff_locations: Record<string, number>;
}

interface VisualizationData {
  months: MonthData[];
  locations: Record<string, Location>;
  summary: {
    total_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    unique_locations: number;
    months_active: number;
    summer_break: {
      start: string;
      end: string;
      note: string;
    };
  };
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<VisualizationData | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the data
    fetch('/tripshot_data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-100 text-xl">Loading TripShot Data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <div className="text-center text-red-400">
          <p className="text-xl">Failed to load data</p>
        </div>
      </div>
    );
  }

  const currentMonth = data.months[currentMonthIndex];
  const highlightedLocations = Object.keys(currentMonth.top_pickup_locations).slice(0, 10);

  // Transform locations to array with lat/lng
  // UNT Campus bounds: approximately 33.205 to 33.215 lat, -97.155 to -97.140 lng
  const UNT_LAT_MIN = 33.205;
  const UNT_LAT_MAX = 33.215;
  const UNT_LNG_MIN = -97.155;
  const UNT_LNG_MAX = -97.140;
  
  const locationsArray = Object.entries(data.locations).map(([name, coords]) => {
    // Convert normalized coordinates (0-1100) to actual GPS coordinates
    const normalizedX = coords.x / 1100; // 0 to 1
    const normalizedY = coords.y / 1000; // 0 to 1
    
    const lat = UNT_LAT_MIN + (normalizedY * (UNT_LAT_MAX - UNT_LAT_MIN));
    const lng = UNT_LNG_MIN + (normalizedX * (UNT_LNG_MAX - UNT_LNG_MIN));
    
    const pickups = currentMonth.top_pickup_locations[name] || 0;
    const dropoffs = currentMonth.top_dropoff_locations[name] || 0;
    return {
      lat,
      lng,
      name,
      pickups,
      dropoffs,
    };
  });

  // Get top routes for visualization with coordinates
  const topRoutes = currentMonth.top_routes.slice(0, 10).map((route) => {
    const [from, to] = route.route.split(' → ');
    const fromLoc = data.locations[from];
    const toLoc = data.locations[to];
    
    if (!fromLoc || !toLoc) return null;
    
    // Convert normalized coordinates to GPS
    const fromLat = UNT_LAT_MIN + ((fromLoc.y / 1000) * (UNT_LAT_MAX - UNT_LAT_MIN));
    const fromLng = UNT_LNG_MIN + ((fromLoc.x / 1100) * (UNT_LNG_MAX - UNT_LNG_MIN));
    const toLat = UNT_LAT_MIN + ((toLoc.y / 1000) * (UNT_LAT_MAX - UNT_LAT_MIN));
    const toLng = UNT_LNG_MIN + ((toLoc.x / 1100) * (UNT_LNG_MAX - UNT_LNG_MIN));
    
    return {
      from,
      to,
      count: route.count,
      fromCoords: { lat: fromLat, lng: fromLng },
      toCoords: { lat: toLat, lng: toLng },
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black relative">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/shuttle-1.png)' }}
      />
      <div className="relative z-10">
      {/* Header */}
      <header className="border-b border-green-900 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="UNT Logo" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-green-100">{APP_TITLE}</h1>
              <p className="text-sm text-green-400">Interactive 3D Data Visualization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/analytics">
              <Button variant="outline" className="border-green-700 hover:bg-green-900/50">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-green-700 hover:bg-green-900/50">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-green-700">
                <DialogHeader>
                  <DialogTitle className="text-green-100">About Night Flight</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-3 mt-4 text-green-300">
                      <p>
                        <strong>Night Flight</strong> is UNT Transportation Services' late-night shuttle program,
                        providing safe transportation for students across campus.
                      </p>
                      <div>
                        <p className="font-semibold text-green-200">Service Hours:</p>
                        <p>9 PM - 2 AM, Monday through Sunday</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-200">Contact:</p>
                        <p>940-565-3014 or use the TripShot app</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-200">Data Summary:</p>
                        <p>Total Rides: {data.summary.total_rides.toLocaleString()}</p>
                        <p>Unique Locations: {data.summary.unique_locations}</p>
                        <p>Completion Rate: {((data.summary.completed_rides / data.summary.total_rides) * 100).toFixed(2)}%</p>
                      </div>
                      <div className="text-yellow-400 text-sm">
                        <p className="font-semibold">Summer Break:</p>
                        <p>{data.summary.summer_break.start} - {data.summary.summer_break.end}</p>
                        <p className="italic">{data.summary.summer_break.note}</p>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-green-700 hover:bg-green-900/50"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Visualization - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 rounded-lg border border-green-900 overflow-hidden">
              <div className="p-4 border-b border-green-900">
                <MonthSelector
                  months={data.months}
                  currentIndex={currentMonthIndex}
                  onMonthChange={setCurrentMonthIndex}
                />
              </div>
              <div className="h-[600px]">
                <GoogleMaps3D
                  locations={locationsArray}
                  routes={topRoutes}
                />
              </div>
              <div className="p-4 bg-black/60 border-t border-green-900">
                <p className="text-sm text-green-400 text-center">
                  🖱️ Use mouse to rotate, zoom, and pan • Green markers show top pickup locations • Lines show top routes
                </p>
              </div>
            </div>
          </div>

          {/* Stats Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <StatsPanel monthData={currentMonth} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-green-400 text-sm">
            Data visualization for UNT Transportation Services • {data.months.length} months analyzed • {data.summary.total_rides.toLocaleString()} total rides
          </p>
          <p className="text-green-600 text-xs mt-2">
            Built with React, Google Maps, and Recharts • © 2025 UNT Transportation Services
          </p>
          <p className="text-green-500 text-sm mt-3 font-semibold">
            Harshitha Arugonda - Comprehensive Data Analysis
          </p>
        </div>
      </main>
      </div> {/* Close z-10 div */}
    </div>
  );
}
