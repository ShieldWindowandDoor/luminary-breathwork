"use client";

import { useAppContext, useDerivedStats } from "@/lib/store";
import { bandFor, BOLT_BANDS, CO2_BANDS, HOLD_BANDS, WEEKLY_MIN_BANDS } from "@/lib/benchmarks";
import { formatClock, formatDuration } from "@/lib/utils";
import { Medal } from "lucide-react";

export default function Records() {
  const ctx = useAppContext();
  const stats = useDerivedStats();
  const best5 = ctx.holdSessions.filter((s) => s.targetHolds === 5).reduce((m, s) => Math.max(m, s.totalDurationSeconds), 0);
  const best10 = ctx.holdSessions.filter((s) => s.targetHolds === 10).reduce((m, s) => Math.max(m, s.totalDurationSeconds), 0);
  const longestSession = Math.max(
    0,
    ...ctx.rhythmicSessions.map((s) => s.durationSeconds),
    ...ctx.practiceLog.map((s) => s.durationSeconds)
  );
  const lowestRate = ctx.breathRateScores.reduce(
    (m, s) => (m === 0 ? s.bpm : Math.min(m, s.bpm)),
    0
  );

  const board = [
    { metric: "BOLT", you: stats.bestBolt, display: `${stats.bestBolt.toFixed(1)}s`, band: bandFor(stats.bestBolt, BOLT_BANDS) },
    { metric: "CO2 discard", you: stats.bestCo2, display: `${stats.bestCo2.toFixed(1)}s`, band: bandFor(stats.bestCo2, CO2_BANDS) },
    { metric: "Max hold", you: stats.bestHold, display: formatClock(stats.bestHold), band: bandFor(stats.bestHold, HOLD_BANDS) },
    { metric: "Week minutes", you: stats.weekSeconds / 60, display: formatDuration(stats.weekSeconds), band: bandFor(stats.weekSeconds / 60, WEEKLY_MIN_BANDS) },
  ].sort((a, b) => b.band.rank - a.band.rank);

  const holdRanks = [...ctx.holdRecords].sort((a, b) => b.durationSeconds - a.durationSeconds).slice(0, 8);
  const boltRanks = [...ctx.boltScores].sort((a, b) => b.durationSeconds - a.durationSeconds).slice(0, 8);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-1">Records & leaderboard</h2>
      <p className="text-slate-400 mb-8">
        Personal hall of fame for {ctx.settings.displayName}. Ranks are compared to published training bands, not other accounts.
      </p>

      <div className="p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-300" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300">Ranked board</h3>
        </div>
        <div className="space-y-3">
          {board.map((row, i) => (
            <div key={row.metric} className="flex items-center justify-between bg-slate-950/40 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-amber-300 w-6">{i + 1}</span>
                <div>
                  <p className="font-medium">{row.metric}</p>
                  <p className="text-xs text-slate-500">{row.band.label} band</p>
                </div>
              </div>
              <span className="font-mono text-lg">{row.display}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <PR label="Longest session" value={formatDuration(longestSession)} />
        <PR label="Best 5-hold block" value={formatClock(best5)} />
        <PR label="Best 10-hold block" value={formatClock(best10)} />
        <PR label="Quietest breath rate" value={lowestRate ? `${lowestRate} bpm` : "—"} />
        <PR label="Lifetime practice" value={formatDuration(stats.totalPracticeSeconds)} />
        <PR label="Level / XP" value={`Lv ${stats.level} · ${stats.xp}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-20">
        <RankList title="Hold leaderboard" rows={holdRanks.map((h) => ({ id: h.id, label: new Date(h.date).toLocaleDateString(), value: formatClock(h.durationSeconds) }))} />
        <RankList title="BOLT leaderboard" rows={boltRanks.map((h) => ({ id: h.id, label: new Date(h.date).toLocaleDateString(), value: `${h.durationSeconds.toFixed(1)}s` }))} />
      </div>
    </div>
  );
}

function PR({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <p className="text-2xl font-light mt-2">{value}</p>
    </div>
  );
}

function RankList({ title, rows }: { title: string; rows: { id: string; label: string; value: string }[] }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{title}</h3>
      {rows.length === 0 && <p className="text-sm text-slate-500">No marks yet.</p>}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.id} className="flex justify-between text-sm bg-slate-800/40 rounded-xl px-3 py-2">
            <span className="text-slate-400">
              {i + 1}. {r.label}
            </span>
            <span className="font-mono text-indigo-300">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
