"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Task = { id: string; title: string; done: boolean };

export default function TaskList() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("tasks")
        .select("id, title, done")
        .eq("user_id", user.id)
        .order("created_at");

      setTasks(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function addTask() {
    const title = newTask.trim();
    if (!title) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .insert({ title, user_id: user.id, done: false })
      .select("id, title, done")
      .single();

    if (data) setTasks((prev) => [...prev, data]);
    setNewTask("");
    inputRef.current?.focus();
  }

  async function toggleTask(task: Task) {
    await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-gray-400">{done.length}/{tasks.length} done</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 mb-4 max-h-64 overflow-y-auto overflow-x-hidden px-2 -mx-2">
          {[...pending, ...done].map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => toggleTask(task)}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all ${
                  task.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300 hover:border-emerald-400"
                }`}
              >
                {task.done && (
                  <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${task.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
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
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-300 placeholder-gray-300"
        />
        <button
          onClick={addTask}
          className="px-3 py-2 bg-emerald-500 text-white text-sm rounded-xl hover:bg-emerald-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
