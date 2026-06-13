// Maps an exercise name to a movement category + a per-muscle accent color
// (used for the card's accent ring). Standalone so the SVG system can be removed.

export type MoveCategory =
  | "neck" | "yoga" | "stretch" | "wrist" | "twist" | "plank" | "crunch"
  | "balance" | "calf" | "sidewalk" | "lunge" | "squat" | "kick" | "punch"
  | "triceps" | "bridge" | "hinge" | "row" | "raise" | "shoulderpress"
  | "curl" | "pushup" | "chestpress" | "generic";

const RULES: [RegExp, MoveCategory][] = [
  [/neck|chin tuck|tongue|jaw/, "neck"],
  [/downward dog|cobra/, "yoga"],
  [/stretch/, "stretch"],
  [/wrist/, "wrist"],
  [/twist/, "twist"],
  [/plank/, "plank"],
  [/sit-?up|leg raise|flutter/, "crunch"],
  [/balance/, "balance"],
  [/calf/, "calf"],
  [/lateral walk/, "sidewalk"],
  [/lunge|split squat/, "lunge"],
  [/squat/, "squat"],
  [/kick|roundhouse|leg swing/, "kick"],
  [/jab|cross|hook|uppercut|punch|shadowbox/, "punch"],
  [/tricep|pushdown|overhead.*extension/, "triceps"],
  [/glute bridge|hip thrust|kickback|hamstring curl|glute kick/, "bridge"],
  [/deadlift|romanian|good morning/, "hinge"],
  [/row|face pull|pulldown/, "row"],
  [/raise/, "raise"],
  [/overhead press|shoulder press|overhead shoulder/, "shoulderpress"],
  [/curl|bicep|21s/, "curl"],
  [/push-?up|pike/, "pushup"],
  [/chest|press|fly/, "chestpress"],
];

export function categorize(name: string): MoveCategory {
  const n = name.toLowerCase();
  for (const [re, cat] of RULES) if (re.test(n)) return cat;
  return "generic";
}

export const ACCENT: Record<MoveCategory, string> = {
  squat: "#c2f73e", lunge: "#c2f73e", calf: "#a3e635", balance: "#a3e635",
  sidewalk: "#bef264", kick: "#34d399", hinge: "#2dd4bf", bridge: "#2dd4bf",
  pushup: "#fb5b78", chestpress: "#fb7185", punch: "#fb923c",
  shoulderpress: "#fbbf24", raise: "#fcd34d", row: "#38bdf8", curl: "#a78bfa",
  triceps: "#c084fc", wrist: "#818cf8", plank: "#22d3ee", crunch: "#22d3ee",
  twist: "#06b6d4", stretch: "#c4b5fd", yoga: "#a5b4fc", neck: "#f0abfc",
  generic: "#c2f73e",
};
