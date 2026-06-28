"use client";

import React from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmilePlus, Frown, Meh, Smile } from "lucide-react";
import { MoodChart } from "./mood-chart";

interface MoodEntry {
  id: string;
  score: number;
  description: string;
  tags?: string[];
  createdAt: string;
}

interface MoodHistoryProps {
  entries: MoodEntry[];
}

function getMoodIcon(score: number) {
  if (score >= 75) return <SmilePlus className="w-5 h-5 text-green-500" />;
  if (score >= 50) return <Smile className="w-5 h-5 text-blue-500" />;
  if (score >= 25) return <Meh className="w-5 h-5 text-yellow-500" />;
  return <Frown className="w-5 h-5 text-red-500" />;
}

function MoodItem({ entry }: { entry: MoodEntry }) {
  const formattedDate = format(new Date(entry.createdAt), "PPp");
  const tagsList = entry.tags || [];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getMoodIcon(entry.score)}
            <span className="font-medium">Score: {entry.score}/100</span>
          </div>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      <p className="mt-2 text-sm">{entry.description}</p>
      {tagsList.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tagsList.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

export function MoodHistory({ entries = [] }: MoodHistoryProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mood History</CardTitle>
        <CardDescription>Track your emotional journey over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="graph" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="space-y-4">
            <MoodChart entries={entries} />
          </TabsContent>

          <TabsContent value="list">
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="space-y-4">
                {sortedEntries.map((entry) => (
                  <MoodItem key={entry.id} entry={entry} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Meh className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No mood entries yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your mood to see your history here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}