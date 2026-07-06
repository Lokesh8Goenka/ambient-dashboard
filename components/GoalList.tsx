"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Goal = { id: string; title: string; done: boolean };

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
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
        .select("id, title, done")
        .eq("user_id", user.id)
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
      .select("id, title, done")
      .single();

    if (data) setGoals((prev) => [...prev, data]);
    setNewGoal("");
    inputRef.current?.focus();
  }

  async function toggleGoal(goal: Goal) {
    const supabase = createClient();
    await supabase.from("goals").update({ done: !goal.done }).eq("id", goal.id);
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, done: !g.done } : g));
  }

  async function deleteGoal(id: string) {
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  const pending = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);

  return (
    <div>
      {goals.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400">{done.length}/{goals.length} achieved</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 mb-4 px-2 -mx-2">
          {[...pending, ...done].map((goal) => (
            <li key={goal.id} className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => toggleGoal(goal)}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all ${
                  goal.done
                    ? "bg-amber-500 border-amber-500"
                    : "border-gray-300 hover:border-amber-400"
                }`}
              >
                {goal.done && (
                  <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${goal.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
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
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-amber-300 placeholder-gray-300"
        />
        <button
          onClick={addGoal}
          className="px-3 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
