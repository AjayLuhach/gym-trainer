import { beginnerWorkouts } from "./beginner";
import { strengthWorkouts } from "./strength";

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "12" or "1 min" or "30s"
  description: string;
  tip: string;
  image?: string; // URL to exercise form GIF/image
}

export interface DayWorkout {
  name: string;
  isRest: boolean;
  exercises: Exercise[];
}

export type Level = "beginner" | "strength";

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  strength: "Strength",
};

// ─── All workouts by level ─────────────────────────────────────────────────
// Beginner: Balanced foundation — push-ups, basic combos, 3 sets, full body.
// Strength: Hypertrophy plan — 5 ex/day × 3 sets, bands only.
//           Mon Glutes/Hams · Tue Push · Wed Back/Bi · Thu Quads · Fri Arms ·
//           Sat Stretch+Chest · Sun Rest. Year-long progression via band levels.

const allWorkouts: Record<Level, Record<string, DayWorkout>> = {
  beginner: beginnerWorkouts,
  strength: strengthWorkouts,
};

// ─── Public API ────────────────────────────────────────────────────────────

export function getWorkouts(level: Level): Record<string, DayWorkout> {
  return allWorkouts[level];
}

export function isLevel(value: unknown): value is Level {
  return value === "beginner" || value === "strength";
}

/** Backward-compatible default (beginner) */
export const workouts = allWorkouts.beginner;

export function getTodayWorkout(): { day: string; workout: DayWorkout } {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];
  return { day: today, workout: allWorkouts.beginner[today] };
}

export function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}
