import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Award,
  CircleCheck,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';

export const HabitsView: React.FC = () => {
  const { 
    habits, 
    addHabit, 
    toggleHabitToday, 
    deleteHabit 
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('5');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addHabit(title, parseInt(goal) || 5);
    setTitle('');
    setGoal('5');
    setIsAdding(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if habit completed on a specific day
  const isCompletedOnDay = (habit: any, dateOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - dateOffset);
    const dateStr = d.toISOString().split('T')[0];
    return habit.completedDays?.includes(dateStr);
  };

  // Build list of last 7 days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: weekdays[d.getDay()],
        dayNum: d.getDate(),
        offset: i
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800">Habit Streaks</h2>
          <p className="text-xs text-slate-500">Log continuous commitments to configure stable productivity patterns</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Add Habit inline Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-slide-down">
          <h3 className="text-sm font-bold text-slate-800">Add New Habit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Habit Title</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 30 Minutes Coding, Meditation, Leetcode"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Weekly Goal (Days)</label>
              <select 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="3">3 Days/Week</option>
                <option value="4">4 Days/Week</option>
                <option value="5">5 Days/Week</option>
                <option value="6">6 Days/Week</option>
                <option value="7">7 Days/Week</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Habits Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Habit cards */}
        {habits.map((habit) => {
          const isDoneToday = habit.completedDays?.includes(todayStr);
          return (
            <div 
              key={habit.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{habit.title}</h3>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Goal: {habit.goalDaysPerWeek} days/week</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-amber-200 uppercase tracking-wide">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{habit.streak} Day Streak</span>
                  </div>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 7-Day progress grid */}
              <div className="grid grid-cols-7 gap-2 my-5 border-t border-b border-slate-100 py-4 text-center">
                {last7Days.map((day) => {
                  const done = isCompletedOnDay(habit, day.offset);
                  return (
                    <div key={day.offset} className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">{day.label}</span>
                      <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center border font-mono text-[10px] font-bold ${
                        done 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {done ? <Check className="w-3.5 h-3.5" /> : day.dayNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Check today action */}
              <button 
                onClick={() => toggleHabitToday(habit.id)}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all border ${
                  isDoneToday 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-blue-600 border-blue-700 text-white shadow-sm hover:bg-blue-700'
                }`}
              >
                {isDoneToday ? (
                  <>
                    <CircleCheck className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                    <span>Completed Today</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Log Completion Today</span>
                  </>
                )}
              </button>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="md:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <Flame className="w-12 h-12 text-slate-300" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">No Habit Targets Configured</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto">Track daily codes, reading intervals, exams preparations or workouts to earn multiplier streaks.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-blue-700 shadow-sm"
            >
              Add First Habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
