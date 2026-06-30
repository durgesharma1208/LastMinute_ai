import { Schema, model } from 'mongoose';

export interface IHabit {
  id: string;
  userId: string;
  title: string;
  completedDays: string[];
  streak: number;
  goalDaysPerWeek: number;
  createdAt: string;
}

const habitSchema = new Schema<any>({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  completedDays: [{ type: String }],
  streak: { type: Number, default: 0 },
  goalDaysPerWeek: { type: Number, default: 5 },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { id: false });

export const HabitModel = model<IHabit>('Habit', habitSchema);
