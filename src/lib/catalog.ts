export type Goal =
  | "calm"
  | "sleep"
  | "energy"
  | "focus"
  | "recovery"
  | "endurance"
  | "voice";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Phase = "inhale" | "topHold" | "exhale" | "bottomHold";

export type DedicatedId =
  | "alternate_nostril"
  | "box_breathing"
  | "sleep_478"
  | "calming_48"
  | "resonance"
  | "breath_of_fire"
  | "wim_hof"
  | "fibonacci";

export interface PatternConfig {
  inhale: number;
  topHold: number;
  exhale: number;
  bottomHold: number;
  phaseLabels?: Partial<Record<Phase, string>>;
  lockTimings?: boolean;
  defaultBreaths: number;
  defaultMinutes: number;
}

export interface ExerciseDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cue: string;
  color: string;
  level: Level;
  goals: Goal[];
  dedicated?: boolean;
  pattern?: PatternConfig;
}

export const EXERCISE_CATALOG: ExerciseDef[] = [
  {
    id: "alternate_nostril",
    title: "Alternate Nostril",
    subtitle: "Nadi Shodhana",
    description: "Balances the left and right hemispheres. Promotes relaxation, clarity, and focus.",
    cue: "Use the thumb and ring finger to switch nostrils with a slow, even pace.",
    color: "from-blue-500 to-indigo-600",
    level: "Beginner",
    goals: ["calm", "focus"],
    dedicated: true,
  },
  {
    id: "box_breathing",
    title: "Box Breathing",
    subtitle: "Sama Vritti",
    description: "Equal duration in all four phases. A tactical reset for stress and decision-making.",
    cue: "Keep the four sides equal. Soften the throat on the holds.",
    color: "from-emerald-400 to-teal-500",
    level: "Beginner",
    goals: ["calm", "focus"],
    dedicated: true,
  },
  {
    id: "sleep_478",
    title: "4-7-8 Breathing",
    subtitle: "The Relaxing Breath",
    description: "Inhale 4, hold 7, exhale 8. A downshift for the nervous system before sleep.",
    cue: "Make the exhale quiet and complete. Sit or lie down.",
    color: "from-purple-500 to-indigo-800",
    level: "Beginner",
    goals: ["sleep", "calm"],
    dedicated: true,
  },
  {
    id: "calming_48",
    title: "4-8 Breathing",
    subtitle: "Parasympathetic Activation",
    description: "Inhale 4, exhale 8. Lengthening the exhale slows heart rate.",
    cue: "Never force the empty lung. Stop if you feel air hunger.",
    color: "from-teal-400 to-cyan-600",
    level: "Beginner",
    goals: ["calm", "recovery"],
    dedicated: true,
  },
  {
    id: "resonance",
    title: "Resonance Frequency",
    subtitle: "HRV Coherence",
    description: "About 5.5 breaths per minute to synchronize heart, lungs, and baroreflex.",
    cue: "Breathe low and smooth. No pauses unless they feel natural.",
    color: "from-pink-500 to-rose-600",
    level: "Intermediate",
    goals: ["focus", "recovery"],
    dedicated: true,
  },
  {
    id: "breath_of_fire",
    title: "Breath of Fire",
    subtitle: "Kapalabhati",
    description: "Rapid, rhythmic breathing that builds heat and alertness.",
    cue: "Keep this seated, never near water, and stop if you get dizzy.",
    color: "from-orange-500 to-red-600",
    level: "Advanced",
    goals: ["energy"],
    dedicated: true,
  },
  {
    id: "wim_hof",
    title: "Tummo Breathing",
    subtitle: "Inner Fire Method",
    description: "Rounds of deep circular breaths followed by an extended empty hold.",
    cue: "Sit or lie down. Never in water or while driving.",
    color: "from-yellow-400 to-orange-500",
    level: "Advanced",
    goals: ["energy", "endurance"],
    dedicated: true,
  },
  {
    id: "fibonacci",
    title: "Fibonacci Rhythm",
    subtitle: "Sacred Breath Geometry",
    description: "Ascending and descending counts based on the Fibonacci sequence.",
    cue: "Stay relaxed as counts grow. Skip a stage if it feels strained.",
    color: "from-amber-400 to-amber-700",
    level: "Intermediate",
    goals: ["focus", "calm"],
    dedicated: true,
  },
  {
    id: "phys_sigh",
    title: "Physiological Sigh",
    subtitle: "Double Inhale Reset",
    description: "A sip-in after a full inhale, then a long exhale. Fastest known downshift for acute stress.",
    cue: "First inhale through the nose, small second sip, long slow exhale through the mouth.",
    color: "from-sky-400 to-indigo-500",
    level: "Beginner",
    goals: ["calm", "recovery"],
    pattern: {
      inhale: 2,
      topHold: 1,
      exhale: 6,
      bottomHold: 0,
      phaseLabels: { inhale: "Inhale", topHold: "Sip", exhale: "Long exhale" },
      defaultBreaths: 6,
      defaultMinutes: 2,
    },
  },
  {
    id: "triangle",
    title: "Triangle Breathing",
    subtitle: "Inhale · Hold · Exhale",
    description: "Three-sided cadence that trains even control without a bottom hold.",
    cue: "Keep the hold open-throated. Do not lock the jaw.",
    color: "from-violet-400 to-fuchsia-600",
    level: "Beginner",
    goals: ["focus", "calm"],
    pattern: {
      inhale: 4,
      topHold: 4,
      exhale: 4,
      bottomHold: 0,
      defaultBreaths: 20,
      defaultMinutes: 5,
    },
  },
  {
    id: "coherent_6",
    title: "Coherent 6",
    subtitle: "6 Breaths / Minute",
    description: "Five-second inhale, five-second exhale. A classic HRV training cadence.",
    cue: "Breathe as if fogging a mirror on the exhale — silent and even.",
    color: "from-cyan-400 to-blue-600",
    level: "Beginner",
    goals: ["focus", "recovery"],
    pattern: {
      inhale: 5,
      topHold: 0,
      exhale: 5,
      bottomHold: 0,
      lockTimings: true,
      defaultBreaths: 36,
      defaultMinutes: 6,
    },
  },
  {
    id: "tactical_reset",
    title: "Tactical Reset",
    subtitle: "4-4-6-2",
    description: "Slightly longer exhale with a short empty pause. Used as a performance reset.",
    cue: "Stay tall. Eyes soft. One cycle at a time.",
    color: "from-slate-400 to-indigo-700",
    level: "Intermediate",
    goals: ["focus", "energy"],
    pattern: {
      inhale: 4,
      topHold: 4,
      exhale: 6,
      bottomHold: 2,
      defaultBreaths: 16,
      defaultMinutes: 5,
    },
  },
  {
    id: "straw_exhale",
    title: "Straw Exhale",
    subtitle: "Pursed-Lip Control",
    description: "Long, resisted exhales train CO2 tolerance without aggressive holds.",
    cue: "Exhale as if through a thin straw. Shoulders stay heavy.",
    color: "from-lime-400 to-emerald-700",
    level: "Beginner",
    goals: ["calm", "endurance", "voice"],
    pattern: {
      inhale: 4,
      topHold: 0,
      exhale: 8,
      bottomHold: 1,
      phaseLabels: { exhale: "Straw exhale", bottomHold: "Soft pause" },
      defaultBreaths: 16,
      defaultMinutes: 5,
    },
  },
  {
    id: "ujjayi",
    title: "Ocean Breath",
    subtitle: "Ujjayi",
    description: "Slight throat constriction creates an ocean sound and steadies attention.",
    cue: "Whisper an “hhh” in the throat on inhale and exhale. Never strain.",
    color: "from-indigo-400 to-cyan-700",
    level: "Intermediate",
    goals: ["focus", "voice", "calm"],
    pattern: {
      inhale: 4,
      topHold: 1,
      exhale: 6,
      bottomHold: 0,
      phaseLabels: { inhale: "Ocean in", exhale: "Ocean out" },
      defaultBreaths: 20,
      defaultMinutes: 6,
    },
  },
  {
    id: "bhramari",
    title: "Humming Bee",
    subtitle: "Bhramari",
    description: "A humming exhale vibrates the vagus pathway and quiets mental chatter.",
    cue: "Inhale quietly, then hum the entire exhale with lips closed.",
    color: "from-amber-300 to-rose-500",
    level: "Beginner",
    goals: ["calm", "sleep", "voice"],
    pattern: {
      inhale: 4,
      topHold: 0,
      exhale: 8,
      bottomHold: 0,
      phaseLabels: { exhale: "Hum" },
      defaultBreaths: 12,
      defaultMinutes: 4,
    },
  },
  {
    id: "sitali",
    title: "Cooling Breath",
    subtitle: "Sitali",
    description: "Inhale through a curled tongue or teeth, exhale through the nose to cool down.",
    cue: "If you cannot curl the tongue, inhale through slightly parted teeth.",
    color: "from-teal-300 to-sky-600",
    level: "Beginner",
    goals: ["recovery", "calm"],
    pattern: {
      inhale: 4,
      topHold: 0,
      exhale: 6,
      bottomHold: 0,
      phaseLabels: { inhale: "Cool in", exhale: "Nose out" },
      defaultBreaths: 16,
      defaultMinutes: 4,
    },
  },
  {
    id: "power_ratio",
    title: "Power Ratio",
    subtitle: "3 · 0 · 6 · 0",
    description: "Short inhale, doubled exhale. Energizing without hyperventilation.",
    cue: "Keep the inhale crisp and the exhale complete, not blasted.",
    color: "from-orange-400 to-red-500",
    level: "Intermediate",
    goals: ["energy", "focus"],
    pattern: {
      inhale: 3,
      topHold: 0,
      exhale: 6,
      bottomHold: 0,
      defaultBreaths: 24,
      defaultMinutes: 5,
    },
  },
  {
    id: "morning_charge",
    title: "Morning Charge",
    subtitle: "Wake Protocol",
    description: "Even cadence with a brief top hold to greet the day without coffee-jitters breathing.",
    cue: "Sit near light if you can. Keep the holds gentle.",
    color: "from-yellow-300 to-orange-500",
    level: "Beginner",
    goals: ["energy", "focus"],
    pattern: {
      inhale: 4,
      topHold: 2,
      exhale: 4,
      bottomHold: 0,
      defaultBreaths: 20,
      defaultMinutes: 5,
    },
  },
  {
    id: "pre_sleep_wave",
    title: "Pre-Sleep Wave",
    subtitle: "Downshift Cadence",
    description: "Longer exhales and a soft empty pause to prepare for sleep.",
    cue: "Lights low. Jaw unclenched. Stop if you yawn — that is success.",
    color: "from-indigo-700 to-slate-900",
    level: "Beginner",
    goals: ["sleep", "calm"],
    pattern: {
      inhale: 3,
      topHold: 0,
      exhale: 7,
      bottomHold: 2,
      defaultBreaths: 15,
      defaultMinutes: 8,
    },
  },
  {
    id: "voice_warm",
    title: "Voice Warm-Up",
    subtitle: "Open-Throat Flow",
    description: "Longer exhales with no glottal lock — built for singers and speakers.",
    cue: "Imagine saying “ahh” on the hold. If the throat clicks, you are locking.",
    color: "from-fuchsia-400 to-purple-700",
    level: "Beginner",
    goals: ["voice", "calm"],
    pattern: {
      inhale: 4,
      topHold: 4,
      exhale: 8,
      bottomHold: 0,
      phaseLabels: { topHold: "Open hold" },
      defaultBreaths: 12,
      defaultMinutes: 5,
    },
  },
  {
    id: "cadence_run",
    title: "Cadence Breath",
    subtitle: "2 · 2 Locomotion",
    description: "Short even counts used as a walking or easy-run nasal cadence.",
    cue: "Only practice this while still first in the app, then take it outside.",
    color: "from-emerald-300 to-lime-600",
    level: "Intermediate",
    goals: ["endurance", "energy"],
    pattern: {
      inhale: 2,
      topHold: 0,
      exhale: 2,
      bottomHold: 0,
      lockTimings: true,
      defaultBreaths: 60,
      defaultMinutes: 4,
    },
  },
  {
    id: "extended_box",
    title: "Extended Box",
    subtitle: "6 · 6 · 6 · 6",
    description: "A slower box for experienced practitioners building time-under-control.",
    cue: "Drop to 5s or 4s the moment the inhale feels snatched.",
    color: "from-emerald-500 to-cyan-800",
    level: "Advanced",
    goals: ["endurance", "focus"],
    pattern: {
      inhale: 6,
      topHold: 6,
      exhale: 6,
      bottomHold: 6,
      defaultBreaths: 8,
      defaultMinutes: 8,
    },
  },
];

export const GOALS: { id: Goal; label: string }[] = [
  { id: "calm", label: "Calm" },
  { id: "sleep", label: "Sleep" },
  { id: "energy", label: "Energy" },
  { id: "focus", label: "Focus" },
  { id: "recovery", label: "Recovery" },
  { id: "endurance", label: "Endurance" },
  { id: "voice", label: "Voice" },
];

export function getExercise(id: string) {
  return EXERCISE_CATALOG.find((e) => e.id === id);
}
