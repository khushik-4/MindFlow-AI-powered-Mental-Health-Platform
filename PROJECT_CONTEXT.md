# MindFlow - Project Context & System Architecture Guide

> **Purpose of this Document:** This guide provides a complete, self-contained overview of the **MindFlow** project. It is structured specifically to serve as context for LLMs, AI coding companions, and developers to enable rapid, context-aware reasoning about the codebase, architecture, database schemas, API contracts, and business logic.

---

## 1. Executive Summary & Domain Overview

**MindFlow** is an AI-powered, confidential mental health and wellness platform designed to offer low-barrier emotional support, mood tracking, daily reflections, community interaction, and mindfulness exercises.

- **Primary Goal:** Provide a private, safe, and immediate digital sanctuary for individuals managing stress, anxiety, or emotional tracking without friction or social stigma.
- **Target Audience:** End-users seeking wellness tools & AI companions; developers looking for an enterprise-grade reference template combining Next.js 14 (App Router), Prisma, PostgreSQL, and Groq (LLaMA 3.1 8B).

---

## 2. Core Application Features

1. **Interactive Therapy Chat (`/therapy`)**
   - AI Companion: Empathetic, supportive conversational agent powered by Groq SDK (`llama-3.1-8b-instant`).
   - Graceful Fallbacks: If `GROQ_API_KEY` is absent or the API fails, the service falls back to pre-crafted empathetic response arrays.
   - Session History: Logs individual user-assistant message threads in PostgreSQL.

2. **Dynamic Wellness Dashboard (`/dashboard`)**
   - Aggregate metrics: Weekly mood averages, activity counts, sleep, and heart-rate tracking metrics.
   - AI Insights Generator: Summarizes recent user mood logs and activities into personalized daily wellness tips.

3. **Mood & Activity Tracking (`/mental-health`)**
   - Multi-dimensional logging: Mood scores (1–10 or 1–100), journal notes, exercise types, and meditation durations.
   - Real-time updates stored in the `MoodEntry` and `Activity` database tables.

4. **Community Forums & Peer Groups (`/community`)**
   - Discussion Boards: Categorized posts, search & filter options, tag support, likes, and nested replies.
   - Group Chat Rooms: Public & private interest-based chat channels for peer-to-peer support.

5. **Mindfulness & Grounding Tools**
   - Audio Soundscapes: Interactive ambient audio environments (e.g., forest, ocean waves).
   - Interactive games & relaxation exercises.

6. **Account & Profile Management (`/profile`, `/admin`)**
   - User profiles with bio, avatar customization, fitness goals, and notification preferences.
   - Password updating and user role / admin features.

---

## 3. Technology Stack & Key Dependencies

| Category | Technology / Library | Purpose / Usage |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Full-stack React framework (`app/` directory layout) |
| **Language** | TypeScript | Strong typing across client UI and API routes |
| **UI & Styling** | Tailwind CSS, shadcn/ui, Radix UI | Utility-first styling & accessible component primitives |
| **Animations** | Framer Motion, Lucide React, Tabler Icons | Micro-interactions, transitions, and modern icon packages |
| **Database & ORM** | PostgreSQL, Prisma ORM (`v6.5.0`) | Schema definitions, migration management, type-safe queries |
| **AI Integration** | Groq SDK (`groq-sdk`), `@google/generative-ai` | High-speed LLM inference using LLaMA 3.1 8B Instant model |
| **Auth System** | JWT (`jsonwebtoken`), `bcryptjs` | Stateless session handling via HTTP cookies and Authorization headers |
| **Data Fetching & State** | `@tanstack/react-query`, Zustand | Client-side data management & global application state |

---

## 4. Directory Structure Blueprint

```
MindFlow/
├── app/                        # Next.js 14 App Router Directory
│   ├── api/                    # API Route Handlers
│   │   ├── admin/              # Admin dashboard endpoints
│   │   ├── auth/               # User registration, sign-in, session handlers
│   │   ├── chat/               # AI therapy & room chat handlers
│   │   ├── comments/           # Forum post comment endpoints
│   │   ├── community/          # Community feeds & groups
│   │   ├── health/             # Health metrics & wearable tracking data
│   │   ├── insights/           # Groq AI wellness summary generator
│   │   ├── mental-health/      # Mood logging & entry endpoints
│   │   └── posts/              # Forum post creation & likes
│   ├── community/              # Forum & peer group pages
│   ├── dashboard/              # Analytics & wellness metrics page
│   ├── login/ / sign-in/       # Authentication pages
│   ├── mental-health/          # Mood tracker & check-in UI
│   ├── profile/                # User profile edit & settings page
│   ├── therapy/                # AI therapy chat interface
│   ├── globals.css             # Tailwind base styles & custom CSS vars
│   ├── layout.tsx              # Root HTML layout & global providers
│   └── page.tsx                # Landing page UI
├── components/                 # Reusable UI widgets & shadcn components
│   ├── ui/                     # Primitives (buttons, dialogs, cards, inputs)
│   └── ...                     # Feature-specific client components
├── lib/                        # Server & utility logic
│   ├── auth-utils.ts           # JWT sign, verify, & request extraction helpers
│   ├── prisma.ts               # Prisma Client singleton instantiation
│   └── utils.ts                # Tailwind class merging (`cn`)
├── prisma/
│   ├── schema.prisma           # Unified PostgreSQL Prisma schema definition
│   └── seed.ts                 # Database seeder script
├── public/                     # Static images, icons, and audio assets
├── package.json                # Dependencies, scripts, & engine requirements
└── README.md                   # Project intro & getting started guide
```

---

## 5. Database Schema & Data Models

MindFlow utilizes **PostgreSQL** via **Prisma ORM**. Key entity relationships:

```mermaid
erDiagram
    User ||--o| UserProfile : "has profile"
    User ||--o| UserPreference : "has settings"
    User ||--o{ Session : "conducts therapy sessions"
    Session ||--o{ ChatMessage : "contains messages"
    User ||--o{ MoodEntry : "logs daily mood"
    User ||--o{ Activity : "tracks activities"
    User ||--o{ ForumPost : "authors posts"
    Forum ||--o{ ForumPost : "contains posts"
    ForumPost ||--o{ ForumReply : "has replies"
    User ||--o{ ChatRoomMessage : "sends room messages"
    ChatRoom ||--o{ ChatRoomMessage : "contains room messages"
```

### Core Models Summary

1. **User**: Stores email, `passwordHash`, timestamps, and relational links across all features.
2. **UserProfile**: Contains `bio`, `avatarUrl`, `fitnessGoal`.
3. **UserPreference**: Toggles for `notifications` and `aiInterventions`.
4. **Session & ChatMessage**: Stores therapy sessions and interactive dialogue turns (`role: "user" | "assistant"`).
5. **MoodEntry**: Contains emotional scores (1–10/100) and user notes.
6. **Activity**: Stores categorized exercises, meditation, and therapy event durations.
7. **HealthData**: Daily tracking metrics (`steps`, `heartRateAvg`, `sleepHours`, `sleepQuality`).
8. **Forum, ForumPost, ForumReply, PostLike, CommentLike**: Community forum system.
9. **ChatRoom, ChatRoomMessage, ChatRoomMember**: Group chat channels.

---

## 6. Authentication & Authorization Flow

- **Strategy:** Custom JWT (JSON Web Token) authentication with `bcryptjs` password hashing.
- **Token Format:** Signed payload `{ userId: string }` with a standard 7-day expiration.
- **Transport Mechanism:**
  - Standard HTTP Authorization Header (`Bearer <token>`)
  - Cookies (`auth_token` or `privy_auth_token`)
- **Utility Extraction (`lib/auth-utils.ts`):**
  - `signAuthToken(userId: string)`: Generates signed JWT.
  - `verifyAuthToken(token: string)`: Decodes and validates token against `JWT_SECRET`.
  - `getUserIdFromRequest(request: Request)`: Inspects headers and cookies, returning the validated `userId` or `null`.

---

## 7. AI System Architecture & Fallback Strategy

MindFlow leverages the **Groq SDK** to interact with the fast `llama-3.1-8b-instant` model.

### 1. Therapy Chat (`POST /api/chat`)
- System Prompt: Defines MindFlow as a warm, compassionate, judgment-free AI therapist.
- Parameters: `temperature: 0.7`, `max_tokens: 1024`.
- Fallback Mode: If `GROQ_API_KEY` is missing or the Groq API call fails, the endpoint returns a random curated empathetic response string without throwing a 500 error.

### 2. Wellness Insights (`POST /api/insights`)
- Aggregates recent `MoodEntry` records and `Activity` history for the authenticated user.
- Prompts the LLM to generate actionable, empathetic 2-3 sentence personalized wellness advice.

---

## 8. Essential API Route Endpoints

| Endpoint | Method | Required Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Registers a new user account with hashed password |
| `/api/auth/login` | `POST` | Public | Validates credentials and returns JWT token |
| `/api/chat` | `POST` | Required | Triggers AI therapy response or posts to room chat |
| `/api/chat?roomId=...` | `GET` | Required | Fetches chat history for a group room |
| `/api/mental-health` | `GET / POST` | Required | Retrieves or logs user mood entries |
| `/api/insights` | `POST` | Required | Generates AI wellness recommendations based on logs |
| `/api/posts` | `GET / POST` | Optional/Req | Lists community forum posts or creates new post |
| `/api/health` | `GET / POST` | Required | Fetches smartwatch health metrics (steps, sleep) |

---

## 9. Environment Variables & Setup

### Environment Variables (`.env`)
```bash
# Database connection string (PostgreSQL via Neon, Supabase, or local)
DATABASE_URL="postgresql://user:password@host:5432/mindflow?sslmode=require"

# Groq API key for LLM inference (https://console.groq.com/keys)
GROQ_API_KEY="gsk_..."

# Secret key for JWT token signing
JWT_SECRET="your-super-secret-random-jwt-key"
```

### Setup & Development Commands
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Push schema to database
npm run prisma:push

# 4. Seed database (optional)
npm run prisma:seed

# 5. Start dev server
npm run dev
```

---

## 10. Key Conventions & Engineering Guidelines

1. **Authentication Enforcement:** Always use `getUserIdFromRequest(request)` in API routes to protect user data. Return HTTP 401 if null.
2. **Database Operations:** Always import the singleton Prisma instance from `@/lib/prisma`.
3. **Resilient AI Calling:** Wrap all Groq API calls in `try...catch` blocks and provide structured fallback strings so the frontend UX never breaks.
4. **Mock vs Real Health Data:** Note that `HealthData` endpoints currently provide device simulation data unless an external wearable integration is bound.
5. **Data Cascades:** Cascading deletes (`onDelete: Cascade`) are configured on all major Prisma user relations (`UserProfile`, `Session`, `MoodEntry`, etc.).
