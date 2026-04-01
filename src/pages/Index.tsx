import { useState, useMemo } from 'react';
import { getDaysInMonth } from 'date-fns';
import { getSeattleNow, toSeattleMonthStr, toSeattleDay } from '@/lib/timezone';
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

  const now = getSeattleNow();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const selectedMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  const walkDays = useMemo(() => {
    const days = new Set<number>();
    activities.forEach(a => {
      if (a.activity_type === 'walk' && a.logged_at.startsWith(selectedMonthStr)) {
        const day = new Date(a.logged_at).getDate();
        days.add(day);
      }
    });
    return days;
  }, [activities, selectedMonthStr]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <PawPrint className="w-10 h-10 text-foreground" />
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

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={llAvatar} alt="LL" className="w-8 h-8 rounded-full object-contain" />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">
                LL Walks
              </h1>
              <p className="text-xs font-body text-muted-foreground">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs rounded-xl font-display text-foreground">
              Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs rounded-xl font-display text-foreground">
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PawPath
            walkDays={walkDays}
            isRaining={false}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </motion.div>

        {/* Log a Walk button — only show for current month */}
        {isCurrentMonth && (
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
        )}
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
