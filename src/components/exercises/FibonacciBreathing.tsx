"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, X, ArrowLeft, Info, Aperture } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'exhale';
type Direction = 'ascending' | 'descending' | 'pyramid';

interface StageDef {
    in: number;
    ex: number;
    name: string;
    inCue: string;
    exCue: string;
}

const FIBONACCI_STAGES: StageDef[] = [
    { in: 2, ex: 1, name: "The Seed", inCue: "Draw in the light...", exCue: "Release the tension..." },
    { in: 3, ex: 2, name: "The Root", inCue: "Anchor to the earth...", exCue: "Soften the edges..." },
    { in: 5, ex: 3, name: "The Growth", inCue: "Expand your awareness...", exCue: "Surrender completely..." },
    { in: 8, ex: 5, name: "The Bloom", inCue: "Embrace the infinite...", exCue: "Dissolve into space..." },
    { in: 13, ex: 8, name: "The Horizon", inCue: "Merge with the cosmos...", exCue: "Return to center..." }
];

export default function FibonacciBreathing({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Settings
  const [direction, setDirection] = useState<Direction>('pyramid');
  const [maxStageIndex, setMaxStageIndex] = useState(3); // Default to The Bloom (8 in / 5 out)
  const [targetRounds, setTargetRounds] = useState(3);
  const [toneEnabled, setToneEnabled] = useState(true);
  
  // Active state
  const [sequencePlan, setSequencePlan] = useState<number[]>([]);
  const [planIndex, setPlanIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          oscRef.current = audioCtxRef.current.createOscillator();
          gainRef.current = audioCtxRef.current.createGain();

          oscRef.current.type = 'sine';
          oscRef.current.frequency.value = 528; // 528Hz Solfeggio Frequency

          oscRef.current.connect(gainRef.current);
          gainRef.current.connect(audioCtxRef.current.destination);

          gainRef.current.gain.value = 0;
          oscRef.current.start();
      }
      
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
  };

  const playTone = () => {
      if (audioCtxRef.current && gainRef.current) {
          // Gentle fade in
          gainRef.current.gain.setTargetAtTime(0.08, audioCtxRef.current.currentTime, 1.0);
      }
  };

  const stopTone = () => {
      if (audioCtxRef.current && gainRef.current) {
          // Gentle fade out
          gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
      }
  };

  useEffect(() => {
     return () => {
         if (audioCtxRef.current) {
             audioCtxRef.current.close().catch(() => {});
         }
     };
  }, []);

  const triggerHaptic = (intensity: number) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          // Base vibration of 30ms, scaled up by the fibonacci intensity
          navigator.vibrate(Math.min(30 + intensity * 15, 200));
      }
  };

  const startSession = () => {
      if (toneEnabled) {
          initAudio();
          playTone();
      }
      
      // Build the plan
      const plan: number[] = [];
      for (let r = 0; r < targetRounds; r++) {
         if (direction === 'ascending') {
              for(let i=0; i<=maxStageIndex; i++) plan.push(i);
         } else if (direction === 'descending') {
              for(let i=maxStageIndex; i>=0; i--) plan.push(i);
         } else if (direction === 'pyramid') {
              for(let i=0; i<=maxStageIndex; i++) plan.push(i);
              for(let i=maxStageIndex-1; i>=0; i--) plan.push(i);
         }
      }
      
      setSequencePlan(plan);
      setPlanIndex(0);
      setCurrentPhase('inhale');
      
      if (plan.length > 0) {
          setPhaseTimeLeft(FIBONACCI_STAGES[plan[0]].in);
          triggerHaptic(FIBONACCI_STAGES[plan[0]].in);
      }
      
      setIsActive(true);
  };

  const endSession = () => {
     setIsActive(false);
     stopTone();
  };

  useEffect(() => {
    if (!isActive || sequencePlan.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    let localPhase = currentPhase;
    let localPhaseTimeLeft = phaseTimeLeft;
    let localPlanIndex = planIndex;

    const tick = () => {
        const step = 0.05;
        localPhaseTimeLeft -= step;
        
        if (localPhaseTimeLeft <= 0.02) {
            // Time to transition
            const currentStageDef = FIBONACCI_STAGES[sequencePlan[localPlanIndex]];
            
            if (localPhase === 'inhale') {
                localPhase = 'exhale';
                localPhaseTimeLeft = currentStageDef.ex;
                triggerHaptic(currentStageDef.ex);
            } else {
                // Done with exhale, move to next stage in plan
                localPlanIndex += 1;
                if (localPlanIndex >= sequencePlan.length) {
                    endSession();
                    return;
                }
                localPhase = 'inhale';
                localPhaseTimeLeft = FIBONACCI_STAGES[sequencePlan[localPlanIndex]].in;
                triggerHaptic(FIBONACCI_STAGES[sequencePlan[localPlanIndex]].in);
            }
            
            setPlanIndex(localPlanIndex);
            setCurrentPhase(localPhase);
        }
        
        setPhaseTimeLeft(Math.max(0, localPhaseTimeLeft));
    };

    timerRef.current = setInterval(tick, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, sequencePlan]); // Dependency array rebuilt minimally

  const currentStage = sequencePlan.length > 0 && planIndex < sequencePlan.length 
          ? FIBONACCI_STAGES[sequencePlan[planIndex]] 
          : FIBONACCI_STAGES[0];

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate a ratio for visuals
  const baseTime = currentPhase === 'inhale' ? currentStage.in : currentStage.ex;
  const progressRatio = isActive ? Math.max(0, phaseTimeLeft / baseTime) : 1;

  // The spiral/nautilus visual logic
  // The scale represents how deep we are in the sequence. max scale at maxStageIndex
  const globalScale = 1 + (sequencePlan.length > 0 ? (sequencePlan[planIndex] * 0.2) : 0);
  
  return (
    <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto bg-[#1A1513]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {!showSettings && onBack && (
         <div className="absolute top-4 left-4 z-20">
             <button onClick={() => { endSession(); onBack(); }} className="p-3 bg-[#2A2320] rounded-full hover:bg-amber-900/50 border border-amber-900/40 transition flex items-center justify-center">
                 <ArrowLeft className="w-5 h-5 text-amber-500/80" />
             </button>
         </div>
      )}

      {/* Info Toggle */}
      {!isActive && (
         <div className="absolute top-4 right-16 z-20">
            <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-[#2A2320] rounded-full hover:bg-amber-900/50 border border-amber-900/40 transition">
               <Info className="w-5 h-5 text-amber-500/80" />
            </button>
         </div>
      )}

      {/* Settings Toggle */}
      {!isActive && (
         <div className="absolute top-4 right-4 z-20">
            <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-[#2A2320] rounded-full hover:bg-amber-900/50 border border-amber-900/40 transition">
               <Settings className="w-5 h-5 text-amber-500/80" />
            </button>
         </div>
      )}

      <AnimatePresence>
         {showInfo && !isActive && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-0 z-30 bg-[#1A1513]/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col pt-24"
            >
                <div className="max-w-md mx-auto w-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-2xl font-light text-amber-100">About Fibonacci Rhythm</h2>
                       <button onClick={() => setShowInfo(false)} className="p-2 bg-[#2A2320] rounded-full text-amber-500 hover:text-amber-300 transition">
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-900/20 border border-amber-700/30 shadow-xl mb-6 text-amber-100/70 space-y-4">
                       <p className="leading-relaxed">
                          A precise breathing protocol structured around the Fibonacci sequence ($1, 1, 2, 3, 5, 8, 13$).
                       </p>
                       <p className="leading-relaxed font-bold text-amber-400">
                          Sacred Geometry & 528Hz Carrier Tone
                       </p>
                       <p className="leading-relaxed">
                          By maintaining the exact inhalation and exhalation durations aligned perfectly with the Golden Ratio, this pattern naturally mimics universal growth patterns. It induces an ethereal, highly grounded state. Haptics and a 528Hz core tone are embedded to facilitate frequency coherence.
                       </p>
                       <ul className="list-disc pl-5 space-y-2 mt-4 text-amber-200/60">
                           <li>Enhances deep, geometric awareness</li>
                           <li>Cultivates progressive expansion of lung capacity</li>
                           <li>Harmonizes nervous system to nature's rhythm</li>
                       </ul>
                    </div>
                    
                    <button onClick={() => setShowInfo(false)} className="mt-8 py-4 bg-amber-700 text-amber-50 rounded-full font-bold hover:bg-amber-600 tracking-wider transition-colors">CLOSE</button>
                </div>
            </motion.div>
         )}

         {showSettings && !isActive && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-0 z-30 bg-[#1A1513]/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col"
            >
                <div className="max-w-md mx-auto w-full flex flex-col min-h-full pb-8 pt-4 gap-6">
                    <div className="flex justify-between items-center mb-2">
                       <h2 className="text-xl font-light text-amber-100">Rhythm Settings</h2>
                       <button onClick={() => setShowSettings(false)} className="p-2 bg-[#2A2320] rounded-full text-amber-500 hover:text-amber-300 transition">
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-900/20 border border-amber-700/30 shadow-xl space-y-6">
                       <div>
                          <h3 className="text-xs font-bold text-amber-500/50 uppercase tracking-widest mb-3">Direction Pattern</h3>
                          <div className="flex gap-2">
                              {['ascending', 'descending', 'pyramid'].map((dir) => (
                                  <button 
                                     key={dir}
                                     onClick={() => setDirection(dir as Direction)}
                                     className={`flex-1 text-[10px] sm:text-xs px-2 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors ${direction === dir ? 'bg-amber-600 text-amber-50' : 'bg-[#2A2320] text-amber-500/60 hover:bg-[#3A3330]'}`}
                                  >
                                     {dir}
                                  </button>
                              ))}
                          </div>
                          <p className="text-[10px] text-amber-400/40 mt-2">
                              {direction === 'ascending' && 'Starts small, continuously builds capacity.'}
                              {direction === 'descending' && 'Starts with deep capacity, tapers to stillness.'}
                              {direction === 'pyramid' && 'Expands naturally, then completely grounds and centers.'}
                          </p>
                       </div>

                       <div>
                          <div className="flex justify-between text-sm mb-3 mt-4">
                             <span className="text-amber-500/50 font-bold tracking-widest text-xs uppercase">Peak Stage</span>
                             <span className="font-mono text-amber-200">
                                {FIBONACCI_STAGES[maxStageIndex].in}s In / {FIBONACCI_STAGES[maxStageIndex].ex}s Out
                             </span>
                          </div>
                          <input 
                             type="range" 
                             min={1} 
                             max={4} 
                             step={1}
                             value={maxStageIndex} 
                             onChange={(e) => setMaxStageIndex(parseInt(e.target.value))} 
                             className="w-full h-1 bg-[#2A2320] rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <p className="text-[10px] text-amber-400/40 mt-2 text-center uppercase tracking-widest">{FIBONACCI_STAGES[maxStageIndex].name}</p>
                       </div>

                       <div className="pt-2">
                          <SettingSlider label="Total Rounds" value={targetRounds} min={1} max={10} step={1} onChange={setTargetRounds} color="amber" />
                       </div>

                       <div className="flex items-center justify-between pt-4 border-t border-amber-900/30">
                           <span className="text-sm text-amber-500/80 font-bold uppercase tracking-widest">528Hz Carrier Tone</span>
                           <button 
                               onClick={() => setToneEnabled(!toneEnabled)}
                               className={`w-12 h-6 rounded-full transition-colors relative ${toneEnabled ? 'bg-amber-600' : 'bg-[#2A2320]'}`}
                           >
                               <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${toneEnabled ? 'left-7' : 'left-1'}`} />
                           </button>
                       </div>
                    </div>

                    <div className="mt-auto pt-8 z-10 w-full mb-10">
                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-amber-600 text-amber-50 rounded-full font-bold shadow-xl shadow-amber-900/40 hover:bg-amber-500 tracking-wider">DONE</button>
                    </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto my-auto min-h-max pt-20 pb-20">
         
         {/* Visual Golden Spiral Representation */}
         <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-16 flex items-center justify-center flex-shrink-0">
            {/* Dark sacred geometry background layer */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Aperture className="w-full h-full text-amber-500" strokeWidth={0.5} />
            </div>

            {/* Pulsing layers inspired by fibonacci */}
            {isActive && (
                <div 
                    className="absolute rounded-full transition-all duration-[50ms] ease-linear border-2 border-amber-400/30 mix-blend-screen"
                    style={{
                        width: '100%',
                        height: '100%',
                        background: currentPhase === 'inhale' ? 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0) 70%)' : 'rgba(251,191,36,0)',
                        transform: currentPhase === 'inhale' ? `scale(${0.3 * globalScale + (1 - progressRatio) * 0.7 * globalScale})` : `scale(${1 * globalScale - (1 - progressRatio) * 0.7 * globalScale})`,
                        opacity: currentPhase === 'inhale' ? 1 - progressRatio * 0.3 : 0.7 + progressRatio * 0.3
                    }}
                ></div>
            )}
            
            {/* The inner shell lines that rotate */}
            <div 
                className="absolute w-full h-full"
                style={{
                    transition: 'transform 10s linear',
                    transform: isActive ? `rotate(${currentPhase === 'inhale' ? 180 : 0}deg)` : 'rotate(0deg)'
                }}
            >
               {Array.from({length: 6}).map((_, i) => (
                   <div
                       key={i}
                       className="absolute inset-0 border border-amber-500/20 rounded-full m-auto transition-all duration-1000 ease-in-out"
                       style={{
                           width: `${100 / Math.pow(1.618, i)}%`,
                           height: `${100 / Math.pow(1.618, i)}%`,
                           borderTopColor: isActive ? 'rgba(251,191,36,0.6)' : 'rgba(251,191,36,0.2)',
                           borderRightColor: 'transparent',
                           transform: `rotate(${i * 45}deg) scale(${isActive ? globalScale : 1})`,
                       }}
                   />
               ))}
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center backdrop-blur-md rounded-full w-40 h-40 border border-amber-500/20 shadow-[0_0_50px_rgba(251,191,36,0.1)] bg-[#1A1513]/60">
               <span className="text-xs font-bold text-amber-500/60 tracking-widest uppercase mb-1">
                   {isActive ? currentStage.name : 'The Spark'}
               </span>
               <span className="text-3xl sm:text-4xl font-light tracking-tighter text-amber-50">
                   {isActive ? (currentPhase === 'inhale' ? 'INHALE' : 'EXHALE') : 'READY'}
               </span>
               
               {isActive && (
                  <span className="text-xs font-mono opacity-80 mt-2 uppercase tracking-widest text-amber-300 backdrop-blur-md px-3 py-1 rounded-full bg-amber-900/30">
                      {phaseTimeLeft.toFixed(1)}s
                  </span>
               )}
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-16 h-12">
            <AnimatePresence mode="popLayout">
                {isActive && (
                    <motion.div 
                        key={currentPhase + currentStage.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg sm:text-xl font-light tracking-wide text-amber-200/80 italic"
                    >
                        {currentPhase === 'inhale' ? currentStage.inCue : currentStage.exCue}
                    </motion.div>
                )}
                {!isActive && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-light tracking-widest text-amber-500/50 uppercase"
                    >
                        Align with the golden ratio
                    </motion.div>
                )}
            </AnimatePresence>
         </div>

         {/* Sequence Progress Bar */}
         {isActive && (
             <div className="w-full max-w-sm mb-12 px-6">
                 <div className="flex justify-between text-[10px] font-bold text-amber-500/50 uppercase tracking-widest mb-2">
                     <span>Sequence Progress</span>
                     <span>Step {planIndex + 1} of {sequencePlan.length}</span>
                 </div>
                 <div className="w-full h-1.5 bg-[#2A2320] rounded-full overflow-hidden">
                     <div 
                         className="h-full bg-amber-500 rounded-full transition-all duration-300"
                         style={{ width: `${((planIndex + 1) / sequencePlan.length) * 100}%` }}
                     />
                 </div>
             </div>
         )}

         {/* Controls */}
         <div className="flex justify-center z-10 w-full mt-auto pb-8">
            {!isActive ? (
               <button 
                  onClick={startSession}
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-amber-600 text-amber-50 font-bold hover:bg-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.3)] tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" /> BEGIN SEQUENCE
               </button>
            ) : (
               <button 
                  onClick={endSession}
                  className="p-5 rounded-full bg-[#2A2320] border border-amber-900/50 hover:bg-[#3A3330] shadow-xl text-amber-500/80 transition-colors"
               >
                  <Square className="w-6 h-6 fill-current text-opacity-50" />
               </button>
            )}
         </div>

      </div>
    </div>
  );
}

function SettingSlider({ label, value, min, max, step, onChange, color = 'teal' }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, color?: string }) {
   const isAmber = color === 'amber';
   return (
      <div className="space-y-3">
         <div className="flex justify-between text-sm">
            <span className={isAmber ? "text-amber-500/50 font-bold uppercase tracking-widest text-xs" : "text-slate-400"}>{label}</span>
            <span className={isAmber ? "font-mono text-amber-200" : "font-mono text-slate-200"}>{value.toFixed(step % 1 !== 0 ? 1 : 0)}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className={`w-full h-1 ${isAmber ? 'bg-[#2A2320] accent-amber-500' : 'bg-slate-700 accent-teal-500'} rounded-lg appearance-none cursor-pointer`}
         />
      </div>
   );
}
