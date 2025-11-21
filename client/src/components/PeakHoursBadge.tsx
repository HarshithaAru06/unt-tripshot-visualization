import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PeakHoursBadgeProps {
  peakHour: number;
  busiestDay: string;
}

export default function PeakHoursBadge({ peakHour, busiestDay }: PeakHoursBadgeProps) {
  // Format hour to 12-hour format with AM/PM
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-red-900/40 border-2 border-yellow-500/50 overflow-hidden relative">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-100">Peak Operations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peak Hour */}
          <div className="bg-black/40 rounded-lg p-5 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-yellow-200">Peak Hour</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{formatHour(peakHour)}</p>
            <p className="text-sm text-yellow-300">Highest ride demand</p>
          </div>

          {/* Busiest Day */}
          <div className="bg-black/40 rounded-lg p-5 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-orange-200">Busiest Day</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{busiestDay}</p>
            <p className="text-sm text-orange-300">Most active day of week</p>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
      </div>
    </Card>
  );
}
