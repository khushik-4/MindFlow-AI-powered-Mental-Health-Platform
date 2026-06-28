"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  LineChart,
  MessageCircle,
  Activity,
  Sun,
  Moon,
  Cloud,
  Timer,
  BookOpen,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Pill,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Settings,
  Wand2,
  Wifi,
  Thermometer,
  Music,
  Lamp,
  BrainCircuit,
  ArrowRight,
  X,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FixedChat } from "@/components/chat/fixed-chat";
import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import { ExpandableChat } from "@/components/chat/expandable-chat";
import { ActivityList } from "@/components/activities/activity-list";
import { ChatHistory } from "@/components/chat/chat-history";
import {
  getTodaysActivities,
  updateActivityStatus,
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/db/actions";
import { StartSessionModal } from "@/components/therapy/start-session-modal";
import { SessionHistory } from "@/components/therapy/session-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { useAuth } from "@/lib/contexts/auth-context";
import Modal from "@/components/Modal";
import { ActivityLogger } from "@/components/activities/activity-logger";

import { HealthMetrics } from "@/components/dashboard/health-metrics";

import {
  ActivityLevel,
  DayActivity,
  Activity as DbActivity,
  ContributionGraph,
  calculateDailyStats,
  generateAIInsights,
  transformActivitiesToDayActivity,
} from "@/components/dashboard/dashboard-utils";

interface GameActivity {
  name: string;
  type: "game";
  description: string;
}

const SearchParamsComponent = ({
  onParamsChange,
}: {
  onParamsChange: (params: URLSearchParams) => void;
}) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    onParamsChange(searchParams);
  }, [searchParams, onParamsChange]);

  return null;
};

export default function Dashboard() {
  const { isLoading, user, isAuthenticated, isCheckingSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [interventions, setInterventions] = useState([
    {
      type: "meditation",
      title: "Breathing Exercise",
      duration: "5 mins",
      completed: false,
    },
    {
      type: "activity",
      title: "Evening Walk",
      duration: "20 mins",
      completed: true,
    },
  ]);

  const emergencyContacts = [
    { name: "Crisis Hotline", number: "1-800-273-8255" },
    { name: "Therapist", number: "Dr. Smith - (555) 123-4567" },
  ];

  const medications = [
    {
      name: "Sertraline",
      dosage: "50mg",
      time: "9:00 AM",
      taken: true,
    },
    {
      name: "Vitamin D",
      dosage: "1000 IU",
      time: "9:00 AM",
      taken: false,
    },
  ];

  const [aiInsights, setAiInsights] = useState<
    {
      title: string;
      description: string;
      icon: any;
      priority: "low" | "medium" | "high";
    }[]
  >([]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there, how are you feeling today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      role: "user",
      content: "I'm feeling a bit anxious about my presentation tomorrow.",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      role: "assistant",
      content:
        "I understand presentations can be stressful. Would you like to try a quick breathing exercise together?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ]);

  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>([]);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);

  const [todayStats, setTodayStats] = useState({
    moodScore: null as number | null,
    completionRate: 0,
    mindfulnessCount: 0,
    totalActivities: 0,
  });

  const loadActivities = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userActivities = await getUserActivities(user.id);
      setActivities(userActivities);
      setActivityHistory(transformActivitiesToDayActivity(userActivities));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  const moodHistory = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 75 },
    { day: "Wed", value: 85 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 85 },
  ];

  const upcomingSessions = [
    {
      title: "Therapy Session",
      time: "2:00 PM",
      date: "Today",
      type: "Video Call",
    },
    {
      title: "Meditation",
      time: "9:00 AM",
      date: "Tomorrow",
      type: "Group Session",
    },
  ];

  useEffect(() => {
    if (activities.length > 0) {
      setTodayStats(calculateDailyStats(activities));
    }
  }, [activities]);

  const wellnessStats = [
    {
      title: "Mood Score",
      value: todayStats.moodScore ? `${todayStats.moodScore}%` : "No data",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Today's average mood",
    },
    {
      title: "Completion Rate",
      value: `${todayStats.completionRate}%`,
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Activities completed",
    },
    {
      title: "Mindfulness",
      value: `${todayStats.mindfulnessCount} sessions`,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      description: "Mindfulness activities",
    },
    {
      title: "Total Activities",
      value: todayStats.totalActivities.toString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Planned for today",
    },
  ];

  useEffect(() => {
    if (activities.length > 0) {
      setAiInsights(generateAIInsights(activities));
    }
  }, [activities]);

  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await saveMoodData({
        userId: user?.id as string,
        mood: data.moodScore,
        note: "",
      });
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowActivityLogger(true);
  };



  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user?.id, loadActivities]);

  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      if (!user?.id) return;

      try {
        await logActivity({
          userId: user.id,
          type: "game",
          name: gameName,
          description: description,
          completed: true,
          duration: null,
          moodScore: null,
          moodNote: null,
        });

        loadActivities();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [user?.id, loadActivities]
  );

  const handleSearchParams = useCallback((params: URLSearchParams) => { }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isCheckingSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <SearchParamsComponent onParamsChange={handleSearchParams} />
      </Suspense>
      <Container className="pt-20 pb-8 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name || "there"}
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <hr className="border-border/40" />

        {/* Crisis Alert */}
        {showCrisisAlert && (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Support Available</AlertTitle>
            <AlertDescription>
              We noticed you might be having a difficult time. Help is available
              24/7.
              <div className="mt-2">
                <Button variant="secondary" className="mr-2">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call Crisis Line
                </Button>
                <Button variant="outline">Message Therapist</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid Layout */}
        <div className="space-y-8">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Actions Card */}
            <Card className="border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quick Actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your wellness journey
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full justify-between items-center p-6 h-auto group/button",
                        "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90",
                        "transition-all duration-200 group-hover:translate-y-[-2px]"
                      )}
                      onClick={handleStartTherapy}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">
                            Start Therapy
                          </div>
                          <div className="text-xs text-white/80">
                            Begin a new session
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </Button>

                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={handleAICheckIn}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                          <BrainCircuit className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Check-in</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Quick wellness check
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview Card — compact */}
            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Today's Overview</CardTitle>
                <CardDescription className="text-xs">
                  Your wellness metrics for {format(new Date(), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {wellnessStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={cn(
                        "p-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                        <p className="text-xs font-medium">{stat.title}</p>
                      </div>
                      <p className="text-base font-semibold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription className="text-xs">
                  Personalized recommendations based on your activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.length > 0 ? (
                    aiInsights.map((insight, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg space-y-1 transition-all hover:scale-[1.02]",
                          insight.priority === "high"
                            ? "bg-primary/10"
                            : insight.priority === "medium"
                              ? "bg-primary/5"
                              : "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <insight.icon className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">{insight.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-3">
                      <Activity className="w-6 h-6 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Complete activities to unlock insights</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Spans 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <AnxietyGames onGamePlayed={handleGamePlayed} />
            </div>

            {/* Right Column - Activities */}
            <div>
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>Activity Overview</CardTitle>
                      <CardDescription>
                        Your wellness journey over time
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-sm bg-muted" />
                        <span>Less</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ContributionGraph data={activityHistory} />
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Recent Activities</h4>
                    <div className="space-y-2">
                      {activityHistory.slice(-3).flatMap((day) =>
                        day.activities.map((activity, i) => (
                          <div
                            key={`${format(day.date, "yyyy-MM-dd")}-${i}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  activity.completed
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                                )}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(day.date, "MMM d")}{" "}
                                  {activity.time && `at ${activity.time}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "text-xs",
                                activity.completed && "text-green-500"
                              )}
                            >
                              {activity.completed ? "Completed" : "Start"}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      <FixedChat />

      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Move the slider to track your current mood
            </DialogDescription>
          </DialogHeader>
          <MoodForm onSubmit={handleMoodSubmit} isLoading={isSavingMood} />
        </DialogContent>
      </Dialog>

      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4" />
            </div>
          </div>
        </div>
      )}

      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={loadActivities}
      />
    </div>
  );
}