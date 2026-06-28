import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const mockResponses = [
  "I hear you, and I'm here to support you. Could you share more about what's on your mind?",
  "It's completely okay to feel that way. What do you think is triggering these feelings right now?",
  "Thank you for sharing that with me. Let's take a deep breath together. How can I help you navigate this?",
  "I'm listening. Tell me more about what you've been experiencing lately.",
  "That sounds challenging, but you're not alone in this. What is one small step we could take together to help you feel more grounded?"
];

function getRandomMockResponse() {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomId, content, message } = body;

    // Handle AI therapy chat
    if (message && !roomId) {
      if (!groq) {
        console.log("Groq not initialized — using mock response");
        return NextResponse.json({ response: getRandomMockResponse() });
      }

      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are MindFlow, a warm, supportive, and empathetic AI therapist. You are having a private conversation with a user about their mental health. Provide thoughtful, judgment-free, and compassionate therapeutic responses. Keep responses concise and caring."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        const responseText = completion.choices[0]?.message?.content || getRandomMockResponse();
        return NextResponse.json({ response: responseText });
      } catch (groqError) {
        console.error("Groq API error:", groqError);
        return NextResponse.json({ response: getRandomMockResponse() });
      }
    }

    if (!roomId || !content) {
      return NextResponse.json(
        { error: "Room ID and message content are required" },
        { status: 400 }
      );
    }

    const membership = await prisma.chatRoomMember.findFirst({
      where: { userId, roomId },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this room to send messages" },
        { status: 403 }
      );
    }

    const messageRecord = await prisma.chatRoomMessage.create({
      data: { roomId, userId, content },
    });

    await prisma.chatRoomMember.updateMany({
      where: { userId, roomId },
      data: { lastSeen: new Date() },
    });

    return NextResponse.json(messageRecord);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const chatHistory = await prisma.chatRoomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}