"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { useAppContext } from '../../lib/store';

export default function BoltTest() {
  const { boltScores, addBoltScore } = useAppContext();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestScore = boltScores.reduce((max, s) => Math.max(max, s.durationSeconds), 0);
  const previousScore = boltScores.length > 0 ? boltScores[0].durationSeconds : null;

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const startTest = () => {
    setTime(0);
    setLastScore(null);
    setIsActive(true);
  };

  const stopTest = () => {
    setIsActive(false);
    setLastScore(time);
    if (time > 0) {
       addBoltScore({
           id: Date.now().toString(),
           date: new Date().toISOString(),
           durationSeconds: time
       });
    }
  };

  const formatTime = (seconds: number) => {
    return seconds.toFixed(1) + 's';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4">
      <div className="w-full max-w-sm mb-8 text-center space-y-2">
         <h3 className="text-2xl font-light text-slate-100">BOLT Score</h3>
         <p className="text-slate-400 text-sm leading-relaxed">
            Take a normal breath in, and a normal breath out. Hold your breath on the exhale. 
            Stop the timer at the <strong>first</strong> clear desire to breathe.
         </p>
      </div>

      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-sm flex items-center justify-center mb-8">
         <div className={`absolute w-full h-full rounded-full border-4 transition-all duration-300 ${isActive ? 'border-indigo-500 scale-100 opacity-100 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-slate-800 scale-95 opacity-50'}`}></div>
         
         <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-mono tracking-tighter text-white">
               {formatTime(time)}
            </span>
         </div>
      </div>

      {lastScore !== null && (
         <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-2xl font-bold text-indigo-400 mb-2">Score: {formatTime(lastScore)}</div>
            <div className="text-sm text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
               20+ is Good, 40 is Optimal.
            </div>
         </div>
      )}

      {(previousScore !== null && !isActive && lastScore === null) && (
         <div className="mb-8 flex gap-6 text-center animate-in fade-in duration-500">
             <div className="flex flex-col items-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Score</span>
                 <span className="text-lg font-mono text-slate-300">{formatTime(previousScore)}</span>
             </div>
             <div className="w-px h-8 bg-slate-800"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Best Score</span>
                 <span className="text-lg font-mono text-indigo-400">{formatTime(bestScore)}</span>
             </div>
         </div>
      )}

      {/* Controls */}
      <div className="flex justify-center z-10 w-full mt-auto pb-8">
         {!isActive ? (
            <button 
               onClick={startTest}
               className="w-full max-w-xs px-10 py-5 rounded-full bg-indigo-600 font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
               <Play className="w-5 h-5 fill-current" /> START TEST
            </button>
         ) : (
            <button 
               onClick={stopTest}
               className="w-full max-w-xs px-10 py-5 rounded-full bg-red-500/20 font-bold text-red-500 border border-red-500/50 hover:bg-red-500/30 shadow-xl tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
               <Square className="w-5 h-5 fill-current" /> STOP (BREATHE)
            </button>
         )}
      </div>
    </div>
  );
}
