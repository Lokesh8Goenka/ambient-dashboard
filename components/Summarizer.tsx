"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Summary = {
  id: string;
  title: string;
  source: string | null;
  summary: string;
};

function looksLikeUrl(s: string) {
  return /^https?:\/\/\S+$/i.test(s.trim());
}

export default function Summarizer() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("summaries")
        .select("id, title, source, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setSummaries(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function summarize() {
    const value = input.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);

    try {
      const payload = looksLikeUrl(value) ? { url: value } : { text: value };
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: saved } = await supabase
        .from("summaries")
        .insert({
          user_id: user.id,
          title: data.title,
          source: data.source,
          summary: data.summary,
        })
        .select("id, title, source, summary")
        .single();

      if (saved) {
        setSummaries((prev) => [saved, ...prev]);
        setExpandedId(saved.id);
      }
      setInput("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSummary(id: string) {
    const supabase = createClient();
    await supabase.from("summaries").delete().eq("id", id);
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) summarize();
          }}
          placeholder="Paste an article link, or paste text to summarize…"
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-sky-300 placeholder-gray-300 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">
            {looksLikeUrl(input) ? "Link detected" : "⌘/Ctrl + Enter to run"}
          </span>
          <button
            onClick={summarize}
            disabled={busy || !input.trim()}
            className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Summarizing…" : "Summarize"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No summaries yet. Drop a link above to get started.
        </p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto overflow-x-hidden">
          {summaries.map((s) => {
            const open = expandedId === s.id;
            return (
              <li key={s.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/60">
                  <button
                    onClick={() => setExpandedId(open ? null : s.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${open ? "" : "-rotate-90"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 truncate">{s.title}</span>
                  </button>
                  {s.source && (
                    <a
                      href={s.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-500 hover:text-sky-600 flex-shrink-0"
                    >
                      open ↗
                    </a>
                  )}
                  <button
                    onClick={() => deleteSummary(s.id)}
                    aria-label="Delete summary"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v11a1 1 0 001 1h6a1 1 0 001-1V7" />
                    </svg>
                  </button>
                </div>
                {open && (
                  <div className="px-3 py-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {s.summary}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
