"use client";

import React, { useState, useEffect, useRef } from "react";
import { Square, Timer, Info } from "lucide-react";
import { useAppContext } from "../lib/store";
import { formatClock } from "../lib/utils";

type HoldPhase = "idle" | "resting" | "holding";

export default function BreathHold() {
  const { addHoldRecord, holdRecords, addHoldSession, setSafetyModalOpen, holdGoal } =
    useAppContext();

  const [phase, setPhase] = useState<HoldPhase>("idle");
  const [restTimeMin, setRestTimeMin] = useState(1);
  const [restSeconds, setRestSeconds] = useState(60);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [sessionHolds, setSessionHolds] = useState<{ id: string; durationSeconds: number }[]>([]);
  const [targetHolds, setTargetHolds] = useState<number>(0);
  const [savedNote, setSavedNote] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const holdSecondsRef = useRef(0);
  const sessionHoldsRef = useRef(sessionHolds);
  sessionHoldsRef.current = sessionHolds;

  const personalBest = holdRecords.reduce((max, record) => Math.max(max, record.durationSeconds), 0);
  const totalSessionHoldTime = sessionHolds.reduce((total, hold) => total + hold.durationSeconds, 0);

  useEffect(() => {
    if (holdGoal > 0) setTargetHolds(holdGoal);
  }, [holdGoal]);

  useEffect(() => {
    if (phase === "idle") {
      if (timerRef.current) clearInterval(timerRef.current);
      setRestSeconds(restTimeMin * 60);
      setHoldSeconds(0);
      holdSecondsRef.current = 0;
      return;
    }

    if (phase === "resting") {
      timerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            holdSecondsRef.current = 0;
            setHoldSeconds(0);
            setPhase("holding");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === "holding") {
      if (timerRef.current) clearInterval(timerRef.current);
      holdSecondsRef.current = 0;
      timerRef.current = setInterval(() => {
        holdSecondsRef.current += 1;
        setHoldSeconds(holdSecondsRef.current);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const persistHold = (seconds: number) => {
    if (seconds <= 0) return;
    const record = {
      id: `${Date.now()}-${seconds}`,
      date: new Date().toISOString(),
      durationSeconds: seconds,
    };
    addHoldRecord(record);
    const next = [{ id: record.id, durationSeconds: seconds }, ...sessionHoldsRef.current];
    sessionHoldsRef.current = next;
    setSessionHolds(next);
  };

  const persistSessionBlock = () => {
    const holds = sessionHoldsRef.current;
    const total = holds.reduce((a, h) => a + h.durationSeconds, 0);
    if (!holds.length || total <= 0) return;
    addHoldSession({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      targetHolds: targetHolds > 0 ? targetHolds : holds.length,
      totalDurationSeconds: total,
    });
  };

  const stopSet = (includeCurrentHold: boolean) => {
    if (includeCurrentHold) persistHold(holdSecondsRef.current);
    persistSessionBlock();
    const count = sessionHoldsRef.current.length;
    setSavedNote(count ? `Saved ${count} hold${count === 1 ? "" : "s"} to your stats` : "");
    setPhase("idle");
    setSessionHolds([]);
    sessionHoldsRef.current = [];
    holdSecondsRef.current = 0;
  };

  const endHold = () => {
    persistHold(holdSecondsRef.current);
    const count = sessionHoldsRef.current.length;
    if (targetHolds > 0 && count >= targetHolds) {
      persistSessionBlock();
      setSavedNote(`Set complete · ${count} holds saved`);
      setPhase("idle");
      setSessionHolds([]);
      sessionHoldsRef.current = [];
      return;
    }
    if (restTimeMin > 0) {
      setRestSeconds(restTimeMin * 60);
      setPhase("resting");
    } else {
      persistSessionBlock();
      setSavedNote(`Saved ${count} hold${count === 1 ? "" : "s"}`);
      setPhase("idle");
      setSessionHolds([]);
      sessionHoldsRef.current = [];
    }
  };

  return (
    <div
      className="flex flex-col h-full items-center p-6 bg-transparent overflow-y-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="absolute top-4 sm:top-8 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-start opacity-80 pointer-events-none z-20">
        <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col gap-1 pointer-events-auto backdrop-blur-sm shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-indigo-300/60 font-bold">
            Personal Best
          </span>
          <span className="font-mono text-xl text-indigo-300">{formatClock(personalBest)}</span>
        </div>
        {sessionHolds.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/50 flex flex-col gap-2 max-h-48 overflow-y-auto pointer-events-auto shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-end border-b border-slate-700/50 pb-2 gap-4">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Session · saved live
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {formatClock(totalSessionHoldTime)}
              </span>
            </div>
            <div className="space-y-1">
              {sessionHolds.map((h, i) => (
                <div key={h.id} className="flex justify-between items-center min-w-[120px]">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    Hold {sessionHolds.length - i}
                  </span>
                  <span className="font-mono text-sm text-slate-300">
                    {formatClock(h.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 pt-24 sm:pt-0 my-auto min-h-max pb-16">
        {phase === "idle" && (
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center shadow-inner mb-6">
                <Timer className="w-10 h-10 text-slate-500" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-3xl font-light tracking-tight">Ready to hold?</h2>
                <button
                  onClick={() => setSafetyModalOpen(true)}
                  className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-sm">
                Every release is saved to holds stats. Stop a set early and the holds you already
                finished still count.
              </p>
              {savedNote && <p className="text-sm text-emerald-400 mt-3 font-medium">{savedNote}</p>}
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Preparation & Goals
              </h3>
              <div className="space-y-4 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Holds</span>
                </div>
                <div className="grid grid-cols-4 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {[
                    { n: 0, label: "Open" },
                    { n: 5, label: "5" },
                    { n: 8, label: "8" },
                    { n: 10, label: "10" },
                  ].map((opt) => (
                    <button
                      key={opt.n}
                      onClick={() => setTargetHolds(opt.n)}
                      className={`py-2 text-sm font-medium rounded-lg transition-colors ${
                        targetHolds === opt.n
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rest Time</span>
                  <span className="font-mono text-slate-200">{formatClock(restTimeMin * 60)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={restTimeMin}
                  onChange={(e) => setRestTimeMin(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
              <button
                onClick={() => setPhase("holding")}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider"
              >
                START HOLD
              </button>
              {restTimeMin > 0 && (
                <button
                  onClick={() => setPhase("resting")}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-full font-bold border border-slate-700 hover:bg-slate-700 shadow-xl tracking-wider"
                >
                  START REST
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "resting" && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-indigo-300 mb-4">
              {sessionHolds.length}
              {targetHolds > 0 ? ` / ${targetHolds}` : ""} holds saved this set
            </p>
            <div className="w-64 h-64 rounded-full bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center relative">
              <div className="absolute inset-4 rounded-full border border-dashed border-slate-400/20 animate-[spin_10s_linear_infinite]"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Resting
              </span>
              <div className="text-5xl font-mono tracking-widest text-slate-100 tabular-nums">
                {formatClock(restSeconds)}
              </div>
            </div>
            <div className="mt-12 flex gap-4 items-center">
              <button
                onClick={() => stopSet(false)}
                className="p-4 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shadow-xl text-slate-300"
                aria-label="Stop set"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
              <button
                onClick={() => {
                  holdSecondsRef.current = 0;
                  setHoldSeconds(0);
                  setPhase("holding");
                }}
                className="px-8 py-4 bg-indigo-600/20 text-indigo-400 font-bold rounded-full border border-indigo-500/30 hover:bg-indigo-500/30 tracking-wider"
              >
                SKIP REST
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-4">Stop now and the holds above stay in Insights.</p>
          </div>
        )}

        {phase === "holding" && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-indigo-200 mb-4">
              Hold {(sessionHolds.length || 0) + 1}
              {targetHolds > 0 ? ` of ${targetHolds}` : ""} · release or stop anytime
            </p>
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center scale-110">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">
                Holding
              </span>
              <div className="text-5xl font-mono tracking-widest text-white tabular-nums">
                {formatClock(holdSeconds)}
              </div>
            </div>
            <button
              onClick={endHold}
              className="mt-16 px-12 py-5 bg-rose-500 rounded-full text-white font-bold tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-400"
            >
              RELEASE
            </button>
            <button
              onClick={() => stopSet(true)}
              className="mt-4 px-6 py-3 rounded-full text-sm font-bold text-slate-300 border border-slate-600"
            >
              Stop set · save holds
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
