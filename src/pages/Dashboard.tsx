import { useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Sun, CloudRain, PawPrint, Droplets, LayoutDashboard } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { startOfWeek, startOfMonth, startOfYear, isAfter, parseISO } from 'date-fns';

const ICON_COLOR = '#5D4037';

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'walk') return <PawPrint className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  if (type === 'pee') return <Droplets className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  return <PoopIcon className="w-5 h-5" style={{ color: ICON_COLOR }} />;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { activities } = useActivities();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const walkStats = useMemo(() => {
    const walks = activities.filter(a => a.activity_type === 'walk');
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    return {
      today: walks.filter(a => a.logged_at.startsWith(today)).length,
      week: walks.filter(a => isAfter(parseISO(a.logged_at), weekStart)).length,
      month: walks.filter(a => isAfter(parseISO(a.logged_at), monthStart)).length,
      year: walks.filter(a => isAfter(parseISO(a.logged_at), yearStart)).length,
    };
  }, [activities, today]);

  const todayStats = useMemo(() => {
    const todayActs = activities.filter(a => a.logged_at.startsWith(today));
    return {
      walks: todayActs.filter(a => a.activity_type === 'walk').length,
      pees: todayActs.filter(a => a.activity_type === 'pee').length,
      poops: todayActs.filter(a => a.activity_type === 'poop').length,
    };
  }, [activities, today]);

  const todayActivities = useMemo(() => {
    return activities.filter(a => a.logged_at.startsWith(today));
  }, [activities, today]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('activity_log').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Log deleted');
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" style={{ color: ICON_COLOR }} />
          <h1 className="text-xl font-display font-bold" style={{ color: ICON_COLOR }}>LL's Dashboard</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* LL avatar card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
            <CardContent className="p-5 flex items-center gap-4">
              <img src={llAvatar} alt="LL" className="w-16 h-16 rounded-full object-contain" />
              <div>
                <h2 className="font-display font-bold text-lg" style={{ color: ICON_COLOR }}>LL's Day</h2>
                <p className="text-sm" style={{ color: '#8D6E63' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <PawPrint className="w-7 h-7" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-1" style={{ color: ICON_COLOR }}>{todayStats.walks}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Walks</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <Droplets className="w-7 h-7" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-1" style={{ color: ICON_COLOR }}>{todayStats.pees}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Pees</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <PoopIcon className="w-7 h-7" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-1" style={{ color: ICON_COLOR }}>{todayStats.poops}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Poops</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Today's log with delete */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-bold mb-2" style={{ color: ICON_COLOR }}>Today's Log</h3>
          {todayActivities.length === 0 ? (
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center text-sm" style={{ color: '#8D6E63' }}>
                No activities yet today. Go log a walk!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {todayActivities.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <Card className="border" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <ActivityIcon type={a.activity_type} />
                        <div className="flex-1">
                          <span className="font-display font-semibold capitalize text-sm" style={{ color: ICON_COLOR }}>
                            {a.activity_type}
                          </span>
                          <span className="ml-2">
                            {a.weather === 'rain' ? (
                              <CloudRain className="w-3.5 h-3.5 inline" style={{ color: ICON_COLOR }} />
                            ) : (
                              <Sun className="w-3.5 h-3.5 inline" style={{ color: ICON_COLOR }} />
                            )}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: '#8D6E63' }}>
                          {new Date(a.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#A1887F' }} />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
