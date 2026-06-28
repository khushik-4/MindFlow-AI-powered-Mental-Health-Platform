"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface JournalEntryCardProps {
  onSave: (data: { moodScore: number; description: string; tags: string[] }) => Promise<void> | void;
}

const moodTags = ["Happy", "Sad", "Anxious", "Energetic", "Tired", "Stressed"];

function getMoodCategory(value: number): string {
  if (value >= 75) return "excellent";
  if (value >= 50) return "good";
  if (value >= 25) return "fair";
  return "poor";
}

function getMoodIcon(category: string) {
  if (category === "excellent") return <Sun className="w-8 h-8 text-yellow-500" />;
  if (category === "good") return <Cloud className="w-8 h-8 text-blue-400" />;
  if (category === "fair") return <CloudRain className="w-8 h-8 text-blue-500" />;
  return <CloudLightning className="w-8 h-8 text-purple-600" />;
}

export function JournalEntryCard({ onSave }: JournalEntryCardProps) {
  const [moodScore, setMoodScore] = useState(50);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const moodCategory = getMoodCategory(moodScore);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please write something about your mood",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await onSave({
        moodScore,
        description: description.trim(),
        tags: selectedTags,
      });
      setDescription("");
      setSelectedTags([]);
      setMoodScore(50);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {getMoodIcon(moodCategory)}
          <Slider
            value={[moodScore]}
            onValueChange={([value]) => setMoodScore(value)}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
        <Textarea
          placeholder="Write about your mood..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Add mood tags</label>
          <div className="flex flex-wrap gap-2">
            {moodTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Entry"}
        </Button>
      </CardContent>
    </Card>
  );
}
