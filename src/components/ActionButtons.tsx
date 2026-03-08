import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  weather: 'sun' | 'rain';
  onToggleWeather: () => void;
  onLogWalk: () => void;
  onLogPee: () => void;
  onLogPoop: () => void;
  disabled: boolean;
}

const ActionButtons = ({ weather, onToggleWeather, onLogWalk, onLogPee, onLogPoop, disabled }: ActionButtonsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onLogWalk}
            disabled={disabled}
            className="h-14 px-6 rounded-2xl text-base font-display font-semibold shadow-md"
          >
            🐾 Walk
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onLogPee}
            disabled={disabled}
            variant="secondary"
            className="h-14 px-6 rounded-2xl text-base font-display font-semibold shadow-md"
          >
            💧 Pee
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onLogPoop}
            disabled={disabled}
            variant="secondary"
            className="h-14 px-6 rounded-2xl text-base font-display font-semibold shadow-md"
          >
            🍫 Poop
          </Button>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onToggleWeather}
            variant="outline"
            className="h-10 rounded-2xl font-display"
          >
            {weather === 'sun' ? '☀️ Sunny' : '🌧️ Rainy'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ActionButtons;
