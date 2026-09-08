"use client";

import { useAppContext } from "@/lib/store";
import { RARITY_STYLES, TROPHIES } from "@/lib/trophies";
import { Trophy } from "lucide-react";

const CATS = ["practice", "holds", "tests", "streaks", "explorer", "mastery"] as const;

export default function Trophies() {
  const { unlockedTrophies } = useAppContext();
  const unlocked = TROPHIES.filter((t) => unlockedTrophies[t.id]).length;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light">Trophy hall</h2>
          <p className="text-slate-400 mt-2">
            {unlocked} / {TROPHIES.length} unlocked
          </p>
        </div>
        <Trophy className="w-8 h-8 text-amber-400" />
      </div>

      {CATS.map((cat) => (
        <section key={cat} className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TROPHIES.filter((t) => t.category === cat).map((t) => {
              const date = unlockedTrophies[t.id];
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border ${date ? "bg-slate-900 border-slate-700" : "bg-slate-950 border-slate-800 opacity-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${RARITY_STYLES[t.rarity]} flex items-center justify-center`}
                    >
                      <Trophy className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.description}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-1">
                        {t.rarity}
                        {date ? ` · ${new Date(date).toLocaleDateString()}` : " · locked"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
