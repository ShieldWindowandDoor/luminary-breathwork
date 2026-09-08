"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, X, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'topHold' | 'exhale' | 'bottomHold';

export default function Calming48Breathing({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Settings
  const [sessionLengthMin, setSessionLengthMin] = useState(5);
  const [durationType, setDurationType] = useState<'time' | 'breaths'>('breaths');
  const [sessionBreaths, setSessionBreaths] = useState(20);
  
  // Fixed times for 4-8
  const inhaleTime: number = 4.0;
  const topHoldTime: number = 0.0;
  const exhaleTime: number = 8.0;
  const bottomHoldTime: number = 0.0;
  
  // State variables for active session
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [sessionBreathsLeft, setSessionBreathsLeft] = useState(sessionBreaths);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
         nextPhase = 'exhale';
         time = exhaleTime;
      } else if (currentPhaseLocal === 'exhale') {
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
  }, [isActive, sessionLengthMin, durationType, sessionBreaths]);

  const endSession = () => {
     setIsActive(false);
  };

  const getPhaseText = () => {
    switch(currentPhase) {
      case 'inhale': return 'Inhale (Nose)';
      case 'topHold': return '';
      case 'exhale': return 'Exhale (Mouth)';
      case 'bottomHold': return '';
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto bg-slate-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {!showSettings && onBack && (
         <div className="absolute top-4 left-4 z-20">
             <button onClick={onBack} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition flex items-center justify-center">
                 <ArrowLeft className="w-5 h-5 text-slate-300" />
             </button>
         </div>
      )}

      {/* Info Toggle */}
      {!isActive && (
         <div className="absolute top-4 right-16 z-20">
            <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition">
               <Info className="w-5 h-5 text-slate-300" />
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
         {showInfo && !isActive && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col pt-24"
            >
                <div className="max-w-md mx-auto w-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-2xl font-light text-slate-100">About 4-8 Breathing</h2>
                       <button onClick={() => setShowInfo(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl mb-6 text-slate-300 space-y-4">
                       <p className="leading-relaxed">
                          This technique involves a 4-second inhale through the nose followed by an 8-second exhale through the mouth. 
                       </p>
                       <p className="leading-relaxed font-bold text-teal-400">
                          Best for the Parasympathetic Nervous System
                       </p>
                       <p className="leading-relaxed">
                          By extending the exhale to be twice as long as the inhale, this rhythm acts as a natural tranquilizer. It signals the vagus nerve to slow the heart rate and lower blood pressure, promoting deep relaxation and rapid stress relief.
                       </p>
                       <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-400">
                           <li>Reduces anxiety and panic</li>
                           <li>Prepares the mind and body for sleep</li>
                           <li>Calms an overactive nervous system</li>
                           <li>Lowers cortisol levels</li>
                       </ul>
                    </div>
                    
                    <button onClick={() => setShowInfo(false)} className="mt-8 py-4 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 tracking-wider">CLOSE</button>
                </div>
            </motion.div>
         )}

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
                          <div className="flex gap-2">
                              <button 
                                 onClick={() => setDurationType('time')}
                                 className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors ${durationType === 'time' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                              >
                                 Time
                              </button>
                              <button 
                                 onClick={() => setDurationType('breaths')}
                                 className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors ${durationType === 'breaths' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300'}`}
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

                    <div className="mt-auto pt-8 z-10 w-full mb-10">
                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-teal-600 text-white rounded-full font-bold shadow-xl shadow-teal-500/20 hover:bg-teal-500 tracking-wider">DONE</button>
                    </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto my-auto min-h-max pt-20 pb-20">
         
         {/* Simple Circle Graphic Component for 4-8 */}
         <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12 flex items-center justify-center flex-shrink-0">
            {/* Background Circle */}
            <div className={`absolute w-full h-full rounded-full border-4 transition-colors duration-500 ${isActive ? 'border-slate-700/50' : 'border-slate-800'}`}></div>

            {/* Glowing effect inside depending on phase */}
            {isActive && (
                <div 
                    className="absolute w-full h-full rounded-full transition-all duration-300 ease-linear"
                    style={{
                        background: currentPhase === 'inhale' ? 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, rgba(20,184,166,0) 70%)' :
                                    currentPhase === 'exhale' ? 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, rgba(20,184,166,0) 70%)' : 'transparent',
                        transform: currentPhase === 'inhale' ? `scale(${0.5 + (1 - phaseTimeLeft / inhaleTime) * 0.5})` :
                                   currentPhase === 'exhale' ? `scale(${1 - (1 - phaseTimeLeft / exhaleTime) * 0.5})` : 'scale(0.5)'
                    }}
                ></div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-3xl sm:text-4xl font-light tracking-tighter text-white mb-2">{getPhaseText()}</span>
               
               {isActive && (
                  <>
                      <span className="text-xs font-bold opacity-60 mt-2 uppercase tracking-widest text-teal-200">{phaseTimeLeft.toFixed(1)}s</span>
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
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-500 shadow-xl shadow-teal-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
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
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
         />
      </div>
   );
}
