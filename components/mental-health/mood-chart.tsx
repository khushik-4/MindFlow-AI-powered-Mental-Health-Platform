"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodEntry {
  createdAt: string;
  score: number;
}

interface MoodChartProps {
  entries: MoodEntry[];
}

function getMoodColor(score: number): string {
  if (score >= 75) return "rgb(34, 197, 94)";
  if (score >= 50) return "rgb(59, 130, 246)";
  if (score >= 25) return "rgb(234, 179, 8)";
  return "rgb(239, 68, 68)";
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `Mood: ${context.raw}/100`,
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  maintainAspectRatio: false,
};

export function MoodChart({ entries = [] }: MoodChartProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const labels = sortedEntries.map((entry) =>
    format(new Date(entry.createdAt), "MMM d")
  );

  const dataPoints = sortedEntries.map((entry) => entry.score);
  const pointColors = sortedEntries.map((entry) => getMoodColor(entry.score));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Mood Score",
        data: dataPoints,
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        pointBackgroundColor: pointColors,
      },
    ],
  };

  return (
    <div className="h-[300px] w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
