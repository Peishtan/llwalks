import { NavLink } from 'react-router-dom';
import { PawPrint, LayoutDashboard, CalendarDays } from 'lucide-react';

const BottomNav = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs font-display font-semibold transition-colors ${
      isActive ? 'opacity-100' : 'opacity-50'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-4">
        <NavLink to="/" className={linkClass}>
          <PawPrint className="w-5 h-5" style={{ color: '#5D4037' }} />
          <span className="text-[10px]" style={{ color: '#5D4037' }}>Path</span>
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-5 h-5" style={{ color: '#5D4037' }} />
          <span className="text-[10px]" style={{ color: '#5D4037' }}>Dashboard</span>
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          <CalendarDays className="w-5 h-5" style={{ color: '#5D4037' }} />
          <span className="text-[10px]" style={{ color: '#5D4037' }}>History</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
