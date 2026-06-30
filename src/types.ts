export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline: string; // ISO String
  estimatedHours: number;
  labels: string[];
  status: TaskStatus;
  subtasks: Subtask[];
  createdAt: string;
  userId?: string;

  // AI-enriched fields
  priorityScore?: number; // 0-100
  urgencyScore?: number; // 0-100
  importanceScore?: number; // 0-100
  recommendedStartTime?: string; // ISO String
  deadlineRiskProbability?: number; // 0-100 %
  deadlineRiskRecommendation?: string;
  aiReasoning?: string;
}

export interface Habit {
  id: string;
  title: string;
  completedDays: string[]; // ['YYYY-MM-DD', ...]
  streak: number;
  goalDaysPerWeek: number;
  createdAt: string;
}

export interface ScheduledEvent {
  id: string;
  taskId?: string;
  title: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  type: 'task' | 'break' | 'meal' | 'sleep' | 'calendar' | 'custom';
}

export interface ProductivityReport {
  focusScore: number; // 0-100
  completionRate: number; // percentage
  completedTasksCount: number;
  missedDeadlinesCount: number;
  averageDelayMinutes: number;
  dailyStreak: number;
  insights: string[];
  suggestions: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'action' | 'success';
  timestamp: string; // ISO string
  taskId?: string;
  read: boolean;
}

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

