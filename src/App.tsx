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
  Loader,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

function AppContent() {
  const { 
    user, 
    needsAuth, 
    isLoggingIn, 
    handleLogin, 
    handleEmailSignIn,
    handleEmailSignUp,
    isLoading,
    notifications
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Email authentication states
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const unreadNotifs = notifications.filter(n => !n.read);

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    if (isSignUpMode && !name) {
      setAuthError('Please provide your name');
      return;
    }

    try {
      if (isSignUpMode) {
        await handleEmailSignUp(email, password, name);
      } else {
        await handleEmailSignIn(email, password);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'An error occurred during authentication';
      if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        setAuthError('Invalid email or password');
      } else if (msg.includes('auth/email-already-in-use')) {
        setAuthError('This email is already registered');
      } else if (msg.includes('auth/invalid-email')) {
        setAuthError('Invalid email address format');
      } else if (msg.includes('auth/operation-not-allowed')) {
        setAuthError('Email & Password sign-in is not enabled in your Firebase Console. Please enable it in: Console -> Authentication -> Sign-in method -> Email/Password.');
      } else {
        setAuthError(msg);
      }
    }
  };

  // Quick action from Dashboard to open Add Task slide in task view
  const handleAddTaskFromDashboard = () => {
    setActiveTab('tasks');
  };

  // Splash Screen for non-authenticated states (Clean Minimalism Theme)
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        {/* Decorative background subtle gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.02),transparent_50%)]"></div>

        {/* Header */}
        <header className="flex items-center space-x-3 relative z-10">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-600/10">
            <Sparkles className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">
              LastMinute <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Adaptive Productivity Agent</p>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
          <div className="space-y-6">
            <span className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>EXECUTIVE BROWSER COMPANION</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 tracking-tight leading-none">
              Never miss a deadline again.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              LastMinute AI continuously analyzes your deadlines, sleep preference, and Google Calendar events to construct a fully optimized, realistic hour-by-hour day plan. It reminds you exactly when you need to start to finish on time.
            </p>

            {/* Elegant Auth Form Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 w-full max-w-md relative z-20">
              <h3 className="text-base font-bold text-slate-800">
                {isSignUpMode ? 'Create your Account' : 'Sign in to your Account'}
              </h3>
              
              {authError && (
                <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-100 flex flex-col space-y-2">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600 animate-bounce" />
                    <span>{authError}</span>
                  </div>
                  {authError.includes('Firebase Console') && (
                    <div className="mt-2 pt-2 border-t border-red-100 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                      <p className="font-semibold text-slate-700">How to fix this in your Firebase Project:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>
                          Open your <a href="https://console.firebase.google.com/project/woven-folio-9n56p/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-bold underline inline-flex items-center">Firebase Authentication Console ↗</a>
                        </li>
                        <li>Click <strong>Add new provider</strong> (or choose <strong>Email/Password</strong> if already listed).</li>
                        <li>Toggle the switch to <strong>Enable</strong>.</li>
                        <li>Click <strong>Save</strong>. You can then immediately sign up here!</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                {isSignUpMode && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-blue-400 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <Loader className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-mono uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google login button */}
              <button 
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center space-x-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="text-center pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setAuthError('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                >
                  {isSignUpMode ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          </div>

          {/* Core features listing */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-200 transition-colors">
              <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Predictive Deadline Analysis</h4>
                <p className="text-xs text-slate-500 mt-1">Calculates risk threat percentages for uncompleted tasks, helping you reprioritize before it's too late.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-200 transition-colors">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Conflict-Aware AI Day Planner</h4>
                <p className="text-xs text-slate-500 mt-1">Gathers primary meetings from Google Calendar to allocate task focus intervals without overlap.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm hover:border-blue-200 transition-colors">
              <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Adaptive AI Companion Chat</h4>
                <p className="text-xs text-slate-500 mt-1">Stressed or tired? Tell the companion chat and it will move lighter tasks first or reschedule hours instantly.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono relative z-10 uppercase tracking-wider font-semibold">
          <div className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Secure Client-Side Sandboxed Local Storage enabled</span>
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
