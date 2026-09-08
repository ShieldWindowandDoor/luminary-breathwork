"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'exhale';

export default function ResonanceFrequencyBreathing({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [sessionLengthMin, setSessionLengthMin] = useState(5);
  
  // Fixed times for Resonance Frequency (5.5 breaths per minute)
  const inhaleTime: number = 5.5;
  const exhaleTime: number = 5.5;
  
  // State variables for active session
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(sessionLengthMin * 60);
      setCurrentPhase('inhale');
      return;
    }

    let currentPhaseLocal: Phase = 'inhale';
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = sessionLengthMin * 60;

    setCurrentPhase(currentPhaseLocal);
    setPhaseTimeLeft(phaseTimeRemainingLocal);
    setSessionTimeLeft(sessionTimeRemainingLocal);

    const startNextPhase = () => {
      let nextPhase: Phase = 'inhale';
      let time = 0;

      if (currentPhaseLocal === 'inhale') {
         nextPhase = 'exhale';
         time = exhaleTime;
      } else if (currentPhaseLocal === 'exhale') {
         nextPhase = 'inhale';
         time = inhaleTime;
      }
      
      currentPhaseLocal = nextPhase;
      phaseTimeRemainingLocal = time;
      
      setCurrentPhase(currentPhaseLocal);
      setPhaseTimeLeft(time);
    };

    if (inhaleTime === 0) {
       startNextPhase();
    }

    timerRef.current = setInterval(() => {
      const step = 0.05;
      
      sessionTimeRemainingLocal -= step;
      setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));

      if (sessionTimeRemainingLocal <= 0) {
         endSession();
         return;
      }

      phaseTimeRemainingLocal -= step;
      setPhaseTimeLeft(Math.max(0, phaseTimeRemainingLocal));

      if (phaseTimeRemainingLocal <= 0.02) {
         startNextPhase();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, sessionLengthMin]);

  const endSession = () => {
     setIsActive(false);
  };

  const getPhaseText = () => {
    switch(currentPhase) {
      case 'inhale': return 'Inhale (5.5s)';
      case 'exhale': return 'Exhale (5.5s)';
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {!showSettings && onBack && (
         <div className="absolute top-4 left-4 z-20">
             <button onClick={onBack} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition flex items-center justify-center">
                 <ArrowLeft className="w-5 h-5 text-slate-300" />
             </button>
         </div>
      )}

      {/* Settings Toggle */}
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
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col"
            >
                <div className="max-w-md mx-auto w-full flex flex-col min-h-full pb-8 pt-4 gap-6">
                    <div className="flex justify-between items-center mb-2">
                       <h2 className="text-xl font-light text-slate-100">Practice Settings</h2>
                       <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</h3>
                       </div>
                       <SettingSlider label="Session Length (min)" value={sessionLengthMin} min={1} max={60} step={1} onChange={setSessionLengthMin} />
                    </div>

                    <div className="mt-auto pt-8 z-10 w-full mb-10">
                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-rose-600 text-white rounded-full font-bold shadow-xl shadow-rose-500/20 hover:bg-rose-500 tracking-wider">DONE</button>
                    </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto my-auto min-h-max pt-20 pb-20">
         
         {/* Simple Circle Graphic Component for Resonance Frequency */}
         <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12 flex items-center justify-center flex-shrink-0">
            {/* Background Circle */}
            <div className={`absolute w-full h-full rounded-full border-4 transition-colors duration-500 ${isActive ? 'border-slate-700/50' : 'border-slate-800'}`}></div>

            {/* Glowing effect inside depending on phase */}
            {isActive && (
                <div 
                    className="absolute w-full h-full rounded-full transition-all duration-300 ease-linear"
                    style={{
                        background: currentPhase === 'inhale' ? 'radial-gradient(circle, rgba(225,29,72,0.4) 0%, rgba(225,29,72,0) 70%)' :
                                    currentPhase === 'exhale' ? 'radial-gradient(circle, rgba(225,29,72,0.2) 0%, rgba(225,29,72,0) 70%)' : 'transparent',
                        transform: currentPhase === 'inhale' ? `scale(${0.5 + (1 - phaseTimeLeft / inhaleTime) * 0.5})` :
                                   currentPhase === 'exhale' ? `scale(${1 - (1 - phaseTimeLeft / exhaleTime) * 0.5})` : 'scale(0.5)'
                    }}
                ></div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-3xl sm:text-5xl font-light tracking-tighter text-white mb-2">{getPhaseText()}</span>
               
               {isActive && (
                  <>
                      <span className="text-xs font-bold opacity-60 mt-2 uppercase tracking-widest text-rose-200">{phaseTimeLeft.toFixed(1)}s</span>
                  </>
               )}
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-12">
            <div>
                <div className="text-4xl font-mono tracking-widest text-white">
                   {formatTime(isActive ? sessionTimeLeft : sessionLengthMin * 60)}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-2">
                   {isActive ? 'Time Remaining' : 'Session Duration'}
                </div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex justify-center z-10 w-full mt-auto pb-8">
            {!isActive ? (
               <button 
                  onClick={() => setIsActive(true)}
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-xl shadow-rose-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" /> START BREATHING
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
            <span className="font-mono text-slate-200">{value.toFixed(step % 1 !== 0 ? 1 : 0)}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
         />
      </div>
   );
}
