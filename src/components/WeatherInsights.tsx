import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, CloudRain, Flame, PawPrint } from 'lucide-react';
import { toSeattleDateStr, getSeattleTodayStr } from '@/lib/timezone';
import PoopIcon from '@/components/PoopIcon';
import { motion } from 'framer-motion';

interface Activity {
  activity_type: string;
  weather: string;
  logged_at: string;
}

const WeatherInsights = ({ activities }: { activities: Activity[] }) => {
  const insights = useMemo(() => {
    const walks = activities.filter(a => a.activity_type === 'walk');
    const sunWalks = walks.filter(a => a.weather === 'sun').length;
    const rainWalks = walks.filter(a => a.weather === 'rain').length;
    const totalWalks = walks.length;

    // Group walks by date to find unique walk dates
    const walkDates = new Set(walks.map(a => toSeattleDateStr(a.logged_at)));
    const poops = activities.filter(a => a.activity_type === 'poop');

    // Poop rate by weather
    const sunPoops = poops.filter(a => a.weather === 'sun').length;
    const rainPoops = poops.filter(a => a.weather === 'rain').length;
    const sunPoopRate = sunWalks > 0 ? Math.round((sunPoops / sunWalks) * 100) : 0;
    const rainPoopRate = rainWalks > 0 ? Math.round((rainPoops / rainWalks) * 100) : 0;

    // Streak calculation
    const sortedDates = Array.from(walkDates).sort().reverse();
    let streak = 0;
    const todayStr = getSeattleTodayStr();
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(todayStr + 'T12:00:00');
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sortedDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return { sunWalks, rainWalks, totalWalks, sunPoopRate, rainPoopRate, streak };
  }, [activities]);

  if (insights.totalWalks === 0) return null;

  const rainPercent = insights.totalWalks > 0 ? Math.round((insights.rainWalks / insights.totalWalks) * 100) : 0;
  const sunPercent = 100 - rainPercent;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Streak */}
      {insights.streak > 0 && (
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-3 flex items-center gap-3">
            <Flame className="w-6 h-6 text-foreground" />
            <div>
              <p className="font-display font-bold text-foreground text-lg leading-tight">{insights.streak}-day streak!</p>
              <p className="text-xs text-muted-foreground font-display">Keep it going <PawPrint className="w-3 h-3 inline text-foreground" /></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather split bar */}
      <Card className="border-2 border-border bg-card">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-display font-bold text-foreground text-sm">Rain vs Sun</h3>
          <div className="flex rounded-full overflow-hidden h-6 bg-muted">
            {sunPercent > 0 && (
              <div
                className="flex items-center justify-center text-[10px] font-bold font-display transition-all"
                style={{ width: `${sunPercent}%`, background: 'hsl(45 90% 65%)' }}
              >
                {sunPercent > 15 && <><Sun className="w-3 h-3 mr-0.5" /> {sunPercent}%</>}
              </div>
            )}
            {rainPercent > 0 && (
              <div
                className="flex items-center justify-center text-[10px] font-bold font-display text-primary-foreground transition-all"
                style={{ width: `${rainPercent}%`, background: 'hsl(25 30% 35%)' }}
              >
                {rainPercent > 15 && <><CloudRain className="w-3 h-3 mr-0.5" /> {rainPercent}%</>}
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-display">
            <span><Sun className="w-3 h-3 inline mr-0.5" />{insights.sunWalks} walks</span>
            <span><CloudRain className="w-3 h-3 inline mr-0.5" />{insights.rainWalks} walks</span>
          </div>
        </CardContent>
      </Card>

      {/* Poop insight */}
      {(insights.sunWalks > 2 || insights.rainWalks > 2) && (
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <PoopIcon className="w-5 h-5 text-foreground" />
              <h3 className="font-display font-bold text-foreground text-sm">Poop vs Weather</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-muted text-center">
                <Sun className="w-4 h-4 mx-auto text-foreground" />
                <p className="text-xl font-display font-bold text-foreground mt-1">{insights.sunPoopRate}%</p>
                <p className="text-[10px] text-muted-foreground font-display">poop rate</p>
              </div>
              <div className="rounded-xl p-3 bg-muted text-center">
                <CloudRain className="w-4 h-4 mx-auto text-foreground" />
                <p className="text-xl font-display font-bold text-foreground mt-1">{insights.rainPoopRate}%</p>
                <p className="text-[10px] text-muted-foreground font-display">poop rate</p>
              </div>
            </div>
            {insights.rainPoopRate < insights.sunPoopRate && insights.rainWalks > 2 && (
              <p className="text-xs text-muted-foreground font-display italic text-center">
                LL poops {insights.sunPoopRate - insights.rainPoopRate}% less when it rains! <CloudRain className="w-3 h-3 inline text-muted-foreground" />
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default WeatherInsights;
