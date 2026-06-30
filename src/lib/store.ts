import { Task, Habit, ScheduledEvent, SmartNotification } from '../types';

const API_BASE = '';

async function apiFetch(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errorMsg = errData.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

function getAuthHeaders(userId: string): Record<string, string> {
  return { 'x-user-id': userId };
}

// ==================== TASKS ====================

export const subscribeTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const fetchTasks = async () => {
    try {
      const data = await apiFetch('/api/tasks', { headers: getAuthHeaders(userId) });
      callback(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };
  fetchTasks();
  const interval = setInterval(fetchTasks, 5000);
  return () => clearInterval(interval);
};

export const saveTask = async (userId: string, task: Task) => {
  await apiFetch('/api/tasks', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(task),
  });
};

export const removeTask = async (userId: string, taskId: string) => {
  await apiFetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
};

// ==================== HABITS ====================

export const subscribeHabits = (userId: string, callback: (habits: Habit[]) => void) => {
  const fetchHabits = async () => {
    try {
      const data = await apiFetch('/api/habits', { headers: getAuthHeaders(userId) });
      callback(data.habits || []);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    }
  };
  fetchHabits();
  const interval = setInterval(fetchHabits, 5000);
  return () => clearInterval(interval);
};

export const saveHabit = async (userId: string, habit: Habit) => {
  await apiFetch('/api/habits', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(habit),
  });
};

export const removeHabit = async (userId: string, habitId: string) => {
  await apiFetch(`/api/habits/${habitId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
};

// ==================== SCHEDULE ====================

export const subscribeSchedule = (userId: string, callback: (schedule: ScheduledEvent[]) => void) => {
  const fetchSchedule = async () => {
    try {
      const data = await apiFetch('/api/schedule', { headers: getAuthHeaders(userId) });
      callback(data.schedule || []);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    }
  };
  fetchSchedule();
  const interval = setInterval(fetchSchedule, 5000);
  return () => clearInterval(interval);
};

export const saveScheduleEvent = async (userId: string, event: ScheduledEvent) => {
  await apiFetch('/api/schedule', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(event),
  });
};

export const saveFullSchedule = async (userId: string, schedule: ScheduledEvent[]) => {
  await apiFetch('/api/schedule/bulk', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify({ schedule }),
  });
};

// ==================== NOTIFICATIONS ====================

export const subscribeNotifications = (userId: string, callback: (notifications: SmartNotification[]) => void) => {
  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/api/notifications', { headers: getAuthHeaders(userId) });
      callback(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 5000);
  return () => clearInterval(interval);
};

export const saveNotification = async (userId: string, notification: SmartNotification) => {
  await apiFetch('/api/notifications', {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(notification),
  });
};

export const removeNotification = async (userId: string, notifId: string) => {
  await apiFetch(`/api/notifications/${notifId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
};
