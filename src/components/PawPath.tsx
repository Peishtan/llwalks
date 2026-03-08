import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDaysInMonth } from 'date-fns';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import boardBg from '@/assets/board-background.jpg';

interface PawPathProps {
  position: number;
  isRaining: boolean;
}

// Tile colors — warm brown, orange, beige only
const TILE_COLORS = [
  '#A1887F', '#E8A957', '#D7C4A5',
  '#8D6E63', '#F5A623', '#E8D5B7',
  '#795548', '#D4943A', '#C9B896',
];

// Landmark labels at key positions
const LANDMARKS: Record<number, string> = {
  0: 'Garden Start',
  7: 'Pine Grove',
  14: 'Fern Gully',
  21: 'Berry Patch',
};

// Generate winding S-curve path positions (percentages)
function generatePathPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const rows = Math.ceil(count / 7);
  const tilesPerRow = 7;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / tilesPerRow);
    const col = i % tilesPerRow;
    const isReversed = row % 2 === 1;
    const actualCol = isReversed ? (tilesPerRow - 1 - col) : col;
    const x = 5 + actualCol * (90 / (tilesPerRow - 1));
    const yBase = 8 + row * (80 / (rows - 1 || 1));
    const wave = Math.sin(actualCol * 0.8) * 2;
    positions.push({ x, y: yBase + wave });
  }

  return positions;
}

const PawPath = ({ position, isRaining }: PawPathProps) => {
  const now = new Date();
  const totalSpaces = getDaysInMonth(now);
  const lastIdx = totalSpaces - 1;

  const pathPositions = useMemo(() => generatePathPositions(totalSpaces), [totalSpaces]);

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-border shadow-xl">
      {/* Background image */}
      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
        <img
          src={boardBg}
          alt="Garden path background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Heavy fade so tiles pop */}
        <div className="absolute inset-0" style={{ background: 'rgba(255,252,245,0.55)' }} />

        {/* Rain overlay */}
        {isRaining && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="rain-drop absolute w-0.5 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${14 + Math.random() * 18}px`,
                  background: '#8D6E63',
                  opacity: 0.4,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* SVG path connector lines */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 120" preserveAspectRatio="none">
          {pathPositions.map((pos, i) => {
            if (i === 0) return null;
            const prev = pathPositions[i - 1];
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={pos.x}
                y2={pos.y}
                stroke="#8D6E63"
                strokeWidth="1.8"
                strokeDasharray="2,1"
                opacity={0.5}
              />
            );
          })}
        </svg>

        {/* Landmark labels */}
        {Object.entries(LANDMARKS).map(([idx, label]) => {
          const i = parseInt(idx);
          if (i >= totalSpaces) return null;
          const pos = pathPositions[i];
          return (
            <div
              key={`lm-${i}`}
              className="absolute z-15 pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y - 5.5}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-[7px] sm:text-[9px] font-display font-bold whitespace-nowrap" style={{ color: '#5D4037' }}>
                {label}
              </span>
            </div>
          );
        })}

        {/* Tiles */}
        {pathPositions.map((pos, i) => {
          const isCurrentPos = i === position;
          const isVisited = i < position;
          const color = TILE_COLORS[i % TILE_COLORS.length];

          return (
            <div
              key={i}
              className="absolute z-20 flex items-center justify-center"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`
                  flex items-center justify-center rounded-full font-display font-bold
                  transition-all duration-300
                  ${isCurrentPos
                    ? 'w-11 h-11 sm:w-14 sm:h-14 z-30'
                    : 'w-8 h-8 sm:w-10 sm:h-10'}
                `}
                style={{
                  backgroundColor: isVisited ? '#C9B896' : color,
                  border: isCurrentPos
                    ? '3px solid #F5A623'
                    : `2.5px solid ${isVisited ? '#A1887F' : '#795548'}`,
                  boxShadow: isCurrentPos
                    ? '0 0 14px rgba(245,166,35,0.5), 0 3px 8px rgba(0,0,0,0.25)'
                    : '0 2px 5px rgba(0,0,0,0.2)',
                  opacity: isVisited ? 0.85 : 1,
                }}
              >
                {isCurrentPos ? (
                  <motion.img
                    key={`ll-${position}`}
                    src={llAvatar}
                    alt="LL"
                    className="w-9 h-9 sm:w-12 sm:h-12 object-contain drop-shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                ) : isVisited ? (
                  <span className="text-[10px] sm:text-xs" style={{ color: '#795548' }}>🐾</span>
                ) : (
                  <span className="text-[9px] sm:text-[11px] font-bold" style={{ color: '#5D4037' }}>
                    {i + 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Finish label */}
        {totalSpaces > 0 && (
          <div
            className="absolute z-15 pointer-events-none"
            style={{
              left: `${pathPositions[lastIdx].x}%`,
              top: `${pathPositions[lastIdx].y + 5}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-[7px] sm:text-[9px] font-display font-bold whitespace-nowrap" style={{ color: '#5D4037' }}>
              Mountain Summit 🏆
            </span>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border px-4 py-2 flex justify-between items-center" style={{ background: '#F5F0E8' }}>
        <span className="text-xs font-display" style={{ color: '#8D6E63' }}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <span className="text-xs font-display font-bold" style={{ color: '#5D4037' }}>
          Day {position} / {totalSpaces}
        </span>
      </div>
    </div>
  );
};

export default PawPath;
