import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forumId = searchParams.get("id");

    if (forumId) {
      const forum = await prisma.forum.findFirst({
        where: { id: forumId },
      });

      if (!forum) {
        return NextResponse.json({ error: "Forum not found" }, { status: 404 });
      }

      return NextResponse.json(forum);
    }

    const allForums = await prisma.forum.findMany();
    return NextResponse.json(allForums);
  } catch (error) {
    console.error("Error fetching forums:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = verifyAuthToken(token);
    const userId = claims?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, isPrivate, topics } = body;

    const forum = await prisma.forum.create({
      data: {
        name,
        description,
        icon,
        isPrivate: isPrivate || false,
        topics: topics || [],
      },
    });

    // Add the creator as an admin member
    await prisma.forumMember.create({
      data: {
        forumId: forum.id,
        userId,
        role: "admin",
      },
    });

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error creating forum:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = verifyAuthToken(token);
    const userId = claims?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, icon, isPrivate, topics } = body;

    // Check if user is admin of the forum
    const member = await prisma.forumMember.findFirst({
      where: {
        forumId: id,
        userId,
      },
    });

    if (!member || member.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const forum = await prisma.forum.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        isPrivate: isPrivate || false,
        topics: topics || [],
      },
    });

    return NextResponse.json(forum);
  } catch (error) {
    console.error("Error updating forum:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = verifyAuthToken(token);
    const userId = claims?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const forumId = searchParams.get("id");

    if (!forumId) {
      return NextResponse.json({ error: "Forum ID is required" }, { status: 400 });
    }

    // Check if user is admin of the forum
    const member = await prisma.forumMember.findFirst({
      where: {
        forumId,
        userId,
      },
    });

    if (!member || member.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.forum.delete({
      where: { id: forumId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting forum:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}