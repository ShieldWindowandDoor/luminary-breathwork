"use client";

import React, { useState } from 'react';
import { ArrowLeft, Activity, Wind, Timer } from 'lucide-react';
import BoltTest from './tests/BoltTest';
import Co2Test from './tests/Co2Test';
import BreathRateTest from './tests/BreathRateTest';

const TESTS = [
   {
      id: 'bolt',
      title: 'BOLT Score',
      subtitle: 'Body Oxygen Level Test',
      description: 'Measure your body\'s relative sensitivity to carbon dioxide. An important metric for breathwork progress.',
      icon: Activity,
      color: 'from-blue-500 to-indigo-600'
   },
   {
      id: 'co2',
      title: 'CO2 Discard Test',
      subtitle: 'Exhalation Tolerance',
      description: 'Test your parasympathetic control by extending your exhale until empty. Assesses nervous system recovery.',
      icon: Wind,
      color: 'from-emerald-500 to-teal-600'
   },
   {
      id: 'breath_rate',
      title: 'Breath Rate',
      subtitle: 'Breaths Per Minute (BPM)',
      description: 'Count your natural breaths over 60 seconds to assess your current nervous system state and recovery.',
      icon: Timer,
      color: 'from-violet-500 to-purple-600'
   }
];

export default function Tests() {
   const [activeTest, setActiveTest] = useState<string | null>(null);

   if (activeTest === 'bolt') {
       return (
           <div className="w-full h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-slate-400 hover:text-white p-4 w-max transition-colors">
                   <ArrowLeft className="w-5 h-5" /> Back to Tests
               </button>
               <BoltTest />
           </div>
       );
   }

   if (activeTest === 'co2') {
       return (
           <div className="w-full h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-slate-400 hover:text-white p-4 w-max transition-colors">
                   <ArrowLeft className="w-5 h-5" /> Back to Tests
               </button>
               <Co2Test />
           </div>
       );
   }

   if (activeTest === 'breath_rate') {
       return (
           <div className="w-full h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-slate-400 hover:text-white p-4 w-max transition-colors">
                   <ArrowLeft className="w-5 h-5" /> Back to Tests
               </button>
               <BreathRateTest />
           </div>
       );
   }

   return (
      <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
         <div className="mb-8">
            <h2 className="text-3xl font-light tracking-tight text-slate-100">Diagnostics</h2>
            <p className="text-slate-400 mt-2">Test your respiratory health and baseline metrics</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {TESTS.map(test => (
               <button 
                  key={test.id}
                  onClick={() => setActiveTest(test.id)}
                  className="text-left group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
               >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${test.color} opacity-10 rounded-bl-full blur-2xl transition-opacity group-hover:opacity-20`}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${test.color} flex items-center justify-center shadow-lg`}>
                           <test.icon className="w-6 h-6 text-white" />
                        </div>
                     </div>
                     
                     <h3 className="text-xl font-bold text-white mb-1">{test.title}</h3>
                     <p className="text-sm font-medium text-slate-400 mb-4">{test.subtitle}</p>
                     
                     <p className="text-sm text-slate-500 leading-relaxed mb-6 mt-auto">
                        {test.description}
                     </p>

                     <div className="flex items-center text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                        START TEST <ArrowLeft className="w-4 h-4 ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                     </div>
                  </div>
               </button>
            ))}
         </div>
      </div>
   );
}
