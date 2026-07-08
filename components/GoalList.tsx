"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfTodayISO } from "@/lib/dates";

type Goal = { id: string; title: string; done: boolean; completed_at: string | null };

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [archived, setArchived] = useState<Goal[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("goals")
        .select("id, title, done, completed_at")
        .eq("user_id", user.id)
        .or(`done.eq.false,completed_at.gte.${startOfTodayISO()}`)
        .order("created_at");

      setGoals(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function addGoal() {
    const title = newGoal.trim();
    if (!title) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("goals")
      .insert({ title, user_id: user.id, done: false })
      .select("id, title, done, completed_at")
      .single();

    if (data) setGoals((prev) => [...prev, data]);
    setNewGoal("");
    inputRef.current?.focus();
  }

  async function toggleGoal(goal: Goal) {
    const nowDone = !goal.done;
    const completed_at = nowDone ? new Date().toISOString() : null;
    const supabase = createClient();
    await supabase.from("goals").update({ done: nowDone, completed_at }).eq("id", goal.id);
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, done: nowDone, completed_at } : g));
  }

  async function deleteGoal(id: string) {
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function toggleHistory() {
    const next = !showHistory;
    setShowHistory(next);
    if (next && !historyLoaded) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("goals")
        .select("id, title, done, completed_at")
        .eq("user_id", user.id)
        .eq("done", true)
        .lt("completed_at", startOfTodayISO())
        .order("completed_at", { ascending: false });
      setArchived(data ?? []);
      setHistoryLoaded(true);
    }
  }

  const pending = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);

  return (
    <div>
      {goals.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400">{done.length}/{goals.length} achieved today</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 mb-4 px-2 -mx-2">
          {[...pending, ...done].map((goal) => (
            <li key={goal.id} className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
              <button
                onClick={() => toggleGoal(goal)}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all ${
                  goal.done
                    ? "bg-amber-500 border-amber-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-amber-400"
                }`}
              >
                {goal.done && (
                  <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${goal.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"}`}>
                {goal.title}
              </span>
              <button
                onClick={() => deleteGoal(goal.id)}
                aria-label="Delete goal"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v11a1 1 0 001 1h6a1 1 0 001-1V7" />
                </svg>
              </button>
            </li>
          ))}
          {goals.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">No goals yet. What are you working toward?</li>
          )}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Add a goal…"
          className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 outline-none focus:border-amber-300 placeholder-gray-300 dark:placeholder-gray-600"
        />
        <button
          onClick={addGoal}
          className="px-3 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600 transition-colors"
        >
          Add
        </button>
      </div>

      <button
        onClick={toggleHistory}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        {showHistory ? "Hide completed" : "Show completed ›"}
      </button>

      {showHistory && (
        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {archived.length === 0 ? (
            <li className="text-xs text-gray-300 py-2">Nothing archived yet.</li>
          ) : (
            archived.map((g) => (
              <li key={g.id} className="flex items-center justify-between text-xs text-gray-400 px-1 py-1">
                <span className="line-through truncate">{g.title}</span>
                <span className="flex-shrink-0 ml-2">
                  {g.completed_at ? new Date(g.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
