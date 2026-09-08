"use client";

import React from 'react';
import { useAppContext } from '../lib/store';
import { Wind, Timer, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function Progress() {
  const { rhythmicSessions, holdRecords, holdSessions, boltScores, co2Scores, breathRateScores } = useAppContext();

  // Computations
  const totalRhythmicSessions = rhythmicSessions.length;
  const totalRhythmicSeconds = rhythmicSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  
  const totalHoldSessions = holdRecords.length;
  const personalBestHold = holdRecords.reduce((max, r) => Math.max(max, r.durationSeconds), 0);

  const best5HoldSession = holdSessions?.filter(s => s.targetHolds === 5).reduce((max, s) => Math.max(max, s.totalDurationSeconds), 0) || 0;
  const best10HoldSession = holdSessions?.filter(s => s.targetHolds === 10).reduce((max, s) => Math.max(max, s.totalDurationSeconds), 0) || 0;

  const bestBoltScore = boltScores?.reduce((max, s) => Math.max(max, s.durationSeconds), 0) || 0;
  const bestCo2Score = co2Scores?.reduce((max, s) => Math.max(max, s.durationSeconds), 0) || 0;

  const latestBreathRate = breathRateScores?.[0]?.bpm || 0;
  const previousBreathRate = breathRateScores?.[1]?.bpm || 0;

  const getTrendIcon = (current: number, previous: number) => {
     if (!previous || current === 0) return <Minus className="w-4 h-4 text-slate-500" />;
     if (current > previous) return <ArrowUp className="w-4 h-4 text-emerald-400" />;
     if (current < previous) return <ArrowDown className="w-4 h-4 text-indigo-400" />;
     return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}.${Math.floor((mins/60)*10)}h`;
    return `${mins}m`;
  };

  const formatHoldTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTestScore = (seconds: number) => {
    return seconds.toFixed(1) + 's';
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="w-full max-w-2xl mx-auto space-y-8">
         <div className="md:hidden">
           <h2 className="text-3xl font-light tracking-tight select-none pt-4">Insights</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {/* Rhythmic Stats */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col">
               <div className="flex items-center gap-3 mb-6">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rhythmic Breathing</h3>
               </div>
               
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <p className="text-4xl font-light tracking-tighter">{totalRhythmicSessions}</p>
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Total Sessions</p>
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-light tracking-tighter">{formatTime(totalRhythmicSeconds)}</p>
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Total Time</p>
                  </div>
               </div>

               {rhythmicSessions.length > 0 && (
                  <div className="mt-auto">
                     <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Recent</h4>
                     <div className="flex gap-2 h-24 items-end border-b border-slate-800 pb-2">
                        {rhythmicSessions.slice(0, 7).reverse().map((session, i) => {
                           const maxDuration = Math.max(...rhythmicSessions.map(s => s.durationSeconds));
                           const heightPct = Math.max(20, (session.durationSeconds / maxDuration) * 100);
                           return (
                              <div key={session.id} className="flex-1 group relative flex flex-col justify-end h-[90%]">
                                 <div 
                                    className="w-full bg-indigo-500/20 hover:bg-indigo-500 rounded-t-sm transition-colors" 
                                    style={{ height: `${heightPct}%` }}
                                 ></div>
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {Math.round(session.durationSeconds / 60)}m
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               )}
            </div>

            {/* Hold Stats */}
            <div className="p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col">
               <div className="flex items-center gap-3 mb-6">
                  <Timer className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Breath Holds</h3>
               </div>
               
               <div className="mb-8">
                  <p className="text-5xl font-light tracking-tighter text-white">{formatHoldTime(personalBestHold)}</p>
                  <p className="text-xs text-indigo-300/60 mt-2 uppercase tracking-wider font-bold">Max Breath Hold (Record)</p>
               </div>
               
               <div className="mt-auto flex flex-col gap-4 border-t border-indigo-500/20 pt-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-2xl font-light">{totalHoldSessions}</p>
                        <p className="text-[10px] text-indigo-300/60 uppercase font-bold tracking-widest">Total Holds</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-4 w-full">
                     <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-indigo-500/10">
                        <p className="text-xl font-light text-indigo-200">{formatHoldTime(best5HoldSession)}</p>
                        <p className="text-[10px] text-indigo-300/60 uppercase font-bold tracking-widest mt-1">Best 5-Hold</p>
                     </div>
                     <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-indigo-500/10">
                        <p className="text-xl font-light text-indigo-200">{formatHoldTime(best10HoldSession)}</p>
                        <p className="text-[10px] text-indigo-300/60 uppercase font-bold tracking-widest mt-1">Best 10-Hold</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Diagnostics */}
         <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <Activity className="w-5 h-5 text-emerald-400" />
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diagnostic Tests</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
               <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BOLT Score Best</h4>
                   </div>
                   <div className="flex items-end gap-2">
                      <span className="text-3xl font-mono text-indigo-400">{formatTestScore(bestBoltScore)}</span>
                   </div>
               </div>

               <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CO2 Discard Best</h4>
                   </div>
                   <div className="flex items-end gap-2">
                      <span className="text-3xl font-mono text-emerald-400">{formatTestScore(bestCo2Score)}</span>
                   </div>
               </div>

                <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 sm:col-span-2">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latest Breath Rate</h4>
                       <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
                           {getTrendIcon(latestBreathRate, previousBreathRate)}
                           {previousBreathRate > 0 && <span className="text-xs text-slate-400 font-mono">{previousBreathRate} <span className="text-[10px]">BPM</span></span>}
                       </div>
                    </div>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-mono text-violet-400">{latestBreathRate > 0 ? latestBreathRate : '--'}</span>
                       <span className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1.5">{latestBreathRate > 0 ? 'BPM' : ''}</span>
                    </div>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-20">
             {/* History list for holds */}
             {holdRecords.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Recent Holds</h3>
                   <div className="space-y-4">
                      {holdRecords.slice(0, 5).map(record => (
                         <div key={record.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                            <span className="text-sm font-medium text-slate-300">{formatDate(record.date)}</span>
                            <span className="font-mono text-indigo-400 text-lg">{formatHoldTime(record.durationSeconds)}</span>
                         </div>
                      ))}
                   </div>
                </div>
             )}

             {/* History list for Breath Rate */}
             {breathRateScores && breathRateScores.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Recent Breath Rates</h3>
                   <div className="space-y-4">
                      {breathRateScores.slice(0, 5).map(record => (
                         <div key={record.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                            <span className="text-sm font-medium text-slate-300">{formatDate(record.date)}</span>
                            <span className="font-mono text-violet-400 text-lg">{record.bpm} <span className="text-xs text-slate-500">BPM</span></span>
                         </div>
                      ))}
                   </div>
                </div>
             )}
         </div>
      </div>
    </div>
  );
}

