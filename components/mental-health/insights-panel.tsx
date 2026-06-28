"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Moon, Activity, Waves } from "lucide-react";
import { motion } from "framer-motion";

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

interface InsightsPanelProps {
  insights: Insight[];
  recommendations: Recommendation[];
  sleepInsights: SleepInsight | null;
  isLoadingInsights: boolean;
  onGenerateInsights: () => Promise<void>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const isHigh = priority === "high";
  const isMedium = priority === "medium";
  const bgClass = isHigh
    ? "bg-red-100 text-red-800 border border-red-200"
    : isMedium
    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
    : "bg-green-100 text-green-800 border border-green-200";

  return (
    <span className={`text-xs px-2 py-1 rounded-full shadow-sm ${bgClass}`}>
      {priority}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const classes =
    category === "sleep"
      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
      : category === "activity"
      ? "bg-orange-100 text-orange-800 border border-orange-200"
      : category === "mood"
      ? "bg-pink-100 text-pink-800 border border-pink-200"
      : "bg-blue-100 text-blue-800 border border-blue-200";

  return (
    <span className={`text-xs px-2 py-1 rounded-full shadow-sm ${classes}`}>
      {category}
    </span>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-lg border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <h3 className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {insight.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
      <div className="flex gap-2 mt-2">
        <PriorityBadge priority={insight.priority} />
        <CategoryBadge category={insight.category} />
      </div>
    </div>
  );
}

function RecTypeBadge({ type }: { type: string }) {
  const classes =
    type === "meditation"
      ? "bg-purple-100 text-purple-800 border border-purple-200"
      : type === "exercise"
      ? "bg-orange-100 text-orange-800 border border-orange-200"
      : type === "social"
      ? "bg-blue-100 text-blue-800 border border-blue-200"
      : "bg-pink-100 text-pink-800 border border-pink-200";

  return (
    <span className={`text-xs px-2 py-1 rounded-full shadow-sm ${classes}`}>
      {type}
    </span>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-lg border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <h3 className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {rec.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
      <div className="flex gap-2 mt-2">
        <RecTypeBadge type={rec.type} />
        <span className="text-xs px-2 py-1 rounded-full shadow-sm bg-emerald-100 text-emerald-800 border border-emerald-200">
          {rec.duration}
        </span>
      </div>
    </div>
  );
}

function SleepQualityBlock({ quality }: { quality: string }) {
  const colorClass =
    quality === "good"
      ? "text-emerald-600"
      : quality === "fair"
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-lg border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <h3 className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Sleep Quality
      </h3>
      <p className={`text-2xl font-bold mt-1 capitalize ${colorClass}`}>{quality}</p>
    </div>
  );
}

function SleepInsightBlock({ insight }: { insight: any }) {
  return (
    <div className="p-4 bg-gradient-to-br from-muted/80 to-muted/40 rounded-lg border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <h3 className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {insight.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
      <p className="text-sm text-primary mt-2">{insight.recommendation}</p>
    </div>
  );
}

function GenerateButton({
  onClick,
  isLoading,
}: {
  onClick: () => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 bg-primary/90 hover:bg-primary transition-colors duration-300"
    >
      <Sparkles className="w-4 h-4" />
      {isLoading ? (
        <span className="flex items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <Waves className="w-4 h-4" />
          </motion.div>
          Generating...
        </span>
      ) : (
        "Generate Insights"
      )}
    </Button>
  );
}

export function InsightsPanel({
  insights,
  recommendations,
  sleepInsights,
  isLoadingInsights,
  onGenerateInsights,
}: InsightsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Insights
        </h2>
        <GenerateButton onClick={onGenerateInsights} isLoading={isLoadingInsights} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Health Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-primary" />
                </span>
                Health Insights
              </CardTitle>
              <CardDescription>AI-powered analysis of your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Generate insights to see analysis</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-5 h-5 text-primary" />
                </span>
                Mood Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions for mood improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <RecommendationCard key={index} rec={rec} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Generate insights to see analysis</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  <Moon className="w-5 h-5 text-primary" />
                </span>
                Sleep Analysis
              </CardTitle>
              <CardDescription>AI analysis of your sleep patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sleepInsights ? (
                <>
                  <SleepQualityBlock quality={sleepInsights.quality} />
                  {sleepInsights.insights.map((insight, index) => (
                    <SleepInsightBlock key={index} insight={insight} />
                  ))}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Generate insights to see analysis</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
