import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Clock from "@/components/Clock";
import Greeting from "@/components/Greeting";
import Quote from "@/components/Quote";
import HabitTracker from "@/components/HabitTracker";
import TaskList from "@/components/TaskList";
import GoalList from "@/components/GoalList";
import CollapsibleSection from "@/components/CollapsibleSection";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "there")
    .split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7f1] via-[#eaf6fb] to-[#e3f2fd] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header: greeting (left) + clock & sign out (right corner) */}
        <header className="flex items-start justify-between mb-6">
          <Greeting name={firstName} />
          <div className="flex items-center gap-5">
            <Clock />
            <SignOutButton />
          </div>
        </header>

        {/* Quote — single full-width row */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-100 px-6 py-5 mb-4">
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
        </div>
      </div>
    </div>
  );
}
