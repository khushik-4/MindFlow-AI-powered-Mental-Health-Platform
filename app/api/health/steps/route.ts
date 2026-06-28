import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fallback to mock steps data
    const mockSteps = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 5000,
    }));

    return NextResponse.json(mockSteps);
  } catch (error) {
    console.error("Error fetching steps data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}