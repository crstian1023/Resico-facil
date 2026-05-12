import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  LayoutDashboard, DollarSign, FolderOpen, FileText,
  GraduationCap, CreditCard, Settings, LogOut, Menu, X,
  HandCoins, ArrowLeft, Users, UserPlus, Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const taxpayerNav = [
  { to: '/dashboard',       label: 'Inicio',          icon: LayoutDashboard },
  { to: '/income-expenses', label: 'Ingresos y Gastos',icon: DollarSign },
  { to: '/documents',       label: 'Expediente',       icon: FolderOpen },
  { to: '/declarations',    label: 'Declaraciones',    icon: FileText },
  { to: '/payments',        label: 'Pagos',            icon: CreditCard },
  { to: '/support-credits', label: 'Apoyos',           icon: HandCoins },
  { to: '/tutorials',       label: 'Aprende',          icon: GraduationCap },
  { to: '/settings',        label: 'Ajustes',          icon: Settings },
];

const accountantNav = [
  { to: '/contador',  label: 'Mis Clientes', icon: Users },
  { to: '/settings',  label: 'Ajustes',      icon: Settings },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: role } = useUserRole();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isAccountant = role === 'accountant' || role === 'admin';
  const navItems = isAccountant ? accountantNav : taxpayerNav;
  const homeRoute = isAccountant ? '/contador' : '/dashboard';
  const isHome = location.pathname === homeRoute;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            {isAccountant && <Calculator size={16} className="text-sidebar-primary" />}
            <h1 className="text-xl font-bold font-display text-sidebar-primary">Resico Fácil</h1>
          </div>
          <p className="text-xs text-sidebar-foreground/60 truncate">{displayName}</p>
          {isAccountant && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary/80 bg-sidebar-primary/10 px-2 py-0.5 rounded-full">
              Contador
            </span>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-display text-primary">Resico Fácil</h1>
            {isAccountant && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full">
                Contador
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </header>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl p-4 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <p className="text-sm font-medium truncate">{displayName}</p>
                {isAccountant && (
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">Contador</span>
                )}
              </div>
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-destructive hover:bg-muted w-full mt-4"
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {!isHome && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                onClick={() => navigate(homeRoute)}
              >
                <ArrowLeft size={16} /> Inicio
              </Button>
            </div>
          )}
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-40">
          {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              {label.split(' ')[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
