import { Schema, model, Document } from 'mongoose';

export interface ITask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  estimatedHours: number;
  labels: string[];
  status: 'todo' | 'in_progress' | 'completed';
  subtasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  priorityScore?: number;
  urgencyScore?: number;
  importanceScore?: number;
  recommendedStartTime?: string;
  deadlineRiskProbability?: number;
  deadlineRiskRecommendation?: string;
  aiReasoning?: string;
}

const taskSchema = new Schema<any>({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  deadline: { type: String, required: true },
  estimatedHours: { type: Number, default: 1 },
  labels: [{ type: String }],
  status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
  subtasks: [{
    _id: false,
    id: String,
    title: String,
    completed: Boolean,
  }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  priorityScore: Number,
  urgencyScore: Number,
  importanceScore: Number,
  recommendedStartTime: String,
  deadlineRiskProbability: Number,
  deadlineRiskRecommendation: String,
  aiReasoning: String,
}, { id: false });

export const TaskModel = model<ITask>('Task', taskSchema);
