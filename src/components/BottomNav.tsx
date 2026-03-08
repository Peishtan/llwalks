import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs font-display font-semibold transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-2 border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <NavLink to="/" className={linkClass}>
          <span className="text-xl">🐾</span>
          <span>Path</span>
        </NavLink>
        <NavLink to="/shop" className={linkClass}>
          <span className="text-xl">🎁</span>
          <span>Shop</span>
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          <span className="text-xl">📅</span>
          <span>History</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
