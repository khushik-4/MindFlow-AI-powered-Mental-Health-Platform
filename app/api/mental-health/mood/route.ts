import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const entries = await prisma.activity.findMany({
      where: {
        userId,
        type: "mood",
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(
      entries.map((entry) => ({
        id: entry.id,
        moodScore: entry.moodScore || 0,
        description: entry.description || "",
        moodNote: entry.moodNote || "",
        createdAt: entry.timestamp,
      }))
    );
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();

    const entry = await prisma.activity.create({
      data: {
        userId,
        type: "mood",
        name: "Mood Entry",
        description: body.description || "",
        moodScore: body.moodScore,
        moodNote: body.moodNote || "",
        completed: true,
      },
    });

    return NextResponse.json({
      id: entry.id,
      moodScore: entry.moodScore || 0,
      description: entry.description || "",
      moodNote: entry.moodNote || "",
      createdAt: entry.timestamp,
    });
  } catch (error) {
    console.error("Error saving mood entry:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}