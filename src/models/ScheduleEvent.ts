import { Schema, model } from 'mongoose';

export interface IScheduleEvent {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'break' | 'meal' | 'sleep' | 'calendar' | 'custom';
}

const scheduleEventSchema = new Schema<any>({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  taskId: String,
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: {
    type: String,
    enum: ['task', 'break', 'meal', 'sleep', 'calendar', 'custom'],
    default: 'task',
  },
}, { id: false });

export const ScheduleEventModel = model<IScheduleEvent>('ScheduleEvent', scheduleEventSchema);
