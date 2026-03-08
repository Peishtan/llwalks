import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

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
    if (dayActs.some(a => a.activity_type === 'poop')) icons.push('💩');
    return icons;
  };

  const totalWalks = activities.filter(a => a.activity_type === 'walk').length;
  const totalTreats = activities.reduce((sum, a) => sum + a.treats_earned, 0);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-display font-bold">📅 Activity History</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Monthly stats */}
        <div className="flex gap-3">
          <Card className="flex-1 border-2 border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold">{totalWalks}</p>
              <p className="text-xs text-muted-foreground">Walks</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-2 border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold">{totalTreats}</p>
              <p className="text-xs text-muted-foreground">Treats Earned</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-2 border-border">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold">{profile.path_position}</p>
              <p className="text-xs text-muted-foreground">Path Day</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="border-2 border-border">
          <CardContent className="p-4">
            <h2 className="font-display font-bold text-center mb-3">{format(now, 'MMMM yyyy')}</h2>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-xs font-display text-muted-foreground font-bold py-1">{d}</span>
              ))}
              {/* Offset for first day */}
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
                    className={`relative p-1 rounded-lg text-xs font-bold transition-colors min-h-[40px] flex flex-col items-center justify-center gap-0.5
                      ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                      ${isToday && !isSelected ? 'bg-accent/50 text-accent-foreground' : ''}
                      ${!isSelected && !isToday ? 'hover:bg-muted' : ''}
                    `}
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
            <Card className="border-2 border-border">
              <CardContent className="p-4">
                <h3 className="font-display font-bold mb-2">{format(selectedDate, 'EEEE, MMM d')}</h3>
                {dayActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities logged.</p>
                ) : (
                  <div className="space-y-2">
                    {dayActivities.map(a => (
                      <div key={a.id} className="flex items-center gap-3 text-sm bg-muted/50 rounded-xl p-2">
                        <span className="text-lg">
                          {a.activity_type === 'walk' ? '🐾' : a.activity_type === 'pee' ? '💧' : '💩'}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold capitalize">{a.activity_type}</span>
                          <span className="text-muted-foreground ml-2">
                            {a.weather === 'rain' ? '🌧️' : '☀️'}
                          </span>
                        </div>
                        {a.treats_earned > 0 && (
                          <span className="text-xs font-bold text-accent-foreground bg-accent/30 px-2 py-0.5 rounded-full">
                            +{a.treats_earned} 🦴
                          </span>
                        )}
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
