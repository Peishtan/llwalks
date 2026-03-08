import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDaysInMonth } from 'date-fns';
import poodleAvatar from '@/assets/poodle-avatar.png';

interface PawPathProps {
  position: number;
  isRaining: boolean;
}

const PawPath = ({ position, isRaining }: PawPathProps) => {
  const now = new Date();
  const totalSpaces = getDaysInMonth(now);

  // Build a winding path: 5 columns, alternating direction
  const cols = 5;
  const rows = useMemo(() => {
    const result: number[][] = [];
    for (let i = 0; i < totalSpaces; i += cols) {
      const row: number[] = [];
      for (let j = 0; j < cols && i + j < totalSpaces; j++) {
        row.push(i + j);
      }
      if (result.length % 2 === 1) row.reverse();
      result.push(row);
    }
    return result;
  }, [totalSpaces]);

  // Decoration for each space
  const getDecoration = (idx: number) => {
    if (idx === 0) return '🏠';
    if (idx === totalSpaces - 1) return '🏆';
    if (idx % 2 === 0) return '🌳';
    const flowers = ['🌸', '🌻', '🌷', '🌺', '🌼'];
    return flowers[idx % flowers.length];
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-secondary/50 shadow-lg">
      {/* Garden background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, hsl(145, 45%, 88%) 0%, hsl(100, 40%, 85%) 50%, hsl(80, 45%, 82%) 100%)`,
        }}
      />

      {/* Subtle grass texture */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 80%, hsl(120,40%,60%) 1px, transparent 1px),
                          radial-gradient(circle at 60% 30%, hsl(120,40%,60%) 1px, transparent 1px),
                          radial-gradient(circle at 85% 70%, hsl(120,40%,60%) 1px, transparent 1px)`,
        backgroundSize: '60px 40px',
      }} />

      {/* Rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="rain-drop absolute w-0.5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${14 + Math.random() * 18}px`,
                background: 'hsl(200, 70%, 65%)',
                opacity: 0.5,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
          {/* Darken sky slightly */}
          <div className="absolute inset-0 bg-paw-blue/10" />
        </div>
      )}

      {/* Path content */}
      <div className="relative z-10 px-3 py-5 space-y-1">
        {/* Month title */}
        <div className="text-center mb-3">
          <h2 className="font-display font-bold text-secondary-foreground/80 text-sm tracking-wide uppercase">
            {now.toLocaleString('default', { month: 'long' })} Garden Path
          </h2>
        </div>

        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center items-center gap-1">
            {/* Connector from previous row */}
            {row.map((spaceIdx) => {
              const isCurrentPos = spaceIdx === position;
              const isVisited = spaceIdx < position;
              const decoration = getDecoration(spaceIdx);

              // Tile colors cycle through garden tones
              const tileColors = [
                'hsl(25, 60%, 72%)', // warm dirt
                'hsl(35, 55%, 75%)', // sandy
                'hsl(30, 50%, 70%)', // earthy
                'hsl(40, 55%, 75%)', // golden
                'hsl(20, 50%, 70%)', // terracotta
              ];
              const tileColor = tileColors[spaceIdx % tileColors.length];
              const visitedColor = 'hsl(145, 40%, 65%)';

              return (
                <div key={spaceIdx} className="relative flex flex-col items-center">
                  {/* Decoration above */}
                  <span className="text-xs leading-none mb-0.5 h-4">
                    {decoration}
                  </span>

                  {/* Path tile */}
                  <div
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center
                      font-display font-bold text-xs
                      border-2 transition-all duration-300
                      ${isCurrentPos ? 'ring-3 ring-primary/60 shadow-xl scale-110 z-10' : ''}
                      ${isVisited ? 'border-secondary/40' : 'border-border/30'}
                    `}
                    style={{
                      backgroundColor: isVisited ? visitedColor : isCurrentPos ? visitedColor : tileColor,
                      boxShadow: isCurrentPos
                        ? '0 4px 20px hsl(25, 85%, 55%, 0.4)'
                        : isVisited
                        ? '0 2px 6px hsl(145, 40%, 50%, 0.3)'
                        : '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {isCurrentPos ? (
                      <motion.img
                        key={`poodle-${position}`}
                        src={poodleAvatar}
                        alt="Your poodle"
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : isVisited ? (
                      <span className="text-base opacity-60">🐾</span>
                    ) : (
                      <span className="text-foreground/40 text-[11px]">{spaceIdx + 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex justify-between mt-4 px-4">
          <span className="text-xs font-display text-foreground/50">🏠 Home</span>
          <span className="text-xs font-display text-foreground/50">
            Day {position} / {totalSpaces}
          </span>
          <span className="text-xs font-display text-foreground/50">🏆 Finish</span>
        </div>
      </div>
    </div>
  );
};

export default PawPath;
