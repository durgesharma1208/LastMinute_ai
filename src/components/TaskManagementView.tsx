import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Circle,
  HelpCircle,
  Play
} from 'lucide-react';
import { Task, TaskPriority } from '../types';

export const TaskManagementView: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleSubtask, 
    addSubtask, 
    runAIDeadlinePrediction,
    aiLoading
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [labelsInput, setLabelsInput] = useState('');
  
  // Expanded task ID for subtask view
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Handle task submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    const labels = labelsInput
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Call Context to add task
    await addTask(title, new Date(deadline).toISOString(), parseFloat(estimatedHours) || 1, priority, description, labels);

    // Reset Form
    setTitle('');
    setDescription('');
    setDeadline('');
    setEstimatedHours('1');
    setPriority('medium');
    setLabelsInput('');
    setIsAdding(false);
  };

  // Status transitions
  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    const updated = { ...task, status: newStatus };
    await updateTask(updated);
    
    // Auto run prediction when task completes or starts
    setTimeout(() => {
      runAIDeadlinePrediction();
    }, 1000);
  };

  const handleAddSubtaskSubmit = async (taskId: string, subtaskText: string) => {
    await addSubtask(taskId, subtaskText);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800">Task Backlog</h2>
          <p className="text-xs text-slate-500">Track and assess deadlines with AI threat warnings</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => runAIDeadlinePrediction()}
            disabled={aiLoading}
            className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 border border-slate-200 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Predict Risks</span>
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Slide down Add Task form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-slide-down">
          <h3 className="text-sm font-bold text-slate-800">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Task Title *</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish chemistry project"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Deadline *</label>
              <input 
                type="datetime-local" 
                required 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a quick summary or notes..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Estimated Hours</label>
              <input 
                type="number" 
                min="0.5" 
                step="0.5" 
                value={estimatedHours} 
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Task Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Labels (comma-separated)</label>
              <input 
                type="text" 
                value={labelsInput} 
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. School, Exam, Chemistry"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
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
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task Columns grid: Todo, In Progress, Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: TODO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600 font-mono tracking-wider">BACKLOG / TODO</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {tasks.filter(t => t.status === 'todo').length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onDelete={deleteTask}
                expanded={expandedTaskId === task.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                onAddSubtaskSubmit={handleAddSubtaskSubmit}
                onToggleSubtask={toggleSubtask}
              />
            ))}
            {tasks.filter(t => t.status === 'todo').length === 0 && (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No pending tasks.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-700 font-mono tracking-wider">ACTIVE FOCUS</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {tasks.filter(t => t.status === 'in_progress').length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status === 'in_progress').map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onDelete={deleteTask}
                expanded={expandedTaskId === task.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                onAddSubtaskSubmit={handleAddSubtaskSubmit}
                onToggleSubtask={toggleSubtask}
              />
            ))}
            {tasks.filter(t => t.status === 'in_progress').length === 0 && (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Drag a task or click start session to focus.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-xs font-bold text-emerald-700 font-mono tracking-wider">COMPLETED</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {tasks.filter(t => t.status === 'completed').length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onDelete={deleteTask}
                expanded={expandedTaskId === task.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                onAddSubtaskSubmit={handleAddSubtaskSubmit}
                onToggleSubtask={toggleSubtask}
              />
            ))}
            {tasks.filter(t => t.status === 'completed').length === 0 && (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No tasks completed yet. Start working!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Modulared Task Card inside same file
interface TaskCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
  onDelete: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onAddSubtaskSubmit: (taskId: string, subtaskText: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  expanded,
  onToggleExpand,
  onAddSubtaskSubmit,
  onToggleSubtask
}) => {
  const [localSubtaskTitle, setLocalSubtaskTitle] = useState('');
  const urgencyClass = 
    task.priority === 'high' 
      ? 'border-rose-200 bg-rose-50/10' 
      : task.priority === 'medium'
      ? 'border-amber-200 bg-amber-50/10'
      : 'border-slate-200';

  const formatDeadline = (iso: string) => {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isCompleted = task.status === 'completed';
  const hasHighRisk = task.deadlineRiskProbability !== undefined && task.deadlineRiskProbability > 75;

  return (
    <div className={`border p-4 rounded-2xl bg-white shadow-sm transition-all hover:shadow-md ${urgencyClass}`}>
      <div className="flex items-start justify-between space-x-2">
        <div className="flex items-start space-x-2.5 flex-1">
          {isCompleted ? (
            <button 
              onClick={() => onStatusChange(task, 'todo')}
              className="mt-0.5 text-emerald-600 hover:text-emerald-800"
            >
              <CheckCircle className="w-5 h-5 fill-emerald-100" />
            </button>
          ) : (
            <button 
              onClick={() => onStatusChange(task, 'completed')}
              className="mt-0.5 text-slate-300 hover:text-slate-500"
            >
              <Circle className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold truncate text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h4>
            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">{task.estimatedHours}h est.</span>
              <span>•</span>
              <span className="font-mono">{formatDeadline(task.deadline)}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description if present */}
      {task.description && (
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed italic bg-slate-50 p-2 rounded-lg">
          {task.description}
        </p>
      )}

      {/* Render Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.labels.map((label, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              <span>{label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Deadline Risk Prediction Meter */}
      {!isCompleted && task.deadlineRiskProbability !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">DEADLINE FAILURE RISK</span>
            <span className={`font-bold ${hasHighRisk ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
              {task.deadlineRiskProbability}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-1 rounded-full ${hasHighRisk ? 'bg-rose-500' : 'bg-slate-400'}`} 
              style={{ width: `${task.deadlineRiskProbability}%` }}
            ></div>
          </div>
          {task.deadlineRiskRecommendation && (
            <p className="text-[10px] text-blue-700 bg-blue-50/40 p-2 rounded-lg mt-2 border border-blue-100">
              <span className="font-bold">Recommendation:</span> {task.deadlineRiskRecommendation}
            </p>
          )}
        </div>
      )}

      {/* Actionable items like AI Priority Scoring */}
      {!isCompleted && task.priorityScore !== undefined && (
        <div className="mt-2 text-[10px] flex items-center justify-between bg-blue-50/30 px-2 py-1.5 rounded-lg border border-blue-100/30 text-slate-800 font-mono">
          <span>AI RANK SCORE: <strong className="font-extrabold text-blue-600">{task.priorityScore}</strong></span>
          {task.recommendedStartTime && (
            <span>START BY: <strong className="text-slate-900">{new Date(task.recommendedStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          )}
        </div>
      )}

      {/* Quick Status Control */}
      {!isCompleted && (
        <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100">
          {task.status === 'todo' ? (
            <button 
              onClick={() => onStatusChange(task, 'in_progress')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start work now</span>
            </button>
          ) : (
            <button 
              onClick={() => onStatusChange(task, 'todo')}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
            >
              <span>Stop active focus</span>
            </button>
          )}

          {/* Subtask Toggler */}
          <button 
            onClick={onToggleExpand}
            className="text-slate-400 hover:text-slate-600 text-xs flex items-center space-x-0.5 font-semibold"
          >
            <span>Subtasks ({task.subtasks?.length || 0})</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Collapsible Subtasks Section */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50/50 p-3 rounded-xl space-y-3 animate-fade-in">
          <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Subtask breakdown</h5>
          
          <div className="space-y-1.5">
            {task.subtasks && task.subtasks.map(sub => (
              <div key={sub.id} className="flex items-center space-x-2 text-xs text-slate-700">
                <input 
                  type="checkbox" 
                  checked={sub.completed}
                  onChange={() => onToggleSubtask(task.id, sub.id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                  {sub.title}
                </span>
              </div>
            ))}
            {(!task.subtasks || task.subtasks.length === 0) && (
              <p className="text-[11px] text-slate-400 italic">No subtasks defined yet.</p>
            )}
          </div>

          {/* Add Subtask inline form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!localSubtaskTitle.trim()) return;
              onAddSubtaskSubmit(task.id, localSubtaskTitle.trim());
              setLocalSubtaskTitle('');
            }} 
            className="flex items-center space-x-2"
          >
            <input 
              type="text" 
              placeholder="Add subtask..."
              value={localSubtaskTitle}
              onChange={(e) => setLocalSubtaskTitle(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white font-bold p-1 rounded-lg hover:bg-blue-700 transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
