import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 lg:flex">
        <div aria-hidden className="hazard-strong absolute inset-x-0 top-0 h-3" />

        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-signal font-display text-base font-black text-ink">
            U
          </span>
          <span className="font-display text-base font-bold tracking-wide">
            UPORBLOCK
          </span>
        </div>

        <div>
          <p className="kicker">{"// sistem kunci produktivitas"}</p>
          <h1 className="display-xl mt-4 text-6xl xl:text-7xl">
            DISTRASKSI
            <br />
            DIKUNCI.
            <br />
            <span className="text-signal">KARYA DIBUKA.</span>
          </h1>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card/60">
            {[
              ["Threshold", "30:00"],
              ["Validitas", "3 jam"],
              ["Reset", "04:00"],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-3">
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 font-data text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
          <p className="font-data text-xs text-muted-foreground">
            &quot;30 menit scroll = 1 video wajib.&quot; — peraturan rumah
          </p>
        </div>

        <div aria-hidden className="hazard-strong absolute inset-x-0 bottom-0 h-3" />
      </aside>

      <main className="flex items-center justify-center p-6">
        <LoginForm />
      </main>
    </div>
  );
}
