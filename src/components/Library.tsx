"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import AlternateNostril from "./exercises/AlternateNostril";
import BreathOfFire from "./exercises/BreathOfFire";
import BoxBreathing from "./exercises/BoxBreathing";
import Sleep478Breathing from "./exercises/Sleep478Breathing";
import ResonanceFrequencyBreathing from "./exercises/ResonanceFrequencyBreathing";
import TummoBreathing from "./exercises/TummoBreathing";
import Calming48Breathing from "./exercises/Calming48Breathing";
import FibonacciBreathing from "./exercises/FibonacciBreathing";
import GuidedPattern from "./exercises/GuidedPattern";
import { EXERCISE_CATALOG, GOALS, getExercise, type Goal, type Level } from "@/lib/catalog";
import { useAppContext } from "@/lib/store";
import { Chip } from "./ui/controls";

const DEDICATED: Record<string, ComponentType<{ onBack?: () => void }>> = {
  alternate_nostril: AlternateNostril,
  breath_of_fire: BreathOfFire,
  box_breathing: BoxBreathing,
  sleep_478: Sleep478Breathing,
  calming_48: Calming48Breathing,
  resonance: ResonanceFrequencyBreathing,
  wim_hof: TummoBreathing,
  fibonacci: FibonacciBreathing,
};

export default function Library() {
  const { libraryExerciseId, openLibraryExercise, favorites, toggleFavorite } =
    useAppContext();
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<Goal | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(libraryExerciseId);

  useEffect(() => {
    if (libraryExerciseId) setActiveId(libraryExerciseId);
  }, [libraryExerciseId]);

  const close = () => {
    setActiveId(null);
    openLibraryExercise(null);
  };

  const exercise = activeId ? getExercise(activeId) : undefined;
  if (activeId && exercise) {
    const Dedicated = DEDICATED[activeId];
    if (Dedicated) {
      return (
        <div className="w-full h-full relative">
          <Dedicated onBack={close} />
        </div>
      );
    }
    if (exercise.pattern) {
      return <GuidedPattern exercise={exercise} onBack={close} />;
    }
  }

  const filtered = useMemo(() => {
    return EXERCISE_CATALOG.filter((ex) => {
      if (onlyFav && !favorites.includes(ex.id)) return false;
      if (goal !== "all" && !ex.goals.includes(goal)) return false;
      if (level !== "all" && ex.level !== level) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          ex.title.toLowerCase().includes(q) ||
          ex.subtitle.toLowerCase().includes(q) ||
          ex.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, goal, level, onlyFav, favorites]);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto p-4 md:p-8"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="mb-6">
        <h2 className="text-3xl font-light tracking-tight">Exercise Library</h2>
        <p className="text-slate-400 mt-2">
          {EXERCISE_CATALOG.length} techniques · filter by goal, level, or favorites
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search techniques..."
        className="mb-4 w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
      />

      <div className="flex flex-wrap gap-2 mb-3">
        <Chip active={goal === "all"} onClick={() => setGoal("all")}>
          All goals
        </Chip>
        {GOALS.map((g) => (
          <Chip key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>
            {g.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={level === "all"} onClick={() => setLevel("all")}>
          All levels
        </Chip>
        {(["Beginner", "Intermediate", "Advanced"] as Level[]).map((l) => (
          <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
            {l}
          </Chip>
        ))}
        <Chip active={onlyFav} onClick={() => setOnlyFav(!onlyFav)}>
          Favorites
        </Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="text-left group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${ex.color} opacity-10 rounded-bl-full blur-2xl`}
            />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                  {ex.level}
                </span>
                <button
                  onClick={() => toggleFavorite(ex.id)}
                  className="p-2 rounded-full hover:bg-slate-800"
                >
                  <Star
                    className={`w-4 h-4 ${favorites.includes(ex.id) ? "fill-amber-400 text-amber-400" : "text-slate-500"}`}
                  />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{ex.title}</h3>
              <p className="text-sm font-medium text-indigo-400 mb-3">{ex.subtitle}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{ex.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {ex.goals.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setActiveId(ex.id)}
                className="flex items-center text-sm font-bold text-slate-300 group-hover:text-white"
              >
                START PRACTICE <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
