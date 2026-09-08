"use client";

import {
  Wind,
  Menu,
  X,
  Info,
  Home,
  Timer,
  Library as LibraryIcon,
  Activity,
  BarChart3,
  Trophy,
  Flag,
  BookOpen,
  NotebookPen,
  Settings,
  LayoutGrid,
  Sparkles,
  Medal,
} from "lucide-react";
import { useAppContext, type Tab } from "@/lib/store";
import RhythmicBreathing from "@/components/RhythmicBreathing";
import BreathHold from "@/components/BreathHold";
import Progress from "@/components/Progress";
import Library from "@/components/Library";
import Tests from "@/components/Tests";
import SafetyModal from "@/components/SafetyModal";
import Today from "@/components/Today";
import Records from "@/components/Records";
import Trophies from "@/components/Trophies";
import Challenges from "@/components/Challenges";
import Journal from "@/components/Journal";
import Programs from "@/components/Programs";
import Learn from "@/components/Learn";
import SettingsPanel from "@/components/SettingsPanel";
import ProtocolBuilder from "@/components/ProtocolBuilder";
import { useState } from "react";

const NAV: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "rhythmic", label: "Rhythm", icon: Wind },
  { id: "hold", label: "Holds", icon: Timer },
  { id: "builder", label: "Builder", icon: Sparkles },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "programs", label: "Programs", icon: LayoutGrid },
  { id: "tests", label: "Tests", icon: Activity },
  { id: "progress", label: "Insights", icon: BarChart3 },
  { id: "records", label: "Records", icon: Medal },
  { id: "trophies", label: "Trophies", icon: Trophy },
  { id: "challenges", label: "Challenges", icon: Flag },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function HomePage() {
  const {
    activeTab,
    setActiveTab,
    setSafetyModalOpen,
    trophyToast,
    dismissTrophyToast,
  } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const go = (tab: Tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <aside className="hidden md:flex w-56 flex-col border-r border-slate-800 bg-slate-900/60 p-4 gap-1 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 py-4 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Luminaries</h1>
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === item.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setSafetyModalOpen(true)}
          className="mt-auto flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-indigo-300"
        >
          <Info className="w-4 h-4" /> Safety
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <nav className="md:hidden flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Luminaries</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSafetyModalOpen(true)}
              className="p-2 bg-slate-800 rounded-lg border border-slate-700"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-slate-800 rounded-lg border border-slate-700"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-4 right-4 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl z-50 p-2 max-h-[70vh] overflow-y-auto">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${
                  activeTab === item.id
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-slate-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 max-w-5xl mx-auto w-full h-full p-2 md:p-6">
            {activeTab === "today" && <Today />}
            {activeTab === "rhythmic" && <RhythmicBreathing />}
            {activeTab === "hold" && <BreathHold />}
            {activeTab === "builder" && <ProtocolBuilder />}
            {activeTab === "library" && <Library />}
            {activeTab === "programs" && <Programs />}
            {activeTab === "tests" && <Tests />}
            {activeTab === "progress" && <Progress />}
            {activeTab === "records" && <Records />}
            {activeTab === "trophies" && <Trophies />}
            {activeTab === "challenges" && <Challenges />}
            {activeTab === "journal" && <Journal />}
            {activeTab === "learn" && <Learn />}
            {activeTab === "settings" && <SettingsPanel />}
          </div>
        </main>
      </div>

      {trophyToast && (
        <button
          onClick={dismissTrophyToast}
          className="fixed bottom-6 right-6 z-[80] px-5 py-3 rounded-2xl bg-amber-400 text-slate-950 font-bold shadow-xl"
        >
          Trophy: {trophyToast}
        </button>
      )}
      <SafetyModal />
    </div>
  );
}
