"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, Zap, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'exhale';

export default function BreathOfFire({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [sessionLengthMin, setSessionLengthMin] = useState(3);
  const [inhaleTime, setInhaleTime] = useState(0.5);
  const [exhaleTime, setExhaleTime] = useState(0.5);
  
  // State variables for active session
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [breathsCompleted, setBreathsCompleted] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(sessionLengthMin * 60);
      setCurrentPhase('inhale');
      setBreathsCompleted(0);
      return;
    }

    let currentPhaseLocal: Phase = 'inhale';
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = sessionLengthMin * 60;
    let breathsDone = 0;

    setCurrentPhase(currentPhaseLocal);
    setSessionTimeLeft(sessionTimeRemainingLocal);

    timerRef.current = setInterval(() => {
      const step = 0.05; // 50ms, need higher precision for fast breathing
      
      sessionTimeRemainingLocal -= step;
      setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));
      
      if (sessionTimeRemainingLocal <= 0) {
         endSession();
         return;
      }

      phaseTimeRemainingLocal -= step;

      if (phaseTimeRemainingLocal <= 0.01) {
          if (currentPhaseLocal === 'inhale') {
              currentPhaseLocal = 'exhale';
              phaseTimeRemainingLocal = exhaleTime;
          } else {
              currentPhaseLocal = 'inhale';
              phaseTimeRemainingLocal = inhaleTime;
              breathsDone++;
              setBreathsCompleted(breathsDone);
          }
          setCurrentPhase(currentPhaseLocal);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, sessionLengthMin, inhaleTime, exhaleTime]);

  const endSession = () => {
     setIsActive(false);
  };

  const getPhaseText = () => {
    switch(currentPhase) {
      case 'inhale': return 'IN';
      case 'exhale': return 'OUT';
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full items-center p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {!showSettings && onBack && (
         <div className="absolute top-4 left-4 z-20">
             <button onClick={onBack} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition flex items-center justify-center">
                 <ArrowLeft className="w-5 h-5 text-slate-300" />
             </button>
         </div>
      )}

      {!isActive && (
         <div className="absolute top-4 right-4 z-20">
            <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition">
               <Settings className="w-5 h-5 text-slate-300" />
            </button>
         </div>
      )}

      <AnimatePresence>
         {showSettings && !isActive && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 overflow-y-auto p-4 sm:p-8 pt-8 shadow-2xl flex flex-col gap-6"
            >
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-xl font-light text-slate-100">Breath of Fire Settings</h2>
                   <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Pace Tuning</h3>
                   <div className="space-y-6">
                      <SettingSlider label="Inhale Time (s)" value={inhaleTime} min={0.25} max={2.0} step={0.25} onChange={setInhaleTime} />
                      <SettingSlider label="Exhale Time (s)" value={exhaleTime} min={0.25} max={2.0} step={0.25} onChange={setExhaleTime} />
                   </div>
                   <p className="text-xs text-orange-500/80 mt-4 font-medium uppercase tracking-wider">
                       Warning: Can cause lightheadedness. Go at your own pace.
                   </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Duration</h3>
                   <SettingSlider label="Session Length (min)" value={sessionLengthMin} min={1} max={15} step={1} onChange={setSessionLengthMin} />
                </div>

                <div className="sticky bottom-0 pb-4 pt-4 bg-slate-900/95 md:bg-transparent md:pt-0 md:pb-0 z-10 w-full mt-auto">
                    <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-orange-600 text-white rounded-full font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-500 tracking-wider transition-colors">DONE</button>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mt-auto mb-auto min-h-max pt-16">
         <div className="relative w-full aspect-square flex items-center justify-center pointer-events-none mb-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <Zap className={`w-3/4 h-3/4 text-orange-500 transition-transform duration-100 ease-out ${currentPhase === 'inhale' ? 'scale-110 opacity-100' : 'scale-90 opacity-20'}`} />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-6xl sm:text-8xl font-black tracking-tighter text-white italic mb-2">{getPhaseText()}</span>
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-4">
            <div>
                <div className="text-4xl font-mono tracking-widest text-white">{formatTime(isActive ? sessionTimeLeft : sessionLengthMin * 60)}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-2">
                   {isActive ? 'Time Remaining' : 'Session Duration'}
                </div>
            </div>
            
            <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-2xl font-mono tracking-widest text-orange-400">{breathsCompleted}</div>
                <div className="text-[10px] text-orange-500/60 uppercase font-bold tracking-widest mt-1">Breaths Pumped</div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex justify-center z-10 w-full mt-auto pb-8 pt-8">
            {!isActive ? (
               <button 
                  onClick={() => setIsActive(true)}
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-orange-600 font-bold hover:bg-orange-500 shadow-xl shadow-orange-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 text-white"
               >
                  <Play className="w-5 h-5 fill-current text-white" /> START FIRE
               </button>
            ) : (
               <button 
                  onClick={() => endSession()}
                  className="p-5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shadow-xl text-slate-300 transition-colors"
               >
                  <Square className="w-6 h-6 fill-current text-white text-opacity-50" />
               </button>
            )}
         </div>
      </div>
    </div>
  );
}

function SettingSlider({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="font-mono text-slate-200">{value.toFixed(step % 1 !== 0 ? 2 : 0)}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
         />
      </div>
   );
}
