export interface ProgramDay {
  day: number;
  title: string;
  minutes: number;
  exerciseId: string;
  note: string;
}

export interface ProgramDef {
  id: string;
  title: string;
  subtitle: string;
  days: number;
  color: string;
  focus: string;
  schedule: ProgramDay[];
}

export const PROGRAMS: ProgramDef[] = [
  {
    id: "calm-7",
    title: "7-Day Calm",
    subtitle: "Downshift the baseline",
    days: 7,
    color: "from-sky-500 to-indigo-600",
    focus: "Calm",
    schedule: [
      { day: 1, title: "Arrive", minutes: 5, exerciseId: "phys_sigh", note: "Six physiological sighs, then sit still for 30 seconds." },
      { day: 2, title: "Even box", minutes: 6, exerciseId: "box_breathing", note: "Keep the box at 4s. Soft throat." },
      { day: 3, title: "Longer exhale", minutes: 6, exerciseId: "calming_48", note: "If 8s is too long, silently count to 6." },
      { day: 4, title: "Ocean", minutes: 6, exerciseId: "ujjayi", note: "Quiet enough that a roommate would barely hear you." },
      { day: 5, title: "Hum", minutes: 5, exerciseId: "bhramari", note: "Hands off the face unless that helps you settle." },
      { day: 6, title: "Coherence", minutes: 8, exerciseId: "coherent_6", note: "Smooth, not deep. Depth is optional." },
      { day: 7, title: "Integrate", minutes: 8, exerciseId: "straw_exhale", note: "Finish with 1 minute of natural breathing." },
    ],
  },
  {
    id: "hold-14",
    title: "14-Day Hold Builder",
    subtitle: "Comfortable CO2 capacity",
    days: 14,
    color: "from-indigo-500 to-violet-700",
    focus: "Endurance",
    schedule: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: i % 2 === 0 ? "Cadence + holds" : "Recovery cadence",
      minutes: 8 + (i % 3),
      exerciseId: i % 2 === 0 ? "tactical_reset" : "coherent_6",
      note:
        i % 2 === 0
          ? "After the cadence, do 3 comfortable holds in the Holds tab — never to blackout."
          : "Easy nasal breathing only. No max holds today.",
    })),
  },
  {
    id: "sleep-21",
    title: "21-Day Sleep",
    subtitle: "Night downshift ritual",
    days: 21,
    color: "from-purple-600 to-slate-900",
    focus: "Sleep",
    schedule: Array.from({ length: 21 }, (_, i) => {
      const ids = ["pre_sleep_wave", "sleep_478", "bhramari", "calming_48"];
      return {
        day: i + 1,
        title: `Night ${i + 1}`,
        minutes: 6 + (i % 4),
        exerciseId: ids[i % ids.length],
        note: "Practice in bed or low light. Stop when sleepy.",
      };
    }),
  },
  {
    id: "energy-5",
    title: "5-Day Charge",
    subtitle: "Morning voltage",
    days: 5,
    color: "from-orange-400 to-rose-600",
    focus: "Energy",
    schedule: [
      { day: 1, title: "Wake", minutes: 5, exerciseId: "morning_charge", note: "Near a window if possible." },
      { day: 2, title: "Power ratio", minutes: 5, exerciseId: "power_ratio", note: "Stay seated. No breath of fire yet." },
      { day: 3, title: "Cadence", minutes: 4, exerciseId: "cadence_run", note: "Then walk 5 minutes nasally." },
      { day: 4, title: "Tactical", minutes: 6, exerciseId: "tactical_reset", note: "Use before a hard block of work." },
      { day: 5, title: "Integrate", minutes: 6, exerciseId: "box_breathing", note: "Even box after the charge days." },
    ],
  },
  {
    id: "focus-10",
    title: "10-Day Focus",
    subtitle: "Attention as a muscle",
    days: 10,
    color: "from-cyan-400 to-indigo-700",
    focus: "Focus",
    schedule: Array.from({ length: 10 }, (_, i) => ({
      day: i + 1,
      title: `Session ${i + 1}`,
      minutes: 6,
      exerciseId: i % 3 === 0 ? "coherent_6" : i % 3 === 1 ? "box_breathing" : "resonance",
      note: "Practice, then start the one task you have been avoiding.",
    })),
  },
];

export function getProgram(id: string) {
  return PROGRAMS.find((p) => p.id === id);
}
