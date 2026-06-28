"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoodJournal } from "@/components/mental-health/mood-journal";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, LineChart as ChartIcon, Heart } from "lucide-react";
import {
  generateHealthInsights,
  generateMoodRecommendations,
  analyzeSleepPattern,
} from "@/lib/services/ai-insights";
import { useAuth } from "@/lib/contexts/auth-context";
import { MoodHistory } from "@/components/mental-health/mood-history";
import { InsightsPanel } from "@/components/mental-health/insights-panel";
import { SupportPanel } from "@/components/mental-health/support-panel";
import { resolveApiUrl } from "@/lib/utils";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

interface MoodEntry {
  id: string;
  moodScore: number;
  description: string;
  moodNote: string;
  createdAt: string;
}

interface Location {
  country: string;
  city: string;
  state?: string;
}

interface Insight {
  title: string;
  description: string;
  priority: string;
  category: string;
}

interface Recommendation {
  title: string;
  description: string;
  type: string;
  duration: string;
}

interface SleepInsight {
  quality: string;
  insights: Array<{
    title: string;
    description: string;
    recommendation: string;
  }>;
  recommendations: {
    bedtime: string;
    wakeTime: string;
    improvements: string[];
  };
}

interface HealthData {
  heartRate: { average: number; max: number; min: number };
  sleep: { duration: number; efficiency: number; stages: { deep: number; light: number; rem: number } };
  steps: number;
  mood: number;
  activities: Array<{ type: string; timestamp: string; score: number; note: string }>;
}

function constructHealthData(entries: MoodEntry[]): HealthData {
  const latestEntries = entries.slice(0, 5);
  const averageMood =
    latestEntries.length > 0
      ? latestEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / latestEntries.length
      : 50;

  return {
    heartRate: { average: 75, max: 120, min: 60 },
    sleep: { duration: 7.5, efficiency: 85, stages: { deep: 20, light: 55, rem: 25 } },
    steps: 8000,
    mood: averageMood,
    activities: latestEntries.map((entry) => ({
      type: "mood_entry",
      timestamp: entry.createdAt,
      score: entry.moodScore,
      note: entry.moodNote || "",
    })),
  };
}

async function runHealthInsights(healthData: HealthData) {
  try {
    const res = await generateHealthInsights(healthData);
    return {
      success: res.length > 0,
      data: res,
      error: res.length === 0 ? "No health insights generated" : null,
    };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

async function runMoodRecommendations(healthData: HealthData) {
  try {
    const res = await generateMoodRecommendations(healthData.mood, healthData.activities);
    return {
      success: res.length > 0,
      data: res,
      error: res.length === 0 ? "No mood recommendations generated" : null,
    };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

async function runSleepAnalysis(healthData: HealthData) {
  try {
    const res = await analyzeSleepPattern([
      {
        date: new Date().toISOString(),
        duration: healthData.sleep.duration,
        efficiency: healthData.sleep.efficiency,
        stages: healthData.sleep.stages,
      },
    ]);
    return {
      success: !!res,
      data: res,
      error: !res ? "No sleep analysis generated" : null,
    };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

export default function MentalHealthPage() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sleepInsights, setSleepInsights] = useState<SleepInsight | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("journal");

  useEffect(() => {
    if (isAuthenticated) {
      fetchMoodEntries();
      getUserLocation();
    }
  }, [isAuthenticated]);

  const getUserLocation = async () => {
    setLoading(true);
    try {
      if (!MAPBOX_API_KEY) {
        throw new Error("Mapbox API key not configured");
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_API_KEY}`
      );
      const data = await res.json();
      const features = data.features[0];
      const findContext = (pfx: string) =>
        features.context.find((c: any) => c.id.startsWith(pfx))?.text;

      setLocation({
        country: findContext("country"),
        city: findContext("place"),
        state: findContext("region"),
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "Could not determine your location. Showing general resources.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodEntries = async () => {
    try {
      const response = await fetch(resolveApiUrl("/api/mental-health/mood"));
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMoodEntries(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load entries",
        variant: "destructive",
      });
    }
  };

  const handleSaveMood = async (entry: MoodEntry) => {
    try {
      const response = await fetch(resolveApiUrl("/api/mental-health/mood"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error("Failed to save");
      const savedEntry = await response.json();
      setMoodEntries((prev) => [savedEntry, ...prev]);
      toast({ title: "Success", description: "Entry saved" });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    }
  };

  const showAuthErrorToast = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to generate insights",
      variant: "destructive",
    });
  };

  const showNoDataToast = () => {
    toast({
      title: "No Mood Data",
      description: "Please add some mood entries first",
      variant: "destructive",
    });
  };

  const showGenerationToast = (errors: string[]) => {
    if (errors.length > 0) {
      toast({
        title: "Some insights failed to generate",
        description: (
          <div className="mt-2 space-y-2">
            {errors.map((msg, i) => (
              <p key={i} className="text-sm">• {msg}</p>
            ))}
          </div>
        ),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Generated insights based on your data",
      });
    }
  };

  const generateInsights = async () => {
    if (!isAuthenticated) return showAuthErrorToast();
    if (moodEntries.length === 0) return showNoDataToast();

    setIsLoadingInsights(true);
    const healthData = constructHealthData(moodEntries);
    const errors: string[] = [];

    const hResult = await runHealthInsights(healthData);
    if (hResult.success) setInsights(hResult.data);
    else errors.push(`Health: ${hResult.error}`);

    const mResult = await runMoodRecommendations(healthData);
    if (mResult.success) setRecommendations(mResult.data);
    else errors.push(`Mood: ${mResult.error}`);

    const sResult = await runSleepAnalysis(healthData);
    if (sResult.success) setSleepInsights(sResult.data);
    else errors.push(`Sleep: ${sResult.error}`);

    setIsLoadingInsights(false);
    showGenerationToast(errors);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Mental Health Tracking
        </h1>
        <p className="text-muted-foreground mt-2">
          Track, analyze, and improve your emotional well-being
        </p>
      </motion.div>

      <Tabs defaultValue="journal" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] relative overflow-hidden">
          <div
            className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300"
            style={{
              left: "0%",
              width: "25%",
              transform: `translateX(${["journal", "history", "insights", "support"].indexOf(activeTab) * 100
                }%)`,
            }}
          />
          <TabsTrigger
            value="journal"
            className="flex items-center gap-2 relative overflow-hidden group"
            onClick={() => setActiveTab("journal")}
          >
            <Brain className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="relative">Journal</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 relative overflow-hidden group"
            onClick={() => setActiveTab("history")}
          >
            <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="relative">History</span>
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="flex items-center gap-2 relative overflow-hidden group"
            onClick={() => setActiveTab("insights")}
          >
            <ChartIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="relative">Insights</span>
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="flex items-center gap-2 relative overflow-hidden group"
            onClick={() => setActiveTab("support")}
          >
            <Heart className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="relative">Support</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="journal" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardContent className="pt-6">
                  <MoodJournal onSave={handleSaveMood} entries={moodEntries} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardContent className="pt-6">
                  <MoodHistory
                    entries={moodEntries.map((entry) => ({
                      id: entry.id,
                      score: entry.moodScore,
                      description: entry.moodNote || entry.description,
                      createdAt: entry.createdAt,
                      tags: [],
                    }))}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel
              insights={insights}
              recommendations={recommendations}
              sleepInsights={sleepInsights}
              isLoadingInsights={isLoadingInsights}
              onGenerateInsights={generateInsights}
            />
          </TabsContent>

          <TabsContent value="support">
            <SupportPanel
              loading={loading}
              location={location}
              onGetLocation={getUserLocation}
            />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}