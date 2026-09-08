"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Chip } from "./ui/controls";

const TAGS = ["calm", "wired", "tired", "sore", "clear", "anxious"];

export default function Journal() {
  const { journal, addJournalEntry } = useAppContext();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const toggle = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Journal</h2>
      <p className="text-slate-400 mb-8">Check in after practice. Mood and energy stay on this device.</p>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8 space-y-5">
        <label className="block text-sm text-slate-400">
          Mood {mood}/5
          <input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full mt-2 accent-indigo-500"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Energy {energy}/5
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full mt-2 accent-indigo-500"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you notice?"
          className="w-full h-28 bg-slate-800 rounded-2xl p-4 text-sm outline-none"
        />
        <button
          onClick={() => {
            if (!note.trim() && tags.length === 0) return;
            addJournalEntry({ mood, energy, note, tags });
            setNote("");
            setTags([]);
          }}
          className="w-full py-3 rounded-full bg-indigo-600 font-bold"
        >
          Save entry
        </button>
      </div>

      <div className="space-y-3 pb-16">
        {journal.map((j) => (
          <div key={j.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-500">
              {new Date(j.date).toLocaleString()} · mood {j.mood} · energy {j.energy}
            </p>
            <p className="mt-2 text-sm">{j.note}</p>
            <div className="flex gap-1 mt-2">
              {j.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase text-indigo-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
