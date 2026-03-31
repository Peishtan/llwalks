import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, ChevronDown } from 'lucide-react';
import { getDaysInMonth, format } from 'date-fns';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PawPathProps {
  walkDays: Set<number>;
  isRaining: boolean;
  selectedMonth: number; // 0-indexed
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  availableMonths?: { month: number; year: number }[];
}

// Monthly theme definitions
const THEMES: Record<number, {
  name: string;
  goalName: string;
  bgGradient: string;
  pathStroke: string;
  overlayColor: string;
  emoji: string;
}> = {
  0: { name: 'Snowy Peaks', goalName: 'Mountain Summit ⛰️', bgGradient: 'linear-gradient(180deg, hsl(210 30% 92%) 0%, hsl(200 25% 85%) 40%, hsl(38 40% 92%) 100%)', pathStroke: '#8D99A6', overlayColor: 'rgba(230,240,250,0.35)', emoji: '❄️' },
  1: { name: 'Cozy Cabin', goalName: 'Warm Hearth 🏠', bgGradient: 'linear-gradient(180deg, hsl(25 30% 88%) 0%, hsl(30 35% 85%) 40%, hsl(20 25% 80%) 100%)', pathStroke: '#A1887F', overlayColor: 'rgba(245,235,220,0.35)', emoji: '🧣' },
  2: { name: 'Spring Buds', goalName: 'First Bloom 🌱', bgGradient: 'linear-gradient(180deg, hsl(120 30% 90%) 0%, hsl(100 35% 88%) 40%, hsl(80 30% 85%) 100%)', pathStroke: '#81A87A', overlayColor: 'rgba(220,240,220,0.35)', emoji: '🌿' },
  3: { name: 'Cherry Blossoms', goalName: 'Petal Path 🌸', bgGradient: 'linear-gradient(180deg, hsl(340 40% 92%) 0%, hsl(350 35% 90%) 40%, hsl(30 30% 88%) 100%)', pathStroke: '#C48B9F', overlayColor: 'rgba(250,230,240,0.35)', emoji: '🌸' },
  4: { name: 'Wildflower Meadow', goalName: 'Garden Gate 🌺', bgGradient: 'linear-gradient(180deg, hsl(90 40% 88%) 0%, hsl(120 35% 85%) 40%, hsl(50 40% 88%) 100%)', pathStroke: '#7EA87A', overlayColor: 'rgba(230,245,225,0.35)', emoji: '🌼' },
  5: { name: 'Sunny Trail', goalName: 'Sunshine Summit ☀️', bgGradient: 'linear-gradient(180deg, hsl(45 60% 90%) 0%, hsl(40 55% 85%) 40%, hsl(35 45% 82%) 100%)', pathStroke: '#D4943A', overlayColor: 'rgba(255,248,230,0.35)', emoji: '☀️' },
  6: { name: 'Beach Walk', goalName: 'Seaside Cove 🏖️', bgGradient: 'linear-gradient(180deg, hsl(195 50% 88%) 0%, hsl(45 50% 88%) 40%, hsl(35 40% 85%) 100%)', pathStroke: '#7EB5C9', overlayColor: 'rgba(225,245,255,0.35)', emoji: '🐚' },
  7: { name: 'Forest Adventure', goalName: 'Treetop Canopy 🌲', bgGradient: 'linear-gradient(180deg, hsl(130 30% 85%) 0%, hsl(140 35% 78%) 40%, hsl(100 25% 82%) 100%)', pathStroke: '#6B8F5E', overlayColor: 'rgba(215,235,210,0.35)', emoji: '🌲' },
  8: { name: 'Harvest Path', goalName: 'Harvest Barn 🌾', bgGradient: 'linear-gradient(180deg, hsl(40 45% 88%) 0%, hsl(35 50% 82%) 40%, hsl(25 40% 78%) 100%)', pathStroke: '#B8945A', overlayColor: 'rgba(245,238,220,0.35)', emoji: '🌾' },
  9: { name: 'Autumn Leaves', goalName: 'Cozy Campfire 🍂', bgGradient: 'linear-gradient(180deg, hsl(25 50% 85%) 0%, hsl(15 55% 78%) 40%, hsl(35 45% 80%) 100%)', pathStroke: '#C4703A', overlayColor: 'rgba(245,230,215,0.35)', emoji: '🍂' },
  10: { name: 'Misty Morning', goalName: 'Moonlit Peak 🌙', bgGradient: 'linear-gradient(180deg, hsl(220 15% 88%) 0%, hsl(240 10% 85%) 40%, hsl(260 12% 82%) 100%)', pathStroke: '#8888A0', overlayColor: 'rgba(235,235,245,0.35)', emoji: '🌫️' },
  11: { name: 'Winter Wonderland', goalName: 'Holiday Hearth 🎄', bgGradient: 'linear-gradient(180deg, hsl(200 20% 90%) 0%, hsl(150 30% 88%) 40%, hsl(0 40% 88%) 100%)', pathStroke: '#7AAF7A', overlayColor: 'rgba(235,248,235,0.35)', emoji: '🎄' },
};

// Tile colors — warm brown, orange, beige
const TILE_COLORS = [
  '#A1887F', '#E8A957', '#D7C4A5',
  '#8D6E63', '#F5A623', '#E8D5B7',
  '#795548', '#D4943A', '#C9B896',
];

// Generate a smooth S-curve SVG path
function generateSCurvePath(totalTiles: number, width: number, height: number): string {
  const padding = { top: 40, bottom: 50, left: 30, right: 30 };
  const usableW = width - padding.left - padding.right;
  const usableH = height - padding.top - padding.bottom;
  const rows = Math.ceil(totalTiles / 5);
  const rowHeight = usableH / Math.max(rows - 1, 1);

  const points: { x: number; y: number }[] = [];

  for (let r = 0; r < rows; r++) {
    const y = padding.top + r * rowHeight;
    const isEven = r % 2 === 0;
    // Alternate between left-leaning and right-leaning curves
    const xStart = isEven ? padding.left : width - padding.right;
    const xEnd = isEven ? width - padding.right : padding.left;

    if (r === 0) {
      points.push({ x: xStart, y });
      points.push({ x: xStart + (xEnd - xStart) * 0.5, y });
      points.push({ x: xEnd, y });
    } else {
      // Add a smooth turn from previous row
      const prevY = padding.top + (r - 1) * rowHeight;
      const midY = (prevY + y) / 2;
      points.push({ x: xStart, y: midY });
      points.push({ x: xStart, y });
      points.push({ x: xStart + (xEnd - xStart) * 0.5, y });
      points.push({ x: xEnd, y });
    }
  }

  // Build smooth cubic bezier path
  if (points.length < 2) return `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) * 0.5;
    const cpY2 = curr.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }

  return d;
}

const PawPath = ({ walkDays, isRaining, selectedMonth, selectedYear, onMonthChange, availableMonths }: PawPathProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [tilePositions, setTilePositions] = useState<{ x: number; y: number; angle: number }[]>([]);

  const totalSpaces = getDaysInMonth(new Date(selectedYear, selectedMonth));
  const theme = THEMES[selectedMonth];

  const svgWidth = 400;
  const svgHeight = 520;

  const pathD = useMemo(() => generateSCurvePath(totalSpaces, svgWidth, svgHeight), [totalSpaces]);

  // Use getPointAtLength to place tiles along path
  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    const totalLength = pathEl.getTotalLength();
    const positions: { x: number; y: number; angle: number }[] = [];

    for (let i = 0; i < totalSpaces; i++) {
      const ratio = totalSpaces > 1 ? i / (totalSpaces - 1) : 0;
      const point = pathEl.getPointAtLength(ratio * totalLength);

      // Get angle from nearby points for rotation
      const delta = 0.5;
      const p1 = pathEl.getPointAtLength(Math.max(0, ratio * totalLength - delta));
      const p2 = pathEl.getPointAtLength(Math.min(totalLength, ratio * totalLength + delta));
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

      positions.push({ x: point.x, y: point.y, angle });
    }

    setTilePositions(positions);
  }, [pathD, totalSpaces]);

  // LL's position = latest walked day (0-indexed)
  const position = useMemo(() => {
    let max = -1;
    walkDays.forEach(d => { if (d - 1 > max) max = d - 1; });
    return max;
  }, [walkDays]);

  // Build month options
  const monthOptions = useMemo(() => {
    const now = new Date();
    const opts: { month: number; year: number; label: string }[] = [];
    // Show last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: format(d, 'MMMM yyyy'),
      });
    }
    return opts;
  }, []);

  const currentSelectValue = `${selectedYear}-${selectedMonth}`;

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-border shadow-xl">
      {/* Month selector */}
      <div className="relative z-30 px-4 py-2.5 flex items-center justify-between" style={{ background: 'hsl(var(--card))' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{theme.emoji}</span>
          <span className="text-xs font-display font-bold text-foreground">{theme.name}</span>
        </div>
        <Select
          value={currentSelectValue}
          onValueChange={(val) => {
            const [y, m] = val.split('-').map(Number);
            onMonthChange(m, y);
          }}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs font-display font-bold bg-muted border-border rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => (
              <SelectItem key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board area */}
      <div className="relative w-full" style={{ paddingBottom: '130%' }}>
        {/* Theme background */}
        <div
          className="absolute inset-0"
          style={{ background: theme.bgGradient }}
        />
        <div className="absolute inset-0" style={{ background: theme.overlayColor }} />

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
                  background: 'hsl(var(--muted-foreground))',
                  opacity: 0.4,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* SVG path + tiles */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full z-10"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* The trail path */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke={theme.pathStroke}
            strokeWidth="6"
            strokeDasharray="12,6"
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Tile circles */}
          {tilePositions.map((pos, i) => {
            const dayNum = i + 1;
            const isCurrentPos = i === position;
            const hadWalk = walkDays.has(dayNum);
            const color = TILE_COLORS[i % TILE_COLORS.length];
            const tileR = isCurrentPos ? 16 : 12;

            return (
              <g key={i}>
                {/* Shadow */}
                <circle
                  cx={pos.x}
                  cy={pos.y + 2}
                  r={tileR}
                  fill="rgba(0,0,0,0.15)"
                />
                {/* Main tile */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={tileR}
                  fill={isCurrentPos ? 'transparent' : hadWalk ? '#C9B896' : color}
                  stroke={isCurrentPos ? '#F5A623' : hadWalk ? '#A1887F' : '#795548'}
                  strokeWidth={isCurrentPos ? 3 : 2}
                  opacity={hadWalk && !isCurrentPos ? 0.85 : 1}
                />
                {/* Content */}
                {isCurrentPos ? null : hadWalk ? (
                  // Small paw print for walked days — using a simple circle dot pattern
                  <>
                    <circle cx={pos.x} cy={pos.y} r={2.5} fill="#5D4037" />
                    <circle cx={pos.x - 3} cy={pos.y - 4} r={1.5} fill="#5D4037" />
                    <circle cx={pos.x + 3} cy={pos.y - 4} r={1.5} fill="#5D4037" />
                    <circle cx={pos.x - 5} cy={pos.y - 1} r={1.3} fill="#5D4037" />
                    <circle cx={pos.x + 5} cy={pos.y - 1} r={1.3} fill="#5D4037" />
                  </>
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="#5D4037"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="'Fredoka', sans-serif"
                  >
                    {dayNum}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* LL Avatar overlay (HTML for framer-motion) */}
        {position >= 0 && tilePositions[position] && (
          <motion.div
            key={`ll-${position}-${selectedMonth}-${selectedYear}`}
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${(tilePositions[position].x / svgWidth) * 100}%`,
              top: `${(tilePositions[position].y / svgHeight) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{
                border: '3px solid #F5A623',
                boxShadow: '0 0 14px rgba(245,166,35,0.5), 0 3px 8px rgba(0,0,0,0.25)',
                background: 'hsl(var(--card))',
              }}
            >
              <img
                src={llAvatar}
                alt="LL"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg"
              />
            </div>
          </motion.div>
        )}

        {/* Finish label */}
        {tilePositions.length > 0 && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${(tilePositions[tilePositions.length - 1].x / svgWidth) * 100}%`,
              top: `${((tilePositions[tilePositions.length - 1].y + 28) / svgHeight) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-[8px] sm:text-[10px] font-display font-bold whitespace-nowrap text-foreground">
              {theme.goalName}
            </span>
          </div>
        )}
      </div>

      {/* Path complete celebration */}
      {position >= totalSpaces - 1 && position >= 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative text-center px-4 py-3 border-t border-border"
          style={{ background: 'hsl(var(--card))' }}
        >
          <span className="text-3xl">🏆</span>
          <p className="font-display font-bold text-sm mt-1 text-foreground">Path Complete!</p>
          <p className="text-xs text-muted-foreground">Amazing job this month!</p>
        </motion.div>
      )}

      {/* Bottom bar */}
      <div className="relative border-t border-border px-4 py-2 flex justify-center items-center" style={{ background: 'hsl(var(--card))' }}>
        <span className="text-xs font-display font-bold text-foreground">
          {walkDays.size} / {totalSpaces} days walked
        </span>
      </div>
    </div>
  );
};

export default PawPath;
