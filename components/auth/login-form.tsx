"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage({ type: "success", text: "Registrasi berhasil. Silakan login." });
      }
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <p className="kicker">{"// akses"}</p>
        <CardTitle className="display-xl text-3xl">
          {mode === "login" ? "MASUK" : "BUAT AKUN"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Lanjutkan misi harianmu."
            : "Satu akun, satu mesin pengunci."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md py-2 font-data text-xs uppercase tracking-[0.15em] transition-colors ${
                mode === m
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-data text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-data text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Masuk" : "Daftar"}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 rounded-md border px-3 py-2 text-sm ${
              message.type === "error"
                ? "border-alarm/40 bg-alarm/10 text-alarm"
                : "border-live/40 bg-live/10 text-live"
            }`}
          >
            {message.text}
          </p>
        )}

        <p className="mt-6 font-data text-[11px] text-muted-foreground">
          Setelah masuk, hubungkan ekstensi di halaman berikutnya →
        </p>
      </CardContent>
    </Card>
  );
}
