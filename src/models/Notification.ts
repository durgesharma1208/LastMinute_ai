import { Schema, model } from 'mongoose';

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'action' | 'success';
  timestamp: string;
  taskId?: string;
  read: boolean;
}

const notificationSchema = new Schema<any>({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['warning', 'info', 'action', 'success'],
    default: 'info',
  },
  timestamp: { type: String, default: () => new Date().toISOString() },
  taskId: String,
  read: { type: Boolean, default: false },
}, { id: false });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
