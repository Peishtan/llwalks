import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { Sun, CloudRain, PawPrint, Droplets, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import { Button } from '@/components/ui/button';

const ICON_COLOR = '#5D4037';

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'walk') return <PawPrint className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  if (type === 'pee') return <Droplets className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  return <PoopIcon className="w-5 h-5" style={{ color: ICON_COLOR }} />;
};

const History = () => {
  const { activities } = useActivities();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const now = new Date();

  const calendarDays = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    return eachDayOfInterval({ start, end });
  }, [viewMonth.getMonth(), viewMonth.getFullYear()]);

  const dayActivities = useMemo(() => {
    if (!selectedDate) return [];
    return activities.filter(a => isSameDay(parseISO(a.logged_at), selectedDate));
  }, [selectedDate, activities]);

  // Consolidate activities by type for the selected day
  const consolidatedActivities = useMemo(() => {
    const grouped: Record<string, { type: string; count: number; weather: string[] }> = {};
    dayActivities.forEach(a => {
      if (!grouped[a.activity_type]) {
        grouped[a.activity_type] = { type: a.activity_type, count: 0, weather: [] };
      }
      grouped[a.activity_type].count += 1;
      if (!grouped[a.activity_type].weather.includes(a.weather)) {
        grouped[a.activity_type].weather.push(a.weather);
      }
    });
    return Object.values(grouped);
  }, [dayActivities]);

  const getIconsForDay = (day: Date) => {
    const dayActs = activities.filter(a => isSameDay(parseISO(a.logged_at), day));
    const types: string[] = [];
    if (dayActs.some(a => a.activity_type === 'walk')) types.push('walk');
    if (dayActs.some(a => a.activity_type === 'pee')) types.push('pee');
    if (dayActs.some(a => a.activity_type === 'poop')) types.push('poop');
    return types;
  };

  const canGoForward = viewMonth.getMonth() < now.getMonth() || viewMonth.getFullYear() < now.getFullYear();

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5" style={{ color: ICON_COLOR }} />
          <h1 className="text-xl font-display font-bold" style={{ color: ICON_COLOR }}>History</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Calendar */}
        <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
          <CardContent className="p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMonth(prev => subMonths(prev, 1))}
                className="p-1"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: ICON_COLOR }} />
              </Button>
              <h2 className="font-display font-bold" style={{ color: ICON_COLOR }}>
                {format(viewMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMonth(prev => addMonths(prev, 1))}
                disabled={!canGoForward}
                className="p-1"
              >
                <ChevronRight className="w-5 h-5" style={{ color: canGoForward ? ICON_COLOR : '#D7C4A5' }} />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-xs font-display font-bold py-1" style={{ color: '#8D6E63' }}>{d}</span>
              ))}
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map(day => {
                const types = getIconsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, now);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className="relative p-1 rounded-lg text-xs font-bold transition-colors min-h-[40px] flex flex-col items-center justify-center gap-0.5"
                    style={{
                      background: isSelected ? '#8D6E63' : isToday ? '#F5E6D0' : 'transparent',
                      color: isSelected ? '#FFF8F0' : ICON_COLOR,
                    }}
                  >
                    <span>{day.getDate()}</span>
                    {types.length > 0 && (
                      <span className="flex gap-px">
                        {types.map(t => (
                          <span key={t} className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? '#FFF8F0' : ICON_COLOR }} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail — consolidated */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4">
                <h3 className="font-display font-bold mb-2" style={{ color: ICON_COLOR }}>{format(selectedDate, 'EEEE, MMM d')}</h3>
                {consolidatedActivities.length === 0 ? (
                  <p className="text-sm" style={{ color: '#8D6E63' }}>No activities logged.</p>
                ) : (
                  <div className="space-y-2">
                    {consolidatedActivities.map(item => (
                      <div key={item.type} className="flex items-center gap-3 text-sm rounded-xl p-2" style={{ background: '#F5E6D0' }}>
                        <ActivityIcon type={item.type} />
                        <div className="flex-1">
                          <span className="font-semibold capitalize" style={{ color: ICON_COLOR }}>
                            {item.type}
                            {item.count > 1 && (
                              <span className="ml-1 font-normal" style={{ color: '#8D6E63' }}>×{item.count}</span>
                            )}
                          </span>
                        </div>
                        <span className="flex gap-1">
                          {item.weather.includes('sun') && <Sun className="w-3.5 h-3.5" style={{ color: ICON_COLOR }} />}
                          {item.weather.includes('rain') && <CloudRain className="w-3.5 h-3.5" style={{ color: ICON_COLOR }} />}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
