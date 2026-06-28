import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth-utils";

// Get all chat rooms or a specific room
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (roomId) {
      const room = await prisma.chatRoom.findFirst({
        where: { id: roomId },
      });

      if (!room) {
        return NextResponse.json(
          { error: "Room not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(room);
    }

    const rooms = await prisma.chatRoom.findMany({
      orderBy: { memberCount: "desc" },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new chat room
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, description, icon, isPrivate } = await request.json();

    if (!name || !description || !icon) {
      return NextResponse.json(
        { error: "Name, description, and icon are required" },
        { status: 400 }
      );
    }

    const room = await prisma.chatRoom.create({
      data: {
        name,
        description,
        icon,
        isPrivate: isPrivate || false,
        memberCount: 1,
      },
    });

    // Add creator as admin member
    await prisma.chatRoomMember.create({
      data: {
        roomId: room.id,
        userId,
        role: "admin",
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Join a chat room
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.chatRoom.findFirst({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.chatRoomMember.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this room" },
        { status: 400 }
      );
    }

    // Add user as member
    await prisma.chatRoomMember.create({
      data: {
        roomId,
        userId,
        role: "member",
      },
    });

    // Increment member count
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { memberCount: room.memberCount + 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining chat room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}