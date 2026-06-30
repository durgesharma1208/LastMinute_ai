import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TaskManagementView } from './components/TaskManagementView';
import { SchedulerView } from './components/SchedulerView';
import { HabitsView } from './components/HabitsView';
import { CoachView } from './components/CoachView';
import { ChatAssistantView } from './components/ChatAssistantView';
import { NotificationPanel } from './components/NotificationPanel';
import { 
  Sparkles, 
  Bell, 
  Menu, 
  X, 
  Info,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Loader
} from 'lucide-react';

function AppContent() {
  const { 
    user, 
    needsAuth, 
    isLoggingIn, 
    handleLogin, 
    isLoading,
    notifications
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  // Quick action from Dashboard to open Add Task slide in task view
  const handleAddTaskFromDashboard = () => {
    setActiveTab('tasks');
  };

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 text-slate-800 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.04),transparent_60%)]"></div>

        <header className="flex items-center space-x-3 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
            <Sparkles className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">
              LastMinute <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Adaptive Productivity Agent</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
          <div className="space-y-6">
            <span className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></span>
              <span>EXECUTIVE BROWSER COMPANION</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 tracking-tight leading-none">
              Never miss a deadline again.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              LastMinute AI continuously analyzes your deadlines, sleep preference, and Google Calendar events to construct a fully optimized, realistic hour-by-hour day plan. It reminds you exactly when you need to start to finish on time.
            </p>

            <div className="pt-4">
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting Securely...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
              <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Predictive Deadline Analysis</h4>
                <p className="text-xs text-slate-500 mt-1">Calculates risk threat percentages for uncompleted tasks, helping you reprioritize before it's too late.</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Conflict-Aware AI Day Planner</h4>
                <p className="text-xs text-slate-500 mt-1">Gathers primary meetings from Google Calendar to allocate task focus intervals without overlap.</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
              <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Adaptive AI Companion Chat</h4>
                <p className="text-xs text-slate-500 mt-1">Stressed or tired? Tell the companion chat and it will move lighter tasks first or reschedule hours instantly.</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono relative z-10 uppercase tracking-wider font-semibold">
          <div className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Secure Cloud Storage via MongoDB</span>
          </div>
          <span className="mt-2 sm:mt-0">© 2026 LastMinute AI. All rights reserved.</span>
        </footer>
      </div>
    );
  }

  // Loading Spinners for data syncing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-slate-500 text-xs font-semibold">Configuring sandboxed productivity core...</span>
      </div>
    );
  }

  // Master Fullstack Dashboard Frame
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Sidebar Navigation */}
      <div className={`${showMobileMenu ? 'block' : 'hidden'} md:block`}>
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowMobileMenu(false);
          }} 
          unreadCount={unreadNotifs.length}
          setShowNotifications={setShowNotifications}
          showNotifications={showNotifications}
        />
      </div>

      {/* Main Content Arena */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Header toolbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1 text-slate-500 hover:text-slate-800 rounded-lg"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-black font-display tracking-tight text-slate-800 capitalize">
              {activeTab === 'chat' ? 'AI Companion Assistant' : activeTab === 'tasks' ? 'Task Backlog' : `${activeTab}`}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider hidden sm:inline-block">
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            
            {/* Notification Badge button */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifs.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic sub-view container */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              setActiveTab={setActiveTab} 
              onAddTaskClick={handleAddTaskFromDashboard} 
            />
          )}
          {activeTab === 'tasks' && <TaskManagementView />}
          {activeTab === 'scheduler' && <SchedulerView />}
          {activeTab === 'habits' && <HabitsView />}
          {activeTab === 'coach' && <CoachView />}
          {activeTab === 'chat' && <ChatAssistantView />}
        </main>
      </div>

      {/* Slide-out notification panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
