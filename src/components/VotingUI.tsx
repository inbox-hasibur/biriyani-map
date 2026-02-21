"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function VotingUI({ spotId, initialScore = 0 }: { spotId: string; initialScore?: number }) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (userVote === value) {
      // Remove vote
      setLoading(true);
      try {
        // TODO: call supabase delete
        console.log("Remove vote for spot:", spotId);
        setUserVote(null);
        setScore((s) => s - value);
      } finally {
        setLoading(false);
      }
    } else {
      // Add/change vote
      setLoading(true);
      try {
        // TODO: call supabase upsert
        console.log("Vote on spot:", spotId, "value:", value);
        const delta = userVote ? (value - userVote) : value;
        setUserVote(value);
        setScore((s) => s + delta);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${
          userVote === 1
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        <ThumbsUp size={16} />
        <span className="text-xs">Helpful</span>
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${
          userVote === -1
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        <ThumbsDown size={16} />
        <span className="text-xs">Not Helpful</span>
      </button>

      <div className="ml-auto text-sm font-bold text-slate-600">{score > 0 ? "+" : ""}{score}</div>
    </div>
  );
}
