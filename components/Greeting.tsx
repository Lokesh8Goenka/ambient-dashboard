"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else if (h < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  return (
    <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
      {greeting}, {name} <span className="inline-block">👋</span>
    </h1>
  );
}
