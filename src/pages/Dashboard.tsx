import { useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import TreatCounter from '@/components/TreatCounter';
import { motion } from 'framer-motion';
import llAvatar from '@/assets/ll-avatar.png';

const Dashboard = () => {
  const { activities } = useActivities();
  const { profile } = useProfile();

  const today = new Date().toISOString().split('T')[0];

  const todayStats = useMemo(() => {
    const todayActs = activities.filter(a => a.logged_at.startsWith(today));
    return {
      walks: todayActs.filter(a => a.activity_type === 'walk').length,
      pees: todayActs.filter(a => a.activity_type === 'pee').length,
      poops: todayActs.filter(a => a.activity_type === 'poop').length,
      treatsToday: todayActs.reduce((sum, a) => sum + a.treats_earned, 0),
    };
  }, [activities, today]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">📊 LL's Dashboard</h1>
          <TreatCounter count={profile.treat_count} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* LL avatar card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-border overflow-hidden" style={{ background: '#FFF8F0' }}>
            <CardContent className="p-5 flex items-center gap-4">
              <img src={llAvatar} alt="LL" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: '#8D6E63' }} />
              <div>
                <h2 className="font-display font-bold text-lg" style={{ color: '#5D4037' }}>LL's Day</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-border" style={{ background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl">🐾</span>
                <p className="text-2xl font-display font-bold mt-1" style={{ color: '#5D4037' }}>{todayStats.walks}</p>
                <p className="text-xs text-muted-foreground font-display">Walks</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-2 border-border" style={{ background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl">💧</span>
                <p className="text-2xl font-display font-bold mt-1" style={{ color: '#5D4037' }}>{todayStats.pees}</p>
                <p className="text-xs text-muted-foreground font-display">Pees</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-border" style={{ background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl">🍫</span>
                <p className="text-2xl font-display font-bold mt-1" style={{ color: '#5D4037' }}>{todayStats.poops}</p>
                <p className="text-xs text-muted-foreground font-display">Poops</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Treats earned today */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-2 border-border" style={{ background: '#FFF8F0' }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold" style={{ color: '#5D4037' }}>Treats Earned Today</p>
                <p className="text-xs text-muted-foreground">
                  {todayStats.pees > 0 || todayStats.poops > 0
                    ? `${todayStats.pees} pee × 1 + ${todayStats.poops} poop × 2`
                    : 'Log pee or poop to earn treats!'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl">🦴</span>
                <span className="text-2xl font-display font-bold" style={{ color: '#F5A623' }}>{todayStats.treatsToday}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-bold mb-2" style={{ color: '#5D4037' }}>Today's Log</h3>
          {activities.filter(a => a.logged_at.startsWith(today)).length === 0 ? (
            <Card className="border-2 border-border" style={{ background: '#FFF8F0' }}>
              <CardContent className="p-4 text-center text-muted-foreground text-sm">
                No activities yet today. Go log a walk! 🐾
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {activities
                .filter(a => a.logged_at.startsWith(today))
                .map(a => (
                  <Card key={a.id} className="border border-border" style={{ background: '#FFF8F0' }}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-xl">
                        {a.activity_type === 'walk' ? '🐾' : a.activity_type === 'pee' ? '💧' : '🍫'}
                      </span>
                      <div className="flex-1">
                        <span className="font-display font-semibold capitalize text-sm" style={{ color: '#5D4037' }}>
                          {a.activity_type}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {a.weather === 'rain' ? '🌧️' : '☀️'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {a.treats_earned > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5E6D0', color: '#8D6E63' }}>
                          +{a.treats_earned} 🦴
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
