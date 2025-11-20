import { useState, useEffect } from 'react';
import { APP_LOGO } from '@/const';

interface MonthData {
  name: string;
  month_number: number;
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  top_routes: Array<{ route: string; count: number }>;
}

interface TripShotData {
  months: MonthData[];
}

export default function HomeSimple() {
  const [data, setData] = useState<TripShotData | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    fetch('/tripshot_data.json')
      .then(res => res.json())
      .then((jsonData: TripShotData) => setData(jsonData))
      .catch(err => console.error('Error loading data:', err));
  }, []);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentMonth = data.months[currentMonthIndex];

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % data.months.length);
  };

  const previousMonth = () => {
    setCurrentMonthIndex((prev) => (prev - 1 + data.months.length) % data.months.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#00853E] to-[#006B2F] text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <img src={APP_LOGO} alt="UNT Shuttle" className="w-20 h-20 rounded-lg object-cover" />
          <div>
            <h1 className="text-3xl font-bold">UNT Night Flight Data Analysis</h1>
            <p className="text-sm opacity-90 mt-1">8 Months of Shuttle Service Data | January - October 2025</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Month Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center justify-center gap-8">
          <button 
            onClick={previousMonth}
            className="w-10 h-10 rounded-full bg-[#00853E] text-white text-xl hover:bg-[#006B2F] transition-colors"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-[#00853E] min-w-[150px] text-center">
            {currentMonth.name}
          </h2>
          <button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-full bg-[#00853E] text-white text-xl hover:bg-[#006B2F] transition-colors"
          >
            →
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-sm text-gray-600 mb-2">Total Rides</h3>
            <p className="text-3xl font-bold text-[#00853E]">{currentMonth.total_rides.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-sm text-gray-600 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-[#00853E]">{currentMonth.completed_rides.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-sm text-gray-600 mb-2">Cancelled</h3>
            <p className="text-3xl font-bold text-[#00853E]">{currentMonth.cancelled_rides.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-sm text-gray-600 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-[#00853E]">{currentMonth.completion_rate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Monthly Rides</h3>
            <img src="/tableau_charts/monthly_rides.png" alt="Monthly Rides" className="w-full rounded" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Completed vs Cancelled by Month</h3>
            <img src="/tableau_charts/completion_by_month.png" alt="Completion Chart" className="w-full rounded" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Hourly Distribution</h3>
            <img src="/tableau_charts/hourly_rides.png" alt="Hourly Rides" className="w-full rounded" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Overall Status Distribution</h3>
            <img src="/tableau_charts/completion_pie.png" alt="Status Distribution" className="w-full rounded" />
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Top Routes for {currentMonth.name}</h3>
          <div className="space-y-3">
            {currentMonth.top_routes.map((route, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-[#00853E]"
              >
                <span className="text-sm text-gray-700">{route.route}</span>
                <span className="text-lg font-bold text-[#00853E]">{route.count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
