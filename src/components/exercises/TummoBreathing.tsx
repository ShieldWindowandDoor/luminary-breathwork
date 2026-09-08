"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, X, ArrowLeft, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'ventilation' | 'bottomHold' | 'inhaleTransition' | 'recoveryHold' | 'resetExhale' | 'stillness';
type BreathPhase = 'inhale' | 'exhale';

export default function TummoBreathing({ onBack }: { onBack?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [targetRounds, setTargetRounds] = useState(3);
  const [breathsPerRound, setBreathsPerRound] = useState(30);
  const [breathSpeed, setBreathSpeed] = useState(2.0); // Total cycle
  const [recoveryBreathDuration, setRecoveryBreathDuration] = useState(15);
  const [resetExhaleDuration, setResetExhaleDuration] = useState(6);
  const [stillnessDuration, setStillnessDuration] = useState(5);
  
  // Active session tracking
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<Phase>('ventilation');
  
  // Ventilation specific
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  
  const inhaleTime = breathSpeed / 2;
  const exhaleTime = breathSpeed / 2;
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(inhaleTime);

  // Bottom hold specific
  const [bottomHoldTime, setBottomHoldTime] = useState(0);

  // Inhale transition specific
  const [inhaleTransitionTimeLeft, setInhaleTransitionTimeLeft] = useState(3);

  // Recovery hold specific
  const [recoveryTimeLeft, setRecoveryTimeLeft] = useState(recoveryBreathDuration);

  // Reset Exhale specific
  const [resetExhaleTimeLeft, setResetExhaleTimeLeft] = useState(resetExhaleDuration);

  // Stillness specific
  const [stillnessTimeLeft, setStillnessTimeLeft] = useState(stillnessDuration);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSession = () => {
      setCurrentRound(1);
      setPhase('ventilation');
      setBreathPhase('inhale');
      setBreathCount(0);
      setPhaseTimeLeft(breathSpeed / 2);
      setBottomHoldTime(0);
      setInhaleTransitionTimeLeft(3);
      setRecoveryTimeLeft(recoveryBreathDuration);
      setResetExhaleTimeLeft(resetExhaleDuration);
      setStillnessTimeLeft(stillnessDuration);
  };

  // 1. Timer Tick Effect
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      resetSession();
      return;
    }

    timerRef.current = setInterval(() => {
      const step = 0.05; // 50ms ticks
      if (phase === 'ventilation') {
          setPhaseTimeLeft(prev => Math.max(0, prev - step));
      } else if (phase === 'bottomHold') {
          setBottomHoldTime(prev => prev + step);
      } else if (phase === 'inhaleTransition') {
          setInhaleTransitionTimeLeft(prev => Math.max(0, prev - step));
      } else if (phase === 'recoveryHold') {
          setRecoveryTimeLeft(prev => Math.max(0, prev - step));
      } else if (phase === 'resetExhale') {
          setResetExhaleTimeLeft(prev => Math.max(0, prev - step));
      } else if (phase === 'stillness') {
          setStillnessTimeLeft(prev => Math.max(0, prev - step));
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]); 

  // 2. Ventilation Transition Logic
  useEffect(() => {
      if (isActive && phase === 'ventilation' && phaseTimeLeft <= 0) {
          const currentInhaleTime = breathSpeed / 2;
          const currentExhaleTime = breathSpeed / 2;
          
          if (breathPhase === 'inhale') {
              setBreathPhase('exhale');
              setPhaseTimeLeft(currentExhaleTime);
          } else {
              const newCount = breathCount + 1;
              setBreathCount(newCount);
              if (newCount >= breathsPerRound) {
                  setPhase('bottomHold');
                  setBottomHoldTime(0);
              } else {
                  setBreathPhase('inhale');
                  setPhaseTimeLeft(currentInhaleTime);
              }
          }
      }
  }, [isActive, phase, phaseTimeLeft, breathPhase, breathCount, breathsPerRound, breathSpeed]);

  // 3. Inhale Transition Logic
  useEffect(() => {
      if (isActive && phase === 'inhaleTransition' && inhaleTransitionTimeLeft <= 0) {
          setPhase('recoveryHold');
          setRecoveryTimeLeft(recoveryBreathDuration);
      }
  }, [isActive, phase, inhaleTransitionTimeLeft, recoveryBreathDuration]);

  // 4. Recovery Hold Transition Logic
  useEffect(() => {
      if (isActive && phase === 'recoveryHold' && recoveryTimeLeft <= 0) {
          setPhase('resetExhale');
          setResetExhaleTimeLeft(resetExhaleDuration);
      }
  }, [isActive, phase, recoveryTimeLeft, resetExhaleDuration]);

  // 5. Reset Exhale Transition Logic
  useEffect(() => {
      if (isActive && phase === 'resetExhale' && resetExhaleTimeLeft <= 0) {
          setPhase('stillness');
          setStillnessTimeLeft(stillnessDuration);
      }
  }, [isActive, phase, resetExhaleTimeLeft, stillnessDuration]);

  // 6. Stillness Transition Logic
  useEffect(() => {
      if (isActive && phase === 'stillness' && stillnessTimeLeft <= 0) {
          if (currentRound >= targetRounds) {
              setIsActive(false);
          } else {
              setCurrentRound(r => r + 1);
              setPhase('ventilation');
              setBreathPhase('inhale');
              setBreathCount(0);
              setPhaseTimeLeft(breathSpeed / 2);
              setRecoveryTimeLeft(recoveryBreathDuration);
              setResetExhaleTimeLeft(resetExhaleDuration);
              setStillnessTimeLeft(stillnessDuration);
          }
      }
  }, [isActive, phase, stillnessTimeLeft, currentRound, targetRounds, breathSpeed, recoveryBreathDuration, resetExhaleDuration, stillnessDuration]);

  const endSession = () => {
     setIsActive(false);
  };

  const handleNextPhase = () => {
      if (phase === 'bottomHold') {
          setPhase('inhaleTransition');
          setInhaleTransitionTimeLeft(3);
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

                    <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl space-y-8">
                       <SettingSlider label="Target Rounds" value={targetRounds} min={1} max={10} step={1} onChange={setTargetRounds} />
                       <SettingSlider label="Breaths Per Round" value={breathsPerRound} min={10} max={60} step={1} onChange={setBreathsPerRound} />
                       <SettingSlider label="Breath Speed (s)" value={breathSpeed} min={1.5} max={3.0} step={0.25} onChange={setBreathSpeed} />
                       <SettingSlider label="Recovery Breath Duration (s)" value={recoveryBreathDuration} min={10} max={30} step={1} onChange={setRecoveryBreathDuration} />
                       <SettingSlider label="Reset Exhale Duration (s)" value={resetExhaleDuration} min={4} max={8} step={0.5} onChange={setResetExhaleDuration} />
                       <SettingSlider label="Stillness Duration (s)" value={stillnessDuration} min={2} max={30} step={1} onChange={setStillnessDuration} />
                    </div>

                    <div className="mt-auto pt-8 z-10 w-full mb-10">
                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-orange-600 text-white rounded-full font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-500 tracking-wider">DONE</button>
                    </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto my-auto min-h-max pt-20 pb-20">
         
         {/* Simple Circle Graphic Component */}
         <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12 flex items-center justify-center flex-shrink-0">
            {/* Background Base */}
            <div className={`absolute w-full h-full rounded-full border-4 transition-colors duration-500 ${isActive ? 'border-slate-800' : 'border-slate-800'}`}></div>

            {/* Glowing effect inside depending on phase */}
            {isActive && phase === 'ventilation' && (
                <div 
                    className="absolute w-full h-full rounded-full transition-all duration-[50ms] ease-linear border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                    style={{
                        background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0) 70%)',
                        transform: (phase === 'ventilation' && breathPhase === 'inhale') ? `scale(${0.5 + (1 - phaseTimeLeft / inhaleTime) * 0.5})` : `scale(${0.5 + (phaseTimeLeft / exhaleTime) * 0.5})`
                    }}
                ></div>
            )}
            
            {isActive && phase === 'bottomHold' && (
                <div className="absolute w-full h-full rounded-full border-4 border-orange-500/50 scale-100 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                     <span className="absolute w-full h-full rounded-full bg-orange-500/10 animate-pulse"></span>
                </div>
            )}

            {isActive && phase === 'inhaleTransition' && (
                <div 
                    className="absolute w-full h-full rounded-full transition-all duration-[50ms] ease-linear border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                        transform: `scale(${0.5 + (1 - (inhaleTransitionTimeLeft / 3)) * 0.5})`
                    }}
                ></div>
            )}

            {isActive && phase === 'recoveryHold' && (
                <div className="absolute w-full h-full rounded-full flex items-center justify-center scale-100 animate-pulse border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                    <span className="absolute w-full h-full rounded-full bg-white/20"></span>
                </div>
            )}

            {isActive && phase === 'resetExhale' && (
                <div 
                    className="absolute w-full h-full rounded-full transition-all duration-[50ms] ease-linear border-4 border-slate-500 shadow-[0_0_20px_rgba(100,116,139,0.3)]"
                    style={{
                        background: 'radial-gradient(circle, rgba(100,116,139,0.2) 0%, rgba(100,116,139,0) 70%)',
                        transform: `scale(${0.5 + (resetExhaleTimeLeft / resetExhaleDuration) * 0.5})`
                    }}
                ></div>
            )}

            {isActive && phase === 'stillness' && (
                <div className="absolute w-full h-full rounded-full flex items-center justify-center scale-[0.5] border-4 border-slate-700/50">
                     <span className="absolute w-full h-full rounded-full bg-slate-800/50"></span>
                </div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <span className="text-3xl sm:text-4xl font-light tracking-tighter text-white mb-2">
                   {phase === 'ventilation' ? (breathPhase === 'inhale' ? 'IN' : 'OUT') : null}
                   {phase === 'bottomHold' ? 'EXHALE & HOLD' : null}
                   {phase === 'inhaleTransition' ? 'INHALE...' : null}
                   {phase === 'recoveryHold' ? 'HOLD IN' : null}
                   {phase === 'resetExhale' ? 'SLOW EXHALE' : null}
                   {phase === 'stillness' ? 'STILLNESS' : null}
               </span>
            </div>
         </div>

         <div className="text-center z-10 space-y-4 mb-8">
            <div className="flex flex-col gap-6">
                <div>
                    <div className="text-4xl font-mono tracking-widest text-white">
                        {phase === 'bottomHold' ? formatTime(bottomHoldTime) : null}
                        {phase === 'inhaleTransition' ? formatTime(Math.ceil(inhaleTransitionTimeLeft)) : null}
                        {phase === 'recoveryHold' ? formatTime(Math.ceil(recoveryTimeLeft)) : null}
                        {phase === 'resetExhale' ? formatTime(Math.ceil(resetExhaleTimeLeft)) : null}
                        {phase === 'stillness' ? formatTime(Math.ceil(stillnessTimeLeft)) : null}
                        {phase === 'ventilation' ? `${breathCount} / ${breathsPerRound}` : null}
                    </div>
                    <div className="text-xs text-orange-500/80 uppercase font-bold tracking-widest mt-2">
                        {phase === 'bottomHold' ? 'Bottom Hold Time' : null}
                        {phase === 'inhaleTransition' ? 'Inhale' : null}
                        {phase === 'recoveryHold' ? 'Recovery Time' : null}
                        {phase === 'resetExhale' ? 'Exhale' : null}
                        {phase === 'stillness' ? 'Rest' : null}
                        {phase === 'ventilation' ? 'Breaths' : null}
                    </div>
                </div>

                {isActive && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">ROUND</span>
                        <span className="text-lg font-bold text-white">{currentRound} / {targetRounds}</span>
                    </div>
                )}
            </div>
         </div>

         {/* Controls */}
         <div className="flex justify-center z-10 w-full mt-auto pb-8">
            {!isActive ? (
               <button 
                  onClick={() => setIsActive(true)}
                  className="w-full max-w-xs px-10 py-5 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-500 shadow-xl shadow-orange-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" /> START BREATHING
               </button>
            ) : (
                <div className="flex gap-4">
                    {phase === 'bottomHold' ? (
                        <button 
                            onClick={handleNextPhase}
                            className="px-10 py-5 rounded-full bg-white font-bold hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)] text-slate-900 tracking-wider transition-colors"
                        >
                            RECOVERY BREATH
                        </button>
                    ) : null}

                    <button 
                        onClick={() => endSession()}
                        className="p-5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shadow-xl text-slate-300 transition-colors"
                    >
                        <Square className="w-6 h-6 fill-current text-white text-opacity-50" />
                    </button>
                </div>
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
            <span className="font-mono text-slate-200">{value}</span>
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
