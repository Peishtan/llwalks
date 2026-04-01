import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDaysInMonth, format } from 'date-fns';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import januaryBg from '@/assets/themes/january-bg.jpg';
import julyBg from '@/assets/themes/july-bg.jpg';
import octoberBg from '@/assets/themes/october-bg.jpg';
import aprilBg from '@/assets/themes/april-bg.jpg';
import mayBg from '@/assets/themes/may-bg.jpg';
import juneBg from '@/assets/themes/june-bg.jpg';
import septemberBg from '@/assets/themes/september-bg.jpg';
import decemberBg from '@/assets/themes/december-bg.jpg';
import augustBg from '@/assets/themes/august-bg.jpg';
import marchBg from '@/assets/themes/march-bg.jpg';
import februaryBg from '@/assets/themes/february-bg.jpg';
import novemberBg from '@/assets/themes/november-bg.jpg';
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
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

// Theme config with backgroundType support
interface ThemeConfig {
  name: string;
  goalIcon: string;
  backgroundType: 'gradient' | 'image';
  backgroundValue: string;
  pathStroke: string;
  emoji: string;
  tileStroke: string;
  tileFill: string;
  textColor: string;
}

const THEMES: Record<number, ThemeConfig> = {
  0: {
    name: 'Snowy Peaks',
    goalIcon: 'Cozy Cabin Hearth 🏠',
    backgroundType: 'image',
    backgroundValue: januaryBg,
    pathStroke: '#7BA7C2',
    emoji: '❄️',
    tileStroke: '#5A8BA8',
    tileFill: '#D6EAF5',
    textColor: '#2C3E50',
  },
  1: {
    name: 'Ice Canyon',
    goalIcon: 'Crystal Cave 🧊',
    backgroundType: 'image',
    backgroundValue: februaryBg,
    pathStroke: '#90CAF9',
    emoji: '🧊',
    tileStroke: '#42A5F5',
    tileFill: '#E3F2FD',
    textColor: '#0D47A1',
  },
  2: {
    name: 'Highland Moor',
    goalIcon: 'Stone Cairn 🪨',
    backgroundType: 'image',
    backgroundValue: marchBg,
    pathStroke: '#6D4C41',
    emoji: '🌿',
    tileStroke: '#4E342E',
    tileFill: '#D7CCC8',
    textColor: '#3E2723',
  },
  3: {
    name: 'Cherry Blossoms',
    goalIcon: 'Pagoda Garden 🌸',
    backgroundType: 'image',
    backgroundValue: aprilBg,
    pathStroke: '#C2185B',
    emoji: '🌸',
    tileStroke: '#AD1457',
    tileFill: '#F8BBD0',
    textColor: '#880E4F',
  },
  4: {
    name: 'Ancient Forest',
    goalIcon: 'Old Growth Tree 🌲',
    backgroundType: 'image',
    backgroundValue: mayBg,
    pathStroke: '#4A7A3D',
    emoji: '🌿',
    tileStroke: '#33691E',
    tileFill: '#C8E6C9',
    textColor: '#1B5E20',
  },
  5: {
    name: 'Alpine Meadow',
    goalIcon: 'Mount Rainier Summit 🏔️',
    backgroundType: 'image',
    backgroundValue: juneBg,
    pathStroke: '#5C6BC0',
    emoji: '🌸',
    tileStroke: '#3949AB',
    tileFill: '#C5CAE9',
    textColor: '#1A237E',
  },
  6: {
    name: 'Beach Walk',
    goalIcon: 'Seaside Cove 🏖️',
    backgroundType: 'image',
    backgroundValue: julyBg,
    pathStroke: '#00ACC1',
    emoji: '🐚',
    tileStroke: '#00838F',
    tileFill: '#B2EBF2',
    textColor: '#004D40',
  },
  7: {
    name: 'Desert Oasis',
    goalIcon: 'Turquoise Pool 🏜️',
    backgroundType: 'image',
    backgroundValue: augustBg,
    pathStroke: '#E65100',
    emoji: '🏜️',
    tileStroke: '#BF360C',
    tileFill: '#FFE0B2',
    textColor: '#4E2700',
  },
  8: {
    name: 'Harvest Moon',
    goalIcon: 'Stone Winery 🍇',
    backgroundType: 'image',
    backgroundValue: septemberBg,
    pathStroke: '#CE93D8',
    emoji: '🍇',
    tileStroke: '#6A1B9A',
    tileFill: '#E1BEE7',
    textColor: '#4A148C',
  },
  9: {
    name: 'Autumn Woods',
    goalIcon: 'Cozy Campfire 🍂',
    backgroundType: 'image',
    backgroundValue: octoberBg,
    pathStroke: '#BF5B1B',
    emoji: '🍂',
    tileStroke: '#8D4004',
    tileFill: '#FFCC80',
    textColor: '#4E2700',
  },
  10: {
    name: 'Redwood Grove',
    goalIcon: 'Ancient Tree 🌲',
    backgroundType: 'image',
    backgroundValue: novemberBg,
    pathStroke: '#8D6E63',
    emoji: '🍂',
    tileStroke: '#5D4037',
    tileFill: '#D7CCC8',
    textColor: '#3E2723',
  },
  11: {
    name: 'Northern Lights',
    goalIcon: 'Aurora Village ✨',
    backgroundType: 'image',
    backgroundValue: decemberBg,
    pathStroke: '#81C784',
    emoji: '🎄',
    tileStroke: '#2E7D32',
    tileFill: '#C8E6C9',
    textColor: '#E8F5E9',
  },
};

// Walked-day tile colors
const WALKED_COLORS = ['#A1887F', '#D4943A', '#C9B896'];

// SVG dimensions
const SVG_W = 400;
const SVG_H = 540;

// Generate a smooth winding S-curve path string
function generateSCurvePath(totalTiles: number): string {
  const margin = { top: 45, bottom: 55, left: 50, right: 50 };
  const rows = Math.ceil(totalTiles / 5);
  const usableH = SVG_H - margin.top - margin.bottom;
  const rowSpacing = usableH / Math.max(rows - 1, 1);

  const waypoints: { x: number; y: number }[] = [];

  for (let r = 0; r < rows; r++) {
    const y = margin.top + r * rowSpacing;
    const goRight = r % 2 === 0;
    const xLeft = margin.left;
    const xRight = SVG_W - margin.right;

    if (goRight) {
      waypoints.push({ x: xLeft, y }, { x: xRight, y });
    } else {
      waypoints.push({ x: xRight, y }, { x: xLeft, y });
    }
  }

  if (waypoints.length < 2) return `M ${waypoints[0]?.x ?? 0} ${waypoints[0]?.y ?? 0}`;

  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;

  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    // For horizontal segments use simple curve, for vertical turns use tight S
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;

    if (Math.abs(dy) < 2) {
      // Horizontal — gentle wave
      const cpY = prev.y + (Math.random() - 0.5) * 8;
      d += ` C ${prev.x + dx * 0.33} ${cpY}, ${prev.x + dx * 0.66} ${cpY}, ${curr.x} ${curr.y}`;
    } else {
      // Vertical turn
      d += ` C ${prev.x} ${prev.y + dy * 0.6}, ${curr.x} ${curr.y - dy * 0.6}, ${curr.x} ${curr.y}`;
    }
  }

  return d;
}

const PawPath = ({ walkDays, isRaining, selectedMonth, selectedYear, onMonthChange }: PawPathProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [tilePositions, setTilePositions] = useState<{ x: number; y: number }[]>([]);

  const totalSpaces = getDaysInMonth(new Date(selectedYear, selectedMonth));
  const theme = THEMES[selectedMonth];

  // Stable path — memoized with a seed to avoid random jitter on re-render
  const pathD = useMemo(() => generateSCurvePath(totalSpaces), [totalSpaces, selectedMonth]);

  // Place tiles along the path using getPointAtLength
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    const totalLen = el.getTotalLength();
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < totalSpaces; i++) {
      const ratio = totalSpaces > 1 ? i / (totalSpaces - 1) : 0;
      const pt = el.getPointAtLength(ratio * totalLen);
      pts.push({ x: pt.x, y: pt.y });
    }

    setTilePositions(pts);
  }, [pathD, totalSpaces]);

  // LL position = today's date (0-indexed) for the current month, or latest walked day for past months
  const position = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (isCurrentMonth) {
      return now.getDate() - 1; // today's tile
    }
    // For past/future months, show on last walked day
    let max = -1;
    walkDays.forEach(d => { if (d - 1 > max) max = d - 1; });
    return max;
  }, [walkDays, selectedMonth, selectedYear]);

  // Month dropdown options — forward-looking desk calendar starting March 2026
  const monthOptions = useMemo(() => {
    const startMonth = 2; // March (0-indexed)
    const startYear = 2026;
    const opts: { month: number; year: number; label: string }[] = [];
    // Show 12 months forward from launch month
    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      opts.push({ month: d.getMonth(), year: d.getFullYear(), label: format(d, 'MMMM yyyy') });
    }
    return opts;
  }, []);

  const selectValue = `${selectedYear}-${selectedMonth}`;

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-border shadow-xl">
      {/* Month selector bar */}
      <div className="relative z-30 px-4 py-2.5 flex items-center justify-between border-b border-border" style={{ background: 'hsl(var(--card))' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{theme.emoji}</span>
          <span className="text-xs font-display font-bold text-foreground">{theme.name}</span>
        </div>
        <Select
          value={selectValue}
          onValueChange={(val) => {
            const [y, m] = val.split('-').map(Number);
            onMonthChange(m, y);
          }}
        >
          <SelectTrigger className="w-[155px] h-8 text-xs font-display font-bold bg-muted border-border rounded-xl">
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

      {/* Board */}
      <div className="relative w-full" style={{ paddingBottom: '135%' }}>
        {/* Background */}
        {theme.backgroundType === 'image' ? (
          <img
            src={theme.backgroundValue}
            alt={`${theme.name} scenery`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: theme.backgroundValue }} />
        )}

        {/* Rain overlay */}
        {isRaining && (
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="rain-drop absolute w-0.5 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${14 + Math.random() * 18}px`,
                  background: 'rgba(180,200,220,0.6)',
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* SVG dual-layered path */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Bottom layer — thick dark outline */}
          <path
            d={pathD}
            fill="none"
            stroke="#3E2723"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
          {/* Top layer — lighter inner stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={theme.pathStroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          {/* Hidden reference path for getPointAtLength */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="transparent"
            strokeWidth="0"
          />
        </svg>

        {/* Tile wrapper divs — positioned via percentage coords */}
        {tilePositions.map((pos, i) => {
          const dayNum = i + 1;
          const isCurrentPos = i === position;
          const hadWalk = walkDays.has(dayNum);

          return (
            <div
              key={i}
              className="absolute z-20 flex items-center justify-center"
              style={{
                left: `${(pos.x / SVG_W) * 100}%`,
                top: `${(pos.y / SVG_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Day tile circle */}
              <div
                className="flex items-center justify-center rounded-full font-display font-bold transition-all duration-300"
                style={{
                  width: isCurrentPos ? 46 : 32,
                  height: isCurrentPos ? 46 : 32,
                  backgroundColor: isCurrentPos
                    ? 'rgba(255,255,255,0.95)'
                    : hadWalk
                      ? '#C9B896D9'
                      : '#C9B896D9',
                  border: `2.5px solid ${isCurrentPos ? '#F5A623' : '#3E2723'}`,
                  boxShadow: isCurrentPos
                    ? '0 0 18px rgba(245,166,35,0.7), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 6px rgba(0,0,0,0.3)',
                }}
              >
                {isCurrentPos ? (
                  <motion.img
                    key={`ll-${position}-${selectedMonth}-${selectedYear}`}
                    src={llAvatar}
                    alt="LL, the hiking dog"
                    className="w-9 h-9 object-contain drop-shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                ) : hadWalk ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5D4037" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="12" cy="17" rx="5" ry="6" />
                    <circle cx="6" cy="8" r="3" />
                    <circle cx="18" cy="8" r="3" />
                    <circle cx="10" cy="4" r="2.5" />
                    <circle cx="14" cy="4" r="2.5" />
                  </svg>
                ) : (
                  <span
                    className="text-[9px] sm:text-[10px] font-bold"
                    style={{ color: '#3E2723' }}
                  >
                    {dayNum}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Goal label at end */}
        {tilePositions.length > 0 && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${(tilePositions[tilePositions.length - 1].x / SVG_W) * 100}%`,
              top: `${((tilePositions[tilePositions.length - 1].y + 26) / SVG_H) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span
              className="text-[8px] sm:text-[10px] font-display font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
              style={{
                color: theme.textColor,
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {theme.goalIcon}
            </span>
          </div>
        )}
      </div>

      {/* Path complete */}
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
