"use server";

import { prisma } from "../prisma";

export async function createUser(userData: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}) {
  return await prisma.user.create({
    data: userData,
  });
}

export async function updateUserPreferences(
  userId: string,
  preferences: any
) {
  return await prisma.userPreference.upsert({
    where: { userId },
    update: preferences,
    create: {
      userId,
      ...preferences,
    },
  });
}

export async function logHealthMetric(
  userId: string,
  metricType: string,
  value: any
) {
  return { success: true };
}

export async function scheduleTherapySession(
  userId: string,
  scheduledTime: Date
) {
  const session = await prisma.session.create({
    data: {
      userId,
      startedAt: scheduledTime,
    },
  });
  return [session];
}



// Chat History Actions
export async function saveChatMessage({
  userId,
  message,
  role,
  context,
}: {
  userId: string;
  message: string;
  role: "user" | "assistant";
  context?: any;
}) {
  try {
    const sessionId = context?.sessionId;
    const msg = await prisma.chatMessage.create({
      data: {
        userId,
        role,
        content: message,
        sessionId,
      },
    });
    return [{
      id: msg.id,
      role: msg.role,
      message: msg.content,
      timestamp: msg.createdAt,
      context: { sessionId: msg.sessionId },
      userId: msg.userId,
      sentiment: null,
    }];
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
}

export async function getChatHistory(userId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    message: msg.content,
    timestamp: msg.createdAt,
    context: { sessionId: msg.sessionId },
    userId: msg.userId,
    sentiment: null,
  }));
}



// Activity Management
export async function createActivity({
  userId,
  type,
  name,
  description,
  duration,
  moodScore,
  moodNote,
}: {
  userId: string;
  type: string;
  name: string;
  description?: string;
  duration?: number;
  moodScore?: number;
  moodNote?: string;
}) {
  try {
    return await prisma.activity.create({
      data: {
        userId,
        type,
        name,
        description,
        duration,
        moodScore,
        moodNote,
        completed: false,
      },
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

export async function updateActivityStatus({
  activityId,
  status,
  completedAt,
}: {
  activityId: string;
  status: string;
  completedAt?: Date;
}) {
  const completed = status === "completed";
  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: {
      completed,
      updatedAt: new Date(),
    },
  });
  return [activity];
}

export async function getTodaysActivities(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.activity.findMany({
    where: {
      userId,
      timestamp: {
        gte: today,
      },
    },
    orderBy: {
      timestamp: "asc",
    },
  });
}



export async function getAllTherapySessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
    });
    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      type: "text",
      status: s.endedAt ? "completed" : "in_progress",
      scheduledTime: s.startedAt,
      summary: s.summary,
    }));
  } catch (error) {
    console.error("Error getting therapy sessions:", error);
    throw error;
  }
}

export async function createTherapySession({
  userId,
  type,
}: {
  userId: string;
  type: string;
}) {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
        startedAt: new Date(),
      },
    });
    return [{
      id: session.id,
      userId: session.userId,
      type,
      status: "in_progress",
      scheduledTime: session.startedAt,
      summary: session.summary,
    }];
  } catch (error) {
    console.error("Failed to create therapy session:", error);
    throw error;
  }
}

export async function updateTherapySession(
  sessionId: string,
  data: {
    title?: string;
    summary?: string;
    status?: string;
  }
) {
  try {
    const updateData: any = {};
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.status === "completed") {
      updateData.endedAt = new Date();
    }

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });

    return [{
      id: session.id,
      userId: session.userId,
      status: session.endedAt ? "completed" : "in_progress",
      scheduledTime: session.startedAt,
      summary: session.summary,
    }];
  } catch (error) {
    console.error("Failed to update therapy session:", error);
    throw error;
  }
}

export async function getSessionChatHistory(sessionId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      message: msg.content,
      timestamp: msg.createdAt,
      context: { sessionId: msg.sessionId },
      userId: msg.userId,
      sentiment: null,
    }));
  } catch (error) {
    console.error("Error getting session chat history:", error);
    throw error;
  }
}

export async function getUserActivities(userId: string, days: number = 7) {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return await prisma.activity.findMany({
      where: {
        userId,
        timestamp: {
          gte: daysAgo,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  } catch (error) {
    console.error("Error getting user activities:", error);
    throw error;
  }
}

export async function saveMoodData({
  userId,
  mood,
  note,
}: {
  userId: string;
  mood: number;
  note: string;
}) {
  return await prisma.activity.create({
    data: {
      userId,
      type: "mood",
      name: "Mood Entry",
      description: note,
      moodScore: mood,
      moodNote: note,
      completed: true,
    },
  });
}

export async function logActivity(data: {
  userId: string;
  type: string;
  name: string;
  description: string | null;
  completed: boolean;
  duration: number | null;
  moodScore: number | null;
  moodNote: string | null;
}) {
  return await prisma.activity.create({
    data: {
      userId: data.userId,
      type: data.type,
      name: data.name,
      description: data.description,
      completed: data.completed,
      duration: data.duration,
      moodScore: data.moodScore,
      moodNote: data.moodNote,
    },
  });
}


