import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Clock from "@/components/Clock";
import Quote from "@/components/Quote";
import HabitTracker from "@/components/HabitTracker";
import TaskList from "@/components/TaskList";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "there")
    .split(" ")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-gray-400">Hi, {firstName} 👋</span>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <Clock />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <Quote />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <HabitTracker />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
