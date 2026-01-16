import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '@/services/api/authService';
import { useTheme } from '@/hooks/useTheme';
import {
  Map,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tractor,
  User,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/monitoramento', label: 'Monitoramento', icon: Map },
  { path: '/relatorios', label: 'Relatórios', icon: FileText },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Tractor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Agritel</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto p-1.5 bg-primary rounded-lg">
            <Tractor className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-sidebar-accent hover:bg-sidebar-accent/80 p-1 rounded-full border border-sidebar-border transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}

          {/* Theme Toggle as Menu Item */}
          <li>
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground`}
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Moon className="w-5 h-5 flex-shrink-0" />
              )}
              {!isCollapsed && <span className="font-medium">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
