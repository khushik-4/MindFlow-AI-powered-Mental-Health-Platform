"use server";

import { prisma } from "@/lib/prisma";

// Saves a completed therapy session to the database
// Called when the user ends a therapy chat session
export async function saveCompletedSession(userId: string, summary: string, moodScore: number) {
  try {
    await prisma.session.create({
      data: {
        userId,
        summary,
        moodScore,
        startedAt: new Date(),
        endedAt: new Date(),
      }
    });
  } catch (error) {
    console.error("Failed to save session:", error);
    throw new Error("Could not save your session. Please try again.");
  }
}
