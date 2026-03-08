import { motion } from 'framer-motion';
import { PATH_COLORS } from '@/lib/constants';

interface PawPathProps {
  position: number;
  isRaining: boolean;
}

const PawPath = ({ position, isRaining }: PawPathProps) => {
  const totalSpaces = 30;
  const spacesPerRow = 6;
  const rows: number[][] = [];

  for (let i = 0; i < totalSpaces; i += spacesPerRow) {
    const row = [];
    for (let j = 0; j < spacesPerRow && i + j < totalSpaces; j++) {
      row.push(i + j);
    }
    // Alternate direction for winding path
    if (rows.length % 2 === 1) row.reverse();
    rows.push(row);
  }

  return (
    <div className="relative p-4 rounded-2xl bg-card border-2 border-border overflow-hidden">
      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="rain-drop absolute w-0.5 bg-paw-blue/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${12 + Math.random() * 16}px`,
                animationDuration: `${0.6 + Math.random() * 0.6}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1.5">
            {row.map(spaceIdx => {
              const isCurrentPos = spaceIdx === position;
              const isVisited = spaceIdx < position;
              const colorClass = PATH_COLORS[spaceIdx % PATH_COLORS.length];

              return (
                <div
                  key={spaceIdx}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs font-bold font-display transition-all border-2
                    ${isVisited ? `${colorClass} border-foreground/10 opacity-90` : ''}
                    ${isCurrentPos ? `${colorClass} border-foreground/20 ring-2 ring-primary/50 shadow-lg` : ''}
                    ${!isVisited && !isCurrentPos ? 'bg-muted/50 border-border/50 text-muted-foreground/40' : 'text-foreground/70'}
                  `}
                >
                  {isCurrentPos ? (
                    <motion.span
                      key={`dog-${position}`}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.4 }}
                      className="text-xl"
                    >
                      🐕
                    </motion.span>
                  ) : isVisited ? (
                    <span className="text-sm">🐾</span>
                  ) : (
                    <span>{spaceIdx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Start / Finish labels */}
      <div className="flex justify-between mt-3 px-2">
        <span className="text-xs font-display text-muted-foreground">🏠 Start</span>
        <span className="text-xs font-display text-muted-foreground">🏆 Day 30</span>
      </div>
    </div>
  );
};

export default PawPath;
