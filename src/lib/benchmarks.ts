export interface Band {
  label: string;
  min: number;
  rank: number;
}

export const BOLT_BANDS: Band[] = [
  { label: "Developing", min: 0, rank: 1 },
  { label: "Functional", min: 20, rank: 2 },
  { label: "Trained", min: 30, rank: 3 },
  { label: "Advanced", min: 40, rank: 4 },
  { label: "Elite", min: 50, rank: 5 },
];

export const HOLD_BANDS: Band[] = [
  { label: "Developing", min: 0, rank: 1 },
  { label: "Functional", min: 30, rank: 2 },
  { label: "Trained", min: 60, rank: 3 },
  { label: "Advanced", min: 90, rank: 4 },
  { label: "Elite", min: 120, rank: 5 },
];

export const CO2_BANDS: Band[] = [
  { label: "Developing", min: 0, rank: 1 },
  { label: "Functional", min: 15, rank: 2 },
  { label: "Trained", min: 25, rank: 3 },
  { label: "Advanced", min: 35, rank: 4 },
  { label: "Elite", min: 45, rank: 5 },
];

export const WEEKLY_MIN_BANDS: Band[] = [
  { label: "Spark", min: 0, rank: 1 },
  { label: "Habit", min: 30, rank: 2 },
  { label: "Dedicated", min: 60, rank: 3 },
  { label: "Devoted", min: 120, rank: 4 },
  { label: "Monastic", min: 240, rank: 5 },
];

export function bandFor(value: number, bands: Band[]) {
  let current = bands[0];
  for (const band of bands) {
    if (value >= band.min) current = band;
  }
  return current;
}
