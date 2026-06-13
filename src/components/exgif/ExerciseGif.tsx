import "./exgif.css";
import { EXERCISE_GIF } from "./exercise-gifs";
import { categorize, ACCENT } from "./categorize";

// Every exercise maps to a real local image (dataset GIF or web-sourced
// GIF/photo). A neutral placeholder shows only if a file is somehow missing.
export function ExerciseGif({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const file = EXERCISE_GIF[name];
  const accent = ACCENT[categorize(name)];
  return (
    <div
      className={`exgif-wrap ${className}`}
      style={{ ["--accent" as string]: accent }}
      aria-hidden="true"
    >
      <div className="exgif-card exgif-card-light">
        {file ? (
          // eslint-disable-next-line @next/next/no-img-element -- animated GIFs aren't optimized by next/image
          <img
            src={`/exercises/${file}`}
            alt=""
            className="exgif-img"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="exgif-placeholder">🏋️</div>
        )}
      </div>
    </div>
  );
}

export function hasGif(name: string): boolean {
  return !!EXERCISE_GIF[name];
}
