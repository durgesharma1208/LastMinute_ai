import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarRange, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Coffee, 
  Sunset, 
  CheckCircle, 
  Sparkles,
  Zap,
  Check,
  Moon,
  Info
} from 'lucide-react';

export const SchedulerView: React.FC = () => {
  const { 
    schedule, 
    runAIScheduler, 
    syncScheduleToGoogleCalendar, 
    aiLoading,
    accessToken,
    handleLogin
  } = useApp();

  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [sleepStart, setSleepStart] = useState('23:00');
  const [sleepEnd, setSleepEnd] = useState('07:00');

  // Trigger AI Scheduling
  const handleGenerate = async () => {
    await runAIScheduler(
      { start: workStart, end: workEnd },
      { start: sleepStart, end: sleepEnd }
    );
  };

  // Build hours list (07:00 to 23:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

  const getEventForHour = (hour: number) => {
    return schedule.filter(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      const eventStartHour = start.getHours();
      const eventEndHour = end.getHours() === 0 ? 24 : end.getHours();
      
      return hour >= eventStartHour && hour < eventEndHour;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800">AI Scheduler</h2>
          <p className="text-xs text-slate-500">Hourly plan constructed by AI matching your priorities and calendar events</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {accessToken ? (
            <button 
              onClick={() => syncScheduleToGoogleCalendar()}
              disabled={aiLoading}
              className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 border border-slate-200 disabled:opacity-50"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Sync Google Calendar</span>
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-slate-800 text-white hover:bg-slate-950 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Connect Google Calendar</span>
            </button>
          )}

          <button 
            onClick={handleGenerate}
            disabled={aiLoading}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Day</span>
          </button>
        </div>
      </div>

      {/* Preferences Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Work Hours Start</label>
          <input 
            type="time" 
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Work Hours End</label>
          <input 
            type="time" 
            value={workEnd}
            onChange={(e) => setWorkEnd(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Sleep Hour Start</label>
          <input 
            type="time" 
            value={sleepStart}
            onChange={(e) => setSleepStart(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Sleep Hour End</label>
          <input 
            type="time" 
            value={sleepEnd}
            onChange={(e) => setSleepEnd(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Timetable Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        
        {/* Main Hour timeline (Left 2 columns) */}
        <div className="lg:col-span-2 p-6 border-r border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-1.5">
            <CalendarRange className="w-4 h-4 text-blue-600" />
            <span>Today's Chronological Schedule</span>
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {hours.map((hour) => {
              const events = getEventForHour(hour);
              const hourStr = `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`;

              return (
                <div key={hour} className="flex items-start space-x-4 group">
                  {/* Hour label */}
                  <div className="text-xs font-mono font-bold text-slate-400 w-16 pt-2 text-right">
                    {hourStr}
                  </div>

                  {/* Hour Content Slots */}
                  <div className="flex-1 min-h-[50px] border-b border-slate-100 pb-2 flex flex-col gap-1.5">
                    {events.length > 0 ? (
                      events.map((event, index) => {
                        let colorClass = 'bg-slate-50 border-slate-200 text-slate-700';
                        let icon = <Clock className="w-3.5 h-3.5" />;

                        if (event.type === 'task') {
                          colorClass = 'bg-blue-50 border-blue-200 text-blue-950';
                          icon = <Zap className="w-3.5 h-3.5 text-blue-600" />;
                        } else if (event.type === 'break') {
                          colorClass = 'bg-amber-50/70 border-amber-200 text-amber-800';
                          icon = <Coffee className="w-3.5 h-3.5" />;
                        } else if (event.type === 'meal') {
                          colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                          icon = <Coffee className="w-3.5 h-3.5" />;
                        } else if (event.type === 'sleep') {
                          colorClass = 'bg-slate-900 border-slate-950 text-slate-300';
                          icon = <Moon className="w-3.5 h-3.5 text-blue-400" />;
                        } else if (event.type === 'calendar') {
                          colorClass = 'bg-teal-50 border-teal-200 text-teal-800';
                          icon = <Calendar className="w-3.5 h-3.5" />;
                        }

                        return (
                          <div 
                            key={`${event.id}_${index}`}
                            className={`flex items-center justify-between border px-4 py-2.5 rounded-xl transition-all shadow-sm ${colorClass}`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {icon}
                              <div>
                                <h4 className="font-bold text-xs">{event.title}</h4>
                                <span className="text-[10px] opacity-75 capitalize font-mono font-semibold">
                                  {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="min-h-[40px] border border-dashed border-slate-200 rounded-xl flex items-center px-4 text-[11px] text-slate-300 italic">
                        Free time
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Insights Side Panel (Right 1 column) */}
        <div className="p-6 bg-slate-50/50 flex flex-col space-y-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Schedule Insights</h4>
            <h3 className="text-sm font-extrabold text-slate-800">Dynamic Task Buffering</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
              <span className="font-bold block mb-1">⏰ Proactive Task Splits</span>
              LastMinute AI automatically segments larger tasks into 1.5 - 2 hour focused blocks. Studies show concentration decreases significantly after 90 minutes.
            </div>

            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
              <span className="font-bold block mb-1">☕ Mindful Breathing Breaks</span>
              15-minute intervals have been placed in between task blocks. Take these moments to step away, stretch, and reset.
            </div>

            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 text-xs text-teal-950 leading-relaxed">
              <span className="font-bold block mb-1">📅 External Calendar Safeguard</span>
              Vite calendar synchronization checks your local meetings first. No tasks will overlap with primary external calendar bookings.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-start space-x-2.5 text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-wider text-[9px]">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Only Focus Task blocks sync to Google Calendar. Meals, sleep, and breaks remain local.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
