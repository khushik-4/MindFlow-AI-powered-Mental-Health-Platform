import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting to seed database...");

    // Clear existing data in correct dependency order
    await prisma.activity.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.chatRoomMessage.deleteMany({});
    await prisma.chatRoomMember.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.forumReply.deleteMany({});
    await prisma.forumPost.deleteMany({});
    await prisma.forumMember.deleteMany({});
    await prisma.forum.deleteMany({});
    await prisma.supportGroup.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Cleared existing database records.");

    // Create test users
    const defaultPasswordHash =
      "$2a$10$X5R2m29m1K1XnZ3sK.zSxeO3nI/L0W7Gf5D7V.Wk8n.s.f8QeZ0a2"; // password123

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "mayankdindoire@gmail.com",
          name: "Mayank",
          passwordHash: defaultPasswordHash,
        },
      }),
      prisma.user.create({
        data: {
          email: "test1@example.com",
          name: "Test User 1",
          passwordHash: defaultPasswordHash,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      }),
      prisma.user.create({
        data: {
          email: "test2@example.com",
          name: "Test User 2",
          passwordHash: defaultPasswordHash,
        },
      }),
    ]);

    console.log(`Created test users: ${users.length}`);

    // Create support groups
    const groups = await Promise.all([
      prisma.supportGroup.create({
        data: {
          name: "Anxiety Support",
          description: "A group for people dealing with anxiety",
        },
      }),
      prisma.supportGroup.create({
        data: {
          name: "Depression Support",
          description: "Support group for depression",
        },
      }),
      prisma.supportGroup.create({
        data: {
          name: "Stress Management",
          description: "Learn to manage daily stress",
        },
      }),
    ]);

    console.log(`Created support groups: ${groups.length}`);

    // Create default chat rooms
    const chatRooms = await Promise.all([
      prisma.chatRoom.create({
        data: {
          name: "General Chat",
          description: "A friendly space for general mental wellness discussions.",
          icon: "💬",
          memberCount: 0,
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Anxiety Chat",
          description: "Connect and share tips for overcoming anxiety and panic.",
          icon: "😌",
          memberCount: 0,
        },
      }),
      prisma.chatRoom.create({
        data: {
          name: "Mindfulness Space",
          description: "Share your meditation and daily mindfulness journeys.",
          icon: "🧘",
          memberCount: 0,
        },
      }),
    ]);

    console.log(`Created chat rooms: ${chatRooms.length}`);

    // Create default forums
    const forums = await Promise.all([
      prisma.forum.create({
        data: {
          name: "Anxiety Discussions",
          description: "Share coping strategies and resources on anxiety.",
          icon: "😌",
          topics: ["Coping Strategies", "Panic Attacks", "Social Anxiety"],
        },
      }),
      prisma.forum.create({
        data: {
          name: "Depression Support",
          description: "A compassionate forum for sharing depression recovery paths.",
          icon: "🌱",
          topics: ["Daily Struggles", "Recovery Journey", "Self-Care"],
        },
      }),
    ]);

    console.log(`Created forums: ${forums.length}`);

    // Create active sessions
    const sessions = await Promise.all([
      prisma.session.create({
        data: {
          userId: users[0].id,
          startedAt: new Date(),
          summary: "Initial Consultation",
          moodScore: 8,
        },
      }),
      prisma.session.create({
        data: {
          userId: users[1].id,
          startedAt: new Date(),
          summary: "Group Session",
          moodScore: 7,
        },
      }),
    ]);

    console.log(`Created active sessions: ${sessions.length}`);

    // Create activities
    const activities = await Promise.all([
      prisma.activity.create({
        data: {
          userId: users[0].id,
          type: "therapy",
          name: "Session Started",
          description: "Started a therapy session",
          timestamp: new Date(),
        },
      }),
      prisma.activity.create({
        data: {
          userId: users[1].id,
          type: "support_group",
          name: "Group Joined",
          description: "Joined Anxiety Support group",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
      }),
      prisma.activity.create({
        data: {
          userId: users[2].id,
          type: "general",
          name: "Profile Updated",
          description: "Updated profile settings",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      }),
    ]);

    console.log(`Created activities: ${activities.length}`);
    console.log("Database seeding completed successfully! 🌱");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Unhandled error during seeding:", e);
  process.exit(1);
});