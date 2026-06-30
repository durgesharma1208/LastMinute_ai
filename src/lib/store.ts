import { Task, Habit, ScheduledEvent, SmartNotification } from '../types';

// Simple pub/sub listener map for real-time reactivity
type Listener = () => void;
const listeners: { [key: string]: Listener[] } = {};

const trigger = (key: string) => {
  if (listeners[key]) {
    listeners[key].forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error triggering local storage listener:', err);
      }
    });
  }
};

const addListener = (key: string, cb: Listener) => {
  if (!listeners[key]) {
    listeners[key] = [];
  }
  listeners[key].push(cb);
  return () => {
    listeners[key] = listeners[key].filter(item => item !== cb);
  };
};

// Helper to get from local storage safely
const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
};

// Helper to set local storage safely
const setLocalData = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

// --- TASKS STORE ---

export const subscribeTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const storageKey = `user_${userId}_tasks`;
  
  // Call immediately with initial data
  const loadAndDeliver = () => {
    const tasks = getLocalData<Task[]>(storageKey, []);
    tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    callback(tasks);
  };
  
  loadAndDeliver();
  return addListener(storageKey, loadAndDeliver);
};

export const saveTask = async (userId: string, task: Task) => {
  const storageKey = `user_${userId}_tasks`;
  const tasks = getLocalData<Task[]>(storageKey, []);
  
  const existingIndex = tasks.findIndex(t => t.id === task.id);
  if (existingIndex >= 0) {
    tasks[existingIndex] = { ...task, userId };
  } else {
    tasks.push({ ...task, userId });
  }
  
  setLocalData(storageKey, tasks);
  trigger(storageKey);
};

export const removeTask = async (userId: string, taskId: string) => {
  const storageKey = `user_${userId}_tasks`;
  const tasks = getLocalData<Task[]>(storageKey, []);
  
  const filtered = tasks.filter(t => t.id !== taskId);
  setLocalData(storageKey, filtered);
  trigger(storageKey);
};

// --- HABITS STORE ---

export const subscribeHabits = (userId: string, callback: (habits: Habit[]) => void) => {
  const storageKey = `user_${userId}_habits`;
  
  const loadAndDeliver = () => {
    const habits = getLocalData<Habit[]>(storageKey, []);
    callback(habits);
  };
  
  loadAndDeliver();
  return addListener(storageKey, loadAndDeliver);
};

export const saveHabit = async (userId: string, habit: Habit) => {
  const storageKey = `user_${userId}_habits`;
  const habits = getLocalData<Habit[]>(storageKey, []);
  
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  if (existingIndex >= 0) {
    habits[existingIndex] = habit;
  } else {
    habits.push(habit);
  }
  
  setLocalData(storageKey, habits);
  trigger(storageKey);
};

export const removeHabit = async (userId: string, habitId: string) => {
  const storageKey = `user_${userId}_habits`;
  const habits = getLocalData<Habit[]>(storageKey, []);
  
  const filtered = habits.filter(h => h.id !== habitId);
  setLocalData(storageKey, filtered);
  trigger(storageKey);
};

// --- SCHEDULE STORE ---

export const subscribeSchedule = (userId: string, callback: (schedule: ScheduledEvent[]) => void) => {
  const storageKey = `user_${userId}_schedule`;
  
  const loadAndDeliver = () => {
    const schedule = getLocalData<ScheduledEvent[]>(storageKey, []);
    schedule.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    callback(schedule);
  };
  
  loadAndDeliver();
  return addListener(storageKey, loadAndDeliver);
};

export const saveScheduleEvent = async (userId: string, event: ScheduledEvent) => {
  const storageKey = `user_${userId}_schedule`;
  const schedule = getLocalData<ScheduledEvent[]>(storageKey, []);
  
  const existingIndex = schedule.findIndex(e => e.id === event.id);
  if (existingIndex >= 0) {
    schedule[existingIndex] = event;
  } else {
    schedule.push(event);
  }
  
  setLocalData(storageKey, schedule);
  trigger(storageKey);
};

export const saveFullSchedule = async (userId: string, newSchedule: ScheduledEvent[]) => {
  const storageKey = `user_${userId}_schedule`;
  setLocalData(storageKey, newSchedule);
  trigger(storageKey);
};

// --- NOTIFICATIONS STORE ---

export const subscribeNotifications = (userId: string, callback: (notifications: SmartNotification[]) => void) => {
  const storageKey = `user_${userId}_notifications`;
  
  const loadAndDeliver = () => {
    const notifications = getLocalData<SmartNotification[]>(storageKey, []);
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(notifications);
  };
  
  loadAndDeliver();
  return addListener(storageKey, loadAndDeliver);
};

export const saveNotification = async (userId: string, notification: SmartNotification) => {
  const storageKey = `user_${userId}_notifications`;
  const notifications = getLocalData<SmartNotification[]>(storageKey, []);
  
  const existingIndex = notifications.findIndex(n => n.id === notification.id);
  if (existingIndex >= 0) {
    notifications[existingIndex] = notification;
  } else {
    notifications.push(notification);
  }
  
  setLocalData(storageKey, notifications);
  trigger(storageKey);
};

export const removeNotification = async (userId: string, notifId: string) => {
  const storageKey = `user_${userId}_notifications`;
  const notifications = getLocalData<SmartNotification[]>(storageKey, []);
  
  const filtered = notifications.filter(n => n.id !== notifId);
  setLocalData(storageKey, filtered);
  trigger(storageKey);
};
