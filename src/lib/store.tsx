"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { EXERCISE_CATALOG } from "./catalog";
import { PROGRAMS } from "./programs";
import { TROPHIES } from "./trophies";
import { computeStreak, dayKey, weekKey } from "./utils";

export type Tab =
  | "today"
  | "rhythmic"
  | "hold"
  | "builder"
  | "library"
  | "programs"
  | "tests"
  | "progress"
  | "records"
  | "trophies"
  | "challenges"
  | "journal"
  | "learn"
  | "settings";

export interface RhythmicSessionRecord {
  id: string;
  date: string;
  durationSeconds: number;
}

export interface HoldRecord {
  id: string;
  date: string;
  durationSeconds: number;
}

export interface HoldSessionRecord {
  id: string;
  date: string;
  targetHolds: number;
  totalDurationSeconds: number;
}

export interface TestRecord {
  id: string;
  date: string;
  durationSeconds: number;
}

export interface BreathRateRecord {
  id: string;
  date: string;
  bpm: number;
}

export interface PracticeLogEntry {
  id: string;
  date: string;
  durationSeconds: number;
  kind: "rhythmic" | "hold" | "library" | "program" | "builder";
  exerciseId?: string;
  title: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  note: string;
  tags: string[];
}

export interface CustomProtocol {
  id: string;
  name: string;
  inhale: number;
  topHold: number;
  exhale: number;
  bottomHold: number;
}

export interface AppSettings {
  displayName: string;
  dailyGoalMinutes: number;
  bells: boolean;
  backgroundSound: boolean;
  theme: "night" | "day";
}

export interface ProgramProgress {
  completedDays: number[];
  startedAt: string;
}

export interface StatsPayload {
  rhythmicSessions: RhythmicSessionRecord[];
  holdRecords: HoldRecord[];
  holdSessions: HoldSessionRecord[];
  boltScores: TestRecord[];
  co2Scores: TestRecord[];
  breathRateScores: BreathRateRecord[];
  practiceLog: PracticeLogEntry[];
  journal: JournalEntry[];
  favorites: string[];
  customProtocols: CustomProtocol[];
  programProgress: Record<string, ProgramProgress>;
  settings: AppSettings;
  unlockedTrophies: Record<string, string>;
  weeklyChallengeClaimed: Record<string, boolean>;
}

interface AppContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  libraryExerciseId: string | null;
  openLibraryExercise: (id: string | null) => void;
  rhythmicSessions: RhythmicSessionRecord[];
  addRhythmicSession: (session: RhythmicSessionRecord) => void;
  holdRecords: HoldRecord[];
  addHoldRecord: (record: HoldRecord) => void;
  holdSessions: HoldSessionRecord[];
  addHoldSession: (session: HoldSessionRecord) => void;
  boltScores: TestRecord[];
  addBoltScore: (score: TestRecord) => void;
  co2Scores: TestRecord[];
  addCo2Score: (score: TestRecord) => void;
  breathRateScores: BreathRateRecord[];
  addBreathRateScore: (score: BreathRateRecord) => void;
  practiceLog: PracticeLogEntry[];
  addPracticeLog: (entry: Omit<PracticeLogEntry, "id" | "date"> & { date?: string }) => void;
  journal: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "date">) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  customProtocols: CustomProtocol[];
  addCustomProtocol: (protocol: Omit<CustomProtocol, "id">) => void;
  removeCustomProtocol: (id: string) => void;
  programProgress: Record<string, ProgramProgress>;
  completeProgramDay: (programId: string, day: number) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  unlockedTrophies: Record<string, string>;
  trophyToast: string | null;
  dismissTrophyToast: () => void;
  weeklyChallengeClaimed: Record<string, boolean>;
  claimWeeklyChallenge: (key: string) => void;
  isSafetyModalOpen: boolean;
  setSafetyModalOpen: (isOpen: boolean) => void;
  exportStats: () => StatsPayload;
  importStats: (payload: StatsPayload) => void;
}

function storageOptions<T>(fallback: T) {
  return {
    initializeWithValue: false as const,
    deserializer: (value: string): T => {
      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    },
  };
}
const defaultSettings: AppSettings = {
  displayName: "Luminary",
  dailyGoalMinutes: 10,
  bells: true,
  backgroundSound: true,
  theme: "night",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function collectDates(
  rhythmic: RhythmicSessionRecord[],
  holds: HoldRecord[],
  log: PracticeLogEntry[],
  tests: { date: string }[]
) {
  return [...rhythmic, ...holds, ...log, ...tests].map((x) => x.date);
}

function evaluateTrophies(input: {
  rhythmic: RhythmicSessionRecord[];
  holds: HoldRecord[];
  log: PracticeLogEntry[];
  bolt: TestRecord[];
  co2: TestRecord[];
  rate: BreathRateRecord[];
  journal: JournalEntry[];
  favorites: string[];
  protocols: CustomProtocol[];
  programs: Record<string, ProgramProgress>;
  claimed: Record<string, boolean>;
}) {
  const sessionCount =
    input.rhythmic.length +
    input.log.filter((l) => l.kind !== "hold" && l.kind !== "rhythmic").length;
  const minutes = input.log.reduce((a, s) => a + s.durationSeconds, 0) / 60;
  const bestHold = input.holds.reduce((m, h) => Math.max(m, h.durationSeconds), 0);
  const bestBolt = input.bolt.reduce((m, s) => Math.max(m, s.durationSeconds), 0);
  const bestCo2 = input.co2.reduce((m, s) => Math.max(m, s.durationSeconds), 0);
  const explored = new Set(
    input.log.map((l) => l.exerciseId).filter(Boolean) as string[]
  );
  const dates = collectDates(input.rhythmic, input.holds, input.log, [
    ...input.bolt,
    ...input.co2,
    ...input.rate,
  ]);
  const streak = computeStreak(dates);
  const hourFlags = [...input.rhythmic, ...input.log].map((s) => new Date(s.date).getHours());
  const programDays = Object.values(input.programs).reduce((a, p) => a + p.completedDays.length, 0);
  const programDone = PROGRAMS.some(
    (p) => (input.programs[p.id]?.completedDays.length || 0) >= p.days
  );

  const unlocked: string[] = [];
  const mark = (id: string, cond: boolean) => {
    if (cond) unlocked.push(id);
  };
  mark("first-session", sessionCount >= 1 || input.holds.length >= 1);
  mark("sessions-10", sessionCount >= 10);
  mark("sessions-50", sessionCount >= 50);
  mark("sessions-100", sessionCount >= 100);
  mark("minutes-60", minutes >= 60);
  mark("minutes-600", minutes >= 600);
  mark("hold-30", bestHold >= 30);
  mark("hold-60", bestHold >= 60);
  mark("hold-90", bestHold >= 90);
  mark("hold-120", bestHold >= 120);
  mark("holds-25", input.holds.length >= 25);
  mark("bolt-20", bestBolt >= 20);
  mark("bolt-30", bestBolt >= 30);
  mark("bolt-40", bestBolt >= 40);
  mark("co2-20", bestCo2 >= 20);
  mark("co2-35", bestCo2 >= 35);
  mark("rate-logged", input.rate.length >= 1);
  mark("streak-3", streak >= 3);
  mark("streak-7", streak >= 7);
  mark("streak-21", streak >= 21);
  mark("streak-40", streak >= 40);
  mark("explore-5", explored.size >= 5);
  mark("explore-12", explored.size >= 12);
  mark("explore-all", explored.size >= EXERCISE_CATALOG.length);
  mark("journal-1", input.journal.length >= 1);
  mark("journal-10", input.journal.length >= 10);
  mark("program-day", programDays >= 1);
  mark("program-done", programDone);
  mark("challenge-goal", Object.keys(input.claimed).length >= 1);
  mark("night-owl", hourFlags.some((h) => h >= 21));
  mark("dawn", hourFlags.some((h) => h < 8));
  mark("custom-1", input.protocols.length >= 1);
  mark("favorite-3", input.favorites.length >= 3);
  return unlocked;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [libraryExerciseId, setLibraryExerciseId] = useState<string | null>(null);
  const [rhythmicSessions, setRhythmicSessions] = useLocalStorage<RhythmicSessionRecord[]>(
    "prana-rhythmic-sessions",
    [],
    storageOptions([] as RhythmicSessionRecord[])
  );
  const [holdRecords, setHoldRecords] = useLocalStorage<HoldRecord[]>(
    "prana-hold-records",
    [],
    storageOptions([] as HoldRecord[])
  );
  const [holdSessions, setHoldSessions] = useLocalStorage<HoldSessionRecord[]>(
    "prana-hold-sessions",
    [],
    storageOptions([] as HoldSessionRecord[])
  );
  const [boltScores, setBoltScores] = useLocalStorage<TestRecord[]>(
    "prana-bolt-scores",
    [],
    storageOptions([] as TestRecord[])
  );
  const [co2Scores, setCo2Scores] = useLocalStorage<TestRecord[]>(
    "prana-co2-scores",
    [],
    storageOptions([] as TestRecord[])
  );
  const [breathRateScores, setBreathRateScores] = useLocalStorage<BreathRateRecord[]>(
    "prana-breath-rate-scores",
    [],
    storageOptions([] as BreathRateRecord[])
  );
  const [practiceLog, setPracticeLog] = useLocalStorage<PracticeLogEntry[]>(
    "prana-practice-log",
    [],
    storageOptions([] as PracticeLogEntry[])
  );
  const [journal, setJournal] = useLocalStorage<JournalEntry[]>(
    "prana-journal",
    [],
    storageOptions([] as JournalEntry[])
  );
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "prana-favorites",
    [],
    storageOptions([] as string[])
  );
  const [customProtocols, setCustomProtocols] = useLocalStorage<CustomProtocol[]>(
    "prana-custom-protocols",
    [],
    storageOptions([] as CustomProtocol[])
  );
  const [programProgress, setProgramProgress] = useLocalStorage<Record<string, ProgramProgress>>(
    "prana-programs",
    {},
    storageOptions({} as Record<string, ProgramProgress>)
  );
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "prana-settings",
    defaultSettings,
    {
      ...storageOptions(defaultSettings),
      deserializer: (value: string): AppSettings => {
        try {
          return { ...defaultSettings, ...(JSON.parse(value) as AppSettings) };
        } catch {
          return defaultSettings;
        }
      },
    }
  );
  const [unlockedTrophies, setUnlockedTrophies] = useLocalStorage<Record<string, string>>(
    "prana-trophies",
    {},
    storageOptions({} as Record<string, string>)
  );
  const [weeklyChallengeClaimed, setWeeklyChallengeClaimed] = useLocalStorage<
    Record<string, boolean>
  >("prana-weekly-claimed", {}, storageOptions({} as Record<string, boolean>));
  const [isSafetyModalOpen, setSafetyModalOpen] = useState(false);
  const [trophyToast, setTrophyToast] = useState<string | null>(null);

  const snapshot = useMemo(
    () => ({
      rhythmic: rhythmicSessions,
      holds: holdRecords,
      log: practiceLog,
      bolt: boltScores,
      co2: co2Scores,
      rate: breathRateScores,
      journal,
      favorites,
      protocols: customProtocols,
      programs: programProgress,
      claimed: weeklyChallengeClaimed,
    }),
    [
      rhythmicSessions,
      holdRecords,
      practiceLog,
      boltScores,
      co2Scores,
      breathRateScores,
      journal,
      favorites,
      customProtocols,
      programProgress,
      weeklyChallengeClaimed,
    ]
  );

  const syncTrophies = (next = snapshot) => {
    const earned = evaluateTrophies(next);
    const fresh: string[] = [];
    setUnlockedTrophies((prev) => {
      const merged = { ...prev };
      for (const id of earned) {
        if (!merged[id]) {
          merged[id] = new Date().toISOString();
          fresh.push(id);
        }
      }
      return merged;
    });
    if (fresh.length) {
      const trophy = TROPHIES.find((t) => t.id === fresh[0]);
      setTrophyToast(trophy?.title || "Trophy unlocked");
    }
  };

  const addRhythmicSession = (session: RhythmicSessionRecord) => {
    setRhythmicSessions((prev) => [session, ...prev]);
    setPracticeLog((prev) => [
      {
        id: session.id,
        date: session.date,
        durationSeconds: session.durationSeconds,
        kind: "rhythmic",
        title: "Rhythmic session",
      },
      ...prev,
    ]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addHoldRecord = (record: HoldRecord) => {
    setHoldRecords((prev) => [record, ...prev]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addHoldSession = (session: HoldSessionRecord) => {
    setHoldSessions((prev) => [session, ...prev]);
  };

  const addBoltScore = (score: TestRecord) => {
    setBoltScores((prev) => [score, ...prev]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addCo2Score = (score: TestRecord) => {
    setCo2Scores((prev) => [score, ...prev]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addBreathRateScore = (score: BreathRateRecord) => {
    setBreathRateScores((prev) => [score, ...prev]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addPracticeLog = (
    entry: Omit<PracticeLogEntry, "id" | "date"> & { date?: string }
  ) => {
    const full: PracticeLogEntry = {
      ...entry,
      id: Date.now().toString(),
      date: entry.date || new Date().toISOString(),
    };
    setPracticeLog((prev) => [full, ...prev]);
    setTimeout(() => syncTrophies(), 0);
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id" | "date">) => {
    setJournal((prev) => [
      { ...entry, id: Date.now().toString(), date: new Date().toISOString() },
      ...prev,
    ]);
    setTimeout(() => syncTrophies(), 0);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setTimeout(() => syncTrophies(), 0);
  };

  const addCustomProtocol = (protocol: Omit<CustomProtocol, "id">) => {
    setCustomProtocols((prev) => [
      { ...protocol, id: Date.now().toString() },
      ...prev,
    ]);
    setTimeout(() => syncTrophies(), 0);
  };

  const removeCustomProtocol = (id: string) => {
    setCustomProtocols((prev) => prev.filter((p) => p.id !== id));
  };

  const completeProgramDay = (programId: string, day: number) => {
    setProgramProgress((prev) => {
      const current = prev[programId] || {
        completedDays: [],
        startedAt: new Date().toISOString(),
      };
      if (current.completedDays.includes(day)) return prev;
      return {
        ...prev,
        [programId]: {
          ...current,
          completedDays: [...current.completedDays, day].sort((a, b) => a - b),
        },
      };
    });
    setTimeout(() => syncTrophies(), 0);
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    const theme = settings.theme === "day" ? "day" : "night";
    document.documentElement.setAttribute("data-theme", theme);
  }, [settings.theme]);

  const exportStats = useCallback(
    (): StatsPayload => ({
      rhythmicSessions,
      holdRecords,
      holdSessions,
      boltScores,
      co2Scores,
      breathRateScores,
      practiceLog,
      journal,
      favorites,
      customProtocols,
      programProgress,
      settings,
      unlockedTrophies,
      weeklyChallengeClaimed,
    }),
    [
      rhythmicSessions,
      holdRecords,
      holdSessions,
      boltScores,
      co2Scores,
      breathRateScores,
      practiceLog,
      journal,
      favorites,
      customProtocols,
      programProgress,
      settings,
      unlockedTrophies,
      weeklyChallengeClaimed,
    ]
  );

  const importStats = useCallback((payload: StatsPayload) => {
    if (payload.rhythmicSessions) setRhythmicSessions(payload.rhythmicSessions);
    if (payload.holdRecords) setHoldRecords(payload.holdRecords);
    if (payload.holdSessions) setHoldSessions(payload.holdSessions);
    if (payload.boltScores) setBoltScores(payload.boltScores);
    if (payload.co2Scores) setCo2Scores(payload.co2Scores);
    if (payload.breathRateScores) setBreathRateScores(payload.breathRateScores);
    if (payload.practiceLog) setPracticeLog(payload.practiceLog);
    if (payload.journal) setJournal(payload.journal);
    if (payload.favorites) setFavorites(payload.favorites);
    if (payload.customProtocols) setCustomProtocols(payload.customProtocols);
    if (payload.programProgress) setProgramProgress(payload.programProgress);
    if (payload.settings) setSettings({ ...defaultSettings, ...payload.settings });
    if (payload.unlockedTrophies) setUnlockedTrophies(payload.unlockedTrophies);
    if (payload.weeklyChallengeClaimed) setWeeklyChallengeClaimed(payload.weeklyChallengeClaimed);
  }, []);

  const claimWeeklyChallenge = (key: string) => {
    setWeeklyChallengeClaimed((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => syncTrophies(), 0);
  };

  const openLibraryExercise = (id: string | null) => {
    setLibraryExerciseId(id);
    if (id) setActiveTab("library");
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        libraryExerciseId,
        openLibraryExercise,
        rhythmicSessions,
        addRhythmicSession,
        holdRecords,
        addHoldRecord,
        holdSessions,
        addHoldSession,
        boltScores,
        addBoltScore,
        co2Scores,
        addCo2Score,
        breathRateScores,
        addBreathRateScore,
        practiceLog,
        addPracticeLog,
        journal,
        addJournalEntry,
        favorites,
        toggleFavorite,
        customProtocols,
        addCustomProtocol,
        removeCustomProtocol,
        programProgress,
        completeProgramDay,
        settings,
        updateSettings,
        unlockedTrophies,
        trophyToast,
        dismissTrophyToast: () => setTrophyToast(null),
        weeklyChallengeClaimed,
        claimWeeklyChallenge,
        isSafetyModalOpen,
        setSafetyModalOpen,
        exportStats,
        importStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
}

export function useDerivedStats() {
  const ctx = useAppContext();
  const dates = [
    ...ctx.rhythmicSessions,
    ...ctx.holdRecords,
    ...ctx.practiceLog,
    ...ctx.boltScores,
    ...ctx.co2Scores,
    ...ctx.breathRateScores,
  ].map((x) => x.date);
  const streak = computeStreak(dates);
  const loggedIds = new Set(ctx.practiceLog.map((l) => l.id));
  const legacyRhythmic = ctx.rhythmicSessions.filter((s) => !loggedIds.has(s.id));
  const allPractice = [...ctx.practiceLog, ...legacyRhythmic];
  const totalPracticeSeconds = allPractice.reduce((a, s) => a + s.durationSeconds, 0);
  const todaySeconds = allPractice
    .filter((s) => dayKey(s.date) === dayKey())
    .reduce((a, s) => a + s.durationSeconds, 0);
  const weekSeconds = allPractice
    .filter((s) => weekKey(new Date(s.date)) === weekKey())
    .reduce((a, s) => a + s.durationSeconds, 0);
  const xp = Math.round(
    totalPracticeSeconds / 6 +
      ctx.holdRecords.reduce((a, h) => a + h.durationSeconds, 0) / 2 +
      Object.keys(ctx.unlockedTrophies).length * 25
  );
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 40)) + 1);
  return {
    streak,
    totalPracticeSeconds,
    todaySeconds,
    weekSeconds,
    xp,
    level,
    bestHold: ctx.holdRecords.reduce((m, h) => Math.max(m, h.durationSeconds), 0),
    bestBolt: ctx.boltScores.reduce((m, s) => Math.max(m, s.durationSeconds), 0),
    bestCo2: ctx.co2Scores.reduce((m, s) => Math.max(m, s.durationSeconds), 0),
  };
}
