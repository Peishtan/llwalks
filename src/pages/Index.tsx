import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivities } from '@/hooks/useActivities';
import PawPath from '@/components/PawPath';
import TreatCounter from '@/components/TreatCounter';
import ActionButtons from '@/components/ActionButtons';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const { signOut } = useAuth();
  const { profile, isLoading } = useProfile();
  const { logActivity } = useActivities();
  const [weather, setWeather] = useState<'sun' | 'rain'>('sun');

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
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              🐕 {profile.dog_name}'s Path
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              Day {profile.path_position} of 30
            </p>
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

        {profile.path_position >= 30 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center bg-accent/30 rounded-2xl p-4 border-2 border-accent"
          >
            <span className="text-4xl">🏆</span>
            <p className="font-display font-bold text-lg mt-2">Path Complete!</p>
            <p className="text-sm text-muted-foreground">Amazing job this month!</p>
          </motion.div>
        )}

        <ActionButtons
          weather={weather}
          onToggleWeather={() => setWeather(w => w === 'sun' ? 'rain' : 'sun')}
          onLogWalk={() => logActivity.mutate({ type: 'walk', weather })}
          onLogPee={() => logActivity.mutate({ type: 'pee', weather })}
          onLogPoop={() => logActivity.mutate({ type: 'poop', weather })}
          disabled={logActivity.isPending}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
