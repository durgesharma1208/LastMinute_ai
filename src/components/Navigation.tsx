import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarRange, 
  Flame, 
  Sparkles, 
  MessageSquare,
  LogOut,
  User as UserIcon,
  Bell
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  setShowNotifications: (show: boolean) => void;
  showNotifications: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  unreadCount,
  setShowNotifications,
  showNotifications
}) => {
  const { user, handleLogout } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Backlog', icon: CheckSquare },
    { id: 'scheduler', label: 'AI Scheduler', icon: CalendarRange },
    { id: 'habits', label: 'Habit Tracker', icon: Flame },
    { id: 'coach', label: 'AI Coach', icon: Sparkles },
    { id: 'chat', label: 'AI Companion', icon: MessageSquare },
  ];

  return (
    <aside className="w-full md:w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 md:h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-slate-800">
              LastMinute <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Workspace Agent</p>
          </div>
        </div>
        
        {/* Mobile Notification Badge button */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="md:hidden relative p-1 text-slate-400 hover:text-slate-600"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left group ${
                isActive 
                  ? 'bg-white border border-slate-200 text-blue-600 shadow-sm font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Information & Settings */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-xl">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-10 h-10 rounded-full border border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-800">{user?.displayName || 'Productive User'}</p>
            <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
