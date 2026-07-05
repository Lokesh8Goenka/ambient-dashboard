"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return <div className="h-9 w-32" />;

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const date = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="text-right leading-none">
      <div className="text-2xl font-light tracking-tight text-gray-800 tabular-nums">
        {hours}
        <span className="text-indigo-400">:</span>
        {minutes}
      </div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{date}</div>
    </div>
  );
}
