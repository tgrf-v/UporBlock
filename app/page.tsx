import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LockoutDemo } from "@/components/lockout-demo";
import { Reveal } from "@/components/reveal";
import { ArrowRight, ArrowUpRight, Flame, Gauge, ShieldOff, Video } from "lucide-react";

const tickerItems = [
  "Blokir otomatis",
  "Upload untuk membuka",
  "Reset harian 04:00",
  "YouTube · TikTok · Instagram",
  "Tanpa ampun",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div aria-hidden className="top-stripe" />

      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-signal font-display text-base font-black text-ink">
              U
            </span>
            <span className="font-display text-base font-bold tracking-wide">
              UPORBLOCK
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/login">
              <Button>
                Aktifkan Gratis <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:pt-24">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker">{"// sistem kunci produktivitas"}</p>
              <h1 className="display-xl mt-5 text-5xl sm:text-6xl xl:text-7xl">
                DISTRASKSI
                <br />
                <span className="text-signal">DIKUNCI.</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                UporBlock memantau tab kamu. Lewat 30 menit di situs distraksi,
                semuanya terkunci — dan hanya video upload baru (&lt;3 jam) yang
                bisa membukanya lagi.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login">
                  <Button size="lg">
                    Aktifkan Sekarang <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <a href="#cara-kerja">
                  <Button variant="outline" size="lg">
                    Lihat Cara Kerja
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 grid max-w-xl grid-cols-2 divide-x divide-border rounded-lg border border-border bg-card/60 sm:grid-cols-4">
                {[
                  ["Threshold", "30:00"],
                  ["Validitas", "3 jam"],
                  ["Reset", "04:00"],
                  ["Platform", "YT·IG·TT"],
                ].map(([label, value]) => (
                  <div key={label} className="px-4 py-3">
                    <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 font-data text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={200}>
              <LockoutDemo />
            </Reveal>
          </div>
        </section>

        <div className="overflow-hidden border-y border-border bg-card/60 py-3">
          <div className="ticker">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center">
                {tickerItems.map((item) => (
                  <span
                    key={`${dup}-${item}`}
                    className="flex items-center gap-6 px-6 font-data text-xs uppercase tracking-[0.25em] text-muted-foreground"
                  >
                    {item} <span className="text-signal">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section id="cara-kerja" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="kicker">{"// protokol"}</p>
            <h2 className="display-xl mt-3 text-4xl sm:text-5xl">
              TIGA LANGKAH. <span className="text-stroke">TANPA NEGOSIASI.</span>
            </h2>
          </Reveal>

          <div className="mt-12 border-t border-border">
            {[
              {
                no: "01",
                title: "Pasang agennya",
                desc: "Install ekstensi UporBlock di Chrome atau Edge, lalu hubungkan ke akunmu dengan satu kode pairing.",
              },
              {
                no: "02",
                title: "Tandai musuhnya",
                desc: "Pilih situs distraksi dan batas waktunya. YouTube Shorts, TikTok, komik — kamu yang tentukan.",
              },
              {
                no: "03",
                title: "Setor karya",
                desc: "Lewat batas? Semuanya terkunci. Upload video produktif kurang dari 3 jam, dan akses terbuka kembali.",
              },
            ].map((step, i) => (
              <Reveal key={step.no} delay={i * 100}>
                <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-border py-8 transition-colors hover:bg-accent/30 sm:gap-10">
                  <span className="text-stroke font-display text-6xl font-black sm:text-7xl">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-muted-foreground">{step.desc}</p>
                  </div>
                  <ArrowUpRight className="size-6 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-signal" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
            <Reveal>
              <p className="kicker">{"// persenjataan"}</p>
              <h2 className="display-xl mt-3 text-4xl sm:text-5xl">
                MESIN YANG <span className="text-signal">TIDAK BISA DIBUJUK.</span>
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Reveal className="md:col-span-2">
                <div className="group relative h-full overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-alarm/50">
                  <div aria-hidden className="hazard absolute inset-x-0 top-0 h-2 opacity-60" />
                  <ShieldOff className="size-8 text-alarm" />
                  <h3 className="mt-5 font-display text-2xl font-bold">
                    Blokir yang tidak bisa ditawar
                  </h3>
                  <p className="mt-3 max-w-md text-muted-foreground">
                    Setelah threshold lewat, situs distraksi dialihkan paksa ke
                    layar pengunci. Tidak ada tombol close. Tidak ada &quot;5 menit
                    lagi&quot;.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 font-data text-xs">
                    <span className="rounded-md border border-alarm/40 bg-alarm/10 px-3 py-1.5 text-alarm line-through">
                      youtube.com/shorts
                    </span>
                    <span className="rounded-md border border-alarm/40 bg-alarm/10 px-3 py-1.5 text-alarm line-through">
                      tiktok.com
                    </span>
                    <span className="rounded-md border border-live/40 bg-live/10 px-3 py-1.5 text-live">
                      studio.youtube.com ✓
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="h-full rounded-xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-warn/50">
                  <Gauge className="size-8 text-warn" />
                  <h3 className="mt-5 font-display text-xl font-bold">
                    Meteran distraksi hidup
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Setiap detik di situs terlarang tercatat dan terlihat.
                  </p>
                  <div className="mt-6 flex h-5 gap-1">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className={`flex-1 rounded-[2px] ${
                          i < 5 ? "bg-live" : i < 10 ? "bg-warn" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-data text-xs text-muted-foreground">
                    18:42 / 30:00
                  </p>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="h-full rounded-xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-sky/50">
                  <Flame className="size-8 text-signal" />
                  <h3 className="mt-5 font-display text-xl font-bold">
                    Streak & reset harian
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Hari baru dimulai jam 4 pagi. Jaga rantai, jangan putus.
                  </p>
                  <p className="mt-6 font-data text-4xl font-extrabold text-signal">
                    27<span className="text-base text-muted-foreground"> hari</span>
                  </p>
                </div>
              </Reveal>

              <Reveal delay={200} className="md:col-span-2">
                <div className="h-full rounded-xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-live/50">
                  <Video className="size-8 text-live" />
                  <h3 className="mt-5 font-display text-2xl font-bold">
                    Upload adalah satu-satunya kunci
                  </h3>
                  <p className="mt-3 max-w-md text-muted-foreground">
                    Paste link video yang baru kamu upload. Sistem memverifikasi
                    umurnya kurang dari 3 jam — video lama tidak berlaku.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["YouTube", "TikTok", "Instagram"].map((p) => (
                      <span
                        key={p}
                        className="rounded-md border border-border bg-background px-3 py-1.5 font-data text-xs text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-signal">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
            <h2 className="display-xl text-4xl text-ink sm:text-5xl">
              SIAP SETOR
              <br />
              HARI INI?
            </h2>
            <Link href="/login" className="shrink-0">
              <Button
                size="lg"
                className="bg-primary px-8 py-6 text-base text-primary-foreground hover:bg-primary/90"
              >
                Aktifkan Gratis <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <p className="mx-auto w-full max-w-6xl px-6 text-center font-data text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          UporBlock — kontrol diri untuk produktivitas
        </p>
      </footer>
    </div>
  );
}
