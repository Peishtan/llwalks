import { useState, useMemo } from 'react';
import { getDaysInMonth } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivities } from '@/hooks/useActivities';
import PawPath from '@/components/PawPath';
import BottomNav from '@/components/BottomNav';
import LogWalkDialog from '@/components/LogWalkDialog';
import { Button } from '@/components/ui/button';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useProfile();
  const { activities, logActivity } = useActivities();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const navigate = useNavigate();

  const totalSpaces = getDaysInMonth(new Date());
  const currentMonth = new Date().toISOString().slice(0, 7);

  const walkDays = useMemo(() => {
    const days = new Set<number>();
    activities.forEach(a => {
      if (a.activity_type === 'walk' && a.logged_at.startsWith(currentMonth)) {
        const day = new Date(a.logged_at).getDate();
        days.add(day);
      }
    });
    return days;
  }, [activities, currentMonth]);

  const latestWalkDay = useMemo(() => {
    let max = 0;
    walkDays.forEach(d => { if (d > max) max = d; });
    return max;
  }, [walkDays]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <PawPrint className="w-10 h-10" style={{ color: '#5D4037' }} />
        </motion.div>
      </div>
    );
  }

  const handleSubmitLog = (data: { weather: 'sun' | 'rain'; date: Date; didPee: boolean; didPoop: boolean; notes?: string }) => {
    logActivity.mutate({ type: 'walk', weather: data.weather, date: data.date, notes: data.notes });
    if (data.didPee) logActivity.mutate({ type: 'pee', weather: data.weather, date: data.date });
    if (data.didPoop) logActivity.mutate({ type: 'poop', weather: data.weather, date: data.date });
    setShowLogDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={llAvatar} alt="LL" className="w-8 h-8 rounded-full object-contain" />
            <div>
              <h1 className="text-lg font-display font-bold" style={{ color: '#5D4037' }}>
                LL Walks
              </h1>
              <p className="text-xs font-body" style={{ color: '#8D6E63' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs rounded-xl font-display" style={{ color: '#5D4037' }}>
              Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs rounded-xl font-display" style={{ color: '#5D4037' }}>
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PawPath walkDays={walkDays} isRaining={false} />
        </motion.div>

        {latestWalkDay >= totalSpaces && (
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

        {/* Log a Walk button */}
        <motion.div whileTap={{ scale: user ? 0.97 : 1 }}>
          <Button
            onClick={() => user ? setShowLogDialog(true) : navigate('/auth')}
            className="w-full h-16 rounded-2xl text-lg font-display font-bold shadow-lg"
            style={{ background: '#8D6E63', color: '#FFF8F0' }}
          >
            <PawPrint className="w-6 h-6 mr-2" />
            {user ? 'Log a Walk' : 'Login to Log'}
          </Button>
        </motion.div>
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

export default Index;
