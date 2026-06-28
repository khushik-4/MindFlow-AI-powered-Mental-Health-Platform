import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Mock sleep data
    const mockSleep = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: Math.floor(Math.random() * 2) * 3600000 + 21600000,
      efficiency: Math.floor(Math.random() * 20) + 75,
      stages: {
        deep: Math.floor(Math.random() * 60) + 60,
        light: Math.floor(Math.random() * 120) + 180,
        rem: Math.floor(Math.random() * 60) + 90,
      },
    }));

    return NextResponse.json(mockSleep);
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}