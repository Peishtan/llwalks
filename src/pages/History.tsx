import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Sun, CloudRain } from 'lucide-react';

const History = () => {
  const { activities } = useActivities();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const now = new Date();

  const calendarDays = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return eachDayOfInterval({ start, end });
  }, [now.getMonth()]);

  const dayActivities = useMemo(() => {
    if (!selectedDate) return [];
    return activities.filter(a => isSameDay(parseISO(a.logged_at), selectedDate));
  }, [selectedDate, activities]);

  const getIconsForDay = (day: Date) => {
    const dayActs = activities.filter(a => isSameDay(parseISO(a.logged_at), day));
    const icons: string[] = [];
    if (dayActs.some(a => a.activity_type === 'walk')) icons.push('🐾');
    if (dayActs.some(a => a.activity_type === 'pee')) icons.push('💧');
    if (dayActs.some(a => a.activity_type === 'poop')) icons.push('🍫');
    return icons;
  };

  const totalWalks = activities.filter(a => a.activity_type === 'walk').length;

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-display font-bold" style={{ color: '#5D4037' }}>📅 Activity History</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Monthly stats */}
        <div className="flex gap-3">
          <Card className="flex-1 border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold" style={{ color: '#5D4037' }}>{totalWalks}</p>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Walks</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold" style={{ color: '#5D4037' }}>{profile.path_position}</p>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Path Day</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
          <CardContent className="p-4">
            <h2 className="font-display font-bold text-center mb-3" style={{ color: '#5D4037' }}>{format(now, 'MMMM yyyy')}</h2>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-xs font-display font-bold py-1" style={{ color: '#8D6E63' }}>{d}</span>
              ))}
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map(day => {
                const icons = getIconsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, now);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className="relative p-1 rounded-lg text-xs font-bold transition-colors min-h-[40px] flex flex-col items-center justify-center gap-0.5"
                    style={{
                      background: isSelected ? '#8D6E63' : isToday ? '#F5E6D0' : 'transparent',
                      color: isSelected ? '#FFF8F0' : '#5D4037',
                    }}
                  >
                    <span>{day.getDate()}</span>
                    {icons.length > 0 && (
                      <span className="text-[8px] leading-none">{icons.join('')}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4">
                <h3 className="font-display font-bold mb-2" style={{ color: '#5D4037' }}>{format(selectedDate, 'EEEE, MMM d')}</h3>
                {dayActivities.length === 0 ? (
                  <p className="text-sm" style={{ color: '#8D6E63' }}>No activities logged.</p>
                ) : (
                  <div className="space-y-2">
                    {dayActivities.map(a => (
                      <div key={a.id} className="flex items-center gap-3 text-sm rounded-xl p-2" style={{ background: '#F5E6D0' }}>
                        <span className="text-lg">
                          {a.activity_type === 'walk' ? '🐾' : a.activity_type === 'pee' ? '💧' : '🍫'}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold capitalize" style={{ color: '#5D4037' }}>{a.activity_type}</span>
                          <span className="ml-2">
                            {a.weather === 'rain' ? (
                              <CloudRain className="w-3.5 h-3.5 inline" style={{ color: '#795548' }} />
                            ) : (
                              <Sun className="w-3.5 h-3.5 inline" style={{ color: '#D4943A' }} />
                            )}
                          </span>
                        </div>
                        {a.bonus_earned && (
                          <span className="text-xs">✨</span>
                        )}
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
