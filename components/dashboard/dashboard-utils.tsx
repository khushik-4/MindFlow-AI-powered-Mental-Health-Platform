import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, addDays, isWithinInterval } from "date-fns";
import { Brain, Heart, Trophy, Sparkles, Calendar, Sun, Moon } from "lucide-react";
import React from "react";

export type ActivityLevel = "none" | "low" | "medium" | "high";

export interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

export interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
}

export interface AIInsight {
  title: string;
  description: string;
  icon: any;
  priority: "low" | "medium" | "high";
}

export const ContributionGraph = ({ data }: { data: DayActivity[] }) => {
  const getLevelColor = (level: ActivityLevel) => {
    const colors = {
      high: "bg-primary hover:bg-primary/90",
      medium: "bg-primary/60 hover:bg-primary/70",
      low: "bg-primary/30 hover:bg-primary/40",
      none: "bg-muted hover:bg-muted/80",
    };
    return colors[level] || colors.none;
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {data.map((day, i) => (
          <div key={i} className="group relative">
            <div
              className={cn(
                "w-full aspect-square rounded-sm cursor-pointer transition-colors",
                getLevelColor(day.level)
              )}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                <p className="font-medium">{format(day.date, "MMM d, yyyy")}</p>
                <p>{day.activities.length} activities</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
          moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
            moodEntries.length
        )
      : null;

  const completedCount = todaysActivities.filter((a) => a.completed).length;
  const rate =
    todaysActivities.length > 0
      ? Math.round((completedCount / todaysActivities.length) * 100)
      : 0;

  const mindfulnessCount = todaysActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  ).length;

  return {
    moodScore: averageMood,
    completionRate: rate,
    mindfulnessCount,
    totalActivities: todaysActivities.length,
  };
};

function checkMoodInsights(recent: Activity[], insights: AIInsight[]) {
  const moodEntries = recent.filter((a) => a.type === "mood" && a.moodScore !== null);
  if (moodEntries.length < 2) return;

  const sum = moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0);
  const averageMood = sum / moodEntries.length;
  const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

  if (latestMood > averageMood) {
    insights.push({
      title: "Mood Improvement",
      description: "Your recent mood scores are above your weekly average. Keep up the good work!",
      icon: Brain,
      priority: "high",
    });
  } else if (latestMood < averageMood - 20) {
    insights.push({
      title: "Mood Change Detected",
      description: "I've noticed a dip in your mood. Would you like to try some mood-lifting activities?",
      icon: Heart,
      priority: "high",
    });
  }
}

function checkMindfulnessInsights(recent: Activity[], insights: AIInsight[]) {
  const practice = recent.filter((a) => ["game", "meditation", "breathing"].includes(a.type));
  if (practice.length === 0) return;

  const dailyAverage = practice.length / 7;
  insights.push({
    title: dailyAverage >= 1 ? "Consistent Practice" : "Mindfulness Opportunity",
    description: dailyAverage >= 1 
      ? "You've been regularly engaging in mindfulness activities. This can help reduce stress and improve focus."
      : "Try incorporating more mindfulness activities into your daily routine.",
    icon: dailyAverage >= 1 ? Trophy : Sparkles,
    priority: dailyAverage >= 1 ? "medium" : "low",
  });
}

function checkCompletionInsights(recent: Activity[], insights: AIInsight[]) {
  const completed = recent.filter((a) => a.completed);
  const rate = recent.length > 0 ? (completed.length / recent.length) * 100 : 0;

  if (rate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(rate)}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  } else if (rate < 50 && recent.length > 0) {
    insights.push({
      title: "Activity Reminder",
      description: "You might benefit from setting smaller, more achievable daily goals.",
      icon: Calendar,
      priority: "medium",
    });
  }
}

function checkTimePatternInsights(recent: Activity[], insights: AIInsight[]) {
  const morning = recent.filter((a) => new Date(a.timestamp).getHours() < 12).length;
  const evening = recent.filter((a) => new Date(a.timestamp).getHours() >= 18).length;

  if (morning > evening) {
    insights.push({
      title: "Morning Person",
      description: "You're most active in the mornings. Consider scheduling important tasks during your peak hours.",
      icon: Sun,
      priority: "medium",
    });
  } else if (evening > morning) {
    insights.push({
      title: "Evening Routine",
      description: "You tend to be more active in the evenings. Make sure to wind down before bedtime.",
      icon: Moon,
      priority: "medium",
    });
  }
}

export const generateAIInsights = (activities: Activity[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const lastWeek = subDays(new Date(), 7);
  const recent = activities.filter((a) => new Date(a.timestamp) >= lastWeek);

  checkMoodInsights(recent, insights);
  checkMindfulnessInsights(recent, insights);
  checkCompletionInsights(recent, insights);
  checkTimePatternInsights(recent, insights);

  return insights
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);
};

export const transformActivitiesToDayActivity = (activities: Activity[]): DayActivity[] => {
  const days: DayActivity[] = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const date = startOfDay(subDays(today, i));
    const dayActs = activities.filter((act) =>
      isWithinInterval(new Date(act.timestamp), {
        start: date,
        end: addDays(date, 1),
      })
    );

    let level: ActivityLevel = "none";
    if (dayActs.length > 0) {
      level = dayActs.length <= 2 ? "low" : dayActs.length <= 4 ? "medium" : "high";
    }

    days.push({
      date,
      level,
      activities: dayActs.map((act) => ({
        type: act.type,
        name: act.name,
        completed: act.completed,
        time: format(new Date(act.timestamp), "h:mm a"),
      })),
    });
  }
  return days;
};
