"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { workouts, type Exercise, type DayWorkout, getDateString } from "@/data/workouts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SetStatus {
  completed: boolean;
}

interface ExerciseProgress {
  sets: SetStatus[];
  completed: boolean;
}

interface DayProgress {
  day: string;
  workoutName: string;
  exercises: ExerciseProgress[];
  completed: boolean;
  startedAt?: string;
}

interface UserData {
  name: string;
  progress: Record<string, DayProgress>;
}

// ─── Helper: format seconds to mm:ss ────────────────────────────────────────

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Day names ──────────────────────────────────────────────────────────────

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Main App ───────────────────────────────────────────────────────────────

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("trainer_username");
    if (stored) setUsername(stored);
    setLoading(false);
  }, []);

  function handleLogin() {
    const name = inputName.trim();
    if (!name) return;
    localStorage.setItem("trainer_username", name);
    setUsername(name);
  }

  function handleLogout() {
    localStorage.removeItem("trainer_username");
    setUsername(null);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!username) {
    return <LoginScreen inputName={inputName} setInputName={setInputName} onLogin={handleLogin} />;
  }

  return <WorkoutApp username={username} onLogout={handleLogout} />;
}

// ─── Login Screen ───────────────────────────────────────────────────────────

function LoginScreen({
  inputName,
  setInputName,
  onLogin,
}: {
  inputName: string;
  setInputName: (v: string) => void;
  onLogin: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">💪</div>
        <h1 className="text-3xl font-bold text-orange-400">Kaam Chlra</h1>
        <p className="text-zinc-400 mt-2">Daily Workout Tracker</p>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none text-lg"
          autoFocus
        />
        <button
          onClick={onLogin}
          disabled={!inputName.trim()}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-semibold text-lg transition-colors"
        >
          Let&apos;s Go
        </button>
      </div>
    </div>
  );
}

// ─── Workout App ────────────────────────────────────────────────────────────

function WorkoutApp({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [selectedDay, setSelectedDay] = useState(() => DAYS[new Date().getDay()]);
  const [dayProgress, setDayProgress] = useState<DayProgress | null>(null);
  const [activeExercise, setActiveExercise] = useState(0);
  const [mode, setMode] = useState<"idle" | "working" | "resting">("idle");
  const [timer, setTimer] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workout: DayWorkout = workouts[selectedDay];
  const dateStr = getDateString();
  const isToday = DAYS[new Date().getDay()] === selectedDay;

  // Load user progress
  useEffect(() => {
    fetch(`/api/user?name=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((data: UserData) => {
        if (data.progress && data.progress[dateStr] && isToday) {
          setDayProgress(data.progress[dateStr]);
        } else {
          resetProgress();
        }
      })
      .catch(() => resetProgress());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  function resetProgress() {
    if (workout.isRest) {
      setDayProgress(null);
      return;
    }
    setDayProgress({
      day: selectedDay,
      workoutName: workout.name,
      exercises: workout.exercises.map((ex) => ({
        sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
        completed: false,
      })),
      completed: false,
    });
    setActiveExercise(0);
    setMode("idle");
    setTimer(0);
  }

  // Save progress to server
  const saveProgress = useCallback(
    async (progress: DayProgress) => {
      setSaving(true);
      try {
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username, date: dateStr, dayProgress: progress }),
        });
      } catch {
        // silent fail — will retry on next save
      }
      setSaving(false);
    },
    [username, dateStr]
  );

  // Timer logic
  useEffect(() => {
    if (mode === "working") {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (mode === "resting") {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setMode("idle");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  function startSet() {
    setMode("working");
    setTimer(0);
  }

  function completeSet() {
    if (!dayProgress) return;
    const updated = structuredClone(dayProgress);
    const exProgress = updated.exercises[activeExercise];
    const nextIncomplete = exProgress.sets.findIndex((s) => !s.completed);
    if (nextIncomplete !== -1) {
      exProgress.sets[nextIncomplete].completed = true;
    }
    exProgress.completed = exProgress.sets.every((s) => s.completed);
    updated.completed = updated.exercises.every((e) => e.completed);

    if (!updated.startedAt) updated.startedAt = new Date().toISOString();

    setDayProgress(updated);
    saveProgress(updated);

    if (exProgress.completed) {
      // Move to next exercise
      setMode("idle");
      setTimer(0);
      if (activeExercise < workout.exercises.length - 1) {
        setActiveExercise(activeExercise + 1);
      }
    } else {
      // Rest between sets
      setMode("resting");
      setTimer(restTime);
    }
  }

  function skipRest() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode("idle");
    setTimer(0);
  }

  function jumpToExercise(idx: number) {
    setActiveExercise(idx);
    setMode("idle");
    setTimer(0);
  }

  // ─── Render ─────────────────────────────────────────────────────

  const completedExercises = dayProgress?.exercises.filter((e) => e.completed).length ?? 0;
  const totalExercises = workout.exercises.length;
  const progressPct = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-orange-400">Kaam Chlra</h1>
            <p className="text-xs text-zinc-500">Hey, {username}</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-zinc-500">saving...</span>}
            <button
              onClick={() => setShowDayPicker(!showDayPicker)}
              className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg border border-zinc-700"
            >
              {selectedDay.slice(0, 3)} {isToday && "• Today"}
            </button>
            <button onClick={onLogout} className="text-xs text-zinc-600 hover:text-zinc-400">
              Exit
            </button>
          </div>
        </div>

        {/* Day Picker */}
        {showDayPicker && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDay(d);
                  setShowDayPicker(false);
                  if (d !== selectedDay) {
                    setActiveExercise(0);
                    setMode("idle");
                    setTimer(0);
                    const w = workouts[d];
                    if (w.isRest) {
                      setDayProgress(null);
                    } else {
                      setDayProgress({
                        day: d,
                        workoutName: w.name,
                        exercises: w.exercises.map((ex) => ({
                          sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
                          completed: false,
                        })),
                        completed: false,
                      });
                    }
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  d === selectedDay
                    ? "bg-orange-500 text-white"
                    : d === DAYS[new Date().getDay()]
                      ? "bg-zinc-700 text-orange-300"
                      : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {!workout.isRest && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{workout.name}</span>
              <span>
                {completedExercises}/{totalExercises}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {workout.isRest ? (
          <RestDay />
        ) : dayProgress?.completed ? (
          <CompletedView />
        ) : (
          <div className="p-4 space-y-4 pb-40">
            {/* Rest Timer Controls */}
            {isToday && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Rest timer:</span>
                {[30, 45, 60, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => setRestTime(t)}
                    className={`px-2 py-1 rounded ${
                      restTime === t ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            )}

            {/* Exercise List */}
            {workout.exercises.map((exercise, idx) => (
              <ExerciseCard
                key={idx}
                exercise={exercise}
                index={idx}
                isActive={idx === activeExercise && isToday}
                progress={dayProgress?.exercises[idx]}
                onTap={() => isToday && jumpToExercise(idx)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {isToday && !workout.isRest && !dayProgress?.completed && (
        <ActionBar
          mode={mode}
          timer={timer}
          exercise={workout.exercises[activeExercise]}
          progress={dayProgress?.exercises[activeExercise]}
          onStart={startSet}
          onComplete={completeSet}
          onSkipRest={skipRest}
        />
      )}
    </div>
  );
}

// ─── Exercise Card ──────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  index,
  isActive,
  progress,
  onTap,
}: {
  exercise: Exercise;
  index: number;
  isActive: boolean;
  progress?: ExerciseProgress;
  onTap: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedSets = progress?.sets.filter((s) => s.completed).length ?? 0;
  const isDone = progress?.completed ?? false;

  return (
    <div
      onClick={onTap}
      className={`rounded-2xl border transition-all ${
        isDone
          ? "border-green-800/50 bg-green-950/20"
          : isActive
            ? "border-orange-500/50 bg-orange-950/20"
            : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  isDone ? "bg-green-800 text-green-200" : isActive ? "bg-orange-800 text-orange-200" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {index + 1}
              </span>
              <h3 className={`font-semibold ${isDone ? "text-green-400 line-through" : "text-white"}`}>
                {exercise.name}
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              {exercise.sets} x {exercise.reps}
            </p>
          </div>

          {/* Set indicators */}
          <div className="flex gap-1 ml-3">
            {progress?.sets.map((s, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border ${
                  s.completed
                    ? "bg-green-500 border-green-400"
                    : "bg-zinc-800 border-zinc-600"
                }`}
              />
            )) ??
              Array.from({ length: exercise.sets }, (_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-600" />
              ))}
          </div>
        </div>

        {completedSets > 0 && !isDone && (
          <p className="text-xs text-orange-400 mt-1">
            {completedSets}/{exercise.sets} sets done
          </p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 mt-2"
        >
          {expanded ? "Hide details" : "Show details"}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
            <p className="text-sm text-zinc-300">{exercise.description}</p>
            <p className="text-xs text-orange-300/70">{exercise.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Bar ─────────────────────────────────────────────────────────────

function ActionBar({
  mode,
  timer,
  exercise,
  progress,
  onStart,
  onComplete,
  onSkipRest,
}: {
  mode: "idle" | "working" | "resting";
  timer: number;
  exercise: Exercise;
  progress?: ExerciseProgress;
  onStart: () => void;
  onComplete: () => void;
  onSkipRest: () => void;
}) {
  const completedSets = progress?.sets.filter((s) => s.completed).length ?? 0;
  const currentSet = completedSets + 1;
  const totalSets = exercise.sets;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto">
        {/* Current exercise info */}
        <div className="text-center mb-3">
          <p className="text-sm text-zinc-400 truncate">{exercise.name}</p>
          <p className="text-xs text-zinc-600">
            Set {Math.min(currentSet, totalSets)} of {totalSets} &bull; {exercise.reps}
          </p>
        </div>

        {/* Timer Display */}
        {mode !== "idle" && (
          <div className={`text-center mb-3 ${mode === "working" ? "pulse-active" : ""}`}>
            <span
              className={`text-4xl font-mono font-bold ${
                mode === "resting" ? "text-blue-400" : "text-orange-400"
              }`}
            >
              {fmt(timer)}
            </span>
            <p className="text-xs text-zinc-500 mt-1">
              {mode === "working" ? "Working..." : "Rest - get ready for next set"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {mode === "idle" && (
            <button
              onClick={onStart}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg transition-colors active:scale-95"
            >
              Start Set {Math.min(currentSet, totalSets)}
            </button>
          )}

          {mode === "working" && (
            <button
              onClick={onComplete}
              className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg transition-colors active:scale-95"
            >
              Done
            </button>
          )}

          {mode === "resting" && (
            <>
              <button
                onClick={onSkipRest}
                className="flex-1 py-3.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-semibold transition-colors active:scale-95"
              >
                Skip Rest
              </button>
              <div className="flex-1 flex items-center justify-center bg-blue-950/50 rounded-xl border border-blue-800/50">
                <span className="text-blue-400 font-mono text-xl">{fmt(timer)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rest Day ───────────────────────────────────────────────────────────────

function RestDay() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">😌</div>
      <h2 className="text-2xl font-bold text-green-400 mb-2">Rest Day</h2>
      <p className="text-zinc-400">Kuch nhi - rest, chill and focus on recovery.</p>
      <div className="mt-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800 max-w-xs">
        <p className="text-sm text-zinc-300">Tips for recovery:</p>
        <ul className="text-sm text-zinc-400 mt-2 space-y-1 text-left">
          <li>- Stay hydrated</li>
          <li>- Get 7-8 hours of sleep</li>
          <li>- Light stretching if needed</li>
          <li>- Eat enough protein</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Completed View ─────────────────────────────────────────────────────────

function CompletedView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-green-400 mb-2">Workout Complete!</h2>
      <p className="text-zinc-400">Great work today. Rest up and come back stronger.</p>
    </div>
  );
}
