import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  googleSignIn, 
  initAuth, 
  logoutUser, 
  getAccessToken,
  emailSignIn,
  emailSignUp,
  User
} from '../lib/firebase';
import { 
  subscribeTasks, 
  saveTask, 
  removeTask, 
  subscribeHabits, 
  saveHabit, 
  removeHabit, 
  subscribeSchedule, 
  saveFullSchedule, 
  saveScheduleEvent,
  subscribeNotifications,
  saveNotification,
  removeNotification
} from '../lib/store';
import { Task, Habit, ScheduledEvent, SmartNotification, ProductivityReport } from '../types';

interface AppContextType {
  user: User | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  accessToken: string | null;
  tasks: Task[];
  habits: Habit[];
  schedule: ScheduledEvent[];
  notifications: SmartNotification[];
  productivityReport: ProductivityReport | null;
  isLoading: boolean;
  aiLoading: boolean;
  chatHistory: { role: 'user' | 'model'; text: string; actionSuggestion?: any }[];
  isChatLoading: boolean;

  handleLogin: () => Promise<void>;
  handleEmailSignIn: (email: string, password: string) => Promise<void>;
  handleEmailSignUp: (email: string, password: string, name: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  
  // Tasks CRUD
  addTask: (title: string, deadline: string, estimatedHours: number, priority: 'low' | 'medium' | 'high', description?: string, labels?: string[]) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, subtaskTitle: string) => Promise<void>;

  // Habits CRUD
  addHabit: (title: string, goalDaysPerWeek: number) => Promise<void>;
  toggleHabitToday: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  // AI Actions
  runAIPrioritization: () => Promise<void>;
  runAIScheduler: (preferredWorkHours?: { start: string, end: string }, sleepHours?: { start: string, end: string }) => Promise<void>;
  runAIDeadlinePrediction: () => Promise<void>;
  runAICoaching: () => Promise<void>;
  sendChat: (message: string) => Promise<void>;

  // Google Calendar Integration
  fetchCalendarEvents: () => Promise<any[]>;
  syncScheduleToGoogleCalendar: () => Promise<void>;

  // Notification management
  addNotification: (title: string, message: string, type: 'warning' | 'info' | 'action' | 'success', taskId?: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [schedule, setSchedule] = useState<ScheduledEvent[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [productivityReport, setProductivityReport] = useState<ProductivityReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string; actionSuggestion?: any }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load subscriptions on Auth change
  useEffect(() => {
    setIsLoading(true);
    const unsubscribeAuth = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
        setIsLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  // Set up firestore data subscriptions once user is available
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHabits([]);
      setSchedule([]);
      setNotifications([]);
      return;
    }

    const unsubTasks = subscribeTasks(user.uid, (data) => setTasks(data));
    const unsubHabits = subscribeHabits(user.uid, (data) => setHabits(data));
    const unsubSchedule = subscribeSchedule(user.uid, (data) => setSchedule(data));
    const unsubNotifications = subscribeNotifications(user.uid, (data) => setNotifications(data));

    return () => {
      unsubTasks();
      unsubHabits();
      unsubSchedule();
      unsubNotifications();
    };
  }, [user]);

  // Initial local notifications/warnings on periodic check
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    // Run context-aware local checker
    const checkStatus = () => {
      const now = new Date();
      tasks.forEach(async (task) => {
        if (task.status === 'completed') return;

        const dl = new Date(task.deadline);
        const diffMs = dl.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Warning: deadline close but not started
        if (diffHours > 0 && diffHours < 4 && task.status === 'todo') {
          const alreadyExists = notifications.some(n => n.taskId === task.id && n.type === 'warning');
          if (!alreadyExists) {
            await addNotification(
              'Deadline Warning!',
              `"${task.title}" is due in ${Math.round(diffHours * 10) / 10} hours and you haven't started. Recommended: Start now!`,
              'warning',
              task.id
            );
          }
        }
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // check every minute
    return () => clearInterval(interval);
  }, [user, tasks, notifications]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login error in Context:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const authUser = await emailSignIn(email, password);
      setUser(authUser);
      setAccessToken(null);
      setNeedsAuth(false);
    } catch (err: any) {
      console.error('Email login error in Context:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignUp = async (email: string, password: string, name: string) => {
    setIsLoggingIn(true);
    try {
      const authUser = await emailSignUp(email, password, name);
      setUser(authUser);
      setAccessToken(null);
      setNeedsAuth(false);
    } catch (err: any) {
      console.error('Email register error in Context:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout error in Context:', err);
    }
  };

  // --- TASKS CRUD ---
  const addTask = async (
    title: string, 
    deadline: string, 
    estimatedHours: number, 
    priority: 'low' | 'medium' | 'high',
    description?: string,
    labels?: string[]
  ) => {
    if (!user) return;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title,
      description: description || '',
      priority,
      deadline,
      estimatedHours,
      labels: labels || [],
      status: 'todo',
      subtasks: [],
      createdAt: new Date().toISOString()
    };
    await saveTask(user.uid, newTask);
    
    // Auto-predict risks when a task is added
    setTimeout(() => {
      runAIDeadlinePrediction();
    }, 1500);
  };

  const updateTask = async (task: Task) => {
    if (!user) return;
    await saveTask(user.uid, task);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await removeTask(user.uid, taskId);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(sub => 
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    await saveTask(user.uid, { ...task, subtasks: updatedSubtasks });
  };

  const addSubtask = async (taskId: string, subtaskTitle: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: `sub_${Date.now()}`,
      title: subtaskTitle,
      completed: false
    };

    await saveTask(user.uid, {
      ...task,
      subtasks: [...task.subtasks, newSubtask]
    });
  };

  // --- HABITS CRUD ---
  const addHabit = async (title: string, goalDaysPerWeek: number) => {
    if (!user) return;
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      title,
      completedDays: [],
      streak: 0,
      goalDaysPerWeek,
      createdAt: new Date().toISOString()
    };
    await saveHabit(user.uid, newHabit);
  };

  const toggleHabitToday = async (habitId: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let completedDays = [...habit.completedDays];
    let streak = habit.streak;

    if (completedDays.includes(todayStr)) {
      // Uncheck today
      completedDays = completedDays.filter(day => day !== todayStr);
      streak = Math.max(0, streak - 1);
    } else {
      // Check today
      completedDays.push(todayStr);
      
      // Compute streak simple logic
      streak += 1;
    }

    await saveHabit(user.uid, {
      ...habit,
      completedDays,
      streak
    });
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    await removeHabit(user.uid, habitId);
  };

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorMsg = `Request failed with status ${response.status}`;
      try {
        const errData = await response.json();
        if (errData && errData.error) {
          errorMsg = errData.error;
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but received: ${text.substring(0, 100)}...`);
    }
    return response.json();
  };

  // --- AI ACTIONS ---
  const runAIPrioritization = async () => {
    if (!user || tasks.length === 0) return;
    setAiLoading(true);
    try {
      const data = await safeFetchJson('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      
      // Update tasks in Firestore with new prioritize attributes
      const updatePromises = tasks.map(async (task) => {
        const enriched = data.prioritizedTasks.find((pt: any) => pt.id === task.id);
        if (enriched) {
          const updated: Task = {
            ...task,
            priorityScore: enriched.priorityScore,
            urgencyScore: enriched.urgencyScore,
            importanceScore: enriched.importanceScore,
            recommendedStartTime: enriched.recommendedStartTime,
            aiReasoning: enriched.aiReasoning
          };
          await saveTask(user.uid, updated);
        }
      });
      await Promise.all(updatePromises);
      await addNotification(
        'AI Prioritization Complete',
        'Your workload has been fully re-ranked with smart priority scoring!',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      await addNotification(
        'AI Prioritization Failed',
        err.message || 'The AI model is busy. Please try again shortly.',
        'warning'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const runAIScheduler = async (
    preferredWorkHours = { start: '08:00', end: '18:00' },
    sleepHours = { start: '23:00', end: '07:00' }
  ) => {
    if (!user) return;
    setAiLoading(true);
    try {
      // Fetch calendar events to prevent double booking
      let calendarEvents: any[] = [];
      if (accessToken) {
        calendarEvents = await fetchCalendarEvents();
      }

      const uncompletedTasks = tasks.filter(t => t.status !== 'completed');

      const data = await safeFetchJson('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: uncompletedTasks,
          calendarEvents,
          preferredWorkHours,
          sleepHours,
          currentTime: new Date().toISOString()
        })
      });

      await saveFullSchedule(user.uid, data.schedule);
      await addNotification(
        'AI Timetable Ready',
        'AI has automatically built an optimal day plan avoiding calendar conflicts.',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      await addNotification(
        'AI Scheduling Failed',
        err.message || 'The AI model is busy. Please try again shortly.',
        'warning'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const runAIDeadlinePrediction = async () => {
    if (!user || tasks.length === 0) return;
    try {
      const uncompletedTasks = tasks.filter(t => t.status !== 'completed');
      if (uncompletedTasks.length === 0) return;

      const data = await safeFetchJson('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: uncompletedTasks,
          schedule,
          currentTime: new Date().toISOString()
        })
      });

      // Update tasks in Firestore with predictions
      const updatePromises = tasks.map(async (task) => {
        const prediction = data.predictions.find((p: any) => p.taskId === task.id);
        if (prediction) {
          const updated = {
            ...task,
            deadlineRiskProbability: prediction.probability,
            deadlineRiskRecommendation: prediction.recommendation
          };
          await saveTask(user.uid, updated);

          // Alert if risk is high (e.g., >75%)
          if (prediction.probability > 75) {
            const alreadyNotified = notifications.some(n => n.taskId === task.id && n.type === 'warning');
            if (!alreadyNotified) {
              await addNotification(
                'High Risk of Missing Deadline!',
                `"${task.title}" has an 87% chance of delay. AI recommends: ${prediction.recommendation}`,
                'warning',
                task.id
              );
            }
          }
        }
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('AI Prediction error:', err);
    }
  };

  const runAICoaching = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const data = await safeFetchJson('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          habits,
          focusScore: 82 // base default focus metric
        })
      });
      setProductivityReport(data);
    } catch (err: any) {
      console.error(err);
      await addNotification(
        'AI Coaching Failed',
        err.message || 'The AI model is busy. Please try again shortly.',
        'warning'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const sendChat = async (message: string) => {
    if (!user) return;
    setIsChatLoading(true);
    
    // Add User message
    const newChatHistory = [...chatHistory, { role: 'user' as const, text: message }];
    setChatHistory(newChatHistory);

    try {
      const data = await safeFetchJson('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chatHistory,
          tasks,
          schedule,
          habits,
          currentTime: new Date().toISOString()
        })
      });

      // Append Model reply
      setChatHistory([
        ...newChatHistory, 
        { 
          role: 'model' as const, 
          text: data.text,
          actionSuggestion: data.suggestedAction 
        }
      ]);

      // Automatically execute actions suggested by AI Chat Assistant (proactive)
      if (data.suggestedAction) {
        const action = data.suggestedAction;
        if (action.type === 'create_task' && action.payload) {
          const payload = action.payload;
          await addTask(
            payload.title || 'New AI Task',
            payload.deadline || new Date(Date.now() + 86400000).toISOString(),
            payload.estimatedHours || 1,
            payload.priority || 'medium',
            payload.description || 'Generated via AI Chat Assistant'
          );
        } else if (action.type === 'rearrange_schedule') {
          await runAIScheduler();
        } else if (action.type === 'take_break') {
          await addNotification(
            'Time for a Break',
            `AI suggests taking a ${action.payload.durationMinutes || 15} minute break to avoid burnout.`,
            'info'
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setChatHistory([
        ...newChatHistory,
        { role: 'model' as const, text: `I apologize, I ran into trouble processing your message: ${err.message || 'Please try again.'}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- GOOGLE CALENDAR API INTEGRATION ---
  const fetchCalendarEvents = async (): Promise<any[]> => {
    if (!accessToken) return [];
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startOfToday)}&timeMax=${encodeURIComponent(endOfToday)}&singleEvents=true&orderBy=startTime`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch from Google Calendar');
      const data = await res.json();
      
      // Map to consistent slots for scheduling
      return (data.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary || 'Google Calendar Event',
        startTime: item.start?.dateTime || item.start?.date,
        endTime: item.end?.dateTime || item.end?.date,
      }));
    } catch (err) {
      console.error('Calendar Fetch Error:', err);
      return [];
    }
  };

  const syncScheduleToGoogleCalendar = async () => {
    if (!accessToken) {
      alert('Please log in with Google first.');
      return;
    }

    const taskEvents = schedule.filter(e => e.type === 'task' || e.type === 'custom');
    if (taskEvents.length === 0) {
      alert('There are no task events scheduled in your AI timetable. Run the AI Scheduler first.');
      return;
    }

    // MANDATORY Confirmation dialog before performing mutating Google API write operations
    const confirmed = window.confirm(
      `Would you like LastMinute AI to sync ${taskEvents.length} items from today's scheduled timetable into your Google Calendar?`
    );
    if (!confirmed) return;

    setAiLoading(true);
    try {
      for (const event of taskEvents) {
        const body = {
          summary: `⏱️ LastMinute AI: ${event.title}`,
          description: `Automatically scheduled by LastMinute AIproductivity companion.\nEstimated slots for task completion.`,
          start: { dateTime: event.startTime },
          end: { dateTime: event.endTime }
        };

        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          throw new Error(`Failed to create calendar event for ${event.title}`);
        }
      }

      await addNotification(
        'Google Calendar Synced',
        `Successfully added ${taskEvents.length} scheduled slots to your primary Google Calendar!`,
        'success'
      );
      alert(`Successfully synced ${taskEvents.length} slots to your Google Calendar!`);
    } catch (err: any) {
      console.error(err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // --- NOTIFICATION MANAGEMENT ---
  const addNotification = async (
    title: string, 
    message: string, 
    type: 'warning' | 'info' | 'action' | 'success',
    taskId?: string
  ) => {
    if (!user) return;
    const newNotification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      taskId
    };
    await saveNotification(user.uid, newNotification);
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      await saveNotification(user.uid, { ...notif, read: true });
    }
  };

  const clearNotification = async (id: string) => {
    if (!user) return;
    await removeNotification(user.uid, id);
  };

  return (
    <AppContext.Provider value={{
      user,
      needsAuth,
      isLoggingIn,
      accessToken,
      tasks,
      habits,
      schedule,
      notifications,
      productivityReport,
      isLoading,
      aiLoading,
      chatHistory,
      isChatLoading,
      handleLogin,
      handleEmailSignIn,
      handleEmailSignUp,
      handleLogout,
      addTask,
      updateTask,
      deleteTask,
      toggleSubtask,
      addSubtask,
      addHabit,
      toggleHabitToday,
      deleteHabit,
      runAIPrioritization,
      runAIScheduler,
      runAIDeadlinePrediction,
      runAICoaching,
      sendChat,
      fetchCalendarEvents,
      syncScheduleToGoogleCalendar,
      addNotification,
      markNotificationAsRead,
      clearNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
