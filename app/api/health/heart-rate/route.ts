import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Mock heart rate data — Fitbit API deprecated for new registrations
    const mockHeartRate = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      average: Math.floor(Math.random() * 20) + 65,
      max: Math.floor(Math.random() * 40) + 120,
      min: Math.floor(Math.random() * 10) + 55,
    }));

    return NextResponse.json(mockHeartRate);
  } catch (error) {
    console.error("Error fetching heart rate data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}