"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useAppContext, useDerivedStats } from "@/lib/store";
import { buildInsights, shortDay } from "@/lib/insights";
import { formatClock, formatDuration } from "@/lib/utils";
import {
  Activity,
  Flame,
  Medal,
  Sparkles,
  Timer,
  TrendingUp,
  Wind,
} from "lucide-react";

export default function Progress() {
  const ctx = useAppContext();
  const derived = useDerivedStats();
  const insights = useMemo(
    () => buildInsights(ctx.exportStats(), { level: derived.level, xp: derived.xp }),
    [ctx, derived.level, derived.xp]
  );
  const [hover, setHover] = useState<number | null>(null);
  const [range, setRange] = useState<14 | 28 | 42>(42);

  const chart = insights.series.slice(-range);
  const maxMin = Math.max(8, ...chart.map((d) => d.minutes));
  const hoverPoint = hover != null ? chart[hover] : chart[chart.length - 1];
  const kindTotal = Object.values(insights.kindSeconds).reduce((a, b) => a + b, 0) || 1;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto p-3 sm:p-5"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="w-full max-w-6xl mx-auto space-y-5 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300 font-semibold">
              Insights
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mt-1">
              {`${insights.name}'s arc`}
            </h2>
            <p className="text-slate-400 mt-1">
              {insights.sessionCount} sessions · {formatDuration(insights.totalPracticeSeconds)} practiced ·
              personal bests from everything you log.
            </p>
          </div>
          <div className="flex gap-2">
            {([14, 28, 42] as const).map((n) => (
              <button
                key={n}
                onClick={() => {
                  setRange(n);
                  setHover(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  range === n
                    ? "bg-indigo-500 text-white border-indigo-400"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-indigo-500/25 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-5 md:p-7 shadow-[0_0_80px_-20px_rgba(99,102,241,0.55)]">
          <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[11px] uppercase tracking-widest font-bold">Practice trajectory</span>
              </div>
              <p className="text-5xl md:text-6xl font-light tracking-tighter mt-2">
                {hoverPoint ? Math.round(hoverPoint.minutes) : 0}
                <span className="text-lg text-slate-400 ml-2">min</span>
              </p>
              <p className="text-sm text-slate-400">
                {hoverPoint ? shortDay(hoverPoint.day) : "—"}
                {hoverPoint?.sessions ? ` · ${hoverPoint.sessions} session${hoverPoint.sessions === 1 ? "" : "s"}` : ""}
                {hoverPoint && hoverPoint.holdSeconds > 0
                  ? ` · ${formatClock(hoverPoint.holdSeconds)} holds`
                  : ""}
              </p>
            </div>
            <div className="flex gap-6">
              <StatChip
                label="This week"
                value={`${Math.round(insights.weekMinutes)}m`}
                delta={insights.weekDelta}
              />
              <StatChip label="Today vs goal" value={`${insights.goalPct}%`} />
              <StatChip label="Sessions" value={`${insights.sessionCount}`} />
            </div>
          </div>
          <div className="relative">
            <AreaChart
              points={chart}
              maxMin={maxMin}
              hover={hover}
              onHover={setHover}
            />
            {insights.sessionCount === 0 && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Finish a session and this curve fills in.
              </p>
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-4">
          <SparkCard
            title="Hold progression"
            icon={<Timer className="w-4 h-4 text-indigo-300" />}
            series={insights.holdSpark}
            format={(v) => formatClock(v)}
            empty="Log holds to draw this curve"
            color="#818cf8"
          />
          <SparkCard
            title="BOLT trend"
            icon={<Activity className="w-4 h-4 text-emerald-300" />}
            series={insights.boltSpark}
            format={(v) => `${v.toFixed(1)}s`}
            empty="Take a BOLT test in Tests"
            color="#34d399"
          />
          <SparkCard
            title="Breath rate"
            icon={<Wind className="w-4 h-4 text-violet-300" />}
            series={insights.rateSpark}
            format={(v) => `${Math.round(v)} bpm`}
            empty="Log a quiet breath-rate test"
            color="#c4b5fd"
            invert
          />
        </div>

        <section className="rounded-[2rem] bg-slate-900 border border-slate-800 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Consistency heat
              </h3>
            </div>
            <p className="text-xs text-slate-500">Last 16 weeks · darker = more minutes</p>
          </div>
          <Heatmap cells={insights.heat} />
        </section>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
          <section className="rounded-[2rem] bg-slate-900 border border-slate-800 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Medal className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Personal bests & records
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {insights.records.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 px-3.5 py-3 hover:border-indigo-500/40 transition-colors"
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold leading-tight">
                    {r.label}
                  </p>
                  <p className="text-xl font-light tracking-tight mt-1.5">{r.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{r.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-[2rem] bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Practice mix
              </h3>
              <MixBars kinds={insights.kindSeconds} total={kindTotal} />
            </section>
            <section className="rounded-[2rem] bg-slate-900 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  PB timeline
                </h3>
              </div>
              <PbList title="Hold PBs" rows={insights.holdPbs} format={formatClock} />
              <PbList title="BOLT PBs" rows={insights.boltPbs} format={(v) => `${v.toFixed(1)}s`} />
            </section>
            <section className="rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
                Last 7 days
              </h3>
              <div className="flex items-end gap-2 h-28">
                {insights.last7.map((d) => {
                  const peak = Math.max(...insights.last7.map((x) => x.minutes), 0);
                  const h = peak === 0 ? 8 : Math.max(10, (d.minutes / peak) * 100);
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={`w-full rounded-t-lg ${
                          d.minutes > 0
                            ? "bg-gradient-to-t from-indigo-700 to-indigo-300 shadow-[0_0_18px_rgba(129,140,248,0.35)]"
                            : "bg-slate-800"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {new Date(`${d.day}T12:00:00`).toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <p className="text-2xl font-light">{value}</p>
      {typeof delta === "number" && (
        <p className={`text-xs ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {delta >= 0 ? "+" : ""}
          {Math.round(delta)}m vs last week
        </p>
      )}
    </div>
  );
}

function AreaChart({
  points,
  maxMin,
  hover,
  onHover,
}: {
  points: { day: string; minutes: number }[];
  maxMin: number;
  hover: number | null;
  onHover: (i: number | null) => void;
}) {
  const gid = useId().replace(/:/g, "");
  const w = 920;
  const h = 220;
  const pad = 16;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const coords = points.map((p, i) => {
    const x = pad + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = pad + innerH - (p.minutes / maxMin) * innerH;
    return { x, y };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords.at(-1)?.x || pad},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-52 md:h-64"
      onMouseLeave={() => onHover(null)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * w;
        let nearest = 0;
        let dist = Infinity;
        coords.forEach((c, i) => {
          const d = Math.abs(c.x - x);
          if (d < dist) {
            dist = d;
            nearest = i;
          }
        });
        onHover(nearest);
      }}
    >
      <defs>
        <linearGradient id={`${gid}Fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
        <filter id={`${gid}Glow`}>
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={pad + innerH * g}
          y2={pad + innerH * g}
          stroke="rgba(148,163,184,0.18)"
          strokeDasharray="4 8"
        />
      ))}
      <path d={area} fill={`url(#${gid}Fill)`} />
      <path d={line} fill="none" stroke="#c7d2fe" strokeWidth="3" filter={`url(#${gid}Glow)`} />
      {coords.map((c, i) =>
        points[i].minutes > 0 ? (
          <circle key={i} cx={c.x} cy={c.y} r={hover === i ? 5.5 : 2.4} fill="#eef2ff" />
        ) : null
      )}
      {hover != null && coords[hover] && (
        <line
          x1={coords[hover].x}
          x2={coords[hover].x}
          y1={pad}
          y2={h - pad}
          stroke="rgba(199,210,254,0.45)"
        />
      )}
    </svg>
  );
}

function Heatmap({ cells }: { cells: { day: string; minutes: number }[] }) {
  const max = Math.max(1, ...cells.map((c) => c.minutes));
  const cols = Math.ceil(cells.length / 7);
  return (
    <div className="flex gap-2 overflow-x-auto">
      <div className="flex flex-col justify-between text-[9px] text-slate-500 py-[1px] shrink-0">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateRows: "repeat(7, 12px)",
          gridAutoFlow: "column",
          gridTemplateColumns: `repeat(${cols}, 12px)`,
        }}
      >
        {cells.map((c) => {
          const t = c.minutes / max;
          const bg =
            t === 0
              ? "rgba(30,41,59,0.9)"
              : `rgba(99,102,241,${0.18 + t * 0.82})`;
          return (
            <div
              key={c.day}
              title={`${shortDay(c.day)} · ${Math.round(c.minutes)} min`}
              className="w-3 h-3 rounded-[3px]"
              style={{ background: bg, boxShadow: t > 0.6 ? "0 0 8px rgba(129,140,248,0.45)" : undefined }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SparkCard({
  title,
  icon,
  series,
  format,
  empty,
  color,
  invert,
}: {
  title: string;
  icon: ReactNode;
  series: { t: string; v: number }[];
  format: (v: number) => string;
  empty: string;
  color: string;
  invert?: boolean;
}) {
  const latest = series.at(-1)?.v;
  const first = series[0]?.v;
  const delta = latest != null && first != null && series.length > 1 ? latest - first : null;
  const better = invert ? delta != null && delta < 0 : delta != null && delta > 0;
  return (
    <div className="rounded-[1.6rem] bg-slate-900 border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        {latest != null && <span className="font-mono text-lg">{format(latest)}</span>}
      </div>
      {series.length < 2 ? (
        <p className="text-sm text-slate-500 h-16 flex items-center">{empty}</p>
      ) : (
        <>
          <Sparkline values={series.map((s) => s.v)} color={color} invert={invert} />
          {delta != null && (
            <p className={`text-xs mt-2 ${better ? "text-emerald-400" : "text-slate-400"}`}>
              {delta > 0 ? "+" : ""}
              {invert ? `${delta.toFixed(0)} bpm vs first` : format(Math.abs(delta)) + (delta >= 0 ? " gained" : " off first")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Sparkline({ values, color, invert }: { values: number[]; color: string; invert?: boolean }) {
  const w = 280;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.001, max - min);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const n = (v - min) / span;
    const y = invert ? 8 + n * (h - 16) : h - 8 - n * (h - 16);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts.join(" ")} />
    </svg>
  );
}

function MixBars({
  kinds,
  total,
}: {
  kinds: Record<"rhythmic" | "hold" | "library" | "program" | "builder", number>;
  total: number;
}) {
  const rows: { key: keyof typeof kinds; label: string; color: string }[] = [
    { key: "rhythmic", label: "Rhythm", color: "bg-indigo-400" },
    { key: "library", label: "Library", color: "bg-violet-400" },
    { key: "hold", label: "Holds", color: "bg-sky-400" },
    { key: "program", label: "Programs", color: "bg-emerald-400" },
    { key: "builder", label: "Builder", color: "bg-amber-400" },
  ];
  if (rows.every((r) => kinds[r.key] === 0)) {
    return <p className="text-sm text-slate-500">Practice mix appears after your first logged session.</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = Math.round((kinds[r.key] / total) * 100);
        return (
          <div key={r.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{r.label}</span>
              <span className="font-mono text-slate-400">
                {formatDuration(kinds[r.key])} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-full ${r.color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PbList({
  title,
  rows,
  format,
}: {
  title: string;
  rows: { date: string; value: number }[];
  format: (v: number) => string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">{title}</p>
      {rows.length === 0 && <p className="text-sm text-slate-500">No personal bests yet.</p>}
      <div className="space-y-1.5">
        {rows.slice(-6).reverse().map((r) => (
          <div key={r.date + r.value} className="flex justify-between text-sm">
            <span className="text-slate-400">{shortDay(r.date)}</span>
            <span className="font-mono text-indigo-300">{format(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
