import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/forms/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  return (
    <>
      <div className="mb-8">
        <p className="kicker">{"// konfigurasi mesin"}</p>
        <h1 className="display-xl mt-2 text-4xl sm:text-5xl">PENGATURAN</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-data text-xs text-muted-foreground">
          <Clock className="size-4 text-signal" />
          Reset harian: {profile.daily_reset_time} ({profile.timezone})
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SettingsForm profile={profile} />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-md bg-signal/10">
                <Shield className="size-5 text-signal" />
              </span>
              Info Blocking
            </CardTitle>
            <CardDescription>Cara kerja mesinmu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              [
                "Block Mode",
                profile.block_mode === "block_after_threshold"
                  ? "Situs diblokir setelah threshold tercapai"
                  : "Hanya reminder, tidak memblokir",
              ],
              ["Threshold", `${profile.distraction_threshold_minutes} menit di situs distraksi`],
              ["Upload Validity", `${profile.upload_validity_hours} jam setelah upload`],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-border pt-3 first:border-0 first:pt-0">
                <p className="font-data text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-foreground">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
