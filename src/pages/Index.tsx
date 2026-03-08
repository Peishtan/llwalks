import { useState, useMemo } from 'react';
import { getDaysInMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivities } from '@/hooks/useActivities';
import PawPath from '@/components/PawPath';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import { motion } from 'framer-motion';
import { Sun, CloudRain, Droplets, PawPrint, CalendarIcon } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import { cn } from '@/lib/utils';

const Index = () => {
  const { signOut } = useAuth();
  const { profile, isLoading } = useProfile();
  const { activities, logActivity } = useActivities();
  const [weather, setWeather] = useState<'sun' | 'rain'>('sun');
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logDate, setLogDate] = useState<Date>(new Date());

  const totalSpaces = getDaysInMonth(new Date());
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  // Compute which days of the month had walks
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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <PawPrint className="w-10 h-10" style={{ color: '#5D4037' }} />
        </motion.div>
      </div>
    );
  }

  const handleLog = (type: 'walk' | 'pee' | 'poop') => {
    logActivity.mutate({ type, weather, date: logDate });
    if (type === 'walk') setShowLogDialog(false);
  };

  const openLogDialog = () => {
    setLogDate(new Date());
    setShowLogDialog(true);
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
                {profile.dog_name}'s Path
              </h1>
              <p className="text-xs font-body" style={{ color: '#8D6E63' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-xs rounded-xl">
            👋
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PawPath walkDays={walkDays} isRaining={weather === 'rain'} />
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
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => openLogDialog()}
            className="w-full h-16 rounded-2xl text-lg font-display font-bold shadow-lg"
            style={{ background: '#8D6E63', color: '#FFF8F0' }}
          >
            <PawPrint className="w-6 h-6 mr-2" />
            Log a Walk
          </Button>
        </motion.div>
      </div>

      {/* Log dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-2" style={{ borderColor: '#D7C4A5', background: '#FFF8F0' }}>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-center" style={{ color: '#5D4037' }}>
              Log a Walk
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Date picker */}
            <div>
              <p className="text-xs font-display font-bold mb-2" style={{ color: '#8D6E63' }}>Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-display rounded-2xl h-12"
                    style={{ borderColor: '#A1887F', background: '#FFF8F0', color: '#5D4037' }}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" style={{ color: '#8D6E63' }} />
                    {format(logDate, 'EEEE, MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={logDate}
                    onSelect={(d) => d && setLogDate(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => handleLog('walk')}
                disabled={logActivity.isPending}
                className="w-full h-14 rounded-2xl text-base font-display font-bold shadow-md"
                style={{ background: '#8D6E63', color: '#FFF8F0' }}
              >
                <PawPrint className="w-5 h-5 mr-2" />
                Log Walk
              </Button>
            </motion.div>

            {/* Pee & Poop */}
            <div>
              <p className="text-xs font-display font-bold mb-2" style={{ color: '#8D6E63' }}>Did LL also...</p>
              <div className="flex gap-3">
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    onClick={() => handleLog('pee')}
                    disabled={logActivity.isPending}
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-display font-bold flex flex-col gap-0.5"
                    style={{ borderColor: '#A1887F', background: '#F5E6D0', color: '#5D4037' }}
                  >
                    <Droplets className="w-5 h-5" style={{ color: '#8D6E63' }} />
                    <span className="text-xs">Pee</span>
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    onClick={() => handleLog('poop')}
                    disabled={logActivity.isPending}
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-display font-bold flex flex-col gap-0.5"
                    style={{ borderColor: '#A1887F', background: '#F5E6D0', color: '#5D4037' }}
                  >
                    <PoopIcon className="w-5 h-5" style={{ color: '#5D4037' }} />
                    <span className="text-xs">Poop</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Weather */}
            <div>
              <p className="text-xs font-display font-bold mb-2" style={{ color: '#8D6E63' }}>Weather</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setWeather('sun')}
                  variant="outline"
                  className={`flex-1 h-12 rounded-2xl font-display font-bold ${weather === 'sun' ? 'ring-2' : ''}`}
                  style={{
                    borderColor: '#A1887F',
                    background: weather === 'sun' ? '#F5E6D0' : '#FFF8F0',
                    color: '#5D4037',
                    ...(weather === 'sun' ? { ringColor: '#D4943A' } : {}),
                  }}
                >
                  <Sun className="w-5 h-5 mr-1" style={{ color: '#D4943A' }} />
                  Sunny
                </Button>
                <Button
                  onClick={() => setWeather('rain')}
                  variant="outline"
                  className={`flex-1 h-12 rounded-2xl font-display font-bold ${weather === 'rain' ? 'ring-2' : ''}`}
                  style={{
                    borderColor: '#A1887F',
                    background: weather === 'rain' ? '#E8D5B7' : '#FFF8F0',
                    color: '#5D4037',
                    ...(weather === 'rain' ? { ringColor: '#795548' } : {}),
                  }}
                >
                  <CloudRain className="w-5 h-5 mr-1" style={{ color: '#795548' }} />
                  Rainy
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Index;
