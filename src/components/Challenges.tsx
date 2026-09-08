"use client";

import { useAppContext, useDerivedStats } from "@/lib/store";
import { weekKey } from "@/lib/utils";

const ROTATION = [
  { id: "minutes", title: "60 mindful minutes", detail: "Accumulate 60 minutes of guided practice this week.", goal: 60, unit: "min" },
  { id: "holds", title: "Eight still holds", detail: "Log 8 breath holds this week, any duration.", goal: 8, unit: "holds" },
  { id: "streak", title: "Five-day presence", detail: "Practice on 5 different days this week.", goal: 5, unit: "days" },
  { id: "library", title: "Three techniques", detail: "Complete 3 library or builder sessions.", goal: 3, unit: "sessions" },
];

export default function Challenges() {
  const ctx = useAppContext();
  const stats = useDerivedStats();
  const key = weekKey();
  const rotation = ROTATION[Number(key.replace(/\D/g, "")) % ROTATION.length];
  const claimedKey = `${key}-${rotation.id}`;
  const claimed = !!ctx.weeklyChallengeClaimed[claimedKey];

  const weekHolds = ctx.holdRecords.filter((h) => weekKey(new Date(h.date)) === key).length;
  const weekDays = new Set(
    [...ctx.practiceLog, ...ctx.rhythmicSessions]
      .filter((s) => weekKey(new Date(s.date)) === key)
      .map((s) => s.date.slice(0, 10))
  ).size;
  const weekLibrary = ctx.practiceLog.filter(
    (s) => weekKey(new Date(s.date)) === key && (s.kind === "library" || s.kind === "builder")
  ).length;
  const progress =
    rotation.id === "minutes"
      ? stats.weekSeconds / 60
      : rotation.id === "holds"
        ? weekHolds
        : rotation.id === "streak"
          ? weekDays
          : weekLibrary;
  const pct = Math.min(100, Math.round((progress / rotation.goal) * 100));
  const complete = progress >= rotation.goal;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Weekly challenge</h2>
      <p className="text-slate-400 mb-8">
        Week {key}. Challenges rotate automatically and live on this device with your records.
      </p>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-indigo-900/30 border border-amber-500/20 mb-8">
        <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-2">This week</p>
        <h3 className="text-2xl font-light mb-2">{rotation.title}</h3>
        <p className="text-sm text-slate-400 mb-6">{rotation.detail}</p>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-mono text-sm text-amber-100 mb-6">
          {Math.round(progress)} / {rotation.goal} {rotation.unit}
        </p>
        <button
          disabled={!complete || claimed}
          onClick={() => ctx.claimWeeklyChallenge(claimedKey)}
          className="px-6 py-3 rounded-full bg-amber-500 text-slate-950 font-bold disabled:opacity-40"
        >
          {claimed ? "Claimed" : complete ? "Claim trophy credit" : "Keep going"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 pb-16">
        {ROTATION.map((c) => (
          <div key={c.id} className={`p-5 rounded-2xl border ${c.id === rotation.id ? "border-amber-400/40 bg-slate-900" : "border-slate-800 bg-slate-950"}`}>
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-slate-500 mt-1">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
