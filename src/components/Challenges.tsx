"use client";

import { Timer, Wind, Library, Flame } from "lucide-react";
import { useAppContext, useDerivedStats } from "@/lib/store";
import { formatClock, weekKey } from "@/lib/utils";

const ROTATION = [
  { id: "minutes", title: "60 mindful minutes", detail: "Accumulate 60 minutes of guided practice this week.", goal: 60, unit: "min" },
  { id: "holds", title: "Eight still holds", detail: "Log 8 breath holds this week, any duration. Stop a set early — finished holds still count.", goal: 8, unit: "holds" },
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

  const weekHoldRecords = ctx.holdRecords.filter((h) => weekKey(new Date(h.date)) === key);
  const weekHolds = weekHoldRecords.length;
  const weekDays = new Set(
    [...ctx.practiceLog, ...ctx.rhythmicSessions, ...ctx.holdRecords]
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

  const startAction = () => {
    if (rotation.id === "holds") ctx.openHoldSession(8);
    else if (rotation.id === "minutes" || rotation.id === "streak") ctx.setActiveTab("rhythmic");
    else ctx.setActiveTab("library");
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Weekly challenge</h2>
      <p className="text-slate-400 mb-8">
        Week {key}. Do the work from this tab. Holds, minutes, and sessions save as you go — quitting
        a set does not erase what you already finished.
      </p>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-indigo-900/30 border border-amber-500/20 mb-8">
        <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-2">This week</p>
        <h3 className="text-2xl font-light mb-2">{rotation.title}</h3>
        <p className="text-sm text-slate-400 mb-6">{rotation.detail}</p>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3 border border-amber-400/20">
          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-mono text-sm text-amber-100 mb-6">
          {Math.round(progress)} / {rotation.goal} {rotation.unit}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={startAction}
            className="px-6 py-3 rounded-full bg-indigo-600 text-white font-bold"
          >
            {rotation.id === "holds"
              ? "Start holds"
              : rotation.id === "library"
                ? "Open library"
                : "Start rhythm"}
          </button>
          <button
            disabled={!complete || claimed}
            onClick={() => ctx.claimWeeklyChallenge(claimedKey)}
            className="px-6 py-3 rounded-full bg-amber-500 text-slate-950 font-bold disabled:opacity-40"
          >
            {claimed ? "Claimed" : complete ? "Claim trophy credit" : "Keep going"}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <QuickStart
          icon={Timer}
          title="Log holds"
          detail="Each release counts, even if you stop at 4 of 8."
          onClick={() => ctx.openHoldSession(rotation.id === "holds" ? 8 : 0)}
        />
        <QuickStart
          icon={Wind}
          title="Rhythm minutes"
          detail="Guided breathing counts toward weekly minutes."
          onClick={() => ctx.setActiveTab("rhythmic")}
        />
        <QuickStart
          icon={Library}
          title="Library session"
          detail="Techniques count for the three-techniques week."
          onClick={() => ctx.setActiveTab("library")}
        />
        <QuickStart
          icon={Flame}
          title="Holds this week"
          detail={`${weekHolds} saved`}
          onClick={() => ctx.openHoldSession(8)}
        />
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          This week’s holds
        </h3>
        {weekHoldRecords.length === 0 ? (
          <p className="text-sm text-slate-500">
            No holds logged this week yet. Start a hold here — stopping early still keeps them.
          </p>
        ) : (
          <div className="space-y-2">
            {weekHoldRecords.slice(0, 12).map((h, i) => (
              <div key={h.id} className="flex justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-400">
                  Hold {weekHoldRecords.length - i} ·{" "}
                  {new Date(h.date).toLocaleString(undefined, {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-mono text-indigo-300">{formatClock(h.durationSeconds)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 pb-16">
        {ROTATION.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl border ${
              c.id === rotation.id ? "border-amber-400/40 bg-slate-900" : "border-slate-800 bg-slate-950"
            }`}
          >
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-slate-500 mt-1">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickStart({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: typeof Timer;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-2xl bg-slate-900 border border-indigo-400/25 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
    >
      <Icon className="w-5 h-5 mb-2" />
      <p className="font-medium">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{detail}</p>
    </button>
  );
}
