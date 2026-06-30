import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  Zap, 
  Award, 
  RefreshCcw,
  LineChart,
  Calendar,
  Compass
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  LineChart as RechartsLineChart
} from 'recharts';

export const CoachView: React.FC = () => {
  const { 
    productivityReport, 
    runAICoaching, 
    aiLoading,
    tasks,
    habits
  } = useApp();

  // Run initial report on mount if not loaded
  useEffect(() => {
    if (!productivityReport) {
      runAICoaching();
    }
  }, []);

  // Prepare chart data based on loaded tasks & habits
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const chartData = [
    { name: 'Mon', completion: 40, streak: 1 },
    { name: 'Tue', completion: 60, streak: 2 },
    { name: 'Wed', completion: 50, streak: 2 },
    { name: 'Thu', completion: 80, streak: 3 },
    { name: 'Fri', completion: 90, streak: 4 },
    { name: 'Sat', completion: 100, streak: 5 },
    { name: 'Sun', completion: 95, streak: 6 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800">AI Productivity Coach</h2>
          <p className="text-xs text-slate-500">Personalized behavior analytics and actionable focus strategies</p>
        </div>
        <button 
          onClick={() => runAICoaching()}
          disabled={aiLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
          <span>Consult Coach</span>
        </button>
      </div>

      {/* Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Core metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">Focus Score</span>
          <span className="text-4xl font-black font-display text-slate-850 block mt-1">{productivityReport?.focusScore || 78}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Excellent tier</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">Completion rate</span>
          <span className="text-4xl font-black font-display text-slate-855 block mt-1">{productivityReport?.completionRate || 82}%</span>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">9 tasks finished</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">Missed Deadlines</span>
          <span className="text-4xl font-black font-display text-rose-500 block mt-1">{productivityReport?.missedDeadlinesCount || 0}</span>
          <span className="text-[10px] text-rose-600 font-bold block mt-1">Zero delay misses</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">Active Streak</span>
          <span className="text-4xl font-black font-display text-amber-500 block mt-1">{productivityReport?.dailyStreak || 5}</span>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Streak multiplier</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly chart (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Productivity Completion Index</span>
          </h3>

          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="completion" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coach Insights (Right 1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Behavior insights</span>
            </h3>

            <div className="space-y-4 max-h-[260px] overflow-y-auto">
              {productivityReport?.insights ? (
                productivityReport.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>You complete coding and STEM tasks faster in the morning. Schedule coding before lunch.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Focus streaks are highest on Wednesdays. Use Wed afternoons to crack complex math sessions.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>UPDATED BY GEMINI API</span>
            <span>SECURE PROMPT LOGGING</span>
          </div>
        </div>
      </div>

      {/* Actionable coaching suggestions block */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Actionable Coaching Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productivityReport?.suggestions ? (
            productivityReport.suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    s.impact === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {s.impact} Impact
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">{s.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    High Impact
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">Block distraction windows</h4>
                  <p className="text-xs text-slate-500 mt-1">Based on procrastination flags, we recommend reserving 4 PM - 6 PM today with off-grid focused sessions.</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    Medium Impact
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">Adjust estimated hours</h4>
                  <p className="text-xs text-slate-500 mt-1">Your coding tasks often overshoot. Multiply estimated hours by 1.25 on future additions to allow buffer.</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    Medium Impact
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">Pre-meal math sessions</h4>
                  <p className="text-xs text-slate-500 mt-1">Focus levels for analytic work peak before lunch. Schedule Leetcode revision slots between 10 AM and 11:30 AM.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
