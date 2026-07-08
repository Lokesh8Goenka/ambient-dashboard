import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Clock from "@/components/Clock";
import Greeting from "@/components/Greeting";
import Quote from "@/components/Quote";
import HabitTracker from "@/components/HabitTracker";
import TaskList from "@/components/TaskList";
import GoalList from "@/components/GoalList";
import Summarizer from "@/components/Summarizer";
import CollapsibleSection from "@/components/CollapsibleSection";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "there")
    .split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7f1] via-[#eaf6fb] to-[#e3f2fd] dark:from-[#0b1120] dark:via-[#0d1424] dark:to-[#111a2e] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header: greeting (left) + clock, theme toggle & sign out (right corner) */}
        <header className="flex items-start justify-between mb-6">
          <Greeting name={firstName} />
          <div className="flex items-center gap-4">
            <Clock />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        {/* Quote — single full-width row */}
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-5 mb-4">
          <Quote />
        </div>

        {/* Sections — uniform two-column grid; new features flow into the next cell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <CollapsibleSection title="Personal Goals" storageKey="goals">
            <GoalList />
          </CollapsibleSection>
          <CollapsibleSection title="Today's Habits" storageKey="habits">
            <HabitTracker />
          </CollapsibleSection>
          <CollapsibleSection title="Tasks" storageKey="tasks">
            <TaskList />
          </CollapsibleSection>
          <div className="md:col-span-2">
            <CollapsibleSection title="AI Summariser" storageKey="summariser">
              <Summarizer />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
}
