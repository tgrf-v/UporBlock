"use client";

import { useEffect, useState } from "react";

const SEGMENTS = 26;
const LIMIT = 1800; // 30 menit

export function LockoutDemo() {
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let raf: number;
    let start = performance.now();
    let lockedUntil = 0;

    const tick = (now: number) => {
      if (lockedUntil) {
        if (now > lockedUntil) {
          lockedUntil = 0;
          start = now;
          setSeconds(0);
          setLocked(false);
        }
      } else {
        const p = Math.min(1, (now - start) / 7000);
        setSeconds(Math.floor(p * LIMIT));
        if (p >= 1) {
          lockedUntil = now + 2800;
          setLocked(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ratio = Math.min(1, seconds / LIMIT);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const filled = Math.round(ratio * SEGMENTS);

  const segColor = (i: number) => {
    if (i >= filled) return "bg-border";
    if (ratio >= 0.85) return "bg-alarm shadow-[0_0_8px_var(--alarm)]";
    if (ratio >= 0.55) return "bg-warn";
    return "bg-live";
  };

  return (
    <div className="relative rotate-1 transition-transform duration-500 hover:rotate-0">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-alarm/70" />
          <span className="size-2.5 rounded-full bg-warn/70" />
          <span className="size-2.5 rounded-full bg-live/70" />
          <div className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 font-data text-[11px] text-muted-foreground">
            {locked ? "⛔ akses ditangguhkan" : "youtube.com/shorts"}
          </div>
        </div>

        <div className="relative p-6">
          {!locked ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="kicker flex items-center gap-2">
                  <span className="dot-live" /> memantau tab aktif
                </span>
                <span className="font-data text-[11px] text-muted-foreground">
                  threshold 30:00
                </span>
              </div>

              <div>
                <p className="stat-number text-5xl">
                  {mins}m {String(secs).padStart(2, "0")}s
                </p>
                <p className="mt-1 font-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  waktu di situs distraksi
                </p>
              </div>

              <div className="flex h-6 gap-1">
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-[2px] transition-all duration-300 ${segColor(i)}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="hazard absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 p-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-alarm/50 bg-alarm/10 px-3 py-1 font-data text-[11px] uppercase tracking-[0.2em] text-alarm">
                <span className="dot-live dot-alarm" /> terkunci
              </span>
              <p className="font-display text-2xl font-black">
                WAKTUNYA <span className="text-signal">UPLOAD</span>
              </p>
              <p className="stamp text-sm">Setor video dulu</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -left-4 -bottom-5 rounded-lg border border-border bg-card px-3 py-2 font-data text-[11px] text-muted-foreground shadow-xl">
        +15s tercatat <span className="blink text-signal">▮</span>
      </div>
    </div>
  );
}
