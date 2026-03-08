import { motion, AnimatePresence } from 'framer-motion';

interface TreatCounterProps {
  count: number;
}

const TreatCounter = ({ count }: TreatCounterProps) => {
  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-accent/80 text-accent-foreground px-4 py-2 rounded-full font-display font-bold text-lg shadow-md border-2 border-accent"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-xl">🦴</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export default TreatCounter;
