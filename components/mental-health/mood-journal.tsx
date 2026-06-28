"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { JournalEntryCard } from "./journal-entry-card";

interface MoodEntry {
  id: string;
  moodScore: number;
  description: string;
  moodNote: string;
  createdAt: string;
}

interface MoodJournalProps {
  onSave: (entry: MoodEntry) => Promise<void> | void;
  entries: MoodEntry[];
}

function getMoodCategory(value: number): string {
  if (value >= 75) return "excellent";
  if (value >= 50) return "good";
  if (value >= 25) return "fair";
  return "poor";
}

function getMoodIcon(category: string) {
  if (category === "excellent") return <Sun className="w-5 h-5 text-yellow-500" />;
  if (category === "good") return <Cloud className="w-5 h-5 text-blue-400" />;
  if (category === "fair") return <CloudRain className="w-5 h-5 text-blue-500" />;
  return <CloudLightning className="w-5 h-5 text-purple-600" />;
}

function RecentEntryItem({ entry }: { entry: MoodEntry }) {
  const category = getMoodCategory(entry.moodScore);
  const tags = entry.moodNote ? entry.moodNote.split(", ") : [];
  const dateStr = new Date(entry.createdAt).toLocaleDateString();

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div>
        <div className="flex items-center space-x-2">
          {getMoodIcon(category)}
          <span className="font-medium capitalize">{category}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {entry.description}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <span className="text-sm text-muted-foreground">{dateStr}</span>
    </div>
  );
}

export function MoodJournal({ onSave, entries }: MoodJournalProps) {
  const handleSave = async (data: {
    moodScore: number;
    description: string;
    tags: string[];
  }) => {
    await onSave({
      id: "",
      moodScore: data.moodScore,
      description: data.description,
      moodNote: data.tags.join(", "),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <JournalEntryCard onSave={handleSave} />

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.map((entry) => (
                <RecentEntryItem key={entry.id || entry.createdAt} entry={entry} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}