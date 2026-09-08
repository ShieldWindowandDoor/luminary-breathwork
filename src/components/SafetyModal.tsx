"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../lib/store';

export default function SafetyModal() {
  const { isSafetyModalOpen, setSafetyModalOpen } = useAppContext();

  return (
    <AnimatePresence>
       {isSafetyModalOpen && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col"
          >
              <div className="max-w-xl mx-auto w-full flex flex-col pb-8 pt-4 gap-6">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                     <h2 className="text-2xl font-light text-slate-100 flex items-center gap-2">
                         <Info className="w-6 h-6 text-indigo-400" /> Safety & Info
                     </h2>
                     <button onClick={() => setSafetyModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
                      
                      {/* General Safety & Disclaimers */}
                      <section className="space-y-4">
                          <h3 className="text-amber-400 font-bold flex items-center gap-2 text-lg">
                              <AlertTriangle className="w-5 h-5" /> When NOT to do breathwork
                          </h3>
                          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80">
                              <ul className="space-y-2 list-disc pl-5">
                                  <li><strong>Never practice breathwork in or near water.</strong> This includes pools, baths, or open water, due to the risk of shallow water blackout.</li>
                                  <li><strong>Never practice while driving or operating heavy machinery.</strong> Altering your breathing can cause lightheadedness or fainting.</li>
                                  <li><strong>Wait after eating.</strong> Avoid intense breathwork for at least 1-2 hours after a heavy meal.</li>
                              </ul>
                          </div>
                      </section>

                      <section className="space-y-4">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Physiological Warnings
                          </h3>
                          <p className="text-slate-400">If you experience any of the following, stop immediately and return to your natural breathing pattern:</p>
                          <ul className="space-y-2 text-slate-400 list-disc pl-5">
                              <li>Severe dizziness, lightheadedness, or vertigo.</li>
                              <li>Pain in the chest or heart palpitations.</li>
                              <li>Intense tingling in the hands, face, or feet (some mild tingling during rapid breathing is normal, but cramping or "tetany" is a sign to slow down).</li>
                          </ul>
                      </section>

                      <hr className="border-slate-800" />

                      {/* Vocal Cord Specific (From previous iteration but un-producer'd) */}
                      <section className="space-y-4">
                        <h3 className="text-white font-bold text-lg">Pro Tip: The "Open Throat" Hold</h3>
                        <p className="mb-4">Don't hold the breath in your throat. Keep your jaw relaxed and your airway open to protect your voice. Protecting your vocal health is just as important as the breathwork itself!</p>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white font-bold mb-1">What is that creaking sound?</h4>
                                <p className="text-slate-400">The "creaking" is likely coming from your glottis (the opening between your vocal cords).</p>
                                <ul className="mt-2 space-y-2 text-slate-400 list-disc pl-5">
                                    <li><strong>The Problem:</strong> Instead of using your diaphragm and chest muscles to hold the breath, you are likely "locking" your throat. This is called a Glottic Closure.</li>
                                    <li><strong>The Noise:</strong> When you hold your breath with your throat, the pressure from your lungs pushes against your vocal cords. Tiny amounts of air may "vibrate" through the cords, creating that creaking or "clicking" sound.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-white font-bold mb-1">Why is your voice raspy afterward?</h4>
                                <p className="text-slate-400">Your vocal cords are delicate. When you use them to hold back the high pressure of a full lung of air, you are essentially "squeezing" them together with extreme force.</p>
                                <ul className="mt-2 space-y-2 text-slate-400 list-disc pl-5">
                                    <li><strong>Vocal Strain:</strong> This creates temporary inflammation or "fatigue" in the folds.</li>
                                    <li><strong>The Result:</strong> Your voice sounds raspy or "cuts out" because the cords are slightly swollen or irritated and can't vibrate smoothly.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <h4 className="text-indigo-400 font-bold mb-2">How to fix it</h4>
                            <p className="text-slate-300 mb-2">To stop the creaking and save your voice, you need to learn to hold the breath lower in your body.</p>
                            <ul className="space-y-2 text-slate-300 list-disc pl-5">
                                <li><strong>Keep the Airway Open:</strong> Imagine you are about to say "Ahhh." Your throat should remain open during the hold.</li>
                                <li><strong>Use the "Lock" Below:</strong> The "seal" should happen at your diaphragm and chest muscles, not your neck.</li>
                                <li><strong>The Test:</strong> If you can still move your tongue and "mouth" words during a breath hold without air escaping, your throat is relaxed. If you have to "unstick" your throat to speak, you were holding it wrong.</li>
                            </ul>
                        </div>
                      </section>

                      <hr className="border-slate-800" />

                      <section className="space-y-4">
                          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Legal Disclaimer</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                              This application is provided for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you have a history of cardiovascular disease, high blood pressure, asthma, epilepsy, or are pregnant, please consult your doctor before engaging in breathwork practices.
                          </p>
                      </section>

                  </div>
                  
                  <div className="mt-8">
                      <button onClick={() => setSafetyModalOpen(false)} className="w-full py-4 bg-slate-800 text-white rounded-full font-bold shadow-xl hover:bg-slate-700 tracking-wider">I UNDERSTAND</button>
                  </div>
              </div>
          </motion.div>
       )}
    </AnimatePresence>
  );
}
