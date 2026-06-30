import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Play, 
  ChevronRight,
  Flame,
  Zap,
  BatteryCharging
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onAddTaskClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onAddTaskClick }) => {
  const { 
    user, 
    tasks, 
    schedule, 
    habits, 
    runAIPrioritization, 
    runAIScheduler,
    aiLoading,
    notifications,
    productivityReport
  } = useApp();

  const [simulatedBatteryAlert, setSimulatedBatteryAlert] = useState(true);

  // Derive stats
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  // High priority / urgent tasks
  const pendingHighPriority = tasks
    .filter(t => t.status !== 'completed' && (t.priority === 'high' || (t.priorityScore && t.priorityScore > 75)))
    .slice(0, 3);

  // Today's schedule items
  const todaySchedule = schedule.slice(0, 4);

  // Calculate generic score
  const baseScore = 65;
  const habitBonus = habits.reduce((acc, h) => acc + (h.streak > 0 ? 5 : 0), 0);
  const taskBonus = completedTasks.length * 4;
  const productivityScore = Math.min(100, baseScore + habitBonus + taskBonus);

  // Find nearest upcoming deadline
  const nextDeadlineTask = tasks
    .filter(t => t.status !== 'completed' && t.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-br from-white to-blue-50/30 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-800">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            {nextDeadlineTask ? (
              <>
                Your next critical deadline is <strong className="text-rose-600 font-bold">{nextDeadlineTask.title}</strong>, due on{' '}
                {new Date(nextDeadlineTask.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. 
                {nextDeadlineTask.deadlineRiskProbability && nextDeadlineTask.deadlineRiskProbability > 50 ? (
                  <span className="text-rose-600 block mt-1.5 font-bold">AI predicts a {nextDeadlineTask.deadlineRiskProbability}% chance of delay unless you start soon.</span>
                ) : (
                  <span className="text-slate-600 block mt-1.5 font-medium">AI recommends starting around {nextDeadlineTask.recommendedStartTime ? new Date(nextDeadlineTask.recommendedStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'now'}.</span>
                )}
              </>
            ) : (
              "You have no pending critical deadlines. Great work keeping on top of your schedule!"
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => runAIPrioritization()}
            disabled={aiLoading}
            className="flex items-center justify-center space-x-2 bg-white text-slate-700 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-xs border border-slate-200 disabled:opacity-50 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Rank Work</span>
          </button>
          <button 
            onClick={() => runAIScheduler()}
            disabled={aiLoading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-600/20 transition-all text-xs disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            <span>AI Auto-Schedule</span>
          </button>
        </div>
      </div>

      {/* Context-Aware Proactive Smart Banners */}
      <div className="space-y-3">
        {simulatedBatteryAlert && (
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 text-amber-950 relative">
            <BatteryCharging className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-amber-800">Proactive Hardware Alert</h4>
              <p className="mt-1 text-amber-900 leading-relaxed">Your laptop battery is at 14%. You have an online interview scheduled in your Calendar today at 3:00 PM. Charge your laptop now to avoid connectivity loss.</p>
            </div>
            <button 
              onClick={() => setSimulatedBatteryAlert(false)} 
              className="text-amber-500 hover:text-amber-700 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI Suggested next task */}
        {nextDeadlineTask && (
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3 text-blue-950">
            <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-blue-800">Next Recommended Action</h4>
              <p className="mt-1 text-blue-900 leading-relaxed">
                Start <strong className="font-bold text-slate-800">"{nextDeadlineTask.title}"</strong>.{' '}
                Estimated workload: {nextDeadlineTask.estimatedHours} hours.
              </p>
            </div>
            <button 
              onClick={() => {
                nextDeadlineTask.status = 'in_progress';
                setActiveTab('scheduler');
              }}
              className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs shadow-sm transition-all flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Metrics Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Productivity score card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">PRODUCTIVITY SCORE</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-black font-display text-slate-800">{productivityReport?.focusScore || productivityScore}</span>
              <span className="text-xs font-bold text-blue-600">/ 100</span>
            </div>
            <div className="flex items-center text-[11px] text-emerald-600 font-bold space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Up 12% this week</span>
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Focus time card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">COMPLETED TODAY</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-black font-display text-slate-800">{completedTasks.length}</span>
              <span className="text-xs font-bold text-slate-500">Tasks</span>
            </div>
            <span className="text-[11px] text-slate-400 block font-semibold">Out of {totalTasks} total tasks</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Completion rate card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1 w-full mr-4">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">COMPLETION RATE</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-black font-display text-slate-800">{productivityReport?.completionRate || completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${productivityReport?.completionRate || completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid - Schedule & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Timetable Event List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black font-display text-slate-800">Today's Timetable</h3>
              <p className="text-xs text-slate-400">Created by AI Scheduler</p>
            </div>
            <button 
              onClick={() => setActiveTab('scheduler')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View full day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((item) => {
                const isTask = item.type === 'task';
                const startStr = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endStr = new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-start space-x-4 p-3 rounded-xl border transition-all ${
                      isTask 
                        ? 'bg-blue-50/30 border-blue-100 hover:bg-blue-50/50' 
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-mono text-xs text-slate-500 font-bold min-w-[70px] pt-1">
                      {startStr}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{item.type} session</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-300" />
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">No Timetable Generated</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">Let LastMinute AI build your custom, hour-by-hour day plan automatically.</p>
                </div>
                <button 
                  onClick={() => runAIScheduler()}
                  disabled={aiLoading}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-xs disabled:opacity-50 shadow-sm"
                >
                  Generate Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* High Priority Tasks with deadline risk warnings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black font-display text-slate-800">Critical Priority Work</h3>
              <p className="text-xs text-slate-400">High impact items requiring focus</p>
            </div>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Manage tasks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {pendingHighPriority.length > 0 ? (
              pendingHighPriority.map((task) => {
                const hasHighRisk = task.deadlineRiskProbability && task.deadlineRiskProbability > 70;
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      hasHighRisk 
                        ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50' 
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${
                          task.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {task.deadlineRiskProbability !== undefined && (
                        <div className="text-right">
                          <span className={`text-xs font-black font-mono block ${hasHighRisk ? 'text-rose-600' : 'text-slate-600'}`}>
                            {task.deadlineRiskProbability}% Delay Risk
                          </span>
                          <span className="text-[10px] text-slate-400">AI prediction</span>
                        </div>
                      )}
                    </div>

                    {task.deadlineRiskRecommendation && (
                      <div className="mt-3 text-[11px] text-blue-900 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                        <span className="font-bold">AI Suggestion:</span> {task.deadlineRiskRecommendation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-slate-300" />
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">No High Priority Work</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">All high priority tasks are completed or scheduled. Keep up the amazing pace!</p>
                </div>
                <button 
                  onClick={onAddTaskClick}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-xs shadow-sm"
                >
                  Create New Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
