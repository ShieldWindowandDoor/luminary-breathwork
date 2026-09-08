"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { SettingSlider } from "./ui/controls";
import GuidedPattern from "./exercises/GuidedPattern";
import type { ExerciseDef } from "@/lib/catalog";
import { Trash2 } from "lucide-react";

const shell: ExerciseDef = {
  id: "custom",
  title: "Custom protocol",
  subtitle: "Builder",
  description: "Your timings.",
  cue: "Keep the throat open on holds. Reduce any count that feels snatched.",
  color: "from-indigo-500 to-purple-700",
  level: "Intermediate",
  goals: ["focus"],
  pattern: {
    inhale: 4,
    topHold: 4,
    exhale: 4,
    bottomHold: 4,
    defaultBreaths: 16,
    defaultMinutes: 5,
  },
};

export default function ProtocolBuilder() {
  const { customProtocols, addCustomProtocol, removeCustomProtocol } = useAppContext();
  const [name, setName] = useState("My protocol");
  const [inhale, setInhale] = useState(4);
  const [topHold, setTopHold] = useState(4);
  const [exhale, setExhale] = useState(6);
  const [bottomHold, setBottomHold] = useState(0);
  const [playing, setPlaying] = useState<string | "draft" | null>(null);

  if (playing) {
    const proto =
      playing === "draft"
        ? { name, inhale, topHold, exhale, bottomHold }
        : customProtocols.find((p) => p.id === playing);
    if (proto) {
      return (
        <GuidedPattern
          exercise={{ ...shell, title: proto.name, pattern: { ...shell.pattern!, ...proto, defaultBreaths: 20, defaultMinutes: 5 } }}
          protocolOverride={proto}
          onBack={() => setPlaying(null)}
        />
      );
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Protocol builder</h2>
      <p className="text-slate-400 mb-8">Compose a four-phase pattern, save it, and run it like any library exercise.</p>

      <div className="grid md:grid-cols-2 gap-6 pb-20">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          />
          <SettingSlider label="Inhale" value={inhale} min={1} max={20} step={0.5} onChange={setInhale} />
          <SettingSlider label="Top hold" value={topHold} min={0} max={20} step={0.5} onChange={setTopHold} />
          <SettingSlider label="Exhale" value={exhale} min={1} max={20} step={0.5} onChange={setExhale} />
          <SettingSlider label="Bottom hold" value={bottomHold} min={0} max={20} step={0.5} onChange={setBottomHold} />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() =>
                addCustomProtocol({ name, inhale, topHold, exhale, bottomHold })
              }
              className="flex-1 py-3 rounded-full bg-slate-800 font-bold"
            >
              Save
            </button>
            <button
              onClick={() => setPlaying("draft")}
              className="flex-1 py-3 rounded-full bg-indigo-600 font-bold"
            >
              Run now
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Saved</h3>
          {customProtocols.length === 0 && (
            <p className="text-slate-500 text-sm">No saved protocols yet.</p>
          )}
          {customProtocols.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {p.inhale}-{p.topHold}-{p.exhale}-{p.bottomHold}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlaying(p.id)}
                  className="px-4 py-2 rounded-full bg-indigo-600 text-sm font-bold"
                >
                  Run
                </button>
                <button
                  onClick={() => removeCustomProtocol(p.id)}
                  className="p-2 rounded-full bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
