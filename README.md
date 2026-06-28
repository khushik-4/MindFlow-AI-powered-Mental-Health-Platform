# MindFlow

MindFlow is a private, AI-assisted space designed for mental wellness check-ins, mood tracking, and community support. Built to provide an accessible, low-friction environment for emotional reflection, it combines artificial intelligence with simple tracking tools to help users monitor their well-being, engage in grounding mindfulness exercises, and connect with peer support groups in a confidential environment.

## Why This Project

- Accessible and immediate support: Provides a low-barrier alternative to traditional mental health resources, available at any time.
- Safe and private exploration: Solves the issue of stigma around seeking mental health support by offering a private, authenticated space.
- Unified self-care tool: Combines active self-reflection (mood tracking and logging) with interactive therapy chats and grounding games.

## How It Works

-> Authentication flow: The user registers or signs in using secure JWT-based credentials. The token is stored locally in cookies and verified for each subsequent request.
-> AI therapy interaction: When a user initiates a therapy session, messages are sent to the Next.js API route. If a Groq API key is present, the app queries the Llama 3.1 8B model to generate an empathetic response; if the API key is not configured, it falls back to a curated local response array.
-> Activity tracking: Users log their mood and check-in details. These data points are stored in a PostgreSQL database using Prisma ORM.
-> Wellness insights: The dashboard reads user logs and calls the Groq API to generate personalized insights and recommendations.
-> Community and mindfulness: Users can search and filter posts in the support categories and engage with browser-based mindfulness soundscapes.

## Features

- Interactive Therapy Chat: Private chat rooms with an empathetic AI assistant.
- Dynamic Dashboard: Overview cards tracking wellness metrics, activity history, and AI-generated insights.
- Mood and Activity Logging: Forms to track mental well-being throughout the day.
- Community Forums: Discussion feed with dynamic search and category filtering.
- Mindfulness Games: Auditory tools featuring forest and ocean wave environments to aid relaxation.
- Profile Customization: Secure dashboard for editing account bios and passwords.

## Tech Stack

- Frontend: Next.js 14, React 18, Tailwind CSS, Framer Motion, Radix UI (Shadcn)
- Backend: Next.js 14 Route Handlers
- Database: PostgreSQL, Prisma ORM
- AI: Groq SDK (Llama 3.1 8B Instant)
- Authentication: JWT, bcryptjs, cookie-based sessions
- Deployment: Vercel / Custom Node hosting

## How To Use It

-> Step 1: Sign up for a new account or log in with existing credentials.
-> Step 2: Look at the Dashboard for an overview of your weekly progress.
-> Step 3: Go to the Therapy page to chat with the AI mental health companion.
-> Step 4: Click the Track Mood button to submit how you are feeling.
-> Step 5: Explore the Community tab to see and create discussion posts.

## Getting Started (Local Setup)

-> Step 1: Clone the repository and navigate into the root directory.
-> Step 2: Install dependencies by running:
   npm install
-> Step 3: Create a .env file in the root directory and define the following variables:
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-jwt-secret-key"
   GROQ_API_KEY="your-groq-api-key"
-> Step 4: Sync the database schema and generate the Prisma Client:
   npx prisma db push
   npx prisma generate
-> Step 5: Run the development server:
   npm run dev

## Benefits / Who This Is For

- Individuals looking for a confidential, structured space to record daily reflections and track mental health indicators.
- Users who need low-pressure, immediate grounding techniques like soundscapes or AI chat prompts.
- Developers seeking a complete template on integrating LLM APIs (Groq/Llama) with database-backed Next.js applications.

## Known Limitations

- Mock Health Metrics: The steps, sleep tracking, and heart-rate charts on the dashboard render mock data from mock API routes rather than live smartwatch device synchronization.
- General AI Guidance: The AI therapy companion is not a replacement for professional clinical care.

## Project Structure

- app/ -> Next.js page components, layout configurations, and API route handlers
- components/ -> Shared React UI widgets and dashboard graphs
- lib/ -> Database helpers, JWT helper utilities, and context providers
- prisma/ -> Database schema definition and seed configuration
