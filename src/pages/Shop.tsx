import { useProfile } from '@/hooks/useProfile';
import { useUnlockables } from '@/hooks/useUnlockables';
import { useActivities } from '@/hooks/useActivities';
import { COSMETIC_ITEMS, BADGE_DEFINITIONS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TreatCounter from '@/components/TreatCounter';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { getDaysInMonth } from 'date-fns';
import { toast } from 'sonner';

const Shop = () => {
  const { profile } = useProfile();
  const { unlockables, purchaseItem, unlockBadge } = useUnlockables();
  const { activities } = useActivities();

  const unlockedIds = useMemo(() => new Set(unlockables.map(u => u.item_id)), [unlockables]);
  const checkedRef = useRef<Set<string>>(new Set());

  // Auto-check badges
  useEffect(() => {
    if (!profile || !activities) return;

    const checkBadge = (id: string, condition: boolean) => {
      if (condition && !unlockedIds.has(id) && !checkedRef.current.has(id)) {
        checkedRef.current.add(id);
        unlockBadge.mutate(id);
        const badge = BADGE_DEFINITIONS.find(b => b.id === id);
        if (badge) toast.success(`🏅 Badge earned: ${badge.name}!`);
      }
    };

    const walks = activities.filter(a => a.activity_type === 'walk');
    checkBadge('first-walk', walks.length >= 1);
    checkBadge('rainy-walker', walks.some(w => w.weather === 'rain'));
    checkBadge('path-complete', profile.path_position >= getDaysInMonth(new Date()));
    checkBadge('treats-50', profile.treat_count >= 50);
    checkBadge('treats-100', profile.treat_count >= 100);

    // 7-day streak check
    if (walks.length >= 7) {
      const dates = [...new Set(walks.map(w => w.logged_at.split('T')[0]))].sort();
      let maxStreak = 1, streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
        if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
        else streak = 1;
      }
      checkBadge('streak-7', maxStreak >= 7);
    }
  }, [profile, activities, unlockedIds]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold">🎁 Treat Shop</h1>
          <TreatCounter count={profile.treat_count} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Badges */}
        <div>
          <h2 className="text-lg font-display font-bold mb-3">🏅 Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map(badge => {
              const unlocked = unlockedIds.has(badge.id);
              return (
                <motion.div key={badge.id} whileHover={{ scale: 1.02 }}>
                  <Card className={`border-2 ${unlocked ? 'border-accent bg-accent/20' : 'border-border bg-muted/30 opacity-60'}`}>
                    <CardContent className="p-3 text-center">
                      <span className="text-3xl">{unlocked ? badge.emoji : '🔒'}</span>
                      <p className="font-display font-semibold text-sm mt-1">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Cosmetics */}
        <div>
          <h2 className="text-lg font-display font-bold mb-3">🎨 Cosmetics</h2>
          <div className="grid grid-cols-2 gap-3">
            {COSMETIC_ITEMS.map(item => {
              const owned = unlockedIds.has(item.id);
              return (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }}>
                  <Card className={`border-2 ${owned ? 'border-secondary bg-secondary/20' : 'border-border'}`}>
                    <CardContent className="p-3 text-center space-y-2">
                      <span className="text-3xl">{item.emoji}</span>
                      <p className="font-display font-semibold text-sm">{item.name}</p>
                      {owned ? (
                        <span className="text-xs text-secondary font-bold">✅ Owned</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => purchaseItem.mutate({ itemId: item.id, cost: item.cost })}
                          disabled={profile.treat_count < item.cost || purchaseItem.isPending}
                          className="rounded-xl font-display text-xs"
                        >
                          🦴 {item.cost} treats
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Shop;
