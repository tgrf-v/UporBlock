import { AppNav } from "@/components/app-nav";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div aria-hidden className="top-stripe" />
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-border/60 py-6">
        <p className="mx-auto w-full max-w-6xl px-6 font-data text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          UporBlock — kunci distraksi, setor karya
        </p>
      </footer>
    </div>
  );
}
