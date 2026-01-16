import { beginnerWorkouts } from "./beginner";
import { athleticWorkouts } from "./athletic";
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

export type Level = "beginner" | "intermediate" | "advanced";

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Athletic",
  advanced: "Strength",
};

// ─── All workouts by level ─────────────────────────────────────────────────
// Beginner: Balanced foundation (her current ~4-month level).
// Athletic: Combat speed, kick power, agility, flexibility — high activity, great for fat loss.
// Strength: Hypertrophy focused — slow tempos, high TUT, 2 rest days, for when surplus eating starts.

const allWorkouts: Record<Level, Record<string, DayWorkout>> = {
  beginner: beginnerWorkouts,
  intermediate: athleticWorkouts,
  advanced: strengthWorkouts,
};

// ─── Public API ────────────────────────────────────────────────────────────

export function getWorkouts(level: Level): Record<string, DayWorkout> {
  return allWorkouts[level];
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
