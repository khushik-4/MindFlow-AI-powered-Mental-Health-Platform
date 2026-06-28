import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import {
  generateHealthInsights,
  generateMoodRecommendations,
  analyzeSleepPattern,
} from "@/lib/services/ai-insights";

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { healthData } = body;

    if (!healthData) {
      return NextResponse.json({ error: "Health data is required" }, { status: 400 });
    }

    const errors: string[] = [];
    let insights = [];
    let recommendations = [];
    let sleepInsights = null;

    try {
      insights = await generateHealthInsights(healthData);
    } catch (err: any) {
      errors.push(`Health: ${err.message || "Unknown error"}`);
    }

    try {
      recommendations = await generateMoodRecommendations(
        healthData.mood,
        healthData.activities
      );
    } catch (err: any) {
      errors.push(`Mood: ${err.message || "Unknown error"}`);
    }

    try {
      sleepInsights = await analyzeSleepPattern([
        {
          date: new Date().toISOString(),
          duration: healthData.sleep?.duration,
          efficiency: healthData.sleep?.efficiency,
          stages: healthData.sleep?.stages,
        },
      ]);
    } catch (err: any) {
      errors.push(`Sleep: ${err.message || "Unknown error"}`);
    }

    return NextResponse.json({ insights, recommendations, sleepInsights, errors });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
