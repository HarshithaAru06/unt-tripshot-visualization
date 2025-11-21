import { Card } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle, Smartphone, Clock, UserPlus } from 'lucide-react';

interface HomeStats {
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  completion_rate: number;
  unique_riders: number;
  dispatch_rides: number;
  app_rides: number;
  app_adoption_rate: number;
  avg_wait_time_minutes: number;
  avg_ride_duration_minutes: number;
  pooled_rides_count: number;
  pooled_percentage: number;
  unique_locations: number;
  peak_hour: number;
  busiest_day: string;
}

interface InsightfulStatsProps {
  stats: HomeStats;
}

export default function InsightfulStats({ stats }: InsightfulStatsProps) {
  const statCards = [
    {
      title: 'Total Rides',
      value: stats.total_rides.toLocaleString(),
      subtitle: `${stats.completed_rides.toLocaleString()} completed`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700',
    },
    {
      title: 'Unique Riders',
      value: stats.unique_riders.toLocaleString(),
      subtitle: `Across ${stats.unique_locations} locations`,
      icon: Users,
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completion_rate}%`,
      subtitle: `${stats.cancelled_rides.toLocaleString()} cancelled`,
      icon: CheckCircle,
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700',
    },
    {
      title: 'App Adoption',
      value: `${stats.app_adoption_rate}%`,
      subtitle: `${stats.app_rides.toLocaleString()} app bookings`,
      icon: Smartphone,
      color: 'from-cyan-500 to-cyan-700',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700',
    },
    {
      title: 'Avg Wait Time',
      value: `${stats.avg_wait_time_minutes} min`,
      subtitle: `${stats.avg_ride_duration_minutes} min avg ride`,
      icon: Clock,
      color: 'from-orange-500 to-orange-700',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700',
    },
    {
      title: 'Pooled Rides',
      value: `${stats.pooled_percentage}%`,
      subtitle: `${stats.pooled_rides_count.toLocaleString()} shared rides`,
      icon: UserPlus,
      color: 'from-pink-500 to-pink-700',
      bgColor: 'bg-pink-900/20',
      borderColor: 'border-pink-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 overflow-hidden relative group hover:scale-105 transition-transform duration-300`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </Card>
        );
      })}
    </div>
  );
}
