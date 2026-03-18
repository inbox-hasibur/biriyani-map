"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getTimeRemaining(targetDate: string): {
  total: number; hours: number; minutes: number; isPast: boolean; label: string;
} | null {
  try {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const total = target - now;
    const isPast = total < 0;
    const absDiff = Math.abs(total);

    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    let label: string;
    if (isPast) {
      if (hours > 24) label = `Started ${Math.floor(hours / 24)}d ago`;
      else if (hours > 0) label = `Started ${hours}h ${minutes}m ago`;
      else label = `Started ${minutes}m ago`;
    } else {
      if (hours > 24) label = `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
      else if (hours > 0) label = `In ${hours}h ${minutes}m`;
      else label = `In ${minutes}m`;
    }

    return { total, hours, minutes, isPast, label };
  } catch {
    return null;
  }
}

export default function TimeCountdown({ time }: { time?: string }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getTimeRemaining>>(null);

  useEffect(() => {
    if (!time) return;
    setRemaining(getTimeRemaining(time));
    const interval = setInterval(() => setRemaining(getTimeRemaining(time)), 30000);
    return () => clearInterval(interval);
  }, [time]);

  if (!time || !remaining) return null;

  const urgencyClass = remaining.isPast
    ? "bg-slate-100 text-slate-500 border-slate-200"
    : remaining.hours < 1
      ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
      : remaining.hours < 3
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-blue-50 text-blue-600 border-blue-200";

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border ${urgencyClass} transition-all`}>
      <Clock size={12} />
      <span>{remaining.label}</span>
    </div>
  );
}
