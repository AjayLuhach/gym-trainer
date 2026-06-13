import { getWorkouts } from "@/data/workouts";
import { ExerciseGif, hasGif } from "@/components/exgif/ExerciseGif";

// Collect every unique exercise across both levels.
function allExercises() {
  const seen = new Map<string, string>(); // name -> reps label
  for (const level of ["beginner", "strength"] as const) {
    const wk = getWorkouts(level);
    for (const day of Object.keys(wk)) {
      for (const ex of wk[day].exercises) {
        if (!seen.has(ex.name)) seen.set(ex.name, `${ex.sets}×${ex.reps}`);
      }
    }
  }
  return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function Demo() {
  const exercises = allExercises();
  return (
    <div className="h-full overflow-y-auto">
      <header className="px-4 pt-[max(1rem,var(--safe-t))] pb-3">
        <p className="font-display text-xs tracking-[0.3em] text-go">
          REAL EXERCISE GIFS
        </p>
        <h1 className="font-display text-3xl mt-1">EVERY MOVE</h1>
        <p className="text-sm text-neutral-400 mt-1.5">
          All {exercises.length} exercises mapped to real images — mostly
          animated, muscle-highlighted demos in a consistent illustrated style.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pb-12">
        {exercises.map(([name, reps]) => (
          <div key={name} className="card p-2">
            <div className="w-full aspect-square">
              <ExerciseGif name={name} />
            </div>
            <div className="mt-2 flex items-start justify-between gap-1">
              <span className="text-[12px] leading-tight text-neutral-200">
                {name}
              </span>
              {!hasGif(name) && (
                <span className="shrink-0 text-[9px] font-display tracking-wider text-neutral-600 mt-0.5">
                  SVG
                </span>
              )}
            </div>
            <span className="text-[10px] text-go font-display">
              {reps}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
