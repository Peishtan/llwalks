import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDaysInMonth } from 'date-fns';
import poodleAvatar from '@/assets/poodle-avatar.png';
import boardBg from '@/assets/board-background.jpg';

interface PawPathProps {
  position: number;
  isRaining: boolean;
}

// Tile colors — warm brown, orange, beige pattern
const TILE_COLORS = [
  '#A1887F', '#E8A957', '#D7C4A5',
  '#8D6E63', '#F5A623', '#E8D5B7',
  '#795548', '#D4943A', '#C9B896',
];

// Nature decorations for tiles
const DECORATIONS = [
  '🌿', '🍂', '🌸', '🪨', '🌻', '🍃', '🌷', '🪵', '🌺', '🌼',
  '🍄', '🦋', '🐿️', '🌿', '🍁', '🌸', '🪶', '🌻', '🐞', '🌷',
  '🍀', '🌺', '🪨', '🌼', '🍃', '🍂', '🌿', '🐛', '🌸', '🪵',
  '🦜',
];

// Landmark labels at key positions
const LANDMARKS: Record<number, string> = {
  0: '🏠 Garden Start',
  7: '🌲 Pine Grove',
  14: '🌊 Fern Gully',
  21: '🫐 Berry Patch',
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

    // X: spread across 5%–95%
    const x = 5 + actualCol * (90 / (tilesPerRow - 1));

    // Y: spread across 8%–88%
    const yBase = 8 + row * (80 / (rows - 1 || 1));

    // Add slight wave
    const wave = Math.sin(actualCol * 0.8) * 2;
    const y = yBase + wave;

    positions.push({ x, y });
  }

  return positions;
}

const PawPath = ({ position, isRaining }: PawPathProps) => {
  const now = new Date();
  const totalSpaces = getDaysInMonth(now);
  const lastIdx = totalSpaces - 1;

  const pathPositions = useMemo(() => generatePathPositions(totalSpaces), [totalSpaces]);

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-secondary/50 shadow-xl">
      {/* Background image */}
      <div className="relative w-full" style={{ paddingBottom: '120%' }}>
        <img
          src={boardBg}
          alt="Garden path background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay to darken slightly for tile readability */}
        <div className="absolute inset-0 bg-black/15" />

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
                  background: 'hsl(210, 80%, 70%)',
                  opacity: 0.6,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-blue-900/15" />
          </div>
        )}

        {/* SVG path connector lines */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 120" preserveAspectRatio="none">
          {pathPositions.map((pos, i) => {
            if (i === 0) return null;
            const prev = pathPositions[i - 1];
            const isVisitedSegment = i <= position;
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={pos.x}
                y2={pos.y}
                stroke={isVisitedSegment ? '#4CAF50' : '#8D6E63'}
                strokeWidth="1.2"
                strokeDasharray={isVisitedSegment ? 'none' : '2,1'}
                opacity={isVisitedSegment ? 0.8 : 0.4}
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
                top: `${pos.y - 5}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-[7px] sm:text-[9px] font-display font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
                {label}
              </span>
            </div>
          );
        })}

        {/* Tiles */}
        {pathPositions.map((pos, i) => {
          const isCurrentPos = i === position;
          const isVisited = i < position;
          const isStart = i === 0;
          const isEnd = i === lastIdx;
          const color = TILE_COLORS[i % TILE_COLORS.length];
          const decoration = DECORATIONS[i % DECORATIONS.length];

          return (
            <div
              key={i}
              className="absolute z-20 flex flex-col items-center"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Decoration above tile */}
              {!isCurrentPos && (
                <span className="text-[8px] sm:text-[10px] leading-none mb-0.5 drop-shadow-sm">
                  {isStart ? '🏠' : isEnd ? '🏆' : decoration}
                </span>
              )}

              {/* Tile */}
              <div
                className={`
                  relative flex items-center justify-center
                  rounded-lg sm:rounded-xl font-display font-bold
                  border transition-all duration-300 cursor-default
                  ${isCurrentPos
                    ? 'w-10 h-10 sm:w-12 sm:h-12 z-30 border-2 border-yellow-400 shadow-[0_0_16px_rgba(255,200,0,0.6)]'
                    : 'w-7 h-7 sm:w-9 sm:h-9 border border-black/20'}
                  ${isVisited ? 'opacity-90' : !isCurrentPos ? 'opacity-70' : ''}
                `}
                style={{
                  backgroundColor: isVisited ? '#66BB6A' : color,
                  boxShadow: isCurrentPos
                    ? '0 0 16px rgba(255,200,0,0.6), 0 4px 8px rgba(0,0,0,0.3)'
                    : '0 2px 4px rgba(0,0,0,0.25)',
                }}
              >
                {isCurrentPos ? (
                  <motion.img
                    key={`poodle-${position}`}
                    src={poodleAvatar}
                    alt="Your poodle"
                    className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                ) : isVisited ? (
                  <span className="text-[10px] sm:text-xs opacity-70">🐾</span>
                ) : (
                  <span className="text-[8px] sm:text-[10px] text-white font-bold drop-shadow-sm">
                    {i + 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Finish cabin label */}
        {totalSpaces > 0 && (
          <div
            className="absolute z-15 pointer-events-none"
            style={{
              left: `${pathPositions[lastIdx].x}%`,
              top: `${pathPositions[lastIdx].y + 5}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-[7px] sm:text-[9px] font-display font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
              🏆 Mountain Summit
            </span>
          </div>
        )}
      </div>

      {/* Bottom legend bar */}
      <div className="relative bg-card/90 backdrop-blur-sm border-t border-border px-4 py-2 flex justify-between items-center">
        <span className="text-xs font-display text-muted-foreground">
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <span className="text-xs font-display font-bold text-foreground">
          Day {position} / {totalSpaces}
        </span>
      </div>
    </div>
  );
};

export default PawPath;
