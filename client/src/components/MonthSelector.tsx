import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthData {
  name: string;
  month_number: number;
  total_rides: number;
}

interface MonthSelectorProps {
  months: MonthData[];
  currentIndex: number;
  onMonthChange: (index: number) => void;
}

export default function MonthSelector({ months, currentIndex, onMonthChange }: MonthSelectorProps) {
  const currentMonth = months[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onMonthChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < months.length - 1) {
      onMonthChange(currentIndex + 1);
    }
  };

  // Check if we're in the summer break period
  const isSummerBreak = currentMonth.month_number >= 6 && currentMonth.month_number <= 7;

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-black/60 rounded-lg border border-green-900">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="border-green-700 hover:bg-green-900/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-center min-w-[200px]">
        <h2 className="text-2xl font-bold text-green-100">{currentMonth.name}</h2>
        <p className="text-sm text-green-400">{currentMonth.total_rides.toLocaleString()} rides</p>
        {isSummerBreak && (
          <p className="text-xs text-yellow-400 mt-1">⚠ Summer Break (May 13 - Aug 9)</p>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentIndex === months.length - 1}
        className="border-green-700 hover:bg-green-900/50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Month indicators */}
      <div className="flex gap-2 ml-4">
        {months.map((month, idx) => (
          <button
            key={idx}
            onClick={() => onMonthChange(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'bg-green-500 w-8'
                : 'bg-green-900 hover:bg-green-700'
            }`}
            title={month.name}
          />
        ))}
      </div>
    </div>
  );
}
