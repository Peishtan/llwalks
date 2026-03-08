import { useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Sun, CloudRain, PawPrint, Droplets, LayoutDashboard } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ICON_COLOR = '#5D4037';

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'walk') return <PawPrint className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  if (type === 'pee') return <Droplets className="w-5 h-5" style={{ color: ICON_COLOR }} />;
  return <PoopIcon className="w-5 h-5" style={{ color: ICON_COLOR }} />;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { activities } = useActivities();
  const queryClient = useQueryClient();

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // All-time stats
  const allTimeStats = useMemo(() => {
    return {
      walks: activities.filter(a => a.activity_type === 'walk').length,
      pees: activities.filter(a => a.activity_type === 'pee').length,
      poops: activities.filter(a => a.activity_type === 'poop').length,
    };
  }, [activities]);

  // Weather breakdown for walks
  const weatherData = useMemo(() => {
    const walks = activities.filter(a => a.activity_type === 'walk');
    const sunny = walks.filter(a => a.weather === 'sun').length;
    const rainy = walks.filter(a => a.weather === 'rain').length;
    return [
      { name: 'Sunny', value: sunny, color: '#D4943A' },
      { name: 'Rainy', value: rainy, color: '#5D4037' },
    ].filter(d => d.value > 0);
  }, [activities]);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" style={{ color: ICON_COLOR }} />
          <h1 className="text-xl font-display font-bold" style={{ color: ICON_COLOR }}>Dashboard</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Weather pie chart */}
        {weatherData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-center mb-2" style={{ color: ICON_COLOR }}>Walk Weather</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={weatherData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {weatherData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        formatter={(value) => <span style={{ color: ICON_COLOR, fontFamily: 'var(--font-display)' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All-time stats: walks, pees, poops */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <PawPrint className="w-6 h-6" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-2" style={{ color: ICON_COLOR }}>{allTimeStats.walks}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Walks</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <PoopIcon className="w-6 h-6" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-2" style={{ color: ICON_COLOR }}>{allTimeStats.poops}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Poops</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center flex flex-col items-center">
                <Droplets className="w-6 h-6" style={{ color: ICON_COLOR }} />
                <p className="text-2xl font-display font-bold mt-2" style={{ color: ICON_COLOR }}>{allTimeStats.pees}</p>
                <p className="text-xs font-display" style={{ color: '#8D6E63' }}>Pees</p>
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
                        {user && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#A1887F' }} />
                          </button>
                        )}
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
