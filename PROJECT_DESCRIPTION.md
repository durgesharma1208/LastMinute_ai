# LastMinute AI

**Adaptive Productivity Agent**

An AI-powered productivity companion that analyzes deadlines, preferences, and calendar events to generate optimized daily schedules, predict deadline risks, and provide intelligent coaching -- ensuring users never miss a deadline.

---

## Problem Statement Selected

Students, freelancers, and professionals struggle with deadline management due to fragmented tools, poor task prioritization, and lack of intelligent scheduling. Existing productivity apps require manual planning and do not adapt to changing workloads or calendar conflicts. This leads to missed deadlines, increased stress, and reduced productivity. The problem is widespread: knowledge workers spend an average of 4+ hours per week just organizing their schedules, and 68% of students report missing deadlines due to poor time management.

---

## Solution Overview

LastMinute AI is a full-stack web application that combines task management, habit tracking, AI-powered scheduling, and predictive analytics into a single interface. Users authenticate via Google Sign-In and are presented with a dashboard that shows key productivity metrics, upcoming deadlines, and AI-generated risk warnings. The application uses the Gemini API to analyze tasks, calculate priority scores, generate conflict-aware daily schedules, predict deadline failure probabilities, and provide personalized productivity coaching. An AI chat assistant allows natural language interaction for task creation, schedule adjustments, and productivity advice. All data is persisted in MongoDB and synchronized with Google Calendar to prevent double-booking.

---

## Key Features

### Authentication
Google Sign-In via Firebase Authentication with OAuth scope for Google Calendar API access. Session management with automatic token caching.

### Dashboard
KPI-driven home screen displaying productivity score, task completion rate, completed task count, next critical deadline with AI risk prediction, and a snapshot of today's AI-generated schedule. Includes action buttons for AI prioritization and scheduling.

### Task Management
Kanban-style three-column board (Todo, In Progress, Completed) with full CRUD operations. Each task supports title, description, deadline, estimated hours, priority level, labels, and subtask breakdown with completion tracking.

### AI Smart Prioritization
Gemini-powered analysis of all tasks to calculate priority scores (0-100), urgency scores, importance scores, recommended start times, and AI reasoning statements. Results are persisted and displayed on task cards.

### AI Conflict-Aware Scheduling
Gemini generates a chronological hourly timetable for the current day, accounting for task deadlines, estimated hours, preferred work hours, sleep hours, meal times, break intervals, and existing Google Calendar events. Tasks are segmented into focused blocks with built-in breaks.

### AI Deadline Risk Prediction
Gemini analyzes each uncompleted task against the current schedule to predict the probability (0-100%) of missing the deadline. Tasks with high risk trigger proactive in-app warnings and display actionable recommendations.

### AI Productivity Coach
Gemini processes task history and habit data to generate a productivity report including focus score, completion rate, missed deadlines count, average delay, daily streak, behavioral insights, and actionable suggestions with impact ratings.

### AI Chat Assistant
Conversational interface powered by Gemini that understands natural language requests. Can create tasks, rearrange schedules, suggest breaks, and provide context-aware advice. Chat history is maintained in session. The assistant can trigger automated actions such as task creation or schedule regeneration.

### Habit Tracking
Habit management with weekly goal configuration, daily completion logging, streak tracking, and a visual 7-day progress grid.

### Google Calendar Integration
Reads today's Google Calendar events to prevent scheduling conflicts. Can push AI-generated timetable slots (task and custom events) into the user's primary Google Calendar after explicit confirmation.

### Smart Notification System
In-app notification panel with categories (warning, info, action, success). Automatically generates deadline warnings when tasks are due within 4 hours and alerts for high-risk deadline predictions. Supports mark-as-read and dismiss actions.

### Productivity Analytics
Recharts-based line chart displaying weekly productivity completion index alongside aggregate metrics such as focus score, completion rate, missed deadlines, and active streak.

### Simulated Voice Command Interface
UI button that simulates voice dictation by selecting a random natural language command (e.g., "Add a biology assignment due tomorrow at 5 PM") and auto-filling the chat input as a demonstration of voice-driven task management.

### Schedule Preferences Configuration
Customizable work hours (start/end) and sleep hours (start/end) that the AI scheduler uses when generating the daily timetable.

---

## Technologies Used

| Category | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Backend | Express.js 4, Node.js, TypeScript |
| Database | MongoDB, Mongoose 9 |
| AI Framework | Google GenAI SDK (@google/genai) |
| AI Model | Gemini 2.0 Flash (primary), Gemini 2.0 Flash Lite (fallback) |
| Authentication | Firebase Authentication (Google Sign-In) |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Charts | recharts |
| Markdown | react-markdown |
| Animations | motion |
| Server-side Rendering | tsx (dev), esbuild (production bundle) |
| Build Tool | Vite 6 |
| Language | TypeScript 5.8 |
| Package Manager | npm |
| Version Control | Git |

---

## Google Technologies Utilized

### Gemini API (via @google/genai SDK)
**Purpose:** Core AI engine for all intelligent features.
**Where used:** Server-side API endpoints for prioritization, scheduling, deadline prediction, coaching, and chat. Uses structured output with response schemas for deterministic JSON parsing.
**Benefit:** Enables complex reasoning about tasks, deadlines, and schedules without requiring pre-trained rules. Generates context-aware, human-readable recommendations.

### Firebase Authentication
**Purpose:** User identity management and Google OAuth token provisioning.
**Where used:** Client-side authentication flow via signInWithPopup and GoogleAuthProvider. Provides OAuth access token for subsequent Google Calendar API calls.
**Benefit:** Eliminates custom credential management. The OAuth token scope includes Google Calendar events for read/write operations.

### Google Calendar API (REST)
**Purpose:** Calendar event synchronization.
**Where used:** Client-side fetch requests to calendar/v3/calendars/primary/events for reading today's events (preventing scheduling conflicts) and creating events from AI-generated timetable slots.
**Benefit:** Ensures the AI scheduler does not double-book across existing calendar meetings.

### Google AI Studio (Deployment)
**Purpose:** Application hosting and deployment.
**Where used:** The project is configured via metadata.json and firebase-applet-config.json for deployment through the Google AI Studio Apps platform.
**Benefit:** Provides managed hosting with Gemini API key integration and a streamlined deployment pipeline.

---

## AI Workflow

### Task Prioritization
1. User creates tasks with deadline, estimated hours, and priority.
2. User clicks "AI Rank Work" on the dashboard.
3. Frontend sends all tasks to POST /api/ai/prioritize.
4. Server sends a system prompt (defining scoring criteria) and task data to Gemini 2.0 Flash with structured JSON schema output.
5. Gemini returns priorityScore, urgencyScore, importanceScore, recommendedStartTime, and aiReasoning for each task.
6. Results are saved to MongoDB and displayed on task cards with visual indicators.

### Schedule Generation
1. User configures work hours and sleep hours in the scheduler view.
2. User clicks "AI Auto-Schedule" or "Regenerate Day".
3. Frontend fetches today's Google Calendar events (if authenticated).
4. Uncompleted tasks, calendar events, and preferences are sent to POST /api/ai/schedule.
5. Gemini generates a chronological timetable with task blocks, breaks, meals, and sleep, ensuring no overlap with calendar events.
6. The schedule is bulk-saved to MongoDB and displayed as an hourly timeline.

### Deadline Risk Prediction
1. Triggered automatically when a task is added and on demand via "AI Predict Risks".
2. Uncompleted tasks and current schedule are sent to POST /api/ai/predict.
3. Gemini analyzes time remaining, schedule contention, and task status to output a probability (0-100) and recommendation per task.
4. High-risk tasks (above 75%) trigger proactive warning notifications.

### Productivity Coaching
1. User navigates to the AI Coach tab.
2. Tasks and habits are sent to POST /api/ai/coach.
3. Gemini calculates focusScore, completionRate, missedDeadlinesCount, averageDelayMinutes, dailyStreak, insights, and actionable suggestions.
4. Results populate the coach dashboard with metrics and chart data.

### Conversational Chat
1. User types a message (or uses a quick prompt / simulated voice command) in the chat assistant.
2. Message, history, tasks, schedule, and habits are sent to POST /api/ai/chat.
3. Gemini processes the context and returns a response with an optional suggestedAction (create_task, rearrange_schedule, take_break).
4. If a suggestedAction is present, the frontend automatically executes it (e.g., creates a task, regenerates schedule, or sends a break notification).

---

## User Workflow

1. **Google Sign-In** -- User authenticates with Google account via Firebase Auth.
2. **Dashboard** -- User sees productivity score, completion metrics, next critical deadline with AI risk, and today's timetable preview.
3. **Create Task** -- User adds tasks with deadline, estimated hours, priority, labels, and subtasks.
4. **AI Prioritization** -- User triggers AI to rank tasks by priority, urgency, and importance.
5. **AI Schedule Generation** -- User configures work/sleep preferences and triggers AI to build a conflict-free hourly timetable that respects Google Calendar events.
6. **AI Deadline Prediction** -- Automatically runs on task creation or manually to flag high-risk deadlines.
7. **Work Execution** -- User follows the AI-generated timetable, moving tasks from Todo to In Progress to Completed.
8. **Habit Tracking** -- User logs daily habits, viewing streak progress on a 7-day grid.
9. **AI Coaching** -- User reviews personalized productivity metrics, insights, and actionable suggestions.
10. **Chat Assistant** -- User interacts via natural language for task management, schedule adjustments, and advice.
11. **Google Calendar Sync** -- User can push AI-scheduled task blocks to Google Calendar after confirmation.
12. **Notifications** -- In-app alerts warn of upcoming deadlines and high-risk tasks.

---

## Project Architecture

### Frontend (React + Vite + Tailwind CSS)
Single-page application with component-based architecture. State managed via React Context (AppContext). Data fetching through a store layer that polls REST API endpoints every 5 seconds. Six primary views navigated via sidebar tabs.

### Backend (Express.js + Node.js)
RESTful API server with CRUD endpoints for tasks, habits, schedule events, and notifications. Five AI endpoints interface with the Gemini API using structured output schemas. Authentication enforced via x-user-id header middleware.

### Database (MongoDB + Mongoose)
Four collections: tasks, habits, scheduleevents, notifications. Each document is scoped to a userId. Mongoose schemas match the TypeScript interfaces.

### AI Layer (Google GenAI SDK)
All AI logic runs server-side. Gemini 2.0 Flash is the primary model with automatic fallback to Gemini 2.0 Flash Lite. Responses are constrained using JSON schema formatting for deterministic parsing.

### Google Services Integration
- Firebase Authentication on the client for sign-in and OAuth token acquisition.
- Google Calendar REST API called from the client for reading existing events and creating new ones.
- Google AI Studio for deployment.

### Deployment
Development mode uses Vite middleware embedded in the Express server. Production mode builds the frontend with Vite and bundles the server with esbuild, serving static files from the dist directory.

---

## Innovation

- **Agentic AI Orchestration:** The application does not rely on static rules. Gemini acts as an intelligent agent that reasons about task priority, schedule conflicts, and deadline risks in context, adapting to the user's specific workload and preferences.
- **Multi-Model AI Pipeline:** Five distinct AI workflows (prioritization, scheduling, prediction, coaching, chat) each use tailored prompts and structured output schemas, demonstrating a modular approach to AI integration.
- **Context-Aware Scheduling:** The scheduler ingests live Google Calendar data, preferred work/sleep hours, and task metadata to produce a timeline that respects real-world constraints -- going beyond simple time-blocking.
- **Proactive Alert System:** The application does not wait for user input. It automatically runs deadline risk prediction on task creation and generates warning notifications when tasks are due within 4 hours without being started.
- **Conversational Task Management:** The chat assistant can execute actions (create tasks, regenerate schedules) based on natural language, bridging the gap between conversation and system state changes.

---

## Impact

- **Students:** Reduces missed assignment deadlines through AI-generated study schedules, deadline risk warnings, and habit tracking for consistent study routines.
- **Professionals:** Eliminates calendar conflicts by integrating with Google Calendar and automatically blocking focused work time around existing meetings.
- **Freelancers:** Provides structured daily plans across multiple projects with priority-based task ordering and deadline risk visibility.
- **Entrepreneurs:** Delivers a centralized command center for task and schedule management with AI coaching to improve productivity patterns over time.

By automating schedule construction and deadline risk assessment, the application reduces daily planning overhead from hours to seconds, allowing users to focus on execution rather than organization.

---

## Future Enhancements

- Real speech-to-text voice input for the chat assistant.
- Push notifications via service workers for deadline warnings outside the browser.
- Multi-user collaboration and shared task spaces.
- Weekly and monthly schedule views in addition to daily.
- Integration with additional calendar providers (Outlook, iCloud).
- Mobile-responsive progressive web app with offline support.
- Team productivity dashboards with manager overview.
- Personalized AI fine-tuning based on historical user behavior patterns.

---

## Conclusion

LastMinute AI is a production-ready, full-stack productivity application that harnesses the Gemini API to transform how users manage tasks, schedules, and deadlines. By combining task management, habit tracking, AI-powered scheduling, deadline risk prediction, and conversational assistance within a single platform, it eliminates the fragmentation inherent in traditional productivity tools. The application demonstrates practical, agentic AI workflows that reason about user context, adapt to real-world constraints, and take proactive action. Built with React, Express, MongoDB, Firebase Authentication, Google Calendar API, and the Google GenAI SDK, LastMinute AI represents a cohesive integration of modern web technologies and Google AI services to solve a universal productivity challenge.
