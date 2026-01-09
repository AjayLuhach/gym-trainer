export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "12" or "1 min" or "30s"
  description: string;
  tip: string;
}

export interface DayWorkout {
  name: string;
  isRest: boolean;
  exercises: Exercise[];
}

export const workouts: Record<string, DayWorkout> = {
  Monday: {
    name: "Upper Body Strength",
    isRest: false,
    exercises: [
      {
        name: "Standard Push-Ups",
        sets: 3,
        reps: "12",
        description: "Classic push-up targeting chest, shoulders, and triceps.",
        tip: "Keep your body in a straight line from head to heels. Lower until chest nearly touches the floor.",
      },
      {
        name: "Resistance Band Chest Press (Slow 5sec)",
        sets: 3,
        reps: "15",
        description: "Slow controlled chest press using resistance band for constant tension.",
        tip: "Take 5 seconds on each rep. Anchor band behind you, press forward at chest height.",
      },
      {
        name: "Pike Push-Ups",
        sets: 3,
        reps: "10",
        description: "Targets shoulders and upper chest. Like a push-up but with hips high.",
        tip: "Form an inverted V shape. Lower your head toward the ground between your hands.",
      },
      {
        name: "Band Straight Punch (Jab Cross)",
        sets: 3,
        reps: "20 each arm",
        description: "Punch forward against band resistance, alternating jab and cross.",
        tip: "Anchor band behind you. Rotate hips with each punch for full power.",
      },
      {
        name: "Band Hook Punch",
        sets: 3,
        reps: "15 each side",
        description: "Horizontal hook punch against band resistance.",
        tip: "Keep elbow at 90°, rotate your torso to drive the punch. Band anchored to the side.",
      },
      {
        name: "Band Uppercut Punch",
        sets: 3,
        reps: "15 each side",
        description: "Upward punch motion against band resistance.",
        tip: "Drive from your legs, scoop upward. Keep core tight throughout the movement.",
      },
    ],
  },
  Tuesday: {
    name: "Glutes & Legs",
    isRest: false,
    exercises: [
      {
        name: "Band Squats",
        sets: 3,
        reps: "20",
        description: "Squats with resistance band around thighs for added glute activation.",
        tip: "Push knees out against the band. Go below parallel if possible.",
      },
      {
        name: "Sumo Squats",
        sets: 3,
        reps: "15",
        description: "Wide-stance squat targeting inner thighs and glutes.",
        tip: "Feet wider than shoulder width, toes pointed out at 45°. Keep chest up.",
      },
      {
        name: "Resistance Band Glute Bridge",
        sets: 3,
        reps: "15",
        description: "Lie on back, band around thighs, drive hips up squeezing glutes.",
        tip: "Push knees apart at the top. Hold the squeeze for 2 seconds.",
      },
      {
        name: "Walking Lunges",
        sets: 3,
        reps: "12 each leg",
        description: "Step forward into a lunge, alternate legs walking forward.",
        tip: "Keep front knee over ankle, not past toes. Take long strides.",
      },
      {
        name: "Resistance Band Lateral Walk",
        sets: 3,
        reps: "15 each side",
        description: "Side stepping with band around ankles for hip abductor work.",
        tip: "Stay low in a quarter-squat position. Keep tension in the band at all times.",
      },
      {
        name: "Standing Calf Raises",
        sets: 3,
        reps: "20",
        description: "Rise up on your toes, pause at the top, lower slowly.",
        tip: "Use a step edge for full range. Pause 2 seconds at the top.",
      },
      {
        name: "15-Min Walk",
        sets: 1,
        reps: "15 min",
        description: "Easy-paced walk to cool down and promote recovery.",
        tip: "Keep a comfortable pace. Focus on breathing and relaxation.",
      },
    ],
  },
  Wednesday: {
    name: "Core & Abs",
    isRest: false,
    exercises: [
      {
        name: "Sit-Ups",
        sets: 3,
        reps: "20",
        description: "Classic sit-up for upper abs and hip flexors.",
        tip: "Cross arms over chest or behind head. Control the descent — don't just drop back.",
      },
      {
        name: "Plank",
        sets: 3,
        reps: "1 min each (or 5 min total)",
        description: "Forearm plank for total core stabilization.",
        tip: "Keep hips level — don't sag or pike. Squeeze glutes and brace abs.",
      },
      {
        name: "Band Russian Twist",
        sets: 3,
        reps: "20",
        description: "Seated twist with band anchored to the side for oblique work.",
        tip: "Lean back slightly, feet off ground. Rotate from your torso, not just arms.",
      },
      {
        name: "Flutter Kicks",
        sets: 3,
        reps: "30s",
        description: "Lying on back, alternate kicking legs up and down rapidly.",
        tip: "Press lower back into the floor. Keep legs straight and kicks small.",
      },
      {
        name: "Leg Raises (Both Legs)",
        sets: 3,
        reps: "12",
        description: "Lying leg raise for lower abs.",
        tip: "Keep legs straight, lower slowly. Press lower back into the floor throughout.",
      },
      {
        name: "Neck Flexion (Front/Left/Right)",
        sets: 2,
        reps: "20",
        description: "Gentle neck strengthening in three directions.",
        tip: "Use your hand for light resistance. Move slowly and controlled — never jerk.",
      },
      {
        name: "Band Jab Cross",
        sets: 3,
        reps: "60s",
        description: "Fast jab-cross combo against band resistance for cardio finisher.",
        tip: "Stay light on your feet, rotate hips. Keep hands up between punches.",
      },
    ],
  },
  Thursday: {
    name: "Active Recovery",
    isRest: false,
    exercises: [
      {
        name: "Full-Body Band Stretch",
        sets: 1,
        reps: "10 min",
        description: "Use resistance band to assist stretching all major muscle groups.",
        tip: "Hold each stretch 20-30 seconds. Breathe deeply into the stretch.",
      },
      {
        name: "Downward Dog to Cobra Flow",
        sets: 2,
        reps: "10",
        description: "Yoga flow transitioning between downward dog and cobra pose.",
        tip: "Move with your breath — exhale into downward dog, inhale into cobra.",
      },
      {
        name: "Band Lateral Front Raise",
        sets: 3,
        reps: "15",
        description: "Raise arms to the front and side against band resistance.",
        tip: "Keep arms straight, control the descent. Don't swing — use slow, steady motion.",
      },
      {
        name: "Band Overhead Shoulder Press",
        sets: 3,
        reps: "15",
        description: "Press band overhead from shoulder height.",
        tip: "Stand on the band, press straight up. Keep core tight, don't arch your back.",
      },
      {
        name: "Wrist Curls (Resistance Band)",
        sets: 3,
        reps: "12",
        description: "Forearm strengthening — curl wrist upward against band.",
        tip: "Rest forearm on your thigh, only move the wrist. Slow and controlled.",
      },
      {
        name: "Reverse Wrist Curls (Resistance Band)",
        sets: 3,
        reps: "12",
        description: "Forearm extensor work — extend wrist upward against band.",
        tip: "Same position as wrist curls but palm faces down. Go lighter if needed.",
      },
      {
        name: "Shadowboxing with Band (Light)",
        sets: 3,
        reps: "1 min rounds",
        description: "Light boxing combinations with band resistance for active recovery.",
        tip: "Keep it light — focus on form and movement, not power. Stay loose.",
      },
      {
        name: "20-Min Walk",
        sets: 1,
        reps: "20 min",
        description: "Easy walk to promote blood flow and recovery.",
        tip: "Enjoy the walk. Keep it easy and relaxed.",
      },
    ],
  },
  Friday: {
    name: "Pull & Posture",
    isRest: false,
    exercises: [
      {
        name: "Band Seated Row",
        sets: 3,
        reps: "15",
        description: "Seated row pulling band toward your torso for back thickness.",
        tip: "Sit tall, pull elbows straight back. Squeeze shoulder blades together.",
      },
      {
        name: "Band Face Pull",
        sets: 3,
        reps: "15",
        description: "Pull band toward your face for rear delts and posture.",
        tip: "Pull to forehead level, elbows high. External rotate at the end — like a double bicep pose.",
      },
      {
        name: "Band Bent-Over Row",
        sets: 3,
        reps: "15",
        description: "Bent over row with band for mid-back development.",
        tip: "Hinge at hips, flat back. Pull band to lower chest, squeeze at the top.",
      },
      {
        name: "Band Deadlift",
        sets: 3,
        reps: "15",
        description: "Stand on band, hinge at hips and stand up — mimics deadlift movement.",
        tip: "Push hips back, keep back flat. Drive through heels to stand up.",
      },
      {
        name: "Band Bicep Curl",
        sets: 3,
        reps: "15",
        description: "Classic bicep curl using resistance band.",
        tip: "Stand on band, curl with palms up. Keep elbows pinned to your sides.",
      },
      {
        name: "Hammer Curl with Band",
        sets: 3,
        reps: "12",
        description: "Neutral grip curl targeting brachialis and forearms.",
        tip: "Palms face each other (neutral grip). Same form as bicep curl, just different grip.",
      },
    ],
  },
  Saturday: {
    name: "Power Legs + Core",
    isRest: false,
    exercises: [
      {
        name: "Aura Squats",
        sets: 3,
        reps: "12",
        description: "Deep squat variation focusing on control and mind-muscle connection.",
        tip: "Go deep, pause at the bottom for 2 seconds. Keep heels planted.",
      },
      {
        name: "Single-Leg Glute Bridge",
        sets: 3,
        reps: "10 each",
        description: "Glute bridge on one leg for unilateral strength.",
        tip: "Extend one leg straight, drive hips up with the other. Keep hips level.",
      },
      {
        name: "Band Good Mornings",
        sets: 3,
        reps: "15",
        description: "Hip hinge with band around neck/shoulders for hamstrings and lower back.",
        tip: "Band around back of neck, hinge at hips. Keep slight knee bend, flat back.",
      },
      {
        name: "Side Plank Hold",
        sets: 2,
        reps: "30s each side",
        description: "Lateral core hold on your forearm.",
        tip: "Stack feet or stagger them. Keep hips high — don't let them drop.",
      },
      {
        name: "Band Overhead Triceps Extension",
        sets: 3,
        reps: "12",
        description: "Extend arms overhead against band for triceps.",
        tip: "Anchor band low, grip behind head, extend arms upward. Keep elbows close to ears.",
      },
      {
        name: "Band Triceps Pushdown",
        sets: 3,
        reps: "15",
        description: "Push band downward for triceps isolation.",
        tip: "Anchor band high (door frame), push down keeping elbows pinned. Squeeze at the bottom.",
      },
    ],
  },
  Sunday: {
    name: "Rest & Recovery",
    isRest: true,
    exercises: [],
  },
};

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
  return { day: today, workout: workouts[today] };
}

export function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}
