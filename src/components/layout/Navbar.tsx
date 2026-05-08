import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Menu, Bell, Settings, LogOut, User, LayoutDashboard, DollarSign,
  FolderOpen, FileText, CreditCard, HandCoins, GraduationCap, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Ingresos y Gastos', href: '/income-expenses', icon: DollarSign },
  { label: 'Expediente', href: '/documents', icon: FolderOpen },
  { label: 'Declaraciones', href: '/declarations', icon: FileText },
  { label: 'Pagos', href: '/payments', icon: CreditCard },
  { label: 'Apoyos', href: '/support-credits', icon: HandCoins },
  { label: 'Aprende', href: '/tutorials', icon: GraduationCap },
  { label: 'Ajustes', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        setUnreadNotifications(prev => prev + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (href: string) => location.pathname === href;

  if (!user || loading) return null;

  const userInitials = user.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';

  const userEmail = user.email || '';
  const userName = user.user_metadata?.full_name || userEmail;

  return (
    <>
      <aside className="hidden md:flex md:w-72 md:flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white border-r border-slate-700 fixed h-screen">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400 hover:text-emerald-300 transition-colors mb-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              RF
            </div>
            <span>Resico Fácil</span>
          </Link>
          <p className="text-xs text-slate-400 truncate mt-3">{userName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50'
                )}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-3" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="md:ml-72 w-full flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-2 font-bold text-emerald-700">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              RF
            </div>
            <span className="text-lg">Resico Fácil</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-600 hover:text-emerald-700"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white">
                  <div className="p-6 border-b border-slate-700">
                    <p className="text-sm font-medium text-slate-300">{userName}</p>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) => cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-300 hover:bg-slate-700/50'
                          )}
                        >
                          <Icon size={18} />
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </nav>
                  <div className="p-4 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                      onClick={handleSignOut}
                    >
                      <LogOut size={18} className="mr-3" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-emerald-200">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 font-normal">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 pb-20 md:pb-6">
          {/* Contenido de página va aquí */}
        </main>
      </div>
    </>
  );
}
