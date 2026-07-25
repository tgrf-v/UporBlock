import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Globe, History, Plug, Settings, Video } from "lucide-react";
import Link from "next/link";

const SEGMENTS = 28;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: task } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user!.id)
    .order("task_date", { ascending: false })
    .limit(1)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const thresholdMinutes = profile?.distraction_threshold_minutes || 30;
  const thresholdSeconds = thresholdMinutes * 60;
  const distraction = task?.distraction_seconds || 0;
  const ratio = Math.min(1, distraction / thresholdSeconds);
  const filled = Math.min(SEGMENTS, Math.round(ratio * SEGMENTS));
  const mins = Math.floor(distraction / 60);
  const secs = distraction % 60;
  const blocked = task?.status === "blocked";
  const completed = task?.status === "completed";

  const statusMeta = completed
    ? { label: "SELESAI", dot: "dot-live", cls: "border-live/40 bg-live/10 text-live" }
    : blocked
      ? { label: "TERKUNCI", dot: "dot-live dot-alarm", cls: "border-alarm/40 bg-alarm/10 text-alarm pulse-alarm" }
      : task?.status === "warning"
        ? { label: "WARNING", dot: "dot-live dot-warn", cls: "border-warn/40 bg-warn/10 text-warn" }
        : { label: "INCOMPLETE", dot: "", cls: "border-border bg-muted/40 text-muted-foreground" };

  const segColor = (i: number) => {
    if (i >= filled) return "bg-border";
    if (ratio >= 1) return "bg-alarm shadow-[0_0_8px_var(--alarm)]";
    if (ratio >= 0.6) return "bg-warn";
    return "bg-live";
  };

  const actions = [
    { href: "/submit", label: "Kirim Video", icon: Video, primary: true },
    { href: "/connect-extension", label: "Ekstensi", icon: Plug },
    { href: "/sites", label: "Kelola Situs", icon: Globe },
    { href: "/history", label: "Riwayat", icon: History },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">{"// mission control"}</p>
          <h1 className="display-xl mt-2 text-4xl sm:text-5xl">
            STATUS <span className="text-signal">HARI INI</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-sm text-muted-foreground">
            {task?.task_date ?? "—"}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-data text-[11px] uppercase tracking-[0.18em] ${statusMeta.cls}`}
          >
            {statusMeta.dot && <span className={statusMeta.dot} />}
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="kicker">waktu distraksi</p>
              <span
                className={`rounded-md border px-2.5 py-1 font-data text-[11px] uppercase tracking-[0.15em] ${
                  task?.block_active
                    ? "border-alarm/40 bg-alarm/10 text-alarm"
                    : "border-border text-muted-foreground"
                }`}
              >
                block {task?.block_active ? "AKTIF" : "OFF"}
              </span>
            </div>

            {task ? (
              <>
                <div className="mt-4 flex items-baseline gap-3">
                  <p
                    className={`stat-number ${
                      ratio >= 1 ? "text-alarm" : ratio >= 0.6 ? "text-warn" : ""
                    }`}
                  >
                    {mins}m {String(secs).padStart(2, "0")}s
                  </p>
                  <span className="font-data text-sm text-muted-foreground">
                    / {thresholdMinutes}m
                  </span>
                </div>

                <div className="mt-6 flex h-7 gap-1">
                  {Array.from({ length: SEGMENTS }).map((_, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-[2px] transition-all duration-300 ${segColor(i)}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between font-data text-[11px] text-muted-foreground">
                  <span>0</span>
                  <span>{Math.round(thresholdMinutes / 2)}m</span>
                  <span className={ratio >= 1 ? "text-alarm" : ""}>
                    {thresholdMinutes}m ⚠
                  </span>
                </div>

                <div className="mt-8 space-y-3 border-t border-border pt-5">
                  {[
                    ["Threshold", `${thresholdMinutes} menit`],
                    ["Validitas upload", `${profile?.upload_validity_hours ?? 3} jam`],
                    ["Terkunci sejak", task.threshold_reached_at ? new Date(task.threshold_reached_at).toLocaleTimeString("id-ID") : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="font-data text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">
                  Belum ada data hari ini. Mulai browsing — agen akan mencatat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="kicker mb-4">aksi cepat</p>
            <div className="space-y-2.5">
              {actions.map(({ href, label, icon: Icon, primary }) => (
                <Link key={href} href={href} className="block">
                  <Button
                    variant={primary ? "default" : "outline"}
                    className={`group w-full justify-between ${
                      primary && blocked ? "pulse-alarm" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-4" />
                      {label}
                    </span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="kicker mb-4">protokol harian</p>
          <ol className="grid gap-4 sm:grid-cols-5">
            {[
              "Install ekstensi UporBlock",
              "Hubungkan dengan akunmu",
              "Atur situs yang diblokir",
              "Browse seperti biasa",
              "Terkunci? Upload video produktif",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                <span className="font-data text-xs font-bold text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
