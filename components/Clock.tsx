"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return <div className="h-24" />;

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const dayName = time.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = time.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="text-7xl font-thin tracking-tight text-gray-900 tabular-nums leading-none">
        {hours}
        <span className="animate-pulse text-indigo-400">:</span>
        {minutes}
        <span className="text-4xl text-gray-400 ml-1">{seconds}</span>
      </div>
      <div className="mt-3 text-gray-500 text-base font-medium">
        {dayName}, {fullDate}
      </div>
    </div>
  );
}
