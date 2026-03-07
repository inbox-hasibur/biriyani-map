"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { MapLayer } from "@/components/MapContext";

const VOTE_LABELS: Record<MapLayer, { up: string; down: string }> = {
  biriyani: { up: "Helpful", down: "Fake" },
  toilet: { up: "Accurate", down: "Inaccurate" },
  goods: { up: "Correct Price", down: "Wrong Price" },
  violence: { up: "Confirm", down: "Doubt" },
};

const TABLE_MAP: Record<MapLayer, string> = {
  biriyani: "spot_votes",
  toilet: "toilet_votes",
  goods: "goods_votes",
  violence: "violence_votes",
};

const ID_FIELD_MAP: Record<MapLayer, string> = {
  biriyani: "spot_id",
  toilet: "toilet_id",
  goods: "goods_id",
  violence: "report_id",
};

export default function VotingUI({
  spotId,
  initialScore = 0,
  layer = "biriyani",
}: {
  spotId: string;
  initialScore?: number;
  layer?: MapLayer;
}) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);
  const labels = VOTE_LABELS[layer];

  async function handleVote(value: 1 | -1) {
    setLoading(true);
    try {
      if (!supabase) {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to vote.");
        return;
      }

      const table = TABLE_MAP[layer];
      const idField = ID_FIELD_MAP[layer];

      if (userVote === value) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(idField, spotId)
          .eq("user_id", user.id);

        if (!error) {
          setScore((s) => s - value);
          setUserVote(null);
        } else {
          console.error("Remove vote error:", error.message);
        }
      } else {
        const { error } = await supabase
          .from(table)
          .upsert(
            { [idField]: spotId, user_id: user.id, value },
            { onConflict: `${idField},user_id` }
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
        <span className="text-xs">{labels.up}</span>
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
        <span className="text-xs">{labels.down}</span>
      </button>

      <div className="ml-auto text-sm font-bold text-slate-600">
        {score > 0 ? "+" : ""}{score}
      </div>
    </div>
  );
}
