import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/history/stats-card";
import { DailyTasksList } from "@/components/history/daily-tasks-list";
import { SubmissionsList } from "@/components/history/submissions-list";
import { AppShell } from "@/components/app-shell";
import { Flame } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("daily_tasks")
    .select("task_date, status, distraction_seconds, completed_at")
    .eq("user_id", user.id)
    .order("task_date", { ascending: false });

  const { data: submissions } = await supabase
    .from("video_submissions")
    .select("id, created_at, is_valid")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allTasks = tasks || [];
  const totalDays = allTasks.length;
  const completedDays = allTasks.filter((t) => t.status === "completed").length;
  const totalDistractionSeconds = allTasks.reduce(
    (sum, t) => sum + t.distraction_seconds,
    0
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskMap = new Map(allTasks.map((t) => [t.task_date, t.status]));

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    if (taskMap.get(dateStr) === "completed") currentStreak++;
    else break;
  }

  for (const dateStr of allTasks.map((t) => t.task_date).sort().reverse()) {
    if (taskMap.get(dateStr) === "completed") {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const stats = {
    total_days: totalDays,
    completed_days: completedDays,
    blocked_days: allTasks.filter((t) => t.status === "blocked").length,
    incomplete_days: allTasks.filter((t) => t.status === "incomplete").length,
    completion_rate:
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
    total_distraction_seconds: totalDistractionSeconds,
    avg_distraction_seconds:
      totalDays > 0 ? Math.round(totalDistractionSeconds / totalDays) : 0,
    current_streak: currentStreak,
    best_streak: bestStreak,
    total_submissions: (submissions || []).length,
    valid_submissions: (submissions || []).filter((s) => s.is_valid).length,
  };

  const highlights = [
    { label: "Streak saat ini", value: stats.current_streak, unit: "hari", hot: true },
    { label: "Streak terbaik", value: stats.best_streak, unit: "hari" },
    { label: "Tingkat selesai", value: stats.completion_rate, unit: "%" },
    { label: "Total distraksi", value: (stats.total_distraction_seconds / 3600).toFixed(1), unit: "jam" },
  ];

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <p className="kicker">{"// log operasi"}</p>
        <h1 className="display-xl mt-2 text-4xl sm:text-5xl">RIWAYAT</h1>
      </div>

      <div className="grid grid-cols-2 divide-border overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-4 lg:divide-x">
        {highlights.map((h) => (
          <div key={h.label} className="p-6">
            <p className="kicker flex items-center gap-2">
              {h.hot && <Flame className="size-3.5 text-signal" />}
              {h.label}
            </p>
            <p className="stat-number mt-3 text-5xl">
              {h.value}
              <span className="ml-1 text-lg text-muted-foreground">{h.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <p className="kicker mb-4">{"// statistik lengkap"}</p>
          <StatsCard stats={stats} />
        </section>
        <section>
          <p className="kicker mb-4">{"// tugas harian"}</p>
          <DailyTasksList />
        </section>
        <section>
          <p className="kicker mb-4">{"// submission video"}</p>
          <SubmissionsList />
        </section>
      </div>
    </AppShell>
  );
}
