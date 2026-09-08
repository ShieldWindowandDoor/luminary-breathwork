"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Square, Settings, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { audio } from "@/lib/audio";
import { useAppContext } from "@/lib/store";
import type { ExerciseDef, Phase } from "@/lib/catalog";
import { formatClock } from "@/lib/utils";
import { SettingSlider } from "@/components/ui/controls";

export default function GuidedPattern({
  exercise,
  onBack,
  protocolOverride,
}: {
  exercise: ExerciseDef;
  onBack?: () => void;
  protocolOverride?: {
    inhale: number;
    topHold: number;
    exhale: number;
    bottomHold: number;
    title?: string;
  };
}) {
  const pattern = exercise.pattern!;
  const { addPracticeLog, favorites, toggleFavorite, settings } = useAppContext();
  const bells = settings?.bells !== false;
  const bgSound = settings?.backgroundSound !== false;
  const favs = favorites || [];
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionLengthMin, setSessionLengthMin] = useState(pattern.defaultMinutes);
  const [durationType, setDurationType] = useState<"time" | "breaths">("breaths");
  const [sessionBreaths, setSessionBreaths] = useState(pattern.defaultBreaths);
  const [inhaleTime, setInhaleTime] = useState(protocolOverride?.inhale ?? pattern.inhale);
  const [topHoldTime, setTopHoldTime] = useState(protocolOverride?.topHold ?? pattern.topHold);
  const [exhaleTime, setExhaleTime] = useState(protocolOverride?.exhale ?? pattern.exhale);
  const [bottomHoldTime, setBottomHoldTime] = useState(
    protocolOverride?.bottomHold ?? pattern.bottomHold
  );
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [sessionBreathsLeft, setSessionBreathsLeft] = useState(sessionBreaths);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>("inhale");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);
  const locked = pattern.lockTimings && !protocolOverride;

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(sessionLengthMin * 60);
      setSessionBreathsLeft(sessionBreaths);
      setCurrentPhase("inhale");
      audio.stopBackgroundLayer();
      return;
    }

    audio.init();
    if (bgSound) audio.startBackgroundLayer();
    elapsedRef.current = 0;

    let currentPhaseLocal: Phase = "inhale";
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = sessionLengthMin * 60;
    let sessionBreathsRemainingLocal = sessionBreaths;

    const times: Record<Phase, number> = {
      inhale: inhaleTime,
      topHold: topHoldTime,
      exhale: exhaleTime,
      bottomHold: bottomHoldTime,
    };
    const order: Phase[] = ["inhale", "topHold", "exhale", "bottomHold"];

    const playFor = (phase: Phase, time: number) => {
      if (!bells || time <= 0) return;
      if (phase === "inhale") audio.playDing(659.25);
      if (phase === "topHold") audio.playDing(880);
      if (phase === "exhale") audio.playDing(440);
      if (phase === "bottomHold") audio.playDing(329.63);
    };

    const startPhase = (phase: Phase) => {
      let idx = order.indexOf(phase);
      for (let i = 0; i < 4; i++) {
        const p = order[idx % 4];
        const time = times[p];
        if (time > 0) {
          if (p === "inhale" && currentPhaseLocal === "bottomHold") {
            sessionBreathsRemainingLocal -= 1;
            setSessionBreathsLeft(sessionBreathsRemainingLocal);
            if (durationType === "breaths" && sessionBreathsRemainingLocal <= 0) {
              finish(true);
              return;
            }
          }
          currentPhaseLocal = p;
          phaseTimeRemainingLocal = time;
          setCurrentPhase(p);
          setPhaseTimeLeft(time);
          playFor(p, time);
          return;
        }
        if (p === "bottomHold") {
          sessionBreathsRemainingLocal -= 1;
          setSessionBreathsLeft(sessionBreathsRemainingLocal);
          if (durationType === "breaths" && sessionBreathsRemainingLocal <= 0) {
            finish(true);
            return;
          }
        }
        idx += 1;
      }
    };

    setCurrentPhase("inhale");
    setPhaseTimeLeft(inhaleTime);
    setSessionTimeLeft(sessionTimeRemainingLocal);
    setSessionBreathsLeft(sessionBreathsRemainingLocal);
    playFor("inhale", inhaleTime);
    if (inhaleTime === 0) startPhase("topHold");

    timerRef.current = setInterval(() => {
      const step = 0.05;
      elapsedRef.current += step;
      if (durationType === "time") {
        sessionTimeRemainingLocal -= step;
        setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));
        if (sessionTimeRemainingLocal <= 0) {
          finish(true);
          return;
        }
      }
      phaseTimeRemainingLocal -= step;
      setPhaseTimeLeft(Math.max(0, phaseTimeRemainingLocal));
      if (phaseTimeRemainingLocal <= 0.03) {
        const next = order[(order.indexOf(currentPhaseLocal) + 1) % 4];
        startPhase(next);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const finish = (completed: boolean) => {
    setIsActive(false);
    audio.stopBackgroundLayer();
    const elapsed = Math.round(elapsedRef.current);
    if (completed || elapsed > 8) {
      addPracticeLog({
        durationSeconds: elapsed,
        kind: protocolOverride ? "builder" : "library",
        exerciseId: exercise.id,
        title: protocolOverride?.title || exercise.title,
      });
    }
  };

  const labelFor = (phase: Phase) => {
    const custom = pattern.phaseLabels?.[phase];
    if (custom) return custom;
    if (phase === "inhale") return "Inhale";
    if (phase === "exhale") return "Exhale";
    return "Hold";
  };

  const scale =
    currentPhase === "inhale" || currentPhase === "topHold" ? 1.35 : 1;

  return (
    <div
      className="flex flex-col h-full relative p-4 overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
        {onBack && !showSettings && (
          <button
            onClick={onBack}
            className="p-3 bg-slate-800 rounded-full border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => toggleFavorite(exercise.id)}
            className="p-3 bg-slate-800 rounded-full border border-slate-700"
          >
              <Star
                className={`w-5 h-5 ${favs.includes(exercise.id) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
              />
          </button>
          {!isActive && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-slate-800 rounded-full border border-slate-700"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-slate-900/95 p-6 overflow-y-auto flex flex-col gap-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light">Session controls</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400">{exercise.cue}</p>
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setDurationType("time")}
                  className={`flex-1 py-2 rounded-lg text-sm ${durationType === "time" ? "bg-indigo-600" : "bg-slate-900"}`}
                >
                  Time
                </button>
                <button
                  onClick={() => setDurationType("breaths")}
                  className={`flex-1 py-2 rounded-lg text-sm ${durationType === "breaths" ? "bg-indigo-600" : "bg-slate-900"}`}
                >
                  Breaths
                </button>
              </div>
              {durationType === "time" ? (
                <SettingSlider
                  label="Minutes"
                  value={sessionLengthMin}
                  min={1}
                  max={45}
                  step={1}
                  onChange={setSessionLengthMin}
                />
              ) : (
                <SettingSlider
                  label="Breaths"
                  value={sessionBreaths}
                  min={3}
                  max={120}
                  step={1}
                  onChange={setSessionBreaths}
                />
              )}
            </div>
            {!locked && (
              <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 space-y-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Phase timings
                </h3>
                <SettingSlider label="Inhale" value={inhaleTime} min={1} max={20} step={0.5} onChange={setInhaleTime} />
                <SettingSlider label="Top hold" value={topHoldTime} min={0} max={20} step={0.5} onChange={setTopHoldTime} />
                <SettingSlider label="Exhale" value={exhaleTime} min={1} max={20} step={0.5} onChange={setExhaleTime} />
                <SettingSlider label="Bottom hold" value={bottomHoldTime} min={0} max={20} step={0.5} onChange={setBottomHoldTime} />
              </div>
            )}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-4 bg-indigo-600 rounded-full font-bold"
            >
              DONE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center pt-16">
        <p className="text-indigo-400 text-sm font-medium mb-1">
          {protocolOverride?.title || exercise.subtitle}
        </p>
        <h2 className="text-2xl font-light mb-8">{protocolOverride?.title || exercise.title}</h2>
        <motion.div
          className={`w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${exercise.color} flex flex-col items-center justify-center shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)]`}
          animate={{ scale: isActive ? scale : 1 }}
          transition={{ duration: Math.max(0.2, currentPhase === "inhale" ? inhaleTime : currentPhase === "exhale" ? exhaleTime : 0.2), ease: "linear" as const }}
        >
          <span className="text-3xl font-light">{isActive ? labelFor(currentPhase) : "Ready"}</span>
          {isActive && (
            <span className="text-xs uppercase tracking-widest opacity-70 mt-1">
              {phaseTimeLeft.toFixed(1)}s
            </span>
          )}
        </motion.div>
        <div className="mt-8 text-center">
          <div className="text-4xl font-mono">
            {durationType === "time"
              ? formatClock(isActive ? sessionTimeLeft : sessionLengthMin * 60)
              : isActive
                ? sessionBreathsLeft
                : sessionBreaths}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-bold">
            {durationType === "time" ? "Time" : "Breaths"}
          </div>
        </div>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-6">{exercise.cue}</p>
        <div className="mt-10 w-full max-w-xs">
          {!isActive ? (
            <button
              onClick={() => setIsActive(true)}
              className="w-full py-5 rounded-full bg-indigo-600 font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" /> START
            </button>
          ) : (
            <button
              onClick={() => finish(false)}
              className="mx-auto p-5 rounded-full bg-slate-800 border border-slate-700 block"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
