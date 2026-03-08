import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Sun, CloudRain, Droplets, PawPrint, CalendarIcon } from 'lucide-react';
import PoopIcon from '@/components/PoopIcon';
import { cn } from '@/lib/utils';

interface LogWalkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { weather: 'sun' | 'rain'; date: Date; didPee: boolean; didPoop: boolean }) => void;
  isPending?: boolean;
}

const LogWalkDialog = ({ open, onOpenChange, onSubmit, isPending }: LogWalkDialogProps) => {
  const [weather, setWeather] = useState<'sun' | 'rain'>('sun');
  const [logDate, setLogDate] = useState<Date>(new Date());
  const [didPee, setDidPee] = useState(false);
  const [didPoop, setDidPoop] = useState(false);

  const handleSubmit = () => {
    onSubmit({ weather, date: logDate, didPee, didPoop });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLogDate(new Date());
      setWeather('sun');
      setDidPee(false);
      setDidPoop(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          {/* Pee & Poop toggles */}
          <div>
            <p className="text-xs font-display font-bold mb-2" style={{ color: '#8D6E63' }}>Did LL also...</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDidPee(p => !p)}
                variant="outline"
                className={`flex-1 h-14 rounded-2xl font-display font-bold flex flex-col gap-0.5 ${didPee ? 'ring-2' : ''}`}
                style={{
                  borderColor: '#A1887F',
                  background: didPee ? '#F5E6D0' : '#FFF8F0',
                  color: '#5D4037',
                }}
              >
                <Droplets className="w-5 h-5" style={{ color: '#5D4037' }} />
                <span className="text-xs">Pee</span>
              </Button>
              <Button
                onClick={() => setDidPoop(p => !p)}
                variant="outline"
                className={`flex-1 h-14 rounded-2xl font-display font-bold flex flex-col gap-0.5 ${didPoop ? 'ring-2' : ''}`}
                style={{
                  borderColor: '#A1887F',
                  background: didPoop ? '#F5E6D0' : '#FFF8F0',
                  color: '#5D4037',
                }}
              >
                <PoopIcon className="w-5 h-5" style={{ color: '#5D4037' }} />
                <span className="text-xs">Poop</span>
              </Button>
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
                }}
              >
                <Sun className="w-5 h-5 mr-1" style={{ color: '#5D4037' }} />
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
                }}
              >
                <CloudRain className="w-5 h-5 mr-1" style={{ color: '#5D4037' }} />
                Rainy
              </Button>
            </div>
          </div>

          {/* Submit button */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full h-14 rounded-2xl text-base font-display font-bold shadow-md"
              style={{ background: '#8D6E63', color: '#FFF8F0' }}
            >
              <PawPrint className="w-5 h-5 mr-2" />
              Log Walk
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogWalkDialog;
