"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'topHold' | 'exhale' | 'bottomHold';

export default function BoxBreathing({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [sessionLengthMin, setSessionLengthMin] = useState(5);
  const [durationType, setDurationType] = useState<'time' | 'breaths'>('breaths');
  const [sessionBreaths, setSessionBreaths] = useState(20);
  const [isLinked, setIsLinked] = useState(true);
  const [boxTime, setBoxTime] = useState(4.0); // For linked mode
  const [inhaleTime, setInhaleTime] = useState(4.0);
  const [topHoldTime, setTopHoldTime] = useState(4.0);
  const [exhaleTime, setExhaleTime] = useState(4.0);
  const [bottomHoldTime, setBottomHoldTime] = useState(4.0);
  
  // State variables for active session
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [sessionBreathsLeft, setSessionBreathsLeft] = useState(sessionBreaths);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings if linked
  useEffect(() => {
     if (isLinked) {
         setInhaleTime(boxTime);
         setTopHoldTime(boxTime);
         setExhaleTime(boxTime);
         setBottomHoldTime(boxTime);
     }
  }, [boxTime, isLinked]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(sessionLengthMin * 60);
      setSessionBreathsLeft(sessionBreaths);
      setCurrentPhase('inhale');
      return;
    }

    let currentPhaseLocal: Phase = 'inhale';
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = sessionLengthMin * 60;
    let sessionBreathsRemainingLocal = sessionBreaths;

    setCurrentPhase(currentPhaseLocal);
    setPhaseTimeLeft(phaseTimeRemainingLocal);
    setSessionTimeLeft(sessionTimeRemainingLocal);
    setSessionBreathsLeft(sessionBreathsRemainingLocal);

    const startNextPhase = () => {
      let nextPhase: Phase = 'inhale';
      let time = 0;

      if (currentPhaseLocal === 'inhale') {
         nextPhase = 'topHold';
         time = topHoldTime;
      } else if (currentPhaseLocal === 'topHold') {
         nextPhase = 'exhale';
         time = exhaleTime;
      } else if (currentPhaseLocal === 'exhale') {
         nextPhase = 'bottomHold';
         time = bottomHoldTime;
      } else if (currentPhaseLocal === 'bottomHold') {
         if (durationType === 'breaths') {
             sessionBreathsRemainingLocal -= 1;
             setSessionBreathsLeft(sessionBreathsRemainingLocal);
             if (sessionBreathsRemainingLocal <= 0) {
                 endSession();
                 return;
             }
         }
         nextPhase = 'inhale';
         time = inhaleTime;
      }
      
      if (time === 0) {
          currentPhaseLocal = nextPhase;
          startNextPhase();
          return;
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
      
      if (durationType === 'time') {
          sessionTimeRemainingLocal -= step;
          setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));

          if (sessionTimeRemainingLocal <= 0) {
             endSession();
             return;
          }
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
  }, [isActive, sessionLengthMin, inhaleTime, topHoldTime, exhaleTime, bottomHoldTime, durationType, sessionBreaths]);

  const endSession = () => {
     setIsActive(false);
  };

  const getPhaseText = () => {
    switch(currentPhase) {
      case 'inhale': return 'Inhale';
      case 'topHold': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'bottomHold': return 'Hold';
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Compute position for the dot
  const getDotPosition = () => {
     let progress = 0;
     let totalForPhase = 1;
     
     if (currentPhase === 'inhale') {
         totalForPhase = inhaleTime;
         progress = 1 - (phaseTimeLeft / totalForPhase);
         return { left: '0%', top: `${100 - (progress * 100)}%` };
     } else if (currentPhase === 'topHold') {
         totalForPhase = topHoldTime;
         progress = 1 - (phaseTimeLeft / totalForPhase);
         return { left: `${progress * 100}%`, top: '0%' };
     } else if (currentPhase === 'exhale') {
         totalForPhase = exhaleTime;
         progress = 1 - (phaseTimeLeft / totalForPhase);
         return { left: '100%', top: `${progress * 100}%` };
     } else if (currentPhase === 'bottomHold') {
         totalForPhase = bottomHoldTime;
         progress = 1 - (phaseTimeLeft / totalForPhase);
         return { left: `${100 - (progress * 100)}%`, top: '100%' };
     }
     return { left: '0%', top: '100%' }; // default bottom left
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
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
               className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 overflow-y-auto p-4 sm:p-8 pt-8 shadow-2xl flex flex-col gap-6"
            >
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-xl font-light text-slate-100">Box Breathing Settings</h2>
                   <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timing Control</h3>
                      <button 
                         onClick={() => setIsLinked(!isLinked)}
                         className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors ${isLinked ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                      >
                          {isLinked ? 'Linked' : 'Unlinked'}
                      </button>
                   </div>
                   
                   {isLinked ? (
                       <SettingSlider label="Box Time (s)" value={boxTime} min={1.0} max={20.0} step={0.5} onChange={setBoxTime} />
                   ) : (
                       <div className="space-y-6">
                          <SettingSlider label="Inhale (s)" value={inhaleTime} min={1} max={20} step={0.5} onChange={setInhaleTime} />
                          <SettingSlider label="Top Hold (s)" value={topHoldTime} min={0} max={20} step={0.5} onChange={setTopHoldTime} />
                          <SettingSlider label="Exhale (s)" value={exhaleTime} min={1} max={20} step={0.5} onChange={setExhaleTime} />
                          <SettingSlider label="Bottom Hold (s)" value={bottomHoldTime} min={0} max={20} step={0.5} onChange={setBottomHoldTime} />
                       </div>
                   )}
                </div>

                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</h3>
                      <div className="flex gap-2">
                          <button 
                             onClick={() => setDurationType('time')}
                             className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors ${durationType === 'time' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                          >
                             Time
                          </button>
                          <button 
                             onClick={() => setDurationType('breaths')}
                             className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors ${durationType === 'breaths' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                          >
                             Breaths
                          </button>
                      </div>
                   </div>
                   {durationType === 'time' ? (
                       <SettingSlider label="Session Length (min)" value={sessionLengthMin} min={1} max={60} step={1} onChange={setSessionLengthMin} />
                   ) : (
                       <SettingSlider label="Total Breaths" value={sessionBreaths} min={1} max={120} step={1} onChange={setSessionBreaths} />
                   )}
                </div>

                <div className="sticky bottom-0 pb-4 pt-4 bg-slate-900/95 md:bg-transparent md:pt-0 md:pb-0 z-10 w-full mt-auto">
                    <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-emerald-600 text-white rounded-full font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 tracking-wider">DONE</button>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mt-auto mb-auto min-h-max pt-16">
         
         {/* Box Graphic Component */}
         <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12 flex items-center justify-center">
            {/* Box Border Track */}
            <div className={`absolute w-full h-full border-[3px] rounded-xl transition-colors duration-500 ${isActive ? 'border-slate-700' : 'border-slate-800'}`}></div>

             {/* Tracing Glowing Edge representing the current side */}
             {isActive && (
                 <div className="absolute w-full h-full pointer-events-none rounded-xl overflow-hidden">
                     <div 
                         className="absolute bg-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all ease-linear"
                         style={{
                             ...(currentPhase === 'inhale' ? { left: 0, bottom: 0, width: '3px', height: `${(1 - (phaseTimeLeft / inhaleTime)) * 100}%` } : {}),
                             ...(currentPhase === 'topHold' ? { left: 0, top: 0, height: '3px', width: `${(1 - (phaseTimeLeft / topHoldTime)) * 100}%` } : {}),
                             ...(currentPhase === 'exhale' ? { right: 0, top: 0, width: '3px', height: `${(1 - (phaseTimeLeft / exhaleTime)) * 100}%` } : {}),
                             ...(currentPhase === 'bottomHold' ? { right: 0, bottom: 0, height: '3px', width: `${(1 - (phaseTimeLeft / bottomHoldTime)) * 100}%` } : {})
                         }}
                     ></div>
                 </div>
             )}

            {/* Traveling glowing dot */}
            {isActive && (
                <div 
                    className="absolute w-4 h-4 bg-emerald-300 rounded-full shadow-[0_0_20px_rgba(110,231,183,1)] z-10"
                    style={{
                        ...getDotPosition(),
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-3xl sm:text-5xl font-light tracking-tighter text-white mb-2">{getPhaseText()}</span>
               
               {isActive && (
                  <>
                      <span className="text-xs font-bold opacity-60 mt-2 uppercase tracking-widest text-emerald-100">{phaseTimeLeft.toFixed(1)}s</span>
                  </>
               )}
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-12">
            <div>
                <div className="text-4xl font-mono tracking-widest text-white">
                   {durationType === 'time' 
                       ? formatTime(isActive ? sessionTimeLeft : sessionLengthMin * 60)
                       : (isActive ? sessionBreathsLeft : sessionBreaths)}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-2">
                   {durationType === 'time'
                       ? (isActive ? 'Time Remaining' : 'Session Duration')
                       : (isActive ? 'Breaths Remaining' : 'Total Breaths')}
                </div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex justify-center z-10 w-full mt-auto pb-8">
            {!isActive ? (
               <button 
                  onClick={() => setIsActive(true)}
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
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
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
         />
      </div>
   );
}
