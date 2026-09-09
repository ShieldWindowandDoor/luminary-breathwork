"use client";

import type { ComponentType } from "react";
import { useAppContext, useDerivedStats } from "@/lib/store";
import { EXERCISE_CATALOG } from "@/lib/catalog";
import { PROGRAMS } from "@/lib/programs";
import { TROPHIES } from "@/lib/trophies";
import { formatClock, formatDuration } from "@/lib/utils";
import { Flame, Trophy, Timer, Wind, Sparkles } from "lucide-react";

export default function Today() {
  const ctx = useAppContext();
  const stats = useDerivedStats();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const goal = ctx.settings.dailyGoalMinutes * 60;
  const goalPct = Math.min(100, Math.round((stats.todaySeconds / Math.max(1, goal)) * 100));
  const recentTrophies = TROPHIES.filter((t) => ctx.unlockedTrophies[t.id]).slice(-3);
  const nextProgram = PROGRAMS.find((p) => {
    const done = ctx.programProgress[p.id]?.completedDays.length || 0;
    return done > 0 && done < p.days;
  }) || PROGRAMS[0];
  const nextDay = (ctx.programProgress[nextProgram.id]?.completedDays.length || 0) + 1;
  const recommended =
    hour >= 20
      ? EXERCISE_CATALOG.find((e) => e.id === "pre_sleep_wave")
      : hour < 10
        ? EXERCISE_CATALOG.find((e) => e.id === "morning_charge")
        : EXERCISE_CATALOG.find((e) => e.id === "phys_sigh");

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <p className="text-indigo-400 text-sm font-medium">
        {greeting}, {ctx.settings.displayName || "Luminary"}
      </p>
      <h2 className="text-3xl font-light mt-1 mb-8">Today at Luminaries</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Flame} label="Streak" value={`${stats.streak}d`} accent="amber" />
        <StatCard icon={Sparkles} label="Level" value={`${stats.level}`} sub={`${stats.xp} XP`} accent="violet" />
        <StatCard icon={Wind} label="Today" value={formatDuration(stats.todaySeconds)} accent="indigo" />
        <StatCard icon={Timer} label="Best hold" value={formatClock(stats.bestHold)} accent="sky" />
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-6">
        <div className="flex justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Daily goal</h3>
          <span className="text-sm font-mono text-indigo-300">{goalPct}%</span>
        </div>
        <div className="h-2 bg-indigo-950/40 rounded-full overflow-hidden border border-indigo-400/20">
          <div className="h-full bg-indigo-500" style={{ width: `${goalPct}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {formatDuration(stats.todaySeconds)} of {ctx.settings.dailyGoalMinutes}m
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => recommended && ctx.openLibraryExercise(recommended.id)}
          className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600/30 to-purple-900/30 border border-indigo-500/20 text-left"
        >
          <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-2">Recommended</p>
          <h3 className="text-2xl font-light">{recommended?.title}</h3>
          <p className="text-sm text-slate-400 mt-2">{recommended?.description}</p>
        </button>
        <button
          onClick={() => ctx.setActiveTab("programs")}
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left"
        >
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Program</p>
          <h3 className="text-2xl font-light">{nextProgram.title}</h3>
          <p className="text-sm text-slate-400 mt-2">
            Day {Math.min(nextDay, nextProgram.days)} of {nextProgram.days} · {nextProgram.focus}
          </p>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { tab: "rhythmic" as const, label: "Rhythm" },
          { tab: "hold" as const, label: "Holds" },
          { tab: "library" as const, label: "Library" },
          { tab: "tests" as const, label: "Tests" },
        ].map((x) => (
          <button
            key={x.tab}
            onClick={() => ctx.setActiveTab(x.tab)}
            className="py-4 rounded-2xl bg-slate-900 border border-indigo-400/30 font-medium hover:bg-indigo-600 hover:text-white hover:border-indigo-400"
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent trophies</h3>
        </div>
        {recentTrophies.length === 0 ? (
          <p className="text-sm text-slate-500">Practice to start filling the hall.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentTrophies.map((t) => (
              <span key={t.id} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-200 text-sm">
                {t.title}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => ctx.setActiveTab("trophies")}
          className="mt-4 text-sm text-indigo-400 font-bold"
        >
          Open trophy hall →
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "indigo",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: "indigo" | "amber" | "violet" | "sky";
}) {
  const ring = {
    indigo: "border-indigo-400/50 shadow-[0_0_24px_rgba(99,102,241,0.22)]",
    amber: "border-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.2)]",
    violet: "border-violet-400/50 shadow-[0_0_24px_rgba(167,139,250,0.22)]",
    sky: "border-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.2)]",
  }[accent];
  const iconColor = {
    indigo: "text-indigo-400",
    amber: "text-amber-400",
    violet: "text-violet-400",
    sky: "text-sky-400",
  }[accent];
  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border ${ring}`}>
      <Icon className={`w-4 h-4 ${iconColor} mb-3`} />
      <p className="text-2xl font-light">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
        {label}
        {sub ? ` · ${sub}` : ""}
      </p>
    </div>
  );
}
