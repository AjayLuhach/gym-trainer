"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getWorkouts,
  isLevel,
  type DayWorkout,
  type Level,
  LEVEL_LABELS,
  getDateString,
} from "@/data/workouts";
import { ExerciseGif } from "@/components/exgif/ExerciseGif";

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

type Mode = "idle" | "working" | "paused" | "resting";

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

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SWIPE_THRESHOLD = 60;

function makeProgress(day: string, w: DayWorkout): DayProgress {
  return {
    day,
    workoutName: w.name,
    exercises: w.exercises.map((ex) => ({
      sets: Array.from({ length: ex.sets }, () => ({ completed: false })),
      completed: false,
    })),
    completed: false,
  };
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration-safe: localStorage is unavailable during SSR, so we read it
    // after mount. These synchronous setState calls are intentional.
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    try {
      const stored = localStorage.getItem("trainer_username");
      if (stored) setUsername(stored);
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
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
    setInputName("");
  }

  if (!mounted) {
    return (
      <div className="flex-1 grid place-items-center">
        <Wordmark className="text-5xl" />
      </div>
    );
  }

  if (!username) {
    return (
      <div className="flex-1 flex flex-col justify-center px-7 pb-[max(2rem,var(--safe-b))]">
        <div className="absolute -top-16 right-[-25%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(194,247,62,0.18),transparent_70%)] blur-2xl pointer-events-none float-y" />

        <div className="reveal reveal-1 relative">
          <p className="font-display text-xs tracking-[0.3em] text-go mb-3">
            DAILY TRAINING
          </p>
          <Wordmark className="text-[clamp(3rem,18vw,5rem)] leading-[0.85]" />
          <p className="text-neutral-400 text-lg mt-4 max-w-[20rem]">
            Show up, put in the work, track every rep.
          </p>
        </div>

        <div className="reveal reveal-3 mt-10 space-y-3 relative">
          <input
            type="text"
            placeholder="What's your name?"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-5 py-4 bg-surface border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:border-go focus:outline-none text-lg transition-colors"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!inputName.trim()}
            className="btn-go w-full py-4 rounded-2xl font-display text-xl tracking-wide disabled:opacity-30 disabled:shadow-none active:scale-[0.98] transition-transform"
          >
            LET&apos;S GO
          </button>
        </div>
      </div>
    );
  }

  return <WorkoutApp username={username} onLogout={handleLogout} />;
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-display leading-none ${className}`}>
      <span className="text-white">STAY </span>
      <span className="text-grad-go">FIT</span>
    </h1>
  );
}

// ─── Workout App ────────────────────────────────────────────────────────────

function WorkoutApp({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => void;
}) {
  const [level, setLevel] = useState<Level>(() => {
    try {
      const stored = localStorage.getItem("trainer_level");
      return isLevel(stored) ? stored : "beginner";
    } catch {
      return "beginner";
    }
  });
  const [selectedDay, setSelectedDay] = useState(() => DAYS[new Date().getDay()]);
  const [dayProgress, setDayProgress] = useState<DayProgress | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [timer, setTimer] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [sheet, setSheet] = useState<"none" | "day" | "level">("none");
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Swipe state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeLocked = useRef(false);

  const allDayWorkouts = getWorkouts(level);
  const workout: DayWorkout = allDayWorkouts[selectedDay];
  const dateStr = getDateString();
  const isToday = DAYS[new Date().getDay()] === selectedDay;

  // ─── Load progress ──────────────────────────────────────────────

  function resumeFrom(progress: DayProgress) {
    setDayProgress(progress);
    if (progress.completed) return;
    const idx = progress.exercises.findIndex((e) => !e.completed);
    if (idx !== -1) setActiveIdx(idx);
  }

  useEffect(() => {
    const cached = getCachedProgress(username, dateStr);
    if (cached && isToday) resumeFrom(cached);

    fetch(`/api/user?name=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((data: UserData) => {
        if (data.progress?.[dateStr] && isToday) {
          resumeFrom(data.progress[dateStr]);
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
    setDayProgress(makeProgress(selectedDay, workout));
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
          body: JSON.stringify({
            name: username,
            date: dateStr,
            dayProgress: progress,
          }),
        });
      } catch {}
      setSaving(false);
    },
    [username, dateStr],
  );

  // ─── Timer ──────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === "working") {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (mode === "resting") {
      intervalRef.current = setInterval(
        () => setTimer((t) => Math.max(0, t - 1)),
        1000,
      );
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  // Auto-start working timer when rest countdown reaches 0
  useEffect(() => {
    if (mode === "resting" && timer === 0) {
      vibrate([30, 20, 30]);
      setMode("working");
      setTimer(0);
    }
  }, [timer, mode]);

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
      if (activeIdx < workout.exercises.length - 1) {
        setActiveIdx(activeIdx + 1);
        setMode("resting");
        setTimer(restTime);
      } else {
        setMode("idle");
        setTimer(0);
      }
    } else {
      setMode("resting");
      setTimer(restTime);
    }
  }

  function skipRest() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode("working");
    setTimer(0);
  }

  function pauseSet() {
    vibrate(30);
    setMode("paused");
  }

  function resumeSet() {
    vibrate(30);
    setMode("working");
  }

  function goTo(idx: number) {
    if (idx < 0 || idx >= workout.exercises.length) return;
    setActiveIdx(idx);
    setMode("idle");
    setTimer(0);
  }

  function finishWorkout() {
    if (!dayProgress) return;
    const updated = { ...dayProgress, completed: true };
    setDayProgress(updated);
    cacheProgress(username, dateStr, updated);
    saveProgress(updated);
  }

  // ─── Swipe handlers ────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
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

    if (!swipeLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      if (Math.abs(dy) > Math.abs(dx)) {
        setIsSwiping(false);
        setSwipeDelta(0);
        return;
      }
      swipeLocked.current = true;
    }

    if (swipeLocked.current) {
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

  // ─── Day / level switching ─────────────────────────────────────

  function selectDay(d: string) {
    setSelectedDay(d);
    setSheet("none");
    setActiveIdx(0);
    setMode("idle");
    setTimer(0);
    const w = allDayWorkouts[d];
    setDayProgress(w.isRest ? null : makeProgress(d, w));
  }

  function changeLevel(newLevel: Level) {
    setLevel(newLevel);
    setSheet("none");
    localStorage.setItem("trainer_level", newLevel);
    const w = getWorkouts(newLevel)[selectedDay];
    setDayProgress(w.isRest ? null : makeProgress(selectedDay, w));
    setActiveIdx(0);
    setMode("idle");
    setTimer(0);
  }

  // ─── Derived state ─────────────────────────────────────────────

  const completedCount =
    dayProgress?.exercises.filter((e) => e.completed).length ?? 0;
  const total = workout.exercises.length;
  const pct = total > 0 ? (completedCount / total) * 100 : 0;

  const topBar = (
    <TopBar
      username={username}
      selectedDay={selectedDay}
      isToday={isToday}
      saving={saving}
      sheet={sheet}
      setSheet={setSheet}
      onSelectDay={selectDay}
      onLogout={onLogout}
      level={level}
      onChangeLevel={changeLevel}
      workoutName={workout.isRest ? undefined : workout.name}
      completedCount={completedCount}
      total={total}
      pct={pct}
    />
  );

  // ─── Rest day ──────────────────────────────────────────────────

  if (workout.isRest) {
    return (
      <div className="flex flex-col h-full">
        {topBar}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-40 h-40 grid place-items-center rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.22),transparent_70%)] reveal reveal-1">
            <span className="text-7xl">🧘</span>
          </div>
          <h2 className="font-display text-4xl text-grad-rest mt-4 reveal reveal-2">
            REST DAY
          </h2>
          <p className="text-neutral-400 mt-2 reveal reveal-2 max-w-xs">
            Recovery is where the gains happen. Take it easy today.
          </p>
          <div className="card mt-8 p-5 max-w-xs w-full text-left reveal reveal-3">
            <p className="font-display text-sm tracking-widest text-rest mb-3">
              RECOVERY CHECKLIST
            </p>
            <ul className="space-y-2.5 text-[15px] text-neutral-300">
              {[
                "Drink plenty of water",
                "Sleep 7–8 hours",
                "Light stretching or a walk",
                "Get enough protein",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="text-rest">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completed ─────────────────────────────────────────────────

  if (dayProgress?.completed) {
    return (
      <div className="flex flex-col h-full">
        {topBar}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
          <Confetti />
          <div className="pop-in relative">
            <div className="w-40 h-40 rounded-full grid place-items-center bg-[radial-gradient(circle,rgba(194,247,62,0.25),transparent_70%)]">
              <span className="text-7xl">🏆</span>
            </div>
          </div>
          <h2 className="font-display text-5xl text-grad-go mt-3 pop-in">
            CRUSHED IT
          </h2>
          <p className="text-neutral-300 mt-3 text-lg">{workout.name}</p>
          <p className="text-neutral-500 mt-1">
            {total} exercises · all done
          </p>
          {isToday && (
            <button
              onClick={resetProgress}
              className="mt-9 px-7 py-3.5 card font-display tracking-wide text-lg active:scale-95 transition-transform"
            >
              RESTART SESSION
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Active exercise ───────────────────────────────────────────

  const exercise = workout.exercises[activeIdx];
  const progress = dayProgress?.exercises[activeIdx];
  const completedSets = progress?.sets.filter((s) => s.completed).length ?? 0;
  const currentSet = completedSets + 1;
  const isDone = progress?.completed ?? false;
  const timing = mode === "working" || mode === "paused" || mode === "resting";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {topBar}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Focused exercise column */}
        <div className="flex flex-col min-h-0 h-full w-full lg:w-[440px] lg:shrink-0 lg:border-r lg:border-white/8">

      {/* Pager dots */}
      <div className="shrink-0 flex items-center justify-center gap-1.5 pt-2.5 pb-1 px-4">
        {workout.exercises.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to exercise ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIdx
                ? "w-7 bg-go"
                : dayProgress?.exercises[i]?.completed
                  ? "w-1.5 bg-go/45"
                  : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Swipeable body */}
      <div
        className="flex-1 flex flex-col overflow-hidden select-none min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex-1 flex flex-col min-h-0"
          style={{
            transform: `translateX(${swipeDelta}px)`,
            transition: isSwiping ? "none" : "transform 0.2s ease-out",
          }}
        >
          {/* Hero — illustration, morphs to timer while training */}
          <div className="shrink-0 relative h-[clamp(150px,30vh,250px)] mt-1">
            <div className="absolute left-4 top-1 z-10 font-display text-xs tracking-widest text-neutral-500">
              {activeIdx + 1} / {total}
            </div>
            {isDone && (
              <div className="absolute right-4 top-1 z-10 text-xs font-semibold px-2.5 py-1 rounded-full bg-go/15 text-go">
                ✓ Done
              </div>
            )}

            <div
              className={`h-full transition-all duration-300 ${
                timing ? "scale-90 opacity-25 blur-[1px]" : "opacity-100"
              }`}
            >
              <ExerciseGif name={exercise.name} />
            </div>

            {timing && (
              <div className="absolute inset-0 grid place-items-center">
                <TimerDial
                  mode={mode}
                  timer={timer}
                  restTime={restTime}
                  currentSet={Math.min(currentSet, exercise.sets)}
                  totalSets={exercise.sets}
                  reps={exercise.reps}
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-3xl leading-[0.95] uppercase">
                {exercise.name}
              </h2>
              <span className="shrink-0 mt-1 font-display text-lg text-go whitespace-nowrap">
                {exercise.sets}&times;{exercise.reps}
              </span>
            </div>

            <div className="card mt-3 p-3.5 mb-2">
              <p className="text-[15px] text-neutral-300 leading-relaxed">
                {exercise.description}
              </p>
              <div className="mt-3 pt-3 border-t border-white/8 flex gap-2.5">
                <span className="shrink-0 text-[10px] font-display tracking-widest text-go mt-0.5">
                  TIP
                </span>
                <p className="text-[14px] text-neutral-400 leading-relaxed">
                  {exercise.tip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control deck */}
      <div className="shrink-0 px-4 pt-3 pb-[max(0.6rem,var(--safe-b))] bg-ink/80 backdrop-blur border-t border-white/8">
        {/* Set pips */}
        <div className="flex items-center gap-2 mb-3">
          {(progress?.sets ?? Array.from({ length: exercise.sets }, () => ({ completed: false }))).map(
            (s, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s.completed
                    ? "bg-go"
                    : i === completedSets && !isDone
                      ? "bg-go/30"
                      : "bg-white/10"
                }`}
              />
            ),
          )}
          <span className="ml-1 font-display text-sm tnum text-neutral-400">
            {completedSets}/{exercise.sets}
          </span>
        </div>

        {/* Rest-duration picker (only when idle & not done) */}
        {!isToday ? (
          <div className="py-3 text-center text-sm text-neutral-500">
            Viewing {selectedDay} — switch to today to train
          </div>
        ) : isDone ? (
          <div className="flex gap-3">
            {activeIdx > 0 && (
              <button
                onClick={() => goTo(activeIdx - 1)}
                className="px-5 py-3.5 card font-display tracking-wide text-neutral-300 active:scale-95 transition-transform"
              >
                PREV
              </button>
            )}
            {activeIdx < total - 1 ? (
              <button
                onClick={() => goTo(activeIdx + 1)}
                className="btn-go flex-1 py-3.5 rounded-2xl font-display text-lg tracking-wide active:scale-[0.98] transition-transform"
              >
                NEXT EXERCISE →
              </button>
            ) : (
              <button
                onClick={finishWorkout}
                className="btn-go flex-1 py-3.5 rounded-2xl font-display text-lg tracking-wide active:scale-[0.98] transition-transform"
              >
                FINISH WORKOUT
              </button>
            )}
          </div>
        ) : mode === "idle" ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs text-neutral-600">REST</span>
              {[30, 45, 60, 90].map((t) => (
                <button
                  key={t}
                  onClick={() => setRestTime(t)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    restTime === t
                      ? "bg-rest/20 text-rest font-semibold"
                      : "bg-white/5 text-neutral-500"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <button
              onClick={startSet}
              className="btn-go w-full py-4 rounded-2xl font-display text-xl tracking-wide active:scale-[0.98] transition-transform"
            >
              {completedSets === 0 ? "START SET 1" : `CONTINUE · SET ${currentSet}`}
            </button>
          </>
        ) : mode === "working" ? (
          <div className="flex gap-3">
            <button
              onClick={pauseSet}
              className="px-6 py-4 card font-display tracking-wide text-neutral-300 active:scale-95 transition-transform"
            >
              PAUSE
            </button>
            <button
              onClick={completeSet}
              className="btn-go flex-1 py-4 rounded-2xl font-display text-xl tracking-wide active:scale-[0.98] transition-transform"
            >
              SET DONE ✓
            </button>
          </div>
        ) : mode === "paused" ? (
          <div className="flex gap-3">
            <button
              onClick={resumeSet}
              className="px-6 py-4 rounded-2xl font-display tracking-wide bg-rest text-white active:scale-95 transition-transform"
            >
              RESUME
            </button>
            <button
              onClick={completeSet}
              className="btn-go flex-1 py-4 rounded-2xl font-display text-xl tracking-wide active:scale-[0.98] transition-transform"
            >
              SET DONE ✓
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setTimer((t) => t + 20)}
              className="px-5 py-4 rounded-2xl font-display tracking-wide bg-rest/15 text-rest border border-rest/25 active:scale-95 transition-transform"
            >
              +20s
            </button>
            <button
              onClick={skipRest}
              className="flex-1 py-4 rounded-2xl font-display text-lg tracking-wide bg-white/8 text-white active:scale-[0.98] transition-transform"
            >
              SKIP REST →
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-neutral-700 mt-2 lg:hidden">
          swipe to change exercise
        </p>
      </div>
        </div>

        {/* Desktop: today's session grid */}
        <aside className="hidden lg:flex flex-col flex-1 min-w-0 min-h-0">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <p className="font-display text-xs tracking-[0.3em] text-go">
              TODAY&apos;S SESSION
            </p>
            <h2 className="font-display text-2xl uppercase leading-none mt-1">
              {workout.name}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 grid grid-cols-2 xl:grid-cols-3 gap-3 content-start">
            {workout.exercises.map((ex, i) => {
              const exDone = dayProgress?.exercises[i]?.completed;
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`text-left rounded-2xl p-2 border transition-all ${
                    isActive
                      ? "border-go/60 bg-go/[0.06]"
                      : exDone
                        ? "border-white/8 bg-white/[0.02] opacity-65 hover:opacity-100"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="relative w-full aspect-square">
                    <ExerciseGif name={ex.name} />
                    <span className="absolute top-1 left-1.5 font-display text-[11px] text-neutral-500">
                      {i + 1}
                    </span>
                    {exDone && (
                      <span className="absolute top-1 right-1.5 text-go text-sm">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] leading-tight mt-1.5 line-clamp-2">
                    {ex.name}
                  </p>
                  <span className="font-display text-[11px] text-go">
                    {ex.sets}&times;{ex.reps}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Timer dial ───────────────────────────────────────────────────────────────

function TimerDial({
  mode,
  timer,
  restTime,
  currentSet,
  totalSets,
  reps,
}: {
  mode: Mode;
  timer: number;
  restTime: number;
  currentSet: number;
  totalSets: number;
  reps: string;
}) {
  const resting = mode === "resting";
  const paused = mode === "paused";
  const frac = resting && restTime > 0 ? timer / restTime : 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  const accent = resting
    ? "var(--color-rest)"
    : paused
      ? "var(--color-gold)"
      : "var(--color-go)";

  return (
    <div className="relative w-[clamp(150px,42vw,200px)] aspect-square grid place-items-center">
      {resting && (
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90 w-full h-full">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="var(--color-rest)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
      )}
      <div
        className={`flex flex-col items-center justify-center rounded-full w-[78%] h-[78%] ${
          mode === "working" ? "halo-go" : resting ? "halo-rest" : ""
        }`}
      >
        <span
          className="font-display text-[11px] tracking-[0.25em]"
          style={{ color: accent }}
        >
          {resting ? "REST" : paused ? "PAUSED" : "WORK"}
        </span>
        <span
          className="font-display text-[clamp(2.7rem,15vw,3.6rem)] leading-none tnum"
          style={{ color: accent }}
        >
          {fmt(timer)}
        </span>
        <span className="text-[11px] text-neutral-500 mt-1">
          {resting ? `Next · Set ${currentSet}/${totalSets}` : `Set ${currentSet} · ${reps}`}
        </span>
      </div>
    </div>
  );
}

// ─── Confetti (celebration) ─────────────────────────────────────────────────

function Confetti() {
  const COLORS = ["#c2f73e", "#a78bfa", "#fb5b78", "#2dd4bf", "#fbbf24"];
  const bits = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bits.map((i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-2 rounded-xs pop-in"
          style={{
            left: `${(i * 53) % 100}%`,
            background: COLORS[i % COLORS.length],
            transform: `translateY(${(i % 5) * 18 + 10}px) rotate(${i * 40}deg)`,
            animationDelay: `${(i % 6) * 0.08}s`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function TopBar({
  username,
  selectedDay,
  isToday,
  saving,
  sheet,
  setSheet,
  onSelectDay,
  onLogout,
  level,
  onChangeLevel,
  workoutName,
  completedCount,
  total,
  pct,
}: {
  username: string;
  selectedDay: string;
  isToday: boolean;
  saving: boolean;
  sheet: "none" | "day" | "level";
  setSheet: (v: "none" | "day" | "level") => void;
  onSelectDay: (d: string) => void;
  onLogout: () => void;
  level: Level;
  onChangeLevel: (l: Level) => void;
  workoutName?: string;
  completedCount?: number;
  total?: number;
  pct?: number;
}) {
  const LEVELS: Level[] = ["beginner", "strength"];
  const todayName = DAYS[new Date().getDay()];
  return (
    <header className="shrink-0 px-4 pt-[max(0.7rem,var(--safe-t))] pb-2.5 relative z-20">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wordmark className="text-xl" />
            {saving && (
              <span className="text-[10px] text-go/70 animate-pulse">
                ● saving
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 truncate -mt-0.5">
            Hey {username} 👋
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip active={sheet === "level"} onClick={() => setSheet(sheet === "level" ? "none" : "level")}>
            {LEVEL_LABELS[level]}
          </Chip>
          <Chip active={sheet === "day"} onClick={() => setSheet(sheet === "day" ? "none" : "day")}>
            {selectedDay.slice(0, 3)} {isToday && <span className="text-go">•</span>}
          </Chip>
          <button
            onClick={onLogout}
            aria-label="Exit"
            className="w-8 h-8 grid place-items-center rounded-lg text-neutral-500 hover:text-neutral-300"
          >
            ⏻
          </button>
        </div>
      </div>

      {sheet === "level" && (
        <div className="flex gap-2 mt-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => onChangeLevel(l)}
              className={`flex-1 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                l === level
                  ? "btn-go font-semibold"
                  : "bg-white/5 text-neutral-400"
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      )}

      {sheet === "day" && (
        <div className="grid grid-cols-7 gap-1.5 mt-3">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`py-2.5 text-xs rounded-xl font-medium transition-colors ${
                d === selectedDay
                  ? "btn-go"
                  : d === todayName
                    ? "bg-white/10 text-go"
                    : "bg-white/5 text-neutral-400"
              }`}
            >
              {DAY_ABBR[i].slice(0, 2)}
            </button>
          ))}
        </div>
      )}

      {workoutName && total != null && completedCount != null && pct != null && (
        <div className="mt-2.5">
          <div className="flex justify-between items-baseline text-[13px] mb-1.5">
            <span className="text-neutral-300 font-medium truncate">{workoutName}</span>
            <span className="font-display text-neutral-400 tnum shrink-0 ml-2">
              {completedCount}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,#9be600,#c2f73e)",
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[13px] rounded-full border transition-colors ${
        active
          ? "border-go/50 bg-go/10 text-go"
          : "border-white/10 bg-white/5 text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}
