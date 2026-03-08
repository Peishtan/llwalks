import { useState, useMemo } from 'react';
import { getDaysInMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivities } from '@/hooks/useActivities';
import PawPath from '@/components/PawPath';
import TreatCounter from '@/components/TreatCounter';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudRain, Droplets, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useProfile();
  const { activities, logActivity } = useActivities();
  const [weather, setWeather] = useState<'sun' | 'rain'>('sun');
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const totalSpaces = getDaysInMonth(new Date());
  const today = new Date().toISOString().split('T')[0];

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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl">
          🐾
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={llAvatar} alt="LL" className="w-8 h-8 rounded-full object-contain" style={{ background: '#F5E6D0' }} />
            <div>
              <h1 className="text-lg font-display font-bold" style={{ color: '#5D4037' }}>
                {profile.dog_name}'s Path
              </h1>
              <p className="text-xs font-body" style={{ color: '#8D6E63' }}>
                Day {profile.path_position} of {totalSpaces}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TreatCounter count={profile.treat_count} />
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs rounded-xl">
              👋
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PawPath position={profile.path_position} isRaining={weather === 'rain'} />
        </motion.div>

        {profile.path_position >= totalSpaces && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center rounded-2xl p-4 border-2"
            style={{ background: '#F5E6D0', borderColor: '#D4943A' }}
          >
            <span className="text-4xl">🏆</span>
            <p className="font-display font-bold text-lg mt-2" style={{ color: '#5D4037' }}>Path Complete!</p>
            <p className="text-sm" style={{ color: '#8D6E63' }}>Amazing job this month!</p>
          </motion.div>
        )}

        {/* Log a Walk section */}
        <Card className="border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg" style={{ color: '#5D4037' }}>Log a Walk</h2>
              <span className="text-sm font-display" style={{ color: '#8D6E63' }}>
                {format(new Date(), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              {/* Walk */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => logActivity.mutate({ type: 'walk', weather })}
                  disabled={logActivity.isPending}
                  className="h-14 w-14 rounded-2xl shadow-md flex flex-col items-center justify-center p-0"
                  style={{ background: '#8D6E63', color: '#FFF8F0' }}
                >
                  <span className="text-xl">🐾</span>
                  <span className="text-[9px] font-display font-bold">Walk</span>
                </Button>
              </motion.div>

              {/* Pee */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => logActivity.mutate({ type: 'pee', weather })}
                  disabled={logActivity.isPending}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl shadow-md flex flex-col items-center justify-center p-0"
                  style={{ borderColor: '#A1887F', background: '#F5E6D0', color: '#5D4037' }}
                >
                  <Droplets className="w-5 h-5" style={{ color: '#8D6E63' }} />
                  <span className="text-[9px] font-display font-bold">Pee</span>
                </Button>
              </motion.div>

              {/* Poop */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => logActivity.mutate({ type: 'poop', weather })}
                  disabled={logActivity.isPending}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl shadow-md flex flex-col items-center justify-center p-0"
                  style={{ borderColor: '#A1887F', background: '#F5E6D0', color: '#5D4037' }}
                >
                  <span className="text-xl">🍫</span>
                  <span className="text-[9px] font-display font-bold">Poop</span>
                </Button>
              </motion.div>

              {/* Weather toggle */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setWeather(w => w === 'sun' ? 'rain' : 'sun')}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl shadow-md flex flex-col items-center justify-center p-0"
                  style={{ borderColor: '#A1887F', background: weather === 'sun' ? '#FFF8F0' : '#E8D5B7', color: '#5D4037' }}
                >
                  {weather === 'sun' ? (
                    <Sun className="w-5 h-5" style={{ color: '#D4943A' }} />
                  ) : (
                    <CloudRain className="w-5 h-5" style={{ color: '#795548' }} />
                  )}
                  <span className="text-[9px] font-display font-bold">{weather === 'sun' ? 'Sun' : 'Rain'}</span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Today's logs */}
        {todayActivities.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm" style={{ color: '#5D4037' }}>Today's Log</h3>
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
                      <span className="text-lg">
                        {a.activity_type === 'walk' ? '🐾' : a.activity_type === 'pee' ? '💧' : '🍫'}
                      </span>
                      <div className="flex-1">
                        <span className="font-display font-semibold capitalize text-sm" style={{ color: '#5D4037' }}>
                          {a.activity_type}
                        </span>
                        <span className="ml-2">
                          {a.weather === 'rain' ? (
                            <CloudRain className="w-3.5 h-3.5 inline" style={{ color: '#795548' }} />
                          ) : (
                            <Sun className="w-3.5 h-3.5 inline" style={{ color: '#D4943A' }} />
                          )}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: '#8D6E63' }}>
                        {new Date(a.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {a.treats_earned > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5E6D0', color: '#8D6E63' }}>
                          +{a.treats_earned} 🦴
                        </span>
                      )}
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
