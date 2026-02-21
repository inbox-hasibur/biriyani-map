"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VotingUI({ spotId, initialScore = 0 }: { spotId: string; initialScore?: number }) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    setLoading(true);
    try {
      if (!supabase) {
        // Dev mock — optimistic update only
        if (userVote === value) {
          setScore((s) => s - value);
          setUserVote(null);
        } else {
          const delta = userVote ? value - userVote : value;
          setScore((s) => s + delta);
          setUserVote(value);
        }
        return;
      }

      // Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to vote.");
        return;
      }

      if (userVote === value) {
        // Remove existing vote
        const { error } = await supabase
          .from("spot_votes")
          .delete()
          .eq("spot_id", spotId)
          .eq("user_id", user.id);

        if (!error) {
          setScore((s) => s - value);
          setUserVote(null);
        } else {
          console.error("Remove vote error:", error.message);
        }
      } else {
        // Upsert — insert or update if already voted with different value
        const { error } = await supabase
          .from("spot_votes")
          .upsert(
            { spot_id: spotId, user_id: user.id, value },
            { onConflict: "spot_id,user_id" }
          );

        if (!error) {
          const delta = userVote ? value - userVote : value;
          setScore((s) => s + delta);
          setUserVote(value);
        } else {
          console.error("Upsert vote error:", error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${userVote === 1
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        aria-label="Upvote"
      >
        <ThumbsUp size={16} />
        <span className="text-xs">Helpful</span>
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${userVote === -1
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        aria-label="Downvote"
      >
        <ThumbsDown size={16} />
        <span className="text-xs">Fake</span>
      </button>

      <div className="ml-auto text-sm font-bold text-slate-600">
        {score > 0 ? "+" : ""}{score}
      </div>
    </div>
  );
}
