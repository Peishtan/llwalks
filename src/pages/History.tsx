import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import LogWalkDialog from '@/components/LogWalkDialog';
import WeatherInsights from '@/components/WeatherInsights';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { Sun, CloudRain, PawPrint, Droplets, CalendarDays, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const TYPE_ORDER = ['walk', 'pee', 'poop'];

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'walk') return <PawPrint className="w-5 h-5 text-foreground" />;
  if (type === 'pee') return <Droplets className="w-5 h-5 text-foreground" />;
  return <PoopIcon className="w-5 h-5 text-foreground" />;
};

const History = () => {
  const { user } = useAuth();
  const { activities, logActivity } = useActivities();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
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

  const consolidatedActivities = useMemo(() => {
    const grouped: Record<string, { type: string; count: number; weather: string[]; ids: string[]; notes: string[] }> = {};
    dayActivities.forEach(a => {
      if (!grouped[a.activity_type]) {
        grouped[a.activity_type] = { type: a.activity_type, count: 0, weather: [], ids: [], notes: [] };
      }
      grouped[a.activity_type].count += 1;
      grouped[a.activity_type].ids.push(a.id);
      if (!grouped[a.activity_type].weather.includes(a.weather)) {
        grouped[a.activity_type].weather.push(a.weather);
      }
      if (a.notes) {
        grouped[a.activity_type].notes.push(a.notes);
      }
    });
    return Object.values(grouped).sort(
      (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
    );
  }, [dayActivities]);

  // Monthly stats for the viewed month
  const monthlyStats = useMemo(() => {
    const monthStr = format(viewMonth, 'yyyy-MM');
    const monthActs = activities.filter(a => a.logged_at.startsWith(monthStr));
    return {
      walks: monthActs.filter(a => a.activity_type === 'walk').length,
      pees: monthActs.filter(a => a.activity_type === 'pee').length,
      poops: monthActs.filter(a => a.activity_type === 'poop').length,
    };
  }, [activities, viewMonth]);

  const getIconsForDay = (day: Date) => {
    const dayActs = activities.filter(a => isSameDay(parseISO(a.logged_at), day));
    const types: string[] = [];
    if (dayActs.some(a => a.activity_type === 'walk')) types.push('walk');
    if (dayActs.some(a => a.activity_type === 'pee')) types.push('pee');
    if (dayActs.some(a => a.activity_type === 'poop')) types.push('poop');
    return types;
  };

  const handleDeleteType = async (ids: string[]) => {
    const { error } = await supabase.from('activity_log').delete().in('id', ids);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    }
  };

  const handleDeleteOne = async (ids: string[]) => {
    const { error } = await supabase.from('activity_log').delete().eq('id', ids[ids.length - 1]);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Removed one');
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    }
  };

  const handleSubmitLog = (data: { weather: 'sun' | 'rain'; date: Date; didPee: boolean; didPoop: boolean; notes?: string }) => {
    logActivity.mutate({ type: 'walk', weather: data.weather, date: data.date, notes: data.notes });
    if (data.didPee) logActivity.mutate({ type: 'pee', weather: data.weather, date: data.date });
    if (data.didPoop) logActivity.mutate({ type: 'poop', weather: data.weather, date: data.date });
    setShowLogDialog(false);
  };

  const canGoForward = viewMonth.getMonth() < now.getMonth() || viewMonth.getFullYear() < now.getFullYear();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-foreground" />
          <h1 className="text-xl font-display font-bold text-foreground">History</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Monthly stats bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <PawPrint className="w-4 h-4" />, count: monthlyStats.walks, label: 'Walks' },
            { icon: <PoopIcon className="w-4 h-4" />, count: monthlyStats.poops, label: 'Poops' },
            { icon: <Droplets className="w-4 h-4" />, count: monthlyStats.pees, label: 'Pees' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
              <span className="text-foreground">{stat.icon}</span>
              <div>
                <p className="text-lg font-display font-bold text-foreground leading-tight">{stat.count}</p>
                <p className="text-[10px] font-display text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="sm" onClick={() => setViewMonth(prev => subMonths(prev, 1))} className="p-1">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </Button>
              <h2 className="font-display font-bold text-foreground">
                {format(viewMonth, 'MMMM yyyy')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setViewMonth(prev => addMonths(prev, 1))} disabled={!canGoForward} className="p-1">
                <ChevronRight className="w-5 h-5" style={{ color: canGoForward ? undefined : 'hsl(var(--border))' }} />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-xs font-display font-bold py-1 text-muted-foreground">{d}</span>
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
                      background: isSelected ? 'hsl(25 30% 35%)' : isToday ? 'hsl(var(--muted))' : 'transparent',
                      color: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                    }}
                  >
                    <span>{day.getDate()}</span>
                    {types.length > 0 && (
                      <span className="flex gap-px">
                        {types.map(t => (
                          <span
                            key={t}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))' }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Log a Walk button */}
        <motion.div whileTap={{ scale: user ? 0.97 : 1 }}>
          <Button
            onClick={() => user ? setShowLogDialog(true) : navigate('/auth')}
            className="w-full h-14 rounded-2xl text-lg font-display font-bold shadow-lg bg-primary text-primary-foreground"
          >
            <PawPrint className="w-5 h-5 mr-2" />
            {user ? 'Log a Walk' : 'Login to Log'}
          </Button>
        </motion.div>

        {/* Day detail */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-border bg-card">
              <CardContent className="p-4">
                <h3 className="font-display font-bold mb-2 text-foreground">{format(selectedDate, 'EEEE, MMM d')}</h3>
                {consolidatedActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities logged.</p>
                ) : (
                  <div className="space-y-2">
                    {consolidatedActivities.map(item => (
                      <div key={item.type} className="rounded-xl p-2 bg-muted">
                        <div className="flex items-center gap-3 text-sm">
                          <ActivityIcon type={item.type} />
                          <div className="flex-1">
                            <span className="font-semibold capitalize text-foreground">
                              {item.type}
                              {item.count > 1 && (
                                <span className="ml-1 font-normal text-muted-foreground">×{item.count}</span>
                              )}
                            </span>
                          </div>
                          <span className="flex gap-1 mr-1">
                            {item.weather.includes('sun') && <Sun className="w-3.5 h-3.5 text-foreground" />}
                            {item.weather.includes('rain') && <CloudRain className="w-3.5 h-3.5 text-foreground" />}
                          </span>
                          {user && (
                            item.count > 1 ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDeleteOne(item.ids)}
                                  className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                                  title="Remove one"
                                >
                                  <span className="text-[10px] font-bold text-muted-foreground">−1</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteType(item.ids)}
                                  className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                                  title="Delete all"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeleteType(item.ids)}
                                className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )
                          )}
                        </div>
                        {item.notes.length > 0 && (
                          <div className="mt-2 pl-8 text-xs text-muted-foreground">
                            {item.notes.map((note, i) => (
                              <p key={i} className="italic">"{note}"</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weather Insights */}
        <WeatherInsights activities={activities} />
      </div>

      <LogWalkDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        onSubmit={handleSubmitLog}
        isPending={logActivity.isPending}
      />

      <BottomNav />
    </div>
  );
};

export default History;
