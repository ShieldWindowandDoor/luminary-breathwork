import { EXERCISE_CATALOG } from "./catalog";
import { PROGRAMS } from "./programs";
import type { StatsPayload } from "./store";
import { computeStreak, formatClock, formatDuration, weekKey } from "./utils";

function titleForExercise(id?: string) {
  if (!id) return "Session";
  return EXERCISE_CATALOG.find((e) => e.id === id)?.title || id;
}

function localDay(date: string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(isoDay: string, n: number) {
  const d = new Date(`${isoDay}T12:00:00`);
  d.setDate(d.getDate() + n);
  return localDay(d.toISOString());
}

function todayLocal() {
  return localDay(new Date().toISOString());
}

export function longestStreak(dates: string[]) {
  const unique = Array.from(new Set(dates.map(localDay))).sort();
  if (!unique.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const gap = Math.round(
      (new Date(`${unique[i]}T12:00:00`).getTime() -
        new Date(`${unique[i - 1]}T12:00:00`).getTime()) /
        86400000
    );
    if (gap === 1) {
      run += 1;
      best = Math.max(best, run);
    } else run = 1;
  }
  return best;
}

function maxOf(values: number[]) {
  return values.length ? Math.max(...values) : 0;
}

function minOf(values: number[]) {
  return values.length ? Math.min(...values) : 0;
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pbTimeline(items: { date: string; value: number }[]) {
  const sorted = [...items].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const marks: { date: string; value: number }[] = [];
  let best = 0;
  for (const item of sorted) {
    if (item.value > best) {
      best = item.value;
      marks.push(item);
    }
  }
  return marks;
}

export type DayPoint = {
  day: string;
  minutes: number;
  sessions: number;
  holdSeconds: number;
};

export type InsightModel = ReturnType<typeof buildInsights>;

export function buildInsights(data: StatsPayload, extra: { level: number; xp: number }) {
  const loggedIds = new Set(data.practiceLog.map((l) => l.id));
  const legacyRhythmic = data.rhythmicSessions.filter((s) => !loggedIds.has(s.id));
  const practice = [
    ...data.practiceLog,
    ...legacyRhythmic.map((s) => ({
      id: s.id,
      date: s.date,
      durationSeconds: s.durationSeconds,
      kind: "rhythmic" as const,
      title: "Rhythmic session",
    })),
  ];

  const activityDates = [
    ...practice,
    ...data.holdRecords,
    ...data.boltScores,
    ...data.co2Scores,
    ...data.breathRateScores,
  ].map((x) => x.date);

  const today = todayLocal();
  const days = 42;
  const start = addDays(today, -(days - 1));
  const byDay = new Map<string, DayPoint>();
  for (let i = 0; i < days; i++) {
    const day = addDays(start, i);
    byDay.set(day, { day, minutes: 0, sessions: 0, holdSeconds: 0 });
  }
  for (const s of practice) {
    const day = localDay(s.date);
    const row = byDay.get(day);
    if (!row) continue;
    row.minutes += s.durationSeconds / 60;
    row.sessions += 1;
  }
  for (const h of data.holdRecords) {
    const day = localDay(h.date);
    const row = byDay.get(day);
    if (row) row.holdSeconds += h.durationSeconds;
  }
  const series = Array.from(byDay.values());

  const minutesByDay = new Map<string, number>();
  for (const s of practice) {
    const d = localDay(s.date);
    minutesByDay.set(d, (minutesByDay.get(d) || 0) + s.durationSeconds / 60);
  }

  const heatWeeks = 16;
  const heatAnchor = addDays(today, -(heatWeeks * 7 - 1));
  const heatStartDate = new Date(`${heatAnchor}T12:00:00`);
  heatStartDate.setDate(heatStartDate.getDate() - heatStartDate.getDay());
  const heatStart = localDay(heatStartDate.toISOString());
  const heatEndDate = new Date(`${today}T12:00:00`);
  heatEndDate.setDate(heatEndDate.getDate() + (6 - heatEndDate.getDay()));
  const heatEnd = localDay(heatEndDate.toISOString());
  const heat: { day: string; minutes: number }[] = [];
  for (let d = heatStart, n = 0; n < 130; n++) {
    heat.push({ day: d, minutes: minutesByDay.get(d) || 0 });
    if (d === heatEnd) break;
    d = addDays(d, 1);
  }

  const last7 = series.slice(-7);
  const prev7 = series.slice(-14, -7);
  const weekMinutes = last7.reduce((a, d) => a + d.minutes, 0);
  const prevWeekMinutes = prev7.reduce((a, d) => a + d.minutes, 0);
  const weekDelta = weekMinutes - prevWeekMinutes;

  const dayTotals = new Map<string, number>();
  const weekTotals = new Map<string, number>();
  for (const s of practice) {
    const d = localDay(s.date);
    dayTotals.set(d, (dayTotals.get(d) || 0) + s.durationSeconds);
    const wk = weekKey(new Date(s.date));
    weekTotals.set(wk, (weekTotals.get(wk) || 0) + s.durationSeconds);
  }
  const bestDaySeconds = maxOf([...dayTotals.values()]);
  const bestWeekSeconds = maxOf([...weekTotals.values()]);
  const bestDayLabel =
    [...dayTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const last30Days = Array.from({ length: 30 }, (_, i) => addDays(today, -(29 - i)));
  const activeLast30 = last30Days.filter((d) => (dayTotals.get(d) || 0) > 0).length;
  const consistency = Math.round((activeLast30 / 30) * 100);

  const holds = data.holdRecords;
  const holdValues = holds.map((h) => h.durationSeconds);
  const recentHolds = [...holds]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)
    .map((h) => h.durationSeconds);
  const firstHold = [...holds].sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
  const bestHold = maxOf(holdValues);
  const holdGain = firstHold ? bestHold - firstHold.durationSeconds : 0;

  const bestByTarget = (n: number) =>
    maxOf(data.holdSessions.filter((s) => s.targetHolds === n).map((s) => s.totalDurationSeconds));

  const longestSession = maxOf(practice.map((s) => s.durationSeconds));
  const longestRhythmic = maxOf(
    practice.filter((s) => s.kind === "rhythmic").map((s) => s.durationSeconds)
  );
  const longestLibrary = maxOf(
    practice.filter((s) => s.kind === "library").map((s) => s.durationSeconds)
  );
  const longestHoldBlock = maxOf(data.holdSessions.map((s) => s.totalDurationSeconds));
  const mostHoldsInBlock = maxOf(data.holdSessions.map((s) => s.targetHolds));

  const byExercise = new Map<string, { seconds: number; count: number }>();
  for (const s of practice) {
    const key = "exerciseId" in s && s.exerciseId ? s.exerciseId : s.kind;
    const cur = byExercise.get(key) || { seconds: 0, count: 0 };
    cur.seconds += s.durationSeconds;
    cur.count += 1;
    byExercise.set(key, cur);
  }
  const favoriteExercise = [...byExercise.entries()].sort((a, b) => b[1].seconds - a[1].seconds)[0];

  const hours = practice.map((s) => new Date(s.date).getHours());
  const dawnCount = hours.filter((h) => h < 8).length;
  const nightCount = hours.filter((h) => h >= 21).length;
  const peakHour = (() => {
    const buckets = Array.from({ length: 24 }, () => 0);
    hours.forEach((h) => (buckets[h] += 1));
    return buckets.indexOf(Math.max(0, ...buckets));
  })();

  const kindSeconds = {
    rhythmic: 0,
    hold: 0,
    library: 0,
    program: 0,
    builder: 0,
  };
  for (const s of practice) {
    kindSeconds[s.kind] += s.durationSeconds;
  }

  const boltSorted = [...data.boltScores].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const co2Sorted = [...data.co2Scores].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const rateSorted = [...data.breathRateScores].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const holdSorted = [...holds].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const latestBolt = boltSorted.at(-1)?.durationSeconds || 0;
  const firstBolt = boltSorted[0]?.durationSeconds || 0;
  const latestCo2 = co2Sorted.at(-1)?.durationSeconds || 0;
  const latestRate = rateSorted.at(-1)?.bpm || 0;
  const quietestRate = minOf(rateSorted.map((r) => r.bpm));
  const highestRate = maxOf(rateSorted.map((r) => r.bpm));

  const journalMood = avg(data.journal.map((j) => j.mood));
  const journalEnergy = avg(data.journal.map((j) => j.energy));
  const bestMoodDay = [...data.journal].sort((a, b) => b.mood - a.mood)[0];
  const bestEnergyDay = [...data.journal].sort((a, b) => b.energy - a.energy)[0];

  const programDays = Object.values(data.programProgress).reduce(
    (a, p) => a + p.completedDays.length,
    0
  );
  const programsStarted = Object.keys(data.programProgress).length;
  const programsDone = PROGRAMS.filter(
    (p) => (data.programProgress[p.id]?.completedDays.length || 0) >= p.days
  ).length;

  const totalPracticeSeconds = practice.reduce((a, s) => a + s.durationSeconds, 0);
  const sessionCount = practice.length;
  const avgSession = sessionCount ? totalPracticeSeconds / sessionCount : 0;
  const holdVolume = holdValues.reduce((a, b) => a + b, 0);
  const avgHold = avg(holdValues);

  const goalMinutes = data.settings.dailyGoalMinutes || 10;
  const todaySeconds = practice
    .filter((s) => localDay(s.date) === today)
    .reduce((a, s) => a + s.durationSeconds, 0);
  const goalPct = Math.min(100, Math.round((todaySeconds / (goalMinutes * 60)) * 100));

  const rhythmList = [...data.rhythmicSessions].sort(
    (a, b) => +new Date(a.date) - +new Date(b.date)
  );
  const rhythmSeconds = rhythmList.reduce((a, s) => a + s.durationSeconds, 0);
  const rhythmBreaths = rhythmList.reduce((a, s) => a + (s.breaths || 0), 0);
  const rhythmToday = rhythmList
    .filter((s) => localDay(s.date) === today)
    .reduce((a, s) => a + s.durationSeconds, 0);
  const rhythmWeek = rhythmList
    .filter((s) => last7.some((d) => d.day === localDay(s.date)))
    .reduce((a, s) => a + s.durationSeconds, 0);
  const longestRhythmBreaths = maxOf(rhythmList.map((s) => s.breaths || 0));
  const avgRhythm = rhythmList.length ? rhythmSeconds / rhythmList.length : 0;
  const cycleKey = (s: (typeof rhythmList)[0]) =>
    s.inhale != null ? `${s.inhale}-${s.topHold ?? 0}-${s.exhale ?? 0}-${s.bottomHold ?? 0}` : "";
  const cycleCounts = new Map<string, number>();
  for (const s of rhythmList) {
    const key = cycleKey(s);
    if (!key) continue;
    cycleCounts.set(key, (cycleCounts.get(key) || 0) + 1);
  }
  const favoriteCycle = [...cycleCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const records = [
    { id: "rhythm-n", label: "Rhythm sessions", value: rhythmList.length ? `${rhythmList.length}` : "—", hint: "Rhythm tab completions" },
    { id: "rhythm-time", label: "Rhythm lifetime", value: rhythmSeconds ? formatDuration(rhythmSeconds) : "—", hint: "All guided rhythm minutes" },
    { id: "rhythm-today", label: "Rhythm today", value: rhythmToday ? formatDuration(rhythmToday) : "—", hint: "Logged on this local day" },
    { id: "rhythm-week", label: "Rhythm this week", value: rhythmWeek ? formatDuration(rhythmWeek) : "—", hint: "Last 7 local days" },
    { id: "rhythm-avg", label: "Avg rhythm session", value: rhythmList.length ? formatDuration(avgRhythm) : "—", hint: "Mean length" },
    { id: "rhythm-breaths", label: "Breaths completed", value: rhythmBreaths ? `${rhythmBreaths}` : "—", hint: "Full cycles logged in Rhythm" },
    { id: "rhythm-breaths-best", label: "Most breaths in a set", value: longestRhythmBreaths ? `${longestRhythmBreaths}` : "—", hint: "Single Rhythm session" },
    { id: "rhythm-cycle", label: "Favorite cycle", value: favoriteCycle ? favoriteCycle[0].replace(/-/g, " / ") : "—", hint: favoriteCycle ? `${favoriteCycle[1]} sessions` : "Inhale / hold / exhale / hold" },
    { id: "hold-max", label: "Max breath hold", value: bestHold ? formatClock(bestHold) : "—", hint: "Single longest apnea" },
    { id: "hold-avg5", label: "Last 5 holds avg", value: recentHolds.length ? formatClock(avg(recentHolds)) : "—", hint: "Recent form, not a one-off" },
    { id: "hold-avg", label: "Lifetime hold avg", value: holdValues.length ? formatClock(avgHold) : "—", hint: `${holdValues.length} holds logged` },
    { id: "hold-volume", label: "Hold volume", value: holdVolume ? formatDuration(holdVolume) : "—", hint: "Sum of every timed hold" },
    { id: "hold-gain", label: "Hold gain vs first", value: holdValues.length > 1 ? `+${formatClock(Math.max(0, holdGain))}` : "—", hint: "Improvement since first mark" },
    { id: "hold-5", label: "Best 5-hold block", value: bestByTarget(5) ? formatClock(bestByTarget(5)) : "—", hint: "Total time across 5 holds" },
    { id: "hold-10", label: "Best 10-hold block", value: bestByTarget(10) ? formatClock(bestByTarget(10)) : "—", hint: "Total time across 10 holds" },
    { id: "hold-block", label: "Best hold set", value: longestHoldBlock ? formatClock(longestHoldBlock) : "—", hint: "Any multi-hold session" },
    { id: "hold-count-set", label: "Biggest hold set", value: mostHoldsInBlock ? `${mostHoldsInBlock} holds` : "—", hint: "Most reps in one block" },
    { id: "session-long", label: "Longest session", value: longestSession ? formatDuration(longestSession) : "—", hint: "Any practice kind" },
    { id: "rhythmic-long", label: "Longest rhythm", value: longestRhythmic ? formatDuration(longestRhythmic) : "—", hint: "Guided rhythmic session" },
    { id: "library-long", label: "Longest library", value: longestLibrary ? formatDuration(longestLibrary) : "—", hint: "Technique from the library" },
    { id: "day-best", label: "Biggest practice day", value: bestDaySeconds ? formatDuration(bestDaySeconds) : "—", hint: bestDayLabel || "Most minutes in 24h" },
    { id: "week-best", label: "Biggest practice week", value: bestWeekSeconds ? formatDuration(bestWeekSeconds) : "—", hint: "ISO week total" },
    { id: "lifetime", label: "Lifetime practice", value: totalPracticeSeconds ? formatDuration(totalPracticeSeconds) : "—", hint: `${sessionCount} sessions` },
    { id: "avg-session", label: "Average session", value: sessionCount ? formatDuration(avgSession) : "—", hint: "Mean length" },
    { id: "streak-now", label: "Current streak", value: `${computeStreak(activityDates)} days`, hint: "Practice days in a row" },
    { id: "streak-best", label: "Longest streak", value: `${longestStreak(activityDates)} days`, hint: "Best consecutive run" },
    { id: "consistency", label: "30-day consistency", value: `${consistency}%`, hint: `${activeLast30} of 30 days active` },
    { id: "bolt-best", label: "BOLT personal best", value: data.boltScores.length ? `${maxOf(data.boltScores.map((s) => s.durationSeconds)).toFixed(1)}s` : "—", hint: latestBolt ? `Latest ${latestBolt.toFixed(1)}s` : "Control pause" },
    { id: "bolt-gain", label: "BOLT vs first", value: boltSorted.length > 1 ? `${latestBolt - firstBolt >= 0 ? "+" : ""}${(latestBolt - firstBolt).toFixed(1)}s` : "—", hint: "Latest minus first test" },
    { id: "co2-best", label: "CO2 discard best", value: data.co2Scores.length ? `${maxOf(data.co2Scores.map((s) => s.durationSeconds)).toFixed(1)}s` : "—", hint: latestCo2 ? `Latest ${latestCo2.toFixed(1)}s` : "Exhale hold" },
    { id: "rate-quiet", label: "Quietest breath rate", value: quietestRate ? `${quietestRate} bpm` : "—", hint: latestRate ? `Latest ${latestRate} bpm` : "Lower is calmer" },
    { id: "rate-high", label: "Highest breath rate", value: highestRate ? `${highestRate} bpm` : "—", hint: "Peak logged BPM" },
    { id: "favorite", label: "Most practiced", value: favoriteExercise ? titleForExercise(favoriteExercise[0]) : "—", hint: favoriteExercise ? formatDuration(favoriteExercise[1].seconds) : "By total time" },
    { id: "dawn", label: "Dawn sessions", value: `${dawnCount}`, hint: "Before 8:00" },
    { id: "night", label: "Night sessions", value: `${nightCount}`, hint: "After 21:00" },
    { id: "peak-hour", label: "Peak hour", value: hours.length ? `${String(peakHour).padStart(2, "0")}:00` : "—", hint: "When you practice most" },
    { id: "mood", label: "Avg journal mood", value: data.journal.length ? journalMood.toFixed(1) : "—", hint: bestMoodDay ? `Best ${bestMoodDay.mood}/10` : "Out of 10" },
    { id: "energy", label: "Avg journal energy", value: data.journal.length ? journalEnergy.toFixed(1) : "—", hint: bestEnergyDay ? `Peak ${bestEnergyDay.energy}/10` : "Out of 10" },
    { id: "programs", label: "Program days", value: `${programDays}`, hint: `${programsDone} finished · ${programsStarted} started` },
    { id: "xp", label: "Level / XP", value: `Lv ${extra.level}`, hint: `${extra.xp} XP` },
    { id: "trophies", label: "Trophies", value: `${Object.keys(data.unlockedTrophies).length}`, hint: "Unlocked on this device" },
    { id: "journal-n", label: "Journal entries", value: `${data.journal.length}`, hint: "Notes + mood check-ins" },
    { id: "protocols", label: "Custom protocols", value: `${data.customProtocols.length}`, hint: "Builder patterns saved" },
  ];

  return {
    series,
    heat,
    last7,
    weekMinutes,
    weekDelta,
    goalPct,
    todaySeconds,
    goalMinutes,
    kindSeconds,
    totalPracticeSeconds,
    sessionCount,
    records,
    rhythmSeconds,
    rhythmCount: rhythmList.length,
    rhythmBreaths,
    rhythmToday,
    rhythmWeek,
    rhythmSpark: rhythmList.map((s) => ({ t: s.date, v: s.durationSeconds / 60 })),
    holdSpark: holdSorted.map((h) => ({ t: h.date, v: h.durationSeconds })),
    boltSpark: boltSorted.map((h) => ({ t: h.date, v: h.durationSeconds })),
    co2Spark: co2Sorted.map((h) => ({ t: h.date, v: h.durationSeconds })),
    rateSpark: rateSorted.map((h) => ({ t: h.date, v: h.bpm })),
    holdPbs: pbTimeline(holdSorted.map((h) => ({ date: h.date, value: h.durationSeconds }))),
    boltPbs: pbTimeline(boltSorted.map((h) => ({ date: h.date, value: h.durationSeconds }))),
    name: data.settings.displayName,
  };
}

export function shortDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
