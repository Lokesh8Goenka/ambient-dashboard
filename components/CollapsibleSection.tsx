"use client";

import { useEffect, useState } from "react";

export default function CollapsibleSection({
  title,
  storageKey,
  children,
}: {
  title: string;
  storageKey: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`section:${storageKey}`);
    setCollapsed(saved === "1");
    setReady(true);
  }, [storageKey]);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(`section:${storageKey}`, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6">
      <button
        onClick={toggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between group"
      >
        <h2 className="font-display text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h2>
        <svg
          className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
            collapsed ? "-rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {ready && !collapsed && <div className="mt-4">{children}</div>}
    </div>
  );
}
