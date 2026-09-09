"use client";

import { Moon, Sun } from "lucide-react";
import { useAppContext } from "@/lib/store";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { settings, updateSettings } = useAppContext();
  const night = settings.theme !== "day";

  return (
    <button
      onClick={() => updateSettings({ theme: night ? "day" : "night" })}
      className={
        compact
          ? "p-2 rounded-lg border border-slate-700 bg-slate-800"
          : "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium border border-slate-700 bg-slate-800/60"
      }
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
    >
      <span className={compact ? "sr-only" : undefined}>
        {night ? "Night mode" : "Day mode"}
      </span>
      {night ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
