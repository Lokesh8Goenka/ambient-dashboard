"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfTodayISO } from "@/lib/dates";

type Task = { id: string; title: string; done: boolean; completed_at: string | null };

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archived, setArchived] = useState<Task[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Active = still pending, OR completed today (so it stays visible today).
      const { data } = await supabase
        .from("tasks")
        .select("id, title, done, completed_at")
        .eq("user_id", user.id)
        .or(`done.eq.false,completed_at.gte.${startOfTodayISO()}`)
        .order("created_at");

      setTasks(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function addTask() {
    const title = newTask.trim();
    if (!title) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .insert({ title, user_id: user.id, done: false })
      .select("id, title, done, completed_at")
      .single();

    if (data) setTasks((prev) => [...prev, data]);
    setNewTask("");
    inputRef.current?.focus();
  }

  async function toggleTask(task: Task) {
    const nowDone = !task.done;
    const completed_at = nowDone ? new Date().toISOString() : null;
    const supabase = createClient();
    await supabase.from("tasks").update({ done: nowDone, completed_at }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: nowDone, completed_at } : t));
  }

  async function deleteTask(id: string) {
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleHistory() {
    const next = !showHistory;
    setShowHistory(next);
    if (next && !historyLoaded) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("tasks")
        .select("id, title, done, completed_at")
        .eq("user_id", user.id)
        .eq("done", true)
        .lt("completed_at", startOfTodayISO())
        .order("completed_at", { ascending: false });
      setArchived(data ?? []);
      setHistoryLoaded(true);
    }
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div>
      {tasks.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400">{done.length}/{tasks.length} done today</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 mb-4 max-h-64 overflow-y-auto overflow-x-hidden px-2 -mx-2">
          {[...pending, ...done].map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
              <button
                onClick={() => toggleTask(task)}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all ${
                  task.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-400"
                }`}
              >
                {task.done && (
                  <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${task.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"}`}>
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v11a1 1 0 001 1h6a1 1 0 001-1V7" />
                </svg>
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">No tasks yet. Add one below!</li>
          )}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task…"
          className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 outline-none focus:border-emerald-300 placeholder-gray-300 dark:placeholder-gray-600"
        />
        <button
          onClick={addTask}
          className="px-3 py-2 bg-emerald-500 text-white text-sm rounded-xl hover:bg-emerald-600 transition-colors"
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
            archived.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-xs text-gray-400 px-1 py-1">
                <span className="line-through truncate">{t.title}</span>
                <span className="flex-shrink-0 ml-2">
                  {t.completed_at ? new Date(t.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
