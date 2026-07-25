import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConnectExtensionForm } from "@/components/forms/connect-extension-form";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ConnectExtensionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <p className="kicker">{"// hubungkan agen"}</p>
        <h1 className="display-xl mt-2 text-4xl sm:text-5xl">EKSTENSI</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Agen di browser yang memantau, mencatat, dan mengunci.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <ol className="h-fit space-y-0 rounded-xl border border-border bg-card p-6">
          {[
            ["01", "Buka chrome://extensions"],
            ["02", "Aktifkan Developer mode"],
            ["03", "Load unpacked → folder extension/"],
            ["04", "Paste kode pairing di popup ekstensi"],
          ].map(([no, step], i, arr) => (
            <li
              key={no}
              className={`flex gap-4 py-3 ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}
            >
              <span className="font-data text-sm font-bold text-signal">{no}</span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <ConnectExtensionForm />
      </div>
    </AppShell>
  );
}
