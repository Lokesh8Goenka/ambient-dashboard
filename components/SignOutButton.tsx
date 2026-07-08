"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={signOut}
      className="font-display text-xs font-medium tracking-wide text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
    >
      Sign out
    </button>
  );
}
