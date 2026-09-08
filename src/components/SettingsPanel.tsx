"use client";

import { useAppContext } from "@/lib/store";
import { SettingSlider } from "./ui/controls";

export default function SettingsPanel() {
  const { settings, updateSettings, setSafetyModalOpen } = useAppContext();

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Settings</h2>
      <p className="text-slate-400 mb-8">Stored locally on this device.</p>

      <div className="space-y-6 max-w-lg pb-16">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <label className="block text-sm text-slate-400">
            Display name
            <input
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
              className="mt-2 w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
            />
          </label>
          <SettingSlider
            label="Daily goal (minutes)"
            value={settings.dailyGoalMinutes}
            min={3}
            max={60}
            step={1}
            onChange={(v) => updateSettings({ dailyGoalMinutes: v })}
          />
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <Toggle
            label="Phase bells"
            on={settings.bells}
            onToggle={() => updateSettings({ bells: !settings.bells })}
          />
          <Toggle
            label="Background tone"
            on={settings.backgroundSound}
            onToggle={() => updateSettings({ backgroundSound: !settings.backgroundSound })}
          />
        </div>

        <button
          onClick={() => setSafetyModalOpen(true)}
          className="w-full py-4 rounded-full bg-slate-800 font-bold"
        >
          Safety & disclaimer
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative ${on ? "bg-indigo-600" : "bg-slate-700"}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full ${on ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}
