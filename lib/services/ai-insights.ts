"use server";

import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

interface HealthData {
  heartRate?: { average: number; max: number; min: number };
  sleep?: { duration: number; efficiency: number; stages?: { deep: number; light: number; rem: number } };
  steps?: number;
  mood?: number;
  activities?: Array<{ type: string; duration?: number; completed?: boolean; timestamp?: string; score?: number; note?: string }>;
}

async function askGroq(prompt: string): Promise<string> {
  if (!groq) throw new Error("Groq not configured");
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
}

export async function generateHealthInsights(data: HealthData) {
  try {
    const prompt = `As a wellness AI assistant, analyze this health data and provide 3 key insights and recommendations:
${JSON.stringify(data, null, 2)}

Respond ONLY with a valid JSON array, no explanation, no markdown backticks:
[{"title":"Short insight title","description":"Detailed explanation and recommendation","priority":"high/medium/low","category":"sleep/activity/mood/heart-rate"}]`;
    const text = await askGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("Unable to generate health insights at this time");
  }
}

export async function generateMoodRecommendations(currentMood: number, recentActivities: any[]) {
  try {
    const prompt = `As a wellness AI assistant, provide 3 personalized recommendations based on mood score ${currentMood}/100 and recent activities: ${JSON.stringify(recentActivities)}

Respond ONLY with a valid JSON array, no explanation, no markdown backticks:
[{"title":"Short title","description":"Detailed explanation","type":"meditation/exercise/social/creative","duration":"estimated minutes"}]`;
    const text = await askGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("Unable to generate mood recommendations at this time");
  }
}

export async function analyzeSleepPattern(sleepData: any[]) {
  try {
    const prompt = `Analyze this sleep data and provide insights:
${JSON.stringify(sleepData)}

Respond ONLY with a valid JSON object, no explanation, no markdown backticks:
{"quality":"good/fair/poor","insights":[{"title":"title","description":"explanation","recommendation":"suggestion"}],"recommendations":{"bedtime":"suggested time","wakeTime":"suggested time","improvements":["list"]}}`;
    const text = await askGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("Unable to analyze sleep patterns at this time");
  }
}

export async function generateExercisePlan(userProfile: any, fitnessGoals: string[]) {
  try {
    const prompt = `Create a personalized exercise plan for this profile and goals:
Profile: ${JSON.stringify(userProfile)}
Goals: ${JSON.stringify(fitnessGoals)}

Respond ONLY with a valid JSON object, no explanation, no markdown backticks:
{"weeklyPlan":[{"day":"Monday","exercises":[{"name":"exercise","sets":3,"reps":10,"duration":"minutes","intensity":"low/medium/high","notes":"tips"}],"totalDuration":"minutes","focusArea":"cardio/strength/flexibility"}],"recommendations":{"warmup":["exercises"],"cooldown":["exercises"],"nutrition":["tips"],"hydration":"recommendation"}}`;
    const text = await askGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    console.error("Error generating exercise plan");
    return null;
  }
}