"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, ArrowRightLeft, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AlternateMode = 'alternating' | 'halfway';
type Phase = 'inhale' | 'topHold' | 'exhale' | 'bottomHold';
type Nostril = 'left' | 'right' | 'both';

export default function AlternateNostril({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [sessionLengthMin, setSessionLengthMin] = useState(5);
  const [mode, setMode] = useState<AlternateMode>('alternating');
  const [inhaleTime, setInhaleTime] = useState(4.0);
  const [topHoldTime, setTopHoldTime] = useState(4.0);
  const [exhaleTime, setExhaleTime] = useState(4.0);
  const [bottomHoldTime, setBottomHoldTime] = useState(0.0);
  
  // State variables for active session
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [activeNostril, setActiveNostril] = useState<Nostril>('left');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSecondHalf = useRef(false);
  const currentSide = useRef<'left' | 'right'>('left'); // Used for 'alternating' mode memory

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(sessionLengthMin * 60);
      setCurrentPhase('inhale');
      setActiveNostril('left');
      isSecondHalf.current = false;
      currentSide.current = 'left';
      return;
    }

    let currentPhaseLocal: Phase = 'inhale';
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = sessionLengthMin * 60;
    let currentActiveNostrilLocal: Nostril = 'left';

    setCurrentPhase(currentPhaseLocal);
    setPhaseTimeLeft(phaseTimeRemainingLocal);
    setSessionTimeLeft(sessionTimeRemainingLocal);
    
    // Initial side logic
    if (mode === 'halfway') {
       currentActiveNostrilLocal = 'left';
       setActiveNostril('left');
    } else {
       currentSide.current = 'left';
       currentActiveNostrilLocal = 'left';
       setActiveNostril('left');
    }

    const startNextPhase = () => {
      let nextPhase: Phase = 'inhale';
      let time = 0;
      let nextNostril: Nostril = currentActiveNostrilLocal;

      if (currentPhaseLocal === 'inhale') {
         nextPhase = 'topHold';
         time = topHoldTime;
         nextNostril = 'both'; // typically both are pinched
      } else if (currentPhaseLocal === 'topHold') {
         nextPhase = 'exhale';
         time = exhaleTime;
         // Set exhale nostril based on mode
         if (mode === 'alternating') {
             currentSide.current = currentSide.current === 'left' ? 'right' : 'left';
             nextNostril = currentSide.current;
         } else {
             nextNostril = isSecondHalf.current ? 'left' : 'right';
         }
      } else if (currentPhaseLocal === 'exhale') {
         nextPhase = 'bottomHold';
         time = bottomHoldTime;
         nextNostril = 'both';
      } else if (currentPhaseLocal === 'bottomHold') {
         nextPhase = 'inhale';
         time = inhaleTime;
         
         if (mode === 'alternating') {
             currentSide.current = currentSide.current === 'left' ? 'right' : 'left';
             nextNostril = currentSide.current;
         } else {
             nextNostril = isSecondHalf.current ? 'right' : 'left';
         }
      }
      
      if (time === 0) {
          // If a hold is 0s, recurse to next
          currentPhaseLocal = nextPhase;
          currentActiveNostrilLocal = nextNostril;
          setActiveNostril(nextNostril);
          startNextPhase();
          return;
      }
      
      currentPhaseLocal = nextPhase;
      phaseTimeRemainingLocal = time;
      currentActiveNostrilLocal = nextNostril;
      
      setCurrentPhase(currentPhaseLocal);
      setActiveNostril(nextNostril);
      setPhaseTimeLeft(time);
    };

    if (inhaleTime === 0) {
       startNextPhase();
    } // edge case protect

    timerRef.current = setInterval(() => {
      const step = 0.1;
      
      sessionTimeRemainingLocal -= step;
      setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));
      
      if (mode === 'halfway') {
         const halftime = (sessionLengthMin * 60) / 2;
         if (sessionTimeRemainingLocal <= halftime && !isSecondHalf.current) {
             isSecondHalf.current = true;
             // Can add a little visual or audio cue here later
         }
      }

      if (sessionTimeRemainingLocal <= 0) {
         endSession();
         return;
      }

      phaseTimeRemainingLocal -= step;
      setPhaseTimeLeft(Math.max(0, phaseTimeRemainingLocal));

      if (phaseTimeRemainingLocal <= 0.05) {
         startNextPhase();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, sessionLengthMin]);

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

  const getNostrilText = () => {
      if (currentPhase === 'topHold' || currentPhase === 'bottomHold') {
          return "Pinch Both";
      }
      if (activeNostril === 'left') return "Close Right, Breathe Left";
      if (activeNostril === 'right') return "Close Left, Breathe Right";
      return "";
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

      {/* Settings Pane */}
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
                   <h2 className="text-xl font-light text-slate-100">Alternate Nostril Settings</h2>
                   <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Mode Selection</h3>
                   <div className="flex bg-slate-900 p-1 rounded-xl mb-2 border border-slate-800">
                      <button 
                         onClick={() => setMode('alternating')}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'alternating' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                      >Alternating</button>
                      <button 
                         onClick={() => setMode('halfway')}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'halfway' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                      >Switch Halfway</button>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 px-2">
                       {mode === 'alternating' ? 'Standard Nadi Shodhana: switch nostril after every inhale.' : 'Balances one side fully, then auto-switches halfway through the session.'}
                   </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Duration & Timings</h3>
                   <div className="space-y-6">
                      <SettingSlider label="Session Length (min)" value={sessionLengthMin} min={1} max={60} step={1} onChange={setSessionLengthMin} />
                      <SettingSlider label="Inhale (s)" value={inhaleTime} min={1} max={20} step={0.5} onChange={setInhaleTime} />
                      <SettingSlider label="Top Hold (s)" value={topHoldTime} min={0} max={20} step={0.5} onChange={setTopHoldTime} />
                      <SettingSlider label="Exhale (s)" value={exhaleTime} min={1} max={20} step={0.5} onChange={setExhaleTime} />
                      <SettingSlider label="Bottom Hold (s)" value={bottomHoldTime} min={0} max={20} step={0.5} onChange={setBottomHoldTime} />
                   </div>
                </div>

                <div className="sticky bottom-0 pb-4 pt-4 bg-slate-900/95 z-10 w-full mt-auto">
                    <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 tracking-wider">DONE</button>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mt-auto mb-auto min-h-max pt-16">
         
         <div className="relative w-full aspect-square flex items-center justify-center pointer-events-none mb-8">
            <div className={`absolute w-3/4 h-3/4 rounded-full border-4 transition-all duration-1000 ease-in-out border-purple-500 ${isActive && activeNostril === 'left' ? '[clip-path:polygon(0_0,50%_0,50%_100%,0_100%)] !border-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] translate-x-[-10%]' : (isActive && activeNostril === 'right' ? '[clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)] !border-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)] translate-x-[10%]' : '')} ${isActive ? 'opacity-100 scale-100' : 'opacity-20 scale-95'}`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-3xl sm:text-5xl font-light tracking-tighter text-white mb-2">{getPhaseText()}</span>
               
               {isActive && (
                  <>
                      <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">{getNostrilText()}</span>
                      <span className="text-xs opacity-60 mt-2 uppercase tracking-widest">{phaseTimeLeft.toFixed(1)}s</span>
                  </>
               )}
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-12">
            <div>
                <div className="text-4xl font-mono tracking-widest text-white">{formatTime(isActive ? sessionTimeLeft : sessionLengthMin * 60)}</div>
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
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-indigo-600 font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" /> START SESSION
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
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
         />
      </div>
   );
}
