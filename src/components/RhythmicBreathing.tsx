"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Settings, Volume2, VolumeX, Bell, BellOff, X, Wind } from 'lucide-react';
import { audio } from '../lib/audio';
import { useAppContext } from '../lib/store';

type Phase = 'inhale' | 'topHold' | 'exhale' | 'bottomHold' | 'idle';
type LimitMode = 'time' | 'breaths';

const PRESETS = [
  { name: 'Calm 4-6', inhale: 4, top: 0, exhale: 6, bottom: 0 },
  { name: 'Box 4', inhale: 4, top: 4, exhale: 4, bottom: 4 },
  { name: 'Sleep 4-7-8', inhale: 4, top: 7, exhale: 8, bottom: 0 },
  { name: 'Triangle', inhale: 4, top: 4, exhale: 4, bottom: 0 },
  { name: 'Tactical', inhale: 4, top: 4, exhale: 6, bottom: 2 },
  { name: 'Coherent', inhale: 5, top: 0, exhale: 5, bottom: 0 },
  { name: 'Voice', inhale: 4, top: 4, exhale: 8, bottom: 0 },
  { name: 'Power', inhale: 3, top: 0, exhale: 6, bottom: 0 },
];

export default function RhythmicBreathing() {
  const { addRhythmicSession } = useAppContext();
  
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Can be used to toggle on mobile if needed
  
  // Settings
  const [limitMode, setLimitMode] = useState<LimitMode>('time');
  const [sessionLengthMin, setSessionLengthMin] = useState(5);
  const [sessionLengthBreaths, setSessionLengthBreaths] = useState(30);

  const [inhaleTime, setInhaleTime] = useState(4.0);
  const [topHoldTime, setTopHoldTime] = useState(4.0);
  const [exhaleTime, setExhaleTime] = useState(6.0);
  const [bottomHoldTime, setBottomHoldTime] = useState(0.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgSoundEnabled, setBgSoundEnabled] = useState(true);
  
  // State
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionLengthMin * 60);
  const [currentPhase, setCurrentPhase] = useState<Phase>('idle');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [breathsCompleted, setBreathsCompleted] = useState(0);
  const [savedNote, setSavedNote] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalPhaseTime = useRef(0);
  const elapsedRef = useRef(0);
  const breathsRef = useRef(0);
  const savedRef = useRef(false);
  const addSessionRef = useRef(addRhythmicSession);
  const settingsRef = useRef({ inhaleTime, topHoldTime, exhaleTime, bottomHoldTime });
  addSessionRef.current = addRhythmicSession;
  settingsRef.current = { inhaleTime, topHoldTime, exhaleTime, bottomHoldTime };

  const persistSession = (completed: boolean) => {
    if (savedRef.current) return;
    const elapsed = Math.round(elapsedRef.current);
    if (!completed && elapsed < 8) return;
    savedRef.current = true;
    const s = settingsRef.current;
    addSessionRef.current({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationSeconds: Math.max(elapsed, 1),
      breaths: breathsRef.current,
      inhale: s.inhaleTime,
      topHold: s.topHoldTime,
      exhale: s.exhaleTime,
      bottomHold: s.bottomHoldTime,
    });
    const seconds = Math.max(elapsed, 1);
    setSavedNote(
      seconds >= 60
        ? `Logged ${Math.floor(seconds / 60)}m ${seconds % 60}s · ${breathsRef.current} breaths`
        : `Logged ${seconds}s · ${breathsRef.current} breaths`
    );
  };

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(limitMode === "time" ? sessionLengthMin * 60 : 0);
      setBreathsCompleted(0);
      setCurrentPhase("idle");
      audio.stopBackgroundLayer();
      return;
    }

    savedRef.current = false;
    elapsedRef.current = 0;
    breathsRef.current = 0;
    setSavedNote("");
    audio.init();
    if (bgSoundEnabled) audio.startBackgroundLayer();

    let currentPhaseLocal: Phase = "inhale";
    let phaseTimeRemainingLocal = inhaleTime;
    let sessionTimeRemainingLocal = limitMode === "time" ? sessionLengthMin * 60 : 0;
    let breathsDoneLocal = 0;

    setCurrentPhase(currentPhaseLocal);
    setPhaseTimeLeft(phaseTimeRemainingLocal);
    setSessionTimeLeft(sessionTimeRemainingLocal);
    setBreathsCompleted(0);
    totalPhaseTime.current = phaseTimeRemainingLocal;

    const finish = (completed: boolean) => {
      persistSession(completed);
      setIsActive(false);
    };

    const startPhase = (nextPhase: Phase) => {
      currentPhaseLocal = nextPhase;
      let time = 0;
      if (nextPhase === "inhale") {
        time = inhaleTime;
        if (soundEnabled && time > 0) audio.playDing(659.25);
      } else if (nextPhase === "topHold") {
        time = topHoldTime;
        if (soundEnabled && time > 0) audio.playDing(880);
      } else if (nextPhase === "exhale") {
        time = exhaleTime;
        if (soundEnabled && time > 0) audio.playDing(440);
      } else if (nextPhase === "bottomHold") {
        time = bottomHoldTime;
        if (soundEnabled && time > 0) audio.playDing(329.63);
      }

      if (time === 0) {
        if (nextPhase === "inhale") startPhase("topHold");
        else if (nextPhase === "topHold") startPhase("exhale");
        else if (nextPhase === "exhale") startPhase("bottomHold");
        else if (nextPhase === "bottomHold") {
          breathsDoneLocal++;
          breathsRef.current = breathsDoneLocal;
          setBreathsCompleted(breathsDoneLocal);
          startPhase("inhale");
        }
        return;
      }

      setCurrentPhase(currentPhaseLocal);
      phaseTimeRemainingLocal = time;
      setPhaseTimeLeft(time);
      totalPhaseTime.current = time;
    };

    startPhase("inhale");

    timerRef.current = setInterval(() => {
      const step = 0.1;
      elapsedRef.current += step;

      if (limitMode === "time") {
        sessionTimeRemainingLocal -= step;
        setSessionTimeLeft(Math.max(0, sessionTimeRemainingLocal));
        if (sessionTimeRemainingLocal <= 0) {
          finish(true);
          return;
        }
      } else {
        sessionTimeRemainingLocal += step;
        setSessionTimeLeft(sessionTimeRemainingLocal);
      }

      phaseTimeRemainingLocal -= step;
      setPhaseTimeLeft(Math.max(0, phaseTimeRemainingLocal));

      if (phaseTimeRemainingLocal <= 0.05) {
        if (currentPhaseLocal === "inhale") startPhase("topHold");
        else if (currentPhaseLocal === "topHold") startPhase("exhale");
        else if (currentPhaseLocal === "exhale") startPhase("bottomHold");
        else if (currentPhaseLocal === "bottomHold") {
          breathsDoneLocal++;
          breathsRef.current = breathsDoneLocal;
          setBreathsCompleted(breathsDoneLocal);
          if (limitMode === "breaths" && breathsDoneLocal >= sessionLengthBreaths) {
            finish(true);
            return;
          }
          startPhase("inhale");
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, limitMode, sessionLengthMin, sessionLengthBreaths]);

  const endSession = (completed: boolean) => {
    persistSession(completed);
    setIsActive(false);
    audio.stopBackgroundLayer();
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getPhaseText = () => {
    switch (currentPhase) {
        case 'inhale': return 'Inhale';
        case 'topHold': return 'Hold';
        case 'exhale': return 'Exhale';
        case 'bottomHold': return 'Hold';
        default: return 'Ready';
    }
  };

  const getCircleAnimation = () => {
     if (currentPhase === 'idle') return { scale: 1, opacity: 0.5 };
     if (currentPhase === 'inhale') return { scale: 1.5, opacity: 1, transition: { duration: totalPhaseTime.current, ease: 'linear' as const } };
     if (currentPhase === 'topHold') return { scale: 1.5, opacity: 1, transition: { duration: 0.1 } };
     if (currentPhase === 'exhale') return { scale: 1, opacity: 0.8, transition: { duration: totalPhaseTime.current, ease: 'linear' as const } };
     if (currentPhase === 'bottomHold') return { scale: 1, opacity: 0.8, transition: { duration: 0.1 } };
     return { scale: 1, opacity: 1 };
  };

  return (
    <div className="flex flex-col h-full relative p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-20">
        {!isActive && !showSettings && (
          <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700 transition">
             <Settings className="w-5 h-5 text-slate-300" />
          </button>
        )}
      </div>

      <AnimatePresence>
         {showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 overflow-y-auto p-4 sm:p-8 pt-16 shadow-2xl flex flex-col gap-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
               <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-light text-slate-100">Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Duration</h3>
                  
                  <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
                     <button 
                        onClick={() => setLimitMode('time')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${limitMode === 'time' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                     >Time</button>
                     <button 
                        onClick={() => setLimitMode('breaths')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${limitMode === 'breaths' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                     >Breaths</button>
                  </div>

                  {limitMode === 'time' ? (
                   <SettingSlider label="Session Length (min)" value={sessionLengthMin} min={1} max={60} step={1} onChange={setSessionLengthMin} />
               ) : (
                   <SettingSlider label="Session Length (breaths)" value={sessionLengthBreaths} min={5} max={500} step={1} onChange={setSessionLengthBreaths} />
               )}
               </div>

               <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Breath Rhythm</h3>
                  <div className="space-y-6">
                     <SettingSlider label="Inhale (s)" value={inhaleTime} min={1} max={20} step={0.5} onChange={setInhaleTime} />
                     <SettingSlider label="Top Hold (s)" value={topHoldTime} min={0} max={20} step={0.5} onChange={setTopHoldTime} />
                     <SettingSlider label="Exhale (s)" value={exhaleTime} min={1} max={20} step={0.5} onChange={setExhaleTime} />
                     <SettingSlider label="Bottom Hold (s)" value={bottomHoldTime} min={0} max={20} step={0.5} onChange={setBottomHoldTime} />
                  </div>
               </div>

               <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Audio Settings</h3>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Phase Bells</span>
                        <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-10 h-5 rounded-full relative shadow-inner cursor-pointer transition-colors ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${soundEnabled ? 'right-1' : 'translate-x-1'}`}></div>
                        </button>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Background Sound</span>
                        <button onClick={() => setBgSoundEnabled(!bgSoundEnabled)} className={`w-10 h-5 rounded-full relative shadow-inner cursor-pointer transition-colors ${bgSoundEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${bgSoundEnabled ? 'right-1' : 'translate-x-1'}`}></div>
                        </button>
                     </div>
                  </div>
               </div>
               
               <div className="sticky bottom-0 pb-4 pt-4 bg-slate-900/95 md:bg-transparent md:pt-0 md:pb-0 z-10 w-full mb-10">
                  <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 tracking-wider">DONE</button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Main Breathing Area */}
      <div className="flex-1 flex flex-col items-center justify-between py-2 sm:py-6 w-full min-h-max relative pt-16">
         
         <div className="hidden md:block"></div>

         <div className="flex flex-col items-center justify-center w-full mt-auto md:mt-0">
            {!isActive && (
               <div className="text-center mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center shadow-inner mb-4 sm:mb-6">
                     <Wind className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">Ready to breathe?</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mb-4">Pick a preset or open settings for full control.</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto pointer-events-auto">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          setInhaleTime(p.inhale);
                          setTopHoldTime(p.top);
                          setExhaleTime(p.exhale);
                          setBottomHoldTime(p.bottom);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          inhaleTime === p.inhale && topHoldTime === p.top && exhaleTime === p.exhale && bottomHoldTime === p.bottom
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
               </div>
            )}
            <div className="relative w-full max-w-[280px] sm:max-w-sm aspect-square flex flex-shrink-0 items-center justify-center pointer-events-none mb-8 md:mb-12">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full border border-slate-800 opacity-20"></div>
                  {isActive && <div className="absolute w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] rounded-full border border-indigo-500/20 animate-[pulse_4s_ease-in-out_infinite]"></div>}
               </div>

               <motion.div 
                  className="relative z-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center"
                  animate={getCircleAnimation()}
               >
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tighter text-white">{getPhaseText()}</span>
                  {isActive && (
                     <span className="text-xs sm:text-sm opacity-60 mt-1 uppercase tracking-widest">{phaseTimeLeft.toFixed(1)}s</span>
                  )}
               </motion.div>
            </div>
            
            <div className="text-center z-10 space-y-4">
               <div>
                   <div className="text-3xl sm:text-4xl font-mono tracking-widest text-white">{formatTime(limitMode === 'time' && !isActive ? sessionLengthMin * 60 : sessionTimeLeft)}</div>
                   <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-widest mt-2">
                      {limitMode === 'time' && isActive ? 'Time Remaining' : (limitMode === 'breaths' && isActive ? 'Elapsed Time' : 'Session Duration')}
                   </div>
               </div>
               
               {(limitMode === 'breaths' || isActive) && (
                   <div>
                      <div className="text-xl sm:text-2xl font-mono tracking-widest text-indigo-400">
                         {breathsCompleted} {limitMode === 'breaths' && !isActive ? `/ ${sessionLengthBreaths}` : (limitMode === 'breaths' && isActive ? `/ ${sessionLengthBreaths}` : '')}
                      </div>
                      <div className="text-[10px] sm:text-xs text-indigo-400/60 uppercase font-bold tracking-widest mt-1">Breaths</div>
                   </div>
               )}
            </div>
         </div>

         {/* Controls */}
         <div className="flex justify-center z-10 w-full px-4 md:px-0 mt-auto mb-4 md:mb-0">
            {!isActive ? (
               <div className="w-full md:w-auto flex flex-col items-center gap-3">
                 {savedNote && (
                   <p className="text-sm font-medium text-emerald-400">{savedNote}</p>
                 )}
               <button 
                  onClick={() => setIsActive(true)}
                  className="w-full md:w-auto px-10 py-5 rounded-full bg-indigo-600 font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" /> START SESSION
               </button>
               </div>
            ) : (
               <button 
                  onClick={() => endSession(false)}
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
