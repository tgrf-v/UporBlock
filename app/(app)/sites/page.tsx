import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BlockedSitesForm } from "@/components/forms/blocked-sites-form";
import { AllowlistsForm } from "@/components/forms/allowlists-form";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sites } = await supabase
    .from("blocked_sites")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true });

  const { data: allowlists } = await supabase
    .from("upload_allowlists")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true });

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <p className="kicker">{"// daftar hitam & putih"}</p>
        <h1 className="display-xl mt-2 text-4xl sm:text-5xl">KELOLA SITUS</h1>
        <div className="mt-4 flex flex-wrap gap-2 font-data text-[11px] uppercase tracking-[0.15em]">
          <span className="rounded-md border border-alarm/40 bg-alarm/10 px-3 py-1.5 text-alarm">
            ⛔ diblokir setelah threshold
          </span>
          <span className="rounded-md border border-live/40 bg-live/10 px-3 py-1.5 text-live">
            ✓ tetap terbuka untuk upload
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BlockedSitesForm sites={sites || []} />
        <AllowlistsForm allowlists={allowlists || []} />
      </div>
    </AppShell>
  );
}
