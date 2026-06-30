import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  BellOff, 
  Trash2, 
  Check
} from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearNotification 
  } = useApp();

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm text-slate-800">Proactive Alerts</span>
          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
            let bgClass = 'bg-slate-50 border-slate-200';

            if (notif.type === 'warning') {
               icon = <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
               bgClass = 'bg-rose-50/50 border-rose-100';
            } else if (notif.type === 'success') {
               icon = <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
               bgClass = 'bg-emerald-50/50 border-emerald-100';
            }

            return (
              <div 
                key={notif.id} 
                className={`p-3.5 border rounded-2xl flex items-start space-x-3 transition-all relative group ${bgClass}`}
              >
                {icon}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className={`text-xs font-bold text-slate-800 ${notif.read ? 'text-slate-500 font-medium' : ''}`}>
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono mt-1.5 block">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="absolute right-3 top-3.5 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button 
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => clearNotification(notif.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
            <BellOff className="w-10 h-10 text-slate-200" />
            <div>
              <h4 className="font-bold text-slate-700 text-xs">All notifications cleared</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">We'll alert you of nearby deadlines and hardware triggers.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
