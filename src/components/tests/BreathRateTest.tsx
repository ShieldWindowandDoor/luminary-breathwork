"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Wind, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../lib/store';

export default function BreathRateTest() {
  const [phase, setPhase] = useState<'idle' | 'running' | 'finished'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [breaths, setBreaths] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addBreathRateScore } = useAppContext();

  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setPhase('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'finished') {
       addBreathRateScore({
           id: Date.now().toString(),
           date: new Date().toISOString(),
           bpm: breaths
       });
    }
  }, [phase]);

  const handleStart = () => {
    setBreaths(1);
    setSecondsLeft(60);
    setPhase('running');
  };

  const handleInhale = () => {
    if (phase === 'running') {
      setBreaths(prev => prev + 1);
    }
  };

  const getFeedback = (bpm: number) => {
      if (bpm <= 10) {
          return {
              label: 'Elite/Zen',
              message: 'Elite Respiratory Control.',
              coaching: 'Your nervous system is in a deep state of recovery. This is the optimal zone for deep focus, creative flow, and clear thinking.',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10 border-violet-500/20'
          };
      } else if (bpm <= 15) {
          return {
              label: 'Optimal/Rest',
              message: 'Healthy Baseline.',
              coaching: "You are in a relaxed, parasympathetic state. You're ready for a focused session or activity.",
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20'
          };
      } else if (bpm <= 20) {
          return {
              label: 'Elevated Stress',
              message: 'Elevated Stress Response.',
              coaching: "You are likely breathing from your chest. Try a 2-minute 'Exhale Emphasis' session to bring this down below 12.",
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20'
          };
      } else {
          return {
              label: 'Redlining',
              message: 'System Redlining.',
              coaching: "Your body is in 'Fight or Flight' mode. Action Required: We recommend an immediate 5-minute Box Breath session to prevent burnout and restore balance.",
              color: 'text-rose-400',
              bg: 'bg-rose-500/10 border-rose-500/20'
          };
      }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4">
      {phase === 'idle' && (
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center shadow-inner mb-6">
                 <Timer className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-3xl font-light tracking-tight mb-2">Breath Rate</h2>
              <p className="text-slate-400 text-sm mb-4">Tap 'Inhale' every time your natural breath begins automatically.</p>
              <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-left">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">How to start</h4>
                  <p className="text-slate-400 text-xs">Wait for your natural next breath. Right as your inhale begins, tap the START button to begin the timer and log your first breath.</p>
              </div>
           </div>
           
           <button 
              onClick={handleStart}
              className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider transition-transform active:scale-95"
           >
              START 60s TIMER
           </button>
        </div>
      )}

      {phase === 'running' && (
        <div className="w-full max-w-md flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="text-7xl font-mono font-light text-white mb-2">{secondsLeft}s</div>
           <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">Time Remaining</div>

           <div className="text-6xl font-light text-white mb-4">{breaths}</div>
           <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">Breaths Logged</div>

           <button 
              onPointerDown={handleInhale}
              className="w-64 h-64 rounded-full bg-indigo-600/20 border border-indigo-500 text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-2xl tracking-widest shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex items-center justify-center"
           >
              INHALE
           </button>
        </div>
      )}

      {phase === 'finished' && (
        <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Your Breath Rate</div>
              <div className="text-7xl font-light text-white mb-2">{breaths} <span className="text-3xl text-slate-600">BPM</span></div>
              
              <div className={`mt-8 p-6 rounded-2xl border ${getFeedback(breaths).bg}`}>
                 <h4 className={`text-xl font-semibold mb-2 ${getFeedback(breaths).color}`}>{getFeedback(breaths).message}</h4>
                 <p className="text-slate-300 text-sm leading-relaxed">{getFeedback(breaths).coaching}</p>
                 <div className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Zone: {getFeedback(breaths).label}
                 </div>
              </div>
           </div>

           <button 
              onClick={() => setPhase('idle')}
              className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
           >
              DONE
           </button>
        </div>
      )}
    </div>
  );
}
