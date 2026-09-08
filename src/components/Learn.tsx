"use client";

import { useState } from "react";

const ARTICLES = [
  {
    id: "mechanics",
    title: "What the breath is actually doing",
    body: "Breathing is the only autonomic rhythm you can steer on purpose. Slow nasal breathing raises carbon dioxide slightly, which usually increases oxygen delivery at the tissue level (Bohr effect) and can increase heart-rate variability. Fast mouth breathing does the opposite: it blows off CO2, can make you lightheaded, and is why advanced methods should be done seated or lying down — never in water.",
  },
  {
    id: "nose",
    title: "Why the nose is the default",
    body: "The nose filters, humidifies, and produces nitric oxide, which helps open airways and blood vessels. Unless a protocol specifically asks for a mouth exhale (physiological sigh, some sleep downshifts), inhale through the nose. If you are congested, slow down rather than switching to heavy mouth breathing.",
  },
  {
    id: "holds",
    title: "Holds without hurting your voice",
    body: "A glottal lock — clamping the throat — is how people get a creaky sound and a raspy voice after holds. Keep the jaw soft and the airway open, as if you could still mouth the word “ahh.” The seal should be diaphragmatic. If you have to unstick your throat to speak, you were holding it in the wrong place.",
  },
  {
    id: "co2",
    title: "CO2 is not the enemy",
    body: "The urge to breathe is driven mostly by CO2, not by empty lungs. Training is about staying comfortable at a slightly higher CO2, not collecting scary max holds. BOLT and first-urge holds are better progress markers than a once-a-year heroic number.",
  },
  {
    id: "sigh",
    title: "The physiological sigh",
    body: "A full inhale, a second sip of air, and a long exhale is one of the fastest voluntary ways to drop arousal. Two or three cycles are often enough in a meeting or before sleep. It is not a replacement for medical care if panic is frequent.",
  },
  {
    id: "sleep",
    title: "Night practice",
    body: "Evening work should emphasize longer exhales, humming, and 4-7-8. Avoid breath of fire, tummo, and hard holds in the last hour before bed. Lights down, jaw unclenched, stop when you yawn.",
  },
  {
    id: "safety",
    title: "Hard stops",
    body: "No breathwork in water, in the bath, while driving, or standing on a height. Stop for chest pain, severe dizziness, or tetany. If you are pregnant or have cardiovascular, seizure, or significant respiratory disease, get clinical advice first. This app is educational, not a clinic.",
  },
  {
    id: "progress",
    title: "How to know it is working",
    body: "Useful signs: easier nasal breathing at rest, a calmer baseline breath rate, a slowly rising BOLT, and the ability to take a hold without panic. Useless signs: forcing a new personal record every session. Rest days are part of the protocol.",
  },
];

export default function Learn() {
  const [open, setOpen] = useState(ARTICLES[0].id);
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-3xl font-light mb-2">Learn</h2>
      <p className="text-slate-400 mb-8">Short field notes. Not medical advice.</p>
      <div className="space-y-3 pb-16">
        {ARTICLES.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpen(open === a.id ? "" : a.id)}
            className="w-full text-left p-5 rounded-2xl bg-slate-900 border border-slate-800"
          >
            <h3 className="text-lg font-medium">{a.title}</h3>
            {open === a.id && <p className="text-sm text-slate-400 mt-3 leading-relaxed">{a.body}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
