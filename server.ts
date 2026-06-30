import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI SDK with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Resilient helper to call generateContent with fallbacks to handle transient model errors or high demand (503/429)
async function generateContentWithFallback(params: Parameters<typeof ai.models.generateContent>[0]) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[AI] Attempting request using model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      console.log(`[AI] Success using model: ${model}`);
      return response;
    } catch (err: any) {
      console.warn(`[AI] Model ${model} failed:`, err.message || err);
      lastError = err;
      // If it's a 503 (high demand) or other API error, fallback to the next model
    }
  }
  throw lastError;
}

app.use(express.json());

// API route: AI Smart Prioritization
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks array is required" });
    }

    if (tasks.length === 0) {
      return res.json({ tasks: [] });
    }

    const systemPrompt = `You are LastMinute AI, an expert Executive Productivity Assistant. 
Analyze the user's tasks and calculate priority scores.
For each task, return:
1. priorityScore (0 to 100): High importance and near deadline increases this.
2. urgencyScore (0 to 100): Closer deadline increases this.
3. importanceScore (0 to 100): Initial priority indicator and user flags increase this.
4. recommendedStartTime: Recommended ISO date/time string to start this task, given the estimated duration and current time (which is ${new Date().toISOString()}).
5. aiReasoning: One sentence explaining why this task has this score and when to start.

Output must be in JSON matching the requested schema. Ensure all tasks from input are returned with their ID and these calculated scores.`;

    const userPrompt = `Here is the list of tasks to analyze: ${JSON.stringify(tasks)}`;

    // Define JSON Schema for response
    const taskPrioritySchema: Schema = {
      type: Type.OBJECT,
      properties: {
        prioritizedTasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              priorityScore: { type: Type.INTEGER },
              urgencyScore: { type: Type.INTEGER },
              importanceScore: { type: Type.INTEGER },
              recommendedStartTime: { type: Type.STRING },
              aiReasoning: { type: Type.STRING },
            },
            required: ["id", "priorityScore", "urgencyScore", "importanceScore", "recommendedStartTime", "aiReasoning"],
          },
        },
      },
      required: ["prioritizedTasks"],
    };

    const response = await generateContentWithFallback({
      model: "gemini-2.5-flash",
      contents: [systemPrompt, userPrompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: taskPrioritySchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Prioritize Error:", error);
    res.status(500).json({ error: error.message || "Failed to prioritize tasks" });
  }
});

// API route: AI Scheduler
app.post("/api/ai/schedule", async (req, res) => {
  try {
    const { tasks, calendarEvents, preferredWorkHours, sleepHours, currentTime } = req.body;
    const now = currentTime ? new Date(currentTime) : new Date();

    const systemPrompt = `You are LastMinute AI, a master automated scheduler.
Your job is to build a beautiful schedule (timetable events) for today starting from ${now.toISOString()}.
Make sure to fit tasks around existing 'calendarEvents'.
Rules:
1. Block out sleep hours (e.g., from preferred sleepHours: ${JSON.stringify(sleepHours || { start: "23:00", end: "07:00" })}).
2. Schedule task sessions (type: 'task') of maximum 2 hours. If a task takes longer, schedule a portion or divide it.
3. Insert 15-minute breaks (type: 'break') between back-to-back tasks.
4. Allocate meals: Lunch (12:00 - 13:00) and Dinner (19:00 - 20:00) (type: 'meal').
5. Create standard sleep blocks (type: 'sleep').
6. Do not overlap with the provided calendarEvents: ${JSON.stringify(calendarEvents || [])}.
7. Schedule uncompleted high-priority tasks first, taking account of their deadlines.

Output format must be a clean, chronological list of timetable events. Each event must have:
- title: string
- taskId: string (optional, link to original task if it's a 'task' type)
- startTime: ISO string
- endTime: ISO string
- type: 'task' | 'break' | 'meal' | 'sleep' | 'calendar' | 'custom'

Output must be in JSON matching the requested schema.`;

    const userPrompt = `Here are the uncompleted tasks to schedule: ${JSON.stringify(tasks || [])}
Existing Calendar events for today: ${JSON.stringify(calendarEvents || [])}
Preferred work hours: ${JSON.stringify(preferredWorkHours || { start: "08:00", end: "18:00" })}
Preferred sleep hours: ${JSON.stringify(sleepHours || { start: "23:00", end: "07:00" })}`;

    const scheduleSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        schedule: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              taskId: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              type: {
                type: Type.STRING,
                enum: ["task", "break", "meal", "sleep", "calendar", "custom"],
              },
            },
            required: ["title", "startTime", "endTime", "type"],
          },
        },
      },
      required: ["schedule"],
    };

    const response = await generateContentWithFallback({
      model: "gemini-2.5-flash",
      contents: [systemPrompt, userPrompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
        temperature: 0.3,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Scheduler Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate schedule" });
  }
});

// API route: AI Deadline Prediction
app.post("/api/ai/predict", async (req, res) => {
  try {
    const { tasks, schedule, currentTime } = req.body;
    const now = currentTime ? new Date(currentTime) : new Date();

    const systemPrompt = `You are LastMinute AI, an advanced productivity prediction engine.
Analyze each task and predict the probability of missing its deadline (0% to 100%).
Consider:
1. Current time is ${now.toISOString()}.
2. Estimated hours remaining vs time until deadline.
3. Overlap and contention with other tasks in the provided current schedule: ${JSON.stringify(schedule || [])}.
4. Status of subtasks.

For each task in the list, you must output:
- taskId: string
- probability: number (integer 0 to 100) indicating chance of missing deadline
- recommendation: A specific, short, actionable advice to reduce this risk (e.g. "Start within 20 mins, move gym to tomorrow", "Delegate subtask A or split work").

Output must be in JSON matching the requested schema.`;

    const userPrompt = `Here are the uncompleted tasks to analyze: ${JSON.stringify(tasks || [])}`;

    const predictionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        predictions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              taskId: { type: Type.STRING },
              probability: { type: Type.INTEGER },
              recommendation: { type: Type.STRING },
            },
            required: ["taskId", "probability", "recommendation"],
          },
        },
      },
      required: ["predictions"],
    };

    const response = await generateContentWithFallback({
      model: "gemini-2.5-flash",
      contents: [systemPrompt, userPrompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: predictionSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Prediction Error:", error);
    res.status(500).json({ error: error.message || "Failed to predict risks" });
  }
});

// API route: AI Productivity Coach
app.post("/api/ai/coach", async (req, res) => {
  try {
    const { tasks, habits, focusScore } = req.body;

    const systemPrompt = `You are LastMinute AI's expert productivity coach.
Analyze the user's task history and habit completion data.
Calculate the productivity report, including:
1. focusScore (0-100 based on habits and tasks completed)
2. completionRate (percentage of completed tasks)
3. completedTasksCount (number of completed tasks)
4. missedDeadlinesCount (count of deadlines that are past but task is not completed, or completed late)
5. averageDelayMinutes (average delay in completing tasks beyond deadline)
6. dailyStreak (overall streak based on habit completions)
7. insights (3 customized strings explaining their productivity trends, e.g., "You complete coding tasks faster in the morning.")
8. suggestions (3 customized items: {title, description, impact: 'high' | 'medium' | 'low'})

Output must be in JSON matching the requested schema.`;

    const userPrompt = `User data for analysis:
Tasks: ${JSON.stringify(tasks || [])}
Habits: ${JSON.stringify(habits || [])}
Focus Score Input: ${focusScore || 70}`;

    const coachSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        focusScore: { type: Type.INTEGER },
        completionRate: { type: Type.INTEGER },
        completedTasksCount: { type: Type.INTEGER },
        missedDeadlinesCount: { type: Type.INTEGER },
        averageDelayMinutes: { type: Type.INTEGER },
        dailyStreak: { type: Type.INTEGER },
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: {
                type: Type.STRING,
                enum: ["high", "medium", "low"],
              },
            },
            required: ["title", "description", "impact"],
          },
        },
      },
      required: [
        "focusScore",
        "completionRate",
        "completedTasksCount",
        "missedDeadlinesCount",
        "averageDelayMinutes",
        "dailyStreak",
        "insights",
        "suggestions",
      ],
    };

    const response = await generateContentWithFallback({
      model: "gemini-2.5-flash",
      contents: [systemPrompt, userPrompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: coachSchema,
        temperature: 0.3,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Coach Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate coaching metrics" });
  }
});

// API route: AI Chat Assistant
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, tasks, schedule, habits, currentTime } = req.body;
    const now = currentTime ? new Date(currentTime) : new Date();

    const systemPrompt = `You are LastMinute AI, an adaptive and proactive AI productivity companion.
You act like a personal executive assistant. Instead of just replying, you can suggest actions to update the user's tasks or schedule based on their request.
Current Time is: ${now.toISOString()}.

Available user data:
- Tasks: ${JSON.stringify(tasks || [])}
- Schedule: ${JSON.stringify(schedule || [])}
- Habits: ${JSON.stringify(habits || [])}

Instructions:
1. Speak with professional, helpful, objective composure.
2. If the user says something like:
   - "I'm tired" -> suggest starting with an easy task, taking a break, or reducing workload.
   - "I only have 2 hours today" -> offer to reschedule to fit the absolute top priorities.
   - "Add assignment tomorrow at 5 PM" -> process this and trigger a recommended action.
3. You can optionally include a "suggestedAction" in your JSON output.
   - To create a task: suggestedAction: { type: "create_task", payload: { title: "assignment", deadline: "2026-07-01T17:00:00Z", estimatedHours: 2, priority: "high" } }
   - To rearrange schedule: suggestedAction: { type: "rearrange_schedule", payload: { hoursAvailable: 2 } }
   - To take a break: suggestedAction: { type: "take_break", payload: { durationMinutes: 15 } }

Output must be in JSON matching the requested schema.`;

    const chatResponseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        suggestedAction: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING }, // e.g., "create_task", "rearrange_schedule", "take_break"
            payload: { type: Type.OBJECT }, // payload details
          },
          required: ["type"],
        },
      },
      required: ["text"],
    };

    // Format conversation history
    const contents: any[] = [systemPrompt];
    if (history && Array.isArray(history)) {
      history.forEach((h) => {
        contents.push(`${h.role === "user" ? "User" : "Assistant"}: ${h.text}`);
      });
    }
    contents.push(`User's new message: ${message}`);

    const response = await generateContentWithFallback({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.5,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// Vite middleware setup
if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on http://localhost:${PORT}`);
    });
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on port ${PORT}`);
  });
}
