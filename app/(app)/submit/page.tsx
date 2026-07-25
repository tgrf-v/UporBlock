import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmitVideoForm } from "@/components/forms/submit-video-form";
import { AppShell } from "@/components/app-shell";
import { ArrowRight } from "lucide-react";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: submissions } = await supabase
    .from("video_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <p className="kicker">{"// setor karya"}</p>
        <h1 className="display-xl mt-2 text-4xl sm:text-5xl">
          KIRIM <span className="text-signal">VIDEO</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Satu video baru (upload &lt;3 jam) membuka semua situs yang terkunci
          hari ini.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3 font-data text-xs">
        {["Upload videomu", "Paste link di sini", "Blokir terbuka"].map(
          (step, i, arr) => (
            <span key={step} className="flex items-center gap-3">
              <span
                className={`rounded-md border px-3 py-2 ${
                  i === 1
                    ? "border-signal/50 bg-signal/10 text-signal"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {String(i + 1).padStart(2, "0")} · {step}
              </span>
              {i < arr.length - 1 && <ArrowRight className="size-4 text-muted-foreground" />}
            </span>
          )
        )}
      </div>

      <div className="max-w-2xl">
        <SubmitVideoForm submissions={submissions || []} />
      </div>
    </AppShell>
  );
}
