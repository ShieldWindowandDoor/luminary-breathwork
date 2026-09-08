"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, RotateCcw, Timer, Info, X } from 'lucide-react';
import { useAppContext } from '../lib/store';

type HoldPhase = 'idle' | 'resting' | 'holding';

export default function BreathHold() {
  const { addHoldRecord, holdRecords, addHoldSession, setSafetyModalOpen } = useAppContext();
  
  const [phase, setPhase] = useState<HoldPhase>('idle');
  const [restTimeMin, setRestTimeMin] = useState(1);
  const [restSeconds, setRestSeconds] = useState(60);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [sessionHolds, setSessionHolds] = useState<{ id: string; durationSeconds: number }[]>([]);
  const [targetHolds, setTargetHolds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // PB computation
  const personalBest = holdRecords.reduce((max, record) => Math.max(max, record.durationSeconds), 0);
  const totalSessionHoldTime = sessionHolds.reduce((total, hold) => total + hold.durationSeconds, 0);

  useEffect(() => {
    if (phase === 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      setRestSeconds(restTimeMin * 60);
      setHoldSeconds(0);
      return;
    }

    if (phase === 'resting') {
      timerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
             setHoldSeconds(0);
             setPhase('holding');
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'holding') {
       if (timerRef.current) clearInterval(timerRef.current);
       timerRef.current = setInterval(() => {
          setHoldSeconds((prev) => prev + 1);
       }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const saveAndEndSession = (finalHoldTime: number = 0) => {
     const newSessionHoldsCount = sessionHolds.length + (finalHoldTime > 0 ? 1 : 0);
     const newTotalHoldTime = totalSessionHoldTime + finalHoldTime;
     
     if (newTotalHoldTime > 0) {
         addHoldSession({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            targetHolds: (targetHolds > 0 && newSessionHoldsCount >= targetHolds) ? targetHolds : newSessionHoldsCount,
            totalDurationSeconds: newTotalHoldTime
         });
     }
     setPhase('idle');
     setSessionHolds([]);
  };

  const endHold = () => {
     if (holdSeconds > 0) {
        addHoldRecord({
           id: Date.now().toString(),
           date: new Date().toISOString(),
           durationSeconds: holdSeconds
        });
        setSessionHolds(prev => [{ id: Date.now().toString(), durationSeconds: holdSeconds }, ...prev]);
     }
     
     if (targetHolds > 0 && sessionHolds.length + 1 >= targetHolds) {
         saveAndEndSession(holdSeconds);
     } else if (restTimeMin > 0) {
         setRestSeconds(restTimeMin * 60);
         setPhase('resting');
     } else {
         saveAndEndSession(holdSeconds);
     }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full items-center p-6 bg-transparent overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="absolute top-4 sm:top-8 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-start opacity-80 pointer-events-none z-20">
         <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col gap-1 pointer-events-auto backdrop-blur-sm shadow-xl">
            <span className="text-[10px] uppercase tracking-widest text-indigo-300/60 font-bold">Personal Best</span>
            <span className="font-mono text-xl text-indigo-300">{formatTime(personalBest)}</span>
         </div>
         {sessionHolds.length > 0 && (
             <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/50 flex flex-col gap-2 max-h-48 overflow-y-auto pointer-events-auto shadow-xl backdrop-blur-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex justify-between items-end border-b border-slate-700/50 pb-2 gap-4">
                   <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Session Total</span>
                   <span className="font-mono text-emerald-400 font-bold">{formatTime(totalSessionHoldTime)}</span>
                </div>
                <div className="space-y-1">
                    {sessionHolds.map((h, i) => (
                        <div key={h.id} className="flex justify-between items-center min-w-[120px]">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Hold {sessionHolds.length - i}</span>
                            <span className="font-mono text-sm text-slate-300">{formatTime(h.durationSeconds)}</span>
                        </div>
                    ))}
                </div>
             </div>
         )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 pt-24 sm:pt-0 my-auto min-h-max pb-16">
         {phase === 'idle' && (
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center shadow-inner mb-6">
                     <Timer className="w-10 h-10 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-3xl font-light tracking-tight">Ready to hold?</h2>
                      <button onClick={() => setSafetyModalOpen(true)} className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800">
                         <Info className="w-5 h-5" />
                      </button>
                  </div>
                  <p className="text-slate-400 text-sm">Select rest time before your next hold.</p>
               </div>
               
               <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preparation & Goals</h3>
                  
                  <div className="space-y-4 mb-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target Holds</span>
                     </div>
                     <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button 
                           onClick={() => setTargetHolds(0)}
                           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${targetHolds === 0 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}
                        >Endless</button>
                        <button 
                           onClick={() => setTargetHolds(5)}
                           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${targetHolds === 5 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}
                        >5 Holds</button>
                        <button 
                           onClick={() => setTargetHolds(10)}
                           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${targetHolds === 10 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}
                        >10 Holds</button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Rest Time</span>
                        <span className="font-mono text-slate-200">{formatTime(restTimeMin * 60)}</span>
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
                     onClick={() => setPhase('holding')}
                     className="flex-1 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider transition-transform active:scale-95"
                  >
                     START HOLD
                  </button>
                  {restTimeMin > 0 && (
                     <button 
                        onClick={() => setPhase('resting')}
                        className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-full font-bold border border-slate-700 hover:bg-slate-700 shadow-xl tracking-wider transition-transform active:scale-95"
                     >
                        START REST
                     </button>
                  )}
               </div>
            </div>
         )}

         {phase === 'resting' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
               <div className="w-64 h-64 rounded-full bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center relative">
                  <div className="absolute inset-4 rounded-full border border-dashed border-slate-400/20 animate-[spin_10s_linear_infinite]"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Resting</span>
                  <div className="text-5xl font-mono tracking-widest text-slate-100 tabular-nums">
                     {formatTime(restSeconds)}
                  </div>
               </div>
               <div className="mt-12 flex gap-4">
                  <button 
                     onClick={() => saveAndEndSession(0)}
                     className="p-4 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shadow-xl text-slate-300 transition-colors"
                  >
                     <Square className="w-6 h-6 fill-current text-white text-opacity-50" />
                  </button>
                  <button 
                     onClick={() => { setHoldSeconds(0); setPhase('holding'); }}
                     className="px-8 py-4 bg-indigo-600/20 text-indigo-400 font-bold rounded-full border border-indigo-500/30 hover:bg-indigo-500/30 tracking-wider transition-colors"
                  >
                     SKIP REST
                  </button>
               </div>
            </div>
         )}

         {phase === 'holding' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
               <div className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center transform transition-all duration-1000 scale-110">
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Holding</span>
                  <div className="text-5xl font-mono tracking-widest text-white tabular-nums drop-shadow-md">
                     {formatTime(holdSeconds)}
                  </div>
               </div>
               
               <button 
                  onClick={endHold}
                  className="mt-16 px-12 py-5 bg-rose-500 rounded-full text-white font-bold tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-400 flex items-center gap-2 transition-transform active:scale-95"
               >
                  RELEASE
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
