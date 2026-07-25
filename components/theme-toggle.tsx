"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="grid size-9 place-items-center rounded-md border border-border" />
    );
  }

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
      className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-all hover:border-sky hover:text-sky"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
