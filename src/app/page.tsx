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

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function cacheProgress(username: string, date: string, progress: DayProgress) {
  try {
    const key = `trainer_progress_${username}`;
    const cached = JSON.parse(localStorage.getItem(key) || "{}");
    cached[date] = progress;
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {}
}

function getCachedProgress(username: string, date: string): DayProgress | null {
  try {
    const key = `trainer_progress_${username}`;
    const cached = JSON.parse(localStorage.getItem(key) || "{}");
    return cached[date] || null;
  } catch {
    return null;
  }
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SWIPE_THRESHOLD = 60;

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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none text-lg"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!inputName.trim()}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-semibold text-lg transition-colors"
          >
            Let&apos;s Go
          </button>
        </div>
      </div>
    );
  }

  return <WorkoutApp username={username} onLogout={handleLogout} />;
}

// ─── Workout App ────────────────────────────────────────────────────────────

function WorkoutApp({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [selectedDay, setSelectedDay] = useState(() => DAYS[new Date().getDay()]);
  const [dayProgress, setDayProgress] = useState<DayProgress | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mode, setMode] = useState<"idle" | "working" | "resting">("idle");
  const [timer, setTimer] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Swipe state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeLocked = useRef(false); // locked to horizontal after first move

  const workout: DayWorkout = workouts[selectedDay];
  const dateStr = getDateString();
  const isToday = DAYS[new Date().getDay()] === selectedDay;

  // ─── Load progress ──────────────────────────────────────────────

  useEffect(() => {
    const cached = getCachedProgress(username, dateStr);
    if (cached && isToday) setDayProgress(cached);

    fetch(`/api/user?name=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((data: UserData) => {
        if (data.progress?.[dateStr] && isToday) {
          setDayProgress(data.progress[dateStr]);
          cacheProgress(username, dateStr, data.progress[dateStr]);
        } else if (!cached) {
          resetProgress();
        }
      })
      .catch(() => {
        if (!cached) resetProgress();
      });
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
    setActiveIdx(0);
    setMode("idle");
    setTimer(0);
  }

  const saveProgress = useCallback(
    async (progress: DayProgress) => {
      setSaving(true);
      try {
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username, date: dateStr, dayProgress: progress }),
        });
      } catch {}
      setSaving(false);
    },
    [username, dateStr]
  );

  // ─── Timer ──────────────────────────────────────────────────────

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

  function vibrate(ms: number | number[] = 50) {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
  }

  // ─── Actions ────────────────────────────────────────────────────

  function startSet() {
    vibrate(30);
    setMode("working");
    setTimer(0);
  }

  function completeSet() {
    vibrate([50, 30, 50]);
    if (!dayProgress) return;
    const updated = structuredClone(dayProgress);
    const exProg = updated.exercises[activeIdx];
    const next = exProg.sets.findIndex((s) => !s.completed);
    if (next !== -1) exProg.sets[next].completed = true;
    exProg.completed = exProg.sets.every((s) => s.completed);
    updated.completed = updated.exercises.every((e) => e.completed);
    if (!updated.startedAt) updated.startedAt = new Date().toISOString();

    setDayProgress(updated);
    cacheProgress(username, dateStr, updated);
    saveProgress(updated);

    if (exProg.completed) {
      setMode("idle");
      setTimer(0);
      // Auto-advance to next incomplete exercise
      if (activeIdx < workout.exercises.length - 1) {
        setActiveIdx(activeIdx + 1);
      }
    } else {
      setMode("resting");
      setTimer(restTime);
    }
  }

  function skipRest() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode("idle");
    setTimer(0);
  }

  function goTo(idx: number) {
    if (idx < 0 || idx >= workout.exercises.length) return;
    setActiveIdx(idx);
    setMode("idle");
    setTimer(0);
  }

  // ─── Swipe handlers ────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    // Don't capture swipes on buttons
    if ((e.target as HTMLElement).closest("button")) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
    swipeLocked.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    // First significant movement decides axis
    if (!swipeLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll — bail out
        setIsSwiping(false);
        setSwipeDelta(0);
        return;
      }
      swipeLocked.current = true;
    }

    if (swipeLocked.current) {
      // Dampen at edges
      const atEdge =
        (activeIdx === 0 && dx > 0) ||
        (activeIdx === workout.exercises.length - 1 && dx < 0);
      setSwipeDelta(atEdge ? dx * 0.2 : dx);
    }
  }

  function onTouchEnd() {
    if (!isSwiping) return;
    if (Math.abs(swipeDelta) > SWIPE_THRESHOLD) {
      if (swipeDelta < 0 && activeIdx < workout.exercises.length - 1) {
        goTo(activeIdx + 1);
      } else if (swipeDelta > 0 && activeIdx > 0) {
        goTo(activeIdx - 1);
      }
    }
    setSwipeDelta(0);
    setIsSwiping(false);
    swipeLocked.current = false;
  }

  // ─── Derived state ─────────────────────────────────────────────

  const completedCount = dayProgress?.exercises.filter((e) => e.completed).length ?? 0;
  const total = workout.exercises.length;
  const pct = total > 0 ? (completedCount / total) * 100 : 0;

  // ─── Rest day ──────────────────────────────────────────────────

  if (workout.isRest) {
    return (
      <div className="flex flex-col min-h-dvh">
        <TopBar
          username={username}
          selectedDay={selectedDay}
          isToday={isToday}
          saving={saving}
          showDayPicker={showDayPicker}
          setShowDayPicker={setShowDayPicker}
          onSelectDay={(d) => {
            setSelectedDay(d);
            setShowDayPicker(false);
            setActiveIdx(0);
            setMode("idle");
            setTimer(0);
            const w = workouts[d];
            if (w.isRest) setDayProgress(null);
            else
              setDayProgress({
                day: d,
                workoutName: w.name,
                exercises: w.exercises.map((ex) => ({
                  sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
                  completed: false,
                })),
                completed: false,
              });
          }}
          onLogout={onLogout}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">😌</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Rest Day</h2>
          <p className="text-zinc-400">Kuch nhi — rest, chill and focus on recovery.</p>
          <div className="mt-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800 max-w-xs">
            <p className="text-sm text-zinc-300">Recovery tips:</p>
            <ul className="text-sm text-zinc-400 mt-2 space-y-1 text-left">
              <li>- Stay hydrated</li>
              <li>- Get 7-8 hours of sleep</li>
              <li>- Light stretching if needed</li>
              <li>- Eat enough protein</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completed ─────────────────────────────────────────────────

  if (dayProgress?.completed) {
    return (
      <div className="flex flex-col min-h-dvh">
        <TopBar
          username={username}
          selectedDay={selectedDay}
          isToday={isToday}
          saving={saving}
          showDayPicker={showDayPicker}
          setShowDayPicker={setShowDayPicker}
          onSelectDay={(d) => {
            setSelectedDay(d);
            setShowDayPicker(false);
            setActiveIdx(0);
            setMode("idle");
            setTimer(0);
            const w = workouts[d];
            if (w.isRest) setDayProgress(null);
            else
              setDayProgress({
                day: d,
                workoutName: w.name,
                exercises: w.exercises.map((ex) => ({
                  sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
                  completed: false,
                })),
                completed: false,
              });
          }}
          onLogout={onLogout}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Workout Complete!</h2>
          <p className="text-zinc-400 mb-1">{workout.name} — Done</p>
          <p className="text-sm text-zinc-500">
            {completedCount}/{total} exercises finished
          </p>
        </div>
      </div>
    );
  }

  // ─── Active exercise data ──────────────────────────────────────

  const exercise = workout.exercises[activeIdx];
  const progress = dayProgress?.exercises[activeIdx];
  const completedSets = progress?.sets.filter((s) => s.completed).length ?? 0;
  const currentSet = completedSets + 1;
  const isDone = progress?.completed ?? false;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* ── Compact Header ────────────────────────────────────── */}
      <TopBar
        username={username}
        selectedDay={selectedDay}
        isToday={isToday}
        saving={saving}
        showDayPicker={showDayPicker}
        setShowDayPicker={setShowDayPicker}
        onSelectDay={(d) => {
          setSelectedDay(d);
          setShowDayPicker(false);
          setActiveIdx(0);
          setMode("idle");
          setTimer(0);
          const w = workouts[d];
          if (w.isRest) setDayProgress(null);
          else
            setDayProgress({
              day: d,
              workoutName: w.name,
              exercises: w.exercises.map((ex) => ({
                sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
                completed: false,
              })),
              completed: false,
            });
        }}
        onLogout={onLogout}
        workoutName={workout.name}
        completedCount={completedCount}
        total={total}
        pct={pct}
      />

      {/* ── Swipeable exercise card ───────────────────────────── */}
      <div
        className="flex-1 flex flex-col overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex-1 flex flex-col transition-transform duration-200 ease-out"
          style={{
            transform: `translateX(${swipeDelta}px)`,
            ...(isSwiping ? { transition: "none" } : {}),
          }}
        >
          {/* ── Exercise dots nav ─────────────────────────────── */}
          <div className="flex items-center justify-center gap-1.5 pt-3 pb-2 px-4">
            {workout.exercises.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIdx
                    ? "w-6 bg-orange-500"
                    : dayProgress?.exercises[i]?.completed
                      ? "w-1.5 bg-green-500"
                      : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {/* ── Main card content ─────────────────────────────── */}
          <div className="flex-1 flex flex-col px-5 pb-4 overflow-y-auto">
            {/* Exercise number + name */}
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-zinc-500">
                  {activeIdx + 1}/{total}
                </span>
                {isDone && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold leading-tight">{exercise.name}</h2>
              <p className="text-orange-400 font-medium mt-1">
                {exercise.sets} &times; {exercise.reps}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              {exercise.description}
            </p>

            {/* Form tip */}
            <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-[11px] text-orange-400/70 uppercase tracking-wider font-medium mb-1">
                Form Tip
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{exercise.tip}</p>
            </div>

            {/* Set progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Sets</span>
                <span className="text-sm font-mono text-zinc-400">
                  {completedSets} / {exercise.sets}
                </span>
              </div>
              <div className="flex gap-2">
                {progress?.sets.map((s, i) => (
                  <div
                    key={i}
                    className={`h-2.5 flex-1 rounded-full transition-colors ${
                      s.completed ? "bg-green-500" : "bg-zinc-800"
                    }`}
                  />
                )) ??
                  Array.from({ length: exercise.sets }, (_, i) => (
                    <div key={i} className="h-2.5 flex-1 rounded-full bg-zinc-800" />
                  ))}
              </div>
            </div>

            {/* Timer / Status area */}
            <div className="mt-auto pt-6">
              {mode === "resting" ? (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Rest
                  </p>
                  <div className="text-6xl font-mono font-bold text-blue-400 pulse-active">
                    {fmt(timer)}
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    Next: Set {currentSet} of {exercise.sets}
                  </p>
                </div>
              ) : mode === "working" ? (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Working
                  </p>
                  <div className="text-6xl font-mono font-bold text-orange-400 pulse-active">
                    {fmt(timer)}
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    Set {Math.min(currentSet, exercise.sets)} &middot; {exercise.reps}
                  </p>
                </div>
              ) : null}

              {/* Rest timer config */}
              {isToday && mode === "idle" && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[11px] text-zinc-600">Rest:</span>
                  {[30, 45, 60, 90].map((t) => (
                    <button
                      key={t}
                      onClick={() => setRestTime(t)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        restTime === t
                          ? "bg-orange-500/20 text-orange-400 font-medium"
                          : "bg-zinc-800/50 text-zinc-600"
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom action area ────────────────────────────────── */}
      {isToday && (
        <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 bg-[#0a0a0a] border-t border-zinc-800/50">
          {isDone ? (
            <div className="flex gap-3">
              {activeIdx > 0 && (
                <button
                  onClick={() => goTo(activeIdx - 1)}
                  className="flex-1 py-3.5 bg-zinc-800 rounded-xl font-medium text-zinc-400 active:scale-95 transition-transform"
                >
                  ← Prev
                </button>
              )}
              {activeIdx < total - 1 ? (
                <button
                  onClick={() => goTo(activeIdx + 1)}
                  className="flex-1 py-3.5 bg-orange-500 rounded-xl font-bold text-lg active:scale-95 transition-transform"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (dayProgress) {
                      const updated = { ...dayProgress, completed: true };
                      setDayProgress(updated);
                      cacheProgress(username, dateStr, updated);
                      saveProgress(updated);
                    }
                  }}
                  className="flex-1 py-3.5 bg-green-600 rounded-xl font-bold text-lg active:scale-95 transition-transform"
                >
                  Finish Workout
                </button>
              )}
            </div>
          ) : mode === "idle" ? (
            <button
              onClick={startSet}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg active:scale-[0.97] transition-all"
            >
              {completedSets === 0
                ? `Start Set 1`
                : `Start Set ${currentSet}`}
            </button>
          ) : mode === "working" ? (
            <button
              onClick={completeSet}
              className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg active:scale-[0.97] transition-all"
            >
              Done ✓
            </button>
          ) : (
            <button
              onClick={skipRest}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-lg active:scale-[0.97] transition-all"
            >
              Skip Rest →
            </button>
          )}

          {/* Swipe hint */}
          <p className="text-center text-[10px] text-zinc-700 mt-2">
            swipe left / right to navigate exercises
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function TopBar({
  username,
  selectedDay,
  isToday,
  saving,
  showDayPicker,
  setShowDayPicker,
  onSelectDay,
  onLogout,
  workoutName,
  completedCount,
  total,
  pct,
}: {
  username: string;
  selectedDay: string;
  isToday: boolean;
  saving: boolean;
  showDayPicker: boolean;
  setShowDayPicker: (v: boolean) => void;
  onSelectDay: (d: string) => void;
  onLogout: () => void;
  workoutName?: string;
  completedCount?: number;
  total?: number;
  pct?: number;
}) {
  return (
    <header className="shrink-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-orange-400">Kaam Chlra</h1>
            {saving && (
              <span className="text-[10px] text-zinc-600 animate-pulse">saving</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-600 truncate">Hey, {username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDayPicker(!showDayPicker)}
            className="px-2.5 py-1 text-xs bg-zinc-800 rounded-lg border border-zinc-700/50"
          >
            {selectedDay.slice(0, 3)} {isToday && "• Today"}
          </button>
          <button
            onClick={onLogout}
            className="text-[11px] text-zinc-600 hover:text-zinc-400"
          >
            Exit
          </button>
        </div>
      </div>

      {showDayPicker && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
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

      {workoutName && total != null && completedCount != null && pct != null && (
        <div className="mt-1.5">
          <div className="flex justify-between text-[11px] text-zinc-600 mb-0.5">
            <span>{workoutName}</span>
            <span>
              {completedCount}/{total}
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
