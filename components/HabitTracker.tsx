"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Habit = { id: string; name: string };

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function HabitTracker() {
  const supabase = createClient();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
        supabase.from("habits").select("id, name").eq("user_id", user.id).order("created_at"),
        supabase
          .from("habit_completions")
          .select("habit_id")
          .eq("user_id", user.id)
          .eq("completed_date", todayDate()),
      ]);

      setHabits(habitsData ?? []);
      setCompletedIds(new Set((completionsData ?? []).map((c) => c.habit_id)));
      setLoading(false);
    }
    load();
  }, []);

  async function toggleHabit(habitId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (completedIds.has(habitId)) {
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_date", todayDate());
      setCompletedIds((prev) => { const n = new Set(prev); n.delete(habitId); return n; });
    } else {
      await supabase
        .from("habit_completions")
        .insert({ habit_id: habitId, user_id: user.id, completed_date: todayDate() });
      setCompletedIds((prev) => new Set([...prev, habitId]));
    }
  }

  async function addHabit() {
    const name = newHabit.trim();
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("habits")
      .insert({ name, user_id: user.id })
      .select("id, name")
      .single();

    if (data) setHabits((prev) => [...prev, data]);
    setNewHabit("");
    inputRef.current?.focus();
  }

  async function deleteHabit(habitId: string) {
    await supabase.from("habits").delete().eq("id", habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setCompletedIds((prev) => { const n = new Set(prev); n.delete(habitId); return n; });
  }

  const doneCount = habits.filter((h) => completedIds.has(h.id)).length;

  return (
    <div>
      {habits.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400">{doneCount}/{habits.length} done today</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 mb-4">
          {habits.map((habit) => {
            const done = completedIds.has(habit.id);
            return (
              <li
                key={habit.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    done
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {done && (
                    <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {habit.name}
                </span>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  aria-label="Delete habit"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v11a1 1 0 001 1h6a1 1 0 001-1V7" />
                  </svg>
                </button>
              </li>
            );
          })}
          {habits.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">No habits yet. Add one below!</li>
          )}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a habit…"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-300 placeholder-gray-300"
        />
        <button
          onClick={addHabit}
          className="px-3 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
