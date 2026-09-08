export interface TrophyDef {
  id: string;
  title: string;
  description: string;
  category: "practice" | "holds" | "tests" | "streaks" | "explorer" | "mastery";
  rarity: "bronze" | "silver" | "gold" | "obsidian";
}

export const TROPHIES: TrophyDef[] = [
  { id: "first-session", title: "First Light", description: "Complete your first timed session.", category: "practice", rarity: "bronze" },
  { id: "sessions-10", title: "Ten Breaths In", description: "Log 10 rhythmic or library sessions.", category: "practice", rarity: "bronze" },
  { id: "sessions-50", title: "Studio Regular", description: "Log 50 practice sessions.", category: "practice", rarity: "silver" },
  { id: "sessions-100", title: "Hundredfold", description: "Log 100 practice sessions.", category: "practice", rarity: "gold" },
  { id: "minutes-60", title: "Hour Keeper", description: "Accumulate 60 minutes of practice.", category: "practice", rarity: "bronze" },
  { id: "minutes-600", title: "Ten Hour Temple", description: "Accumulate 10 hours of practice.", category: "practice", rarity: "gold" },
  { id: "hold-30", title: "Half-Minute Still", description: "Hold for 30 seconds.", category: "holds", rarity: "bronze" },
  { id: "hold-60", title: "One Minute Quiet", description: "Hold for 60 seconds.", category: "holds", rarity: "silver" },
  { id: "hold-90", title: "Ninety", description: "Hold for 90 seconds.", category: "holds", rarity: "gold" },
  { id: "hold-120", title: "Two-Minute Gate", description: "Hold for 2 minutes.", category: "holds", rarity: "obsidian" },
  { id: "holds-25", title: "Hold Collector", description: "Complete 25 recorded holds.", category: "holds", rarity: "silver" },
  { id: "bolt-20", title: "BOLT 20", description: "Post a BOLT score of 20s.", category: "tests", rarity: "bronze" },
  { id: "bolt-30", title: "BOLT 30", description: "Post a BOLT score of 30s.", category: "tests", rarity: "silver" },
  { id: "bolt-40", title: "BOLT 40", description: "Post a BOLT score of 40s.", category: "tests", rarity: "gold" },
  { id: "co2-20", title: "Long Exhale", description: "CO2 discard of 20s.", category: "tests", rarity: "bronze" },
  { id: "co2-35", title: "Discard Adept", description: "CO2 discard of 35s.", category: "tests", rarity: "gold" },
  { id: "rate-logged", title: "Baseline Taken", description: "Log a breath-rate test.", category: "tests", rarity: "bronze" },
  { id: "streak-3", title: "Three-Day Ember", description: "Practice 3 days in a row.", category: "streaks", rarity: "bronze" },
  { id: "streak-7", title: "Week Unbroken", description: "Practice 7 days in a row.", category: "streaks", rarity: "silver" },
  { id: "streak-21", title: "Moon Cycle", description: "Practice 21 days in a row.", category: "streaks", rarity: "gold" },
  { id: "streak-40", title: "Forty Nights", description: "Practice 40 days in a row.", category: "streaks", rarity: "obsidian" },
  { id: "explore-5", title: "Curious", description: "Try 5 different library exercises.", category: "explorer", rarity: "bronze" },
  { id: "explore-12", title: "Cartographer", description: "Try 12 different library exercises.", category: "explorer", rarity: "silver" },
  { id: "explore-all", title: "Full Catalog", description: "Try every exercise in the library.", category: "explorer", rarity: "obsidian" },
  { id: "journal-1", title: "Witness", description: "Write your first journal entry.", category: "explorer", rarity: "bronze" },
  { id: "journal-10", title: "Field Notes", description: "Write 10 journal entries.", category: "explorer", rarity: "silver" },
  { id: "program-day", title: "On the Path", description: "Complete a program day.", category: "mastery", rarity: "bronze" },
  { id: "program-done", title: "Graduate", description: "Finish an entire program.", category: "mastery", rarity: "gold" },
  { id: "challenge-goal", title: "Weekly Mark", description: "Hit a weekly challenge goal.", category: "mastery", rarity: "silver" },
  { id: "night-owl", title: "Night Owl", description: "Practice after 9pm.", category: "practice", rarity: "bronze" },
  { id: "dawn", title: "Dawn Watch", description: "Practice before 8am.", category: "practice", rarity: "bronze" },
  { id: "custom-1", title: "Composer", description: "Save a custom protocol.", category: "mastery", rarity: "bronze" },
  { id: "favorite-3", title: "Inner Circle", description: "Favorite 3 exercises.", category: "explorer", rarity: "bronze" },
];

export const RARITY_STYLES = {
  bronze: "from-amber-700 to-orange-400",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-300 to-amber-500",
  obsidian: "from-violet-400 to-fuchsia-700",
};
