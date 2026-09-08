"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { useAppContext } from '../../lib/store';

export default function Co2Test() {
  const { co2Scores, addCo2Score } = useAppContext();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestScore = co2Scores.reduce((max, s) => Math.max(max, s.durationSeconds), 0);
  const previousScore = co2Scores.length > 0 ? co2Scores[0].durationSeconds : null;

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
       addCo2Score({
           id: Date.now().toString(),
           date: new Date().toISOString(),
           durationSeconds: time
       });
    }
  };

  const formatTime = (seconds: number) => {
    return seconds.toFixed(1) + 's';
  };

  const getScoreDetails = (score: number) => {
      if (score < 20) {
          return { label: 'Poor Recovery', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400/20' };
      } else if (score < 40) {
          return { label: 'Moderate', colorClass: 'text-green-400', bgClass: 'bg-green-400/10 border-green-400/20' };
      } else if (score < 60) {
          return { label: 'Good/Strong', colorClass: 'text-teal-400', bgClass: 'bg-teal-400/10 border-teal-400/20' };
      } else {
          return { label: 'Elite/Calm', colorClass: 'text-blue-400', bgClass: 'bg-blue-400/10 border-blue-400/20' };
      }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4">
      <div className="w-full max-w-sm mb-8 text-center space-y-2">
         <h3 className="text-2xl font-light text-slate-100">CO2 Discard Test</h3>
         <p className="text-slate-400 text-sm leading-relaxed">
            Take a deep inhale, then start the timer and exhale <strong>as slowly as possible</strong>. 
            Stop the timer when you completely run out of air.
         </p>
      </div>

      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-sm flex items-center justify-center mb-8">
         <div className={`absolute w-full h-full rounded-full border-4 transition-all duration-300 ${isActive ? 'border-emerald-500 scale-100 opacity-100 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border-slate-800 scale-95 opacity-50'}`}></div>
         
         <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-mono tracking-tighter text-white">
               {formatTime(time)}
            </span>
         </div>
      </div>

      {lastScore !== null && (() => {
         const details = getScoreDetails(lastScore);
         return (
             <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`text-2xl font-bold mb-2 ${details.colorClass}`}>{formatTime(lastScore)}</div>
                <div className={`text-sm px-6 py-2 rounded-xl border ${details.colorClass} ${details.bgClass} font-bold tracking-wider uppercase`}>
                   {details.label}
                </div>
             </div>
         );
      })()}

      {(previousScore !== null && !isActive && lastScore === null) && (
         <div className="mb-8 flex gap-6 text-center animate-in fade-in duration-500">
             <div className="flex flex-col items-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Score</span>
                 <span className="text-lg font-mono text-slate-300">{formatTime(previousScore)}</span>
             </div>
             <div className="w-px h-8 bg-slate-800"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Best Score</span>
                 <span className="text-lg font-mono text-emerald-400">{formatTime(bestScore)}</span>
             </div>
         </div>
      )}

      {/* Controls */}
      <div className="flex justify-center z-10 w-full mt-auto pb-8">
         {!isActive ? (
            <button 
               onClick={startTest}
               className="w-full max-w-xs px-10 py-5 rounded-full bg-emerald-600 font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 text-white"
            >
               <Play className="w-5 h-5 fill-current" /> START TIMER
            </button>
         ) : (
            <button 
               onClick={stopTest}
               className="w-full max-w-xs px-10 py-5 rounded-full bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 font-bold shadow-xl tracking-wider flex items-center justify-center gap-2 transition-colors text-slate-300"
            >
               <Square className="w-5 h-5 fill-current opacity-50" /> OUT OF AIR
            </button>
         )}
      </div>
    </div>
  );
}
