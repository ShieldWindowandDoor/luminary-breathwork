"use client";

import { useState } from "react";
import { PROGRAMS, getProgram } from "@/lib/programs";
import { useAppContext } from "@/lib/store";
import { getExercise } from "@/lib/catalog";
import { ArrowLeft } from "lucide-react";

export default function Programs() {
  const ctx = useAppContext();
  const [active, setActive] = useState<string | null>(null);
  const program = active ? getProgram(active) : undefined;

  if (program) {
    const progress = ctx.programProgress[program.id]?.completedDays || [];
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setActive(null)} className="flex items-center gap-2 text-slate-400 mb-6">
          <ArrowLeft className="w-4 h-4" /> All programs
        </button>
        <h2 className="text-3xl font-light">{program.title}</h2>
        <p className="text-slate-400 mb-2">{program.subtitle}</p>
        <p className="text-sm text-indigo-300 mb-8">
          {progress.length} / {program.days} days
        </p>
        <div className="space-y-3 pb-20">
          {program.schedule.map((d) => {
            const ex = getExercise(d.exerciseId);
            const done = progress.includes(d.day);
            return (
              <div key={d.day} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Day {d.day}</p>
                    <h3 className="text-lg font-medium">{d.title}</h3>
                    <p className="text-sm text-indigo-400">{ex?.title} · {d.minutes} min</p>
                    <p className="text-sm text-slate-400 mt-2">{d.note}</p>
                  </div>
                  {done ? (
                    <span className="text-xs font-bold text-emerald-400">Done</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => ctx.openLibraryExercise(d.exerciseId)}
                        className="px-3 py-2 rounded-full bg-indigo-600 text-xs font-bold"
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => ctx.completeProgramDay(program.id, d.day)}
                        className="px-3 py-2 rounded-full bg-slate-800 text-xs font-bold"
                      >
                        Mark day
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Programs</h2>
      <p className="text-slate-400 mb-8">Multi-day paths with a prescribed technique each day.</p>
      <div className="grid md:grid-cols-2 gap-4 pb-16">
        {PROGRAMS.map((p) => {
          const done = ctx.programProgress[p.id]?.completedDays.length || 0;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className="text-left p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-10`} />
              <p className="relative text-[10px] uppercase tracking-widest text-slate-400">{p.focus} · {p.days} days</p>
              <h3 className="relative text-2xl font-light mt-2">{p.title}</h3>
              <p className="relative text-sm text-slate-400 mt-2">{p.subtitle}</p>
              <p className="relative text-xs text-indigo-300 mt-4">{done} / {p.days} complete</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
