import type { DayWorkout } from "./workouts";

// ═══════════════════════════════════════════════════════════════════════════
// STRENGTH — hypertrophy plan for a year of progression with bands only.
// 5 exercises per day, 3 sets each. 2 lower days, push, pull, dedicated arms.
// Equipment: resistance bands of varying levels + a mat. Nothing else.
// Progress by upgrading band level when the top of the rep range is hit
// on every set with strict form. Tempo and pause cues create the pump.
// ═══════════════════════════════════════════════════════════════════════════

export const strengthWorkouts: Record<string, DayWorkout> = {
  Monday: {
    name: "Glutes & Hamstrings",
    isRest: false,
    exercises: [
      {
        name: "Banded Hip Thrust (Floor)",
        sets: 3,
        reps: "12",
        description:
          "Primary glute builder. Lying on your back, drive hips up against a band looped across the hips and pinned under your feet. Highest direct glute activation of any band exercise.",
        tip: "Lie on your back, knees bent, feet flat. Loop a heavy band across your hip crease and trap each end firmly under the same-side foot. Drive hips up until your body forms a straight line from shoulder to knee. Squeeze glutes hard for a 2-second hold at the top, lower over 3 seconds. Push knees slightly out — do not let them cave in. Set 1: light band. Set 2: medium. Set 3: heaviest band where 12 is genuinely hard. Move up a level when you hit 12 strict reps on all 3 sets.",
      },
      {
        name: "Banded Romanian Deadlift",
        sets: 3,
        reps: "10-12",
        description:
          "Hamstring lengthener under load. Slow eccentric stretches the hamstrings while loaded — the strongest known driver of hamstring growth.",
        tip: "Stand on the centre of the band, grip the handles at thigh height. Push hips straight back (not down), keeping a soft knee bend, until you feel a deep stretch in the hamstrings. Lower over 3 seconds, drive up over 1 second by squeezing glutes. Back stays flat throughout — never round. Exhale at the top. Set 1: light. Set 2: medium. Set 3: heavy. Move up when you hit 12 clean reps on all sets.",
      },
      {
        name: "Banded Single-Leg Glute Bridge",
        sets: 3,
        reps: "12 each leg",
        description:
          "Unilateral glute work. Each side lifts independently, exposing and correcting side-to-side imbalances and forcing the working glute to do all the work.",
        tip: "Lie on your back with a band looped above the knees. One foot planted, opposite knee held to chest. Drive hip up until the body is a straight line from shoulder to knee. Squeeze the working glute hard for 2 seconds at the top, lower over 2 seconds. Keep hips level — if they tilt toward the lifted leg, slow down. Exhale on the drive up.",
      },
      {
        name: "Banded Lying Hamstring Curl",
        sets: 3,
        reps: "12-15",
        description:
          "Direct hamstring isolation. Curls the heel toward the glute against band tension — the only true knee-flexion movement available without machines.",
        tip: "Lie face down on the mat. Loop a band around one ankle and anchor the other end under a heavy piece of furniture (couch leg) or your other foot. Curl the heel toward the glute over 2 seconds, squeeze hard at the top for 1 second, lower over 3 seconds. Keep hips pressed into the mat — do not let them lift. Switch legs each set or do all reps on one side then the other.",
      },
      {
        name: "Banded Standing Glute Kickback",
        sets: 3,
        reps: "15 each leg",
        description:
          "Glute max isolation finisher. Kicks the leg straight back against band resistance, fully shortening the glute. Pure pump work to close out the day.",
        tip: "Loop band around ankles, stand on one foot holding a wall for balance. Kick the other leg straight back, squeeze the glute hard for 1 second at full extension, return slowly. Keep your back flat — if you lean forward to kick higher, you have lost the glute. Small range with full squeeze beats big range with no contraction. Move up a band level when 15 strict reps is easy on both legs.",
      },
    ],
  },
  Tuesday: {
    name: "Push — Chest, Shoulders, Triceps",
    isRest: false,
    exercises: [
      {
        name: "Push-Ups (Band Across Back)",
        sets: 3,
        reps: "10-12",
        description:
          "Compound chest builder. Loop a band across the upper back and under each hand to add resistance to the press. Targets chest, front delts, and triceps in one move.",
        tip: "Place the band across your upper back, ends pinned under each palm. Lower over 2 seconds until chest nearly touches the floor, press up in 1 second. Body straight from head to heels — no sagging hips, no hiked-up butt. If 12 is easy with the heaviest band you have, elevate your feet on a step. If 10 is too hard, drop the band and do regular push-ups.",
      },
      {
        name: "Banded Chest Press (3-1-3 Tempo)",
        sets: 3,
        reps: "10-12",
        description:
          "Slow chest press with constant band tension through the entire range. The 3-second eccentric and concentric maximises time under tension — the strongest hypertrophy signal you can create with bands.",
        tip: "Anchor the band behind you at chest height (door anchor or wedge it in a closed door). Press forward over 3 seconds, hold for 1 second at full extension while squeezing the pecs, return over 3 seconds. Do not lock out — keep tension on the chest throughout. Exhale during the press. Set 1: light band. Set 2: medium. Set 3: heaviest band where you reach failure around rep 10. Move up when you hit 12 on all sets.",
      },
      {
        name: "Banded Overhead Press",
        sets: 3,
        reps: "10-12",
        description:
          "Shoulder compound. Pressing overhead against band tension targets the front and medial deltoids and gives the upper chest secondary work.",
        tip: "Stand on the centre of the band, handles at shoulder height. Press straight up over 2 seconds, lower over 3 seconds. Stop just short of lockout — keep tension on the delts. Brace the core hard; if the lower back arches, the band is too heavy. Exhale on the press. Set 1: light. Set 2: medium. Set 3: heavy. Move up when you complete 12 strict reps on all sets.",
      },
      {
        name: "Banded Lateral Raise (Slow)",
        sets: 3,
        reps: "12-15",
        description:
          "Medial delt isolation — the muscle responsible for shoulder cap and width. Slow tempo is essential because the delts are a small muscle and heavy momentum kills the stimulus.",
        tip: "Stand on the centre of the band, handles at the sides. Raise arms straight out to shoulder height over 3 seconds, lower over 3 seconds. Lead with the elbows, not the wrists — imagine pouring water from a pitcher. Do not shrug the traps. Stop at shoulder height; going higher recruits traps and removes load from the delts. Set 1: light. Set 2: medium. Set 3: heavy.",
      },
      {
        name: "Banded Overhead Triceps Extension",
        sets: 3,
        reps: "12-15",
        description:
          "Long-head triceps isolation in the fully stretched position. The long head is the largest of the three triceps heads and grows best when loaded overhead.",
        tip: "Anchor the band low behind you (under a door or a heavy chair leg). Face away, arms overhead, hands gripping the band. Extend from behind your head to full lockout, squeeze for 1 second, lower over 3 seconds into a deep stretch. Keep elbows pointed forward and tucked close to your ears — they should not flare out. Inhale on the stretch, exhale on the extension.",
      },
    ],
  },
  Wednesday: {
    name: "Back & Biceps",
    isRest: false,
    exercises: [
      {
        name: "Banded Bent-Over Row (Wide Grip)",
        sets: 3,
        reps: "10-12",
        description:
          "Upper-back compound. Wide-grip row pulled to the upper chest hits the lats, rhomboids, and mid-traps — the muscles that build a thick, V-tapered back.",
        tip: "Stand on the band, hinge at the hips to roughly 45 degrees, grip the band wider than shoulder-width. Pull the band toward your upper chest, driving elbows out to the sides. Squeeze shoulder blades for 1 second at the top, lower over 3 seconds. Keep lower back flat — if it rounds, raise your torso angle slightly. Set 1: light. Set 2: medium. Set 3: heaviest band you can row with strict form.",
      },
      {
        name: "Banded Seated Row (Squeeze Hold)",
        sets: 3,
        reps: "10-12",
        description:
          "Mid-back thickness builder. The 2-second squeeze at the end of each rep maximises rhomboid and mid-trap activation in a position bodyweight rows cannot match.",
        tip: "Sit on the floor, legs extended, band looped around the soles of your feet. Pull elbows straight back along your ribs, squeeze shoulder blades together hard for 2 seconds at the end of each rep. Keep chest tall — do not round forward on the return. Inhale on the extension, exhale on the pull. Set 1: light. Set 2: medium. Set 3: heavy — aim for failure at 10. Move up when you hit 12 on all sets.",
      },
      {
        name: "Banded Straight-Arm Pulldown",
        sets: 3,
        reps: "12-15",
        description:
          "Lower-lat isolation. With straight arms and the band anchored high, this becomes a pure shoulder-extension move that hits the lats without bicep involvement — sculpts the lower-lat insertion just above the waist.",
        tip: "Anchor the band high (over a door, around a sturdy hook). Step back so the band has tension, lean forward slightly, arms straight out toward the anchor. Pull the band down to your thighs over 2 seconds with arms straight, squeeze the lats hard at the bottom for 1 second, return over 3 seconds. Slight bend in elbows is fine — do not curl the band down. Light to medium band; this is a feel exercise, not a strength one.",
      },
      {
        name: "Banded Good Morning",
        sets: 3,
        reps: "10-12",
        description:
          "Lower-back and erector spinae builder. The hip hinge with the band loaded across the upper back forces the lower-back erectors to fight extension — the strongest direct lower-back move available with bands.",
        tip: "Loop the band around the back of your neck and shoulders, standing on the other end with both feet. Slight knee bend, soft brace in the core. Hinge at the hips, lowering torso until you feel a deep stretch in the hamstrings and load in the lower back. Drive hips forward to return. Lower over 3 seconds, rise over 1 second. Back stays flat throughout — never round. Exhale at the top. Set 1: light. Set 2: medium. Set 3: heavy.",
      },
      {
        name: "Banded Bicep Curl (Slow)",
        sets: 3,
        reps: "10-12",
        description:
          "Bicep hypertrophy work. Slow eccentric is the highest-yield variable for arm growth — the muscle is forced to resist the stretch under tension.",
        tip: "Stand on the centre of the band, palms forward. Curl over 2 seconds, squeeze hard at the top for 1 second, lower over 3 seconds. Keep elbows pinned to your sides — if they drift forward, you are using momentum. Stop just short of the bottom to keep tension on the biceps. Set 1: light. Set 2: medium. Set 3: heavy. Move up a band when 12 reps is clean on all sets.",
      },
    ],
  },
  Thursday: {
    name: "Quads & Glute Med",
    isRest: false,
    exercises: [
      {
        name: "Banded Goblet Squat",
        sets: 3,
        reps: "10-12",
        description:
          "Primary quad and glute compound. Stand on the band and grip both handles at chest height — band tension peaks at the top of the squat where bodyweight squats lose tension.",
        tip: "Stand on the centre of the band, feet shoulder-width, toes slightly out. Pull the handles up to chest height and hold them there. Squat to full depth (hip crease below knee), drive up. Lower over 3 seconds, push up over 1 second. Keep chest tall, knees tracking over toes. Exhale on the drive up. Set 1: light. Set 2: medium. Set 3: heavy. Move up a band when you hit 12 clean reps on all sets.",
      },
      {
        name: "Bulgarian Split Squat (Banded)",
        sets: 3,
        reps: "10 each leg",
        description:
          "Single-leg quad and glute builder. The rear foot elevation forces the front leg to do almost all the work — one of the highest-output lower-body exercises available without weights.",
        tip: "Rear foot laces-down on a couch or step. Loop a band under the front foot and grip both ends at shoulder height. Keep torso upright. Lower over 3 seconds until the rear knee nearly touches the floor, drive up over 1 second through the front heel. The front shin can travel slightly forward — this is the cue for quad loading. Alternate legs between sets so each leg gets equal rest.",
      },
      {
        name: "Banded Sumo Squat (2s Pause)",
        sets: 3,
        reps: "12",
        description:
          "Wide-stance squat hitting adductors, inner glutes, and quads. The pause at the bottom kills the stretch reflex and forces the muscles to do all the lifting from a dead stop.",
        tip: "Feet wider than shoulders, toes turned out 30-45 degrees. Stand on the band, grip the handles at shoulder height. Lower until thighs are parallel, hold 2 seconds at the bottom, drive up. Keep chest upright — if you lean forward, the stance is too wide. Push knees out hard against an above-knee band if you have one. Set 1: light. Set 2: medium. Set 3: heavy.",
      },
      {
        name: "Banded Lateral Walks",
        sets: 3,
        reps: "15 steps each direction",
        description:
          "Glute medius isolation — the side glute responsible for hip stability and the rounded shape from the side view. Often undertrained relative to the glute max.",
        tip: "Loop band above knees (heavier) or around ankles (harder). Sink into a quarter squat and stay low throughout. Step laterally with control — small, deliberate steps with constant band tension. Do not let the trail leg snap toward the lead leg; walk it in slowly. 15 steps right, then 15 steps left = 1 set. Move up a band when both directions feel easy.",
      },
      {
        name: "Banded Calf Raise (Slow)",
        sets: 3,
        reps: "15-20",
        description:
          "Slow-tempo calf raises for gastrocnemius hypertrophy. Calves respond best to high time under tension because their fibre composition is endurance-biased.",
        tip: "Stand on the edge of a step (heels hanging off) holding a band looped under the ball of one foot, gripped at hip height. Rise over 2 seconds, hold the peak contraction for 2 seconds, lower over 3 seconds into a full stretch below the step. Do not bounce. Both legs at once is fine — for more challenge, do single-leg with the band on one side.",
      },
    ],
  },
  Friday: {
    name: "Arms — Biceps, Triceps, Forearms",
    isRest: false,
    exercises: [
      {
        name: "Banded Bicep Curl — 21s Method",
        sets: 3,
        reps: "21 (7+7+7)",
        description:
          "Mechanical drop set hitting the biceps through every portion of the strength curve without rest. 7 bottom-half reps, 7 top-half reps, 7 full-range reps. Brutal pump in one set.",
        tip: "Stand on the centre of the band, palms forward. First 7: curl from full extension to halfway (forearms parallel to floor). Next 7: from halfway to full contraction. Final 7: full range, full extension to full contraction. Do not release tension between segments. Pick a band where the final 7 full-range reps are genuinely hard. Set 1: light. Set 2: medium. Set 3: medium-heavy. Move up when you complete all 21 reps cleanly on the heaviest band.",
      },
      {
        name: "Banded Hammer Curl",
        sets: 3,
        reps: "10-12",
        description:
          "Neutral-grip curl targeting the brachialis (deep upper-arm muscle that pushes the biceps up) and brachioradialis (largest forearm muscle). The single highest-yield move for thicker arms.",
        tip: "Stand on the band, palms facing each other (thumbs up). Curl over 2 seconds, squeeze for 1 second at the top, lower over 3 seconds. Keep elbows pinned to your sides — if they drift forward, you are using momentum and losing the brachialis. Stop just short of the bottom to keep tension. Set 1: light. Set 2: medium. Set 3: heavy.",
      },
      {
        name: "Banded Triceps Pushdown",
        sets: 3,
        reps: "12-15",
        description:
          "Lateral and medial triceps head isolation. With the band anchored high, this hits the side and inner triceps — different from Tuesday's overhead extension which targets the long head.",
        tip: "Anchor the band high (over a door, around a sturdy hook). Stand facing the anchor, elbows pinned tight to your sides at 90 degrees. Push the band down to full lockout over 2 seconds, squeeze the triceps hard for 1 second, return over 3 seconds. Elbows do not move — only the forearms travel. If your elbows drift forward, the band is too heavy. Set 1: light. Set 2: medium. Set 3: heavy.",
      },
      {
        name: "Banded Triceps Kickback",
        sets: 3,
        reps: "12-15 each arm",
        description:
          "Triceps lateral head finisher. The bent-over position fully shortens the triceps at the top of each rep, creating peak contraction that builds the horseshoe shape on the back of the arm.",
        tip: "Stand on one end of the band, hinge forward at the hips to roughly 45 degrees with a flat back. Upper arm parallel to the floor and pinned to your side. Extend the forearm back to full lockout over 1 second, squeeze hard for 2 seconds, return over 2 seconds. Only the forearm moves — the upper arm stays locked. Switch arms each set or do all reps on one side then the other.",
      },
      {
        name: "Banded Wrist Curl Superset",
        sets: 3,
        reps: "15 + 15 each direction",
        description:
          "Forearm flexor and extensor pair. Wrist curls (palm up) build the inner forearm, reverse wrist curls (palm down) build the outer forearm — together they grow the full forearm and strengthen grip.",
        tip: "Sit on the mat, forearms resting on your thighs, palms up, holding the band under both feet. Curl the wrist up over 1 second, squeeze for 1 second, lower over 2 seconds — do 15 reps. Without rest, flip palms down (reverse wrist curl) and do 15 more reps. That is one set. Only the wrists move; forearms stay glued to your thighs. Reverse curls will need a lighter band — the extensors are weaker than the flexors.",
      },
    ],
  },
  Saturday: {
    name: "Stretch & Chest",
    isRest: false,
    exercises: [
      {
        name: "Full-Body Band Stretch",
        sets: 1,
        reps: "10 min",
        description:
          "Band-assisted static stretching for the muscle groups trained Mon-Fri. Bands let you gently increase range without forcing — key for recovery after a heavy 5-day block.",
        tip: "Hold each stretch for 30-45 seconds. Hit hamstrings, hip flexors, glutes, lats, pecs, and shoulders in that order. Use the band to gently deepen each stretch — never force. Breathe slowly into the position. Prioritise whichever area feels tightest from the week.",
      },
      {
        name: "Downward Dog to Cobra Flow",
        sets: 2,
        reps: "10",
        description:
          "Yoga flow that opens the chest, shoulders, and spine. Cobra extends the thoracic spine and stretches the pecs — perfect prep for the chest work that follows.",
        tip: "From downward dog, shift forward through plank into cobra, then press back. Each transition takes 3-4 seconds. In downward dog, push the floor away and press heels toward the ground. In cobra, squeeze glutes, open the chest, and pull shoulder blades down and back. Move with breath — exhale into dog, inhale into cobra.",
      },
      {
        name: "Banded Chest Fly",
        sets: 3,
        reps: "12-15",
        description:
          "Chest isolation in the fully stretched position. The fly hits the chest in a way the press cannot — it loads the pec at maximum length, the strongest hypertrophy stimulus for chest growth.",
        tip: "Anchor the band behind you at chest height. Stand facing away, arms out wide at shoulder height with a soft elbow bend. Bring your hands together in front of your chest in a hugging arc over 2 seconds, squeeze pecs hard for 1 second, return over 3 seconds into a deep stretch — feel the pecs lengthen. Do not change the elbow angle during the rep. Light to medium band only — this is a feel exercise. Set 1: light. Set 2: light-medium. Set 3: medium.",
      },
      {
        name: "Push-Ups (High Rep, Easy Pace)",
        sets: 3,
        reps: "10-15",
        description:
          "Bodyweight push-up at a comfortable pace for a second weekly chest stimulus. Stop 2-3 reps short of failure — this is a pump session, not a peak performance day.",
        tip: "Standard hand position, body straight from head to heels. Lower over 2 seconds, press up in 1 second. Stop with 2-3 reps in the tank — leaving fuel in the tank is the point. If 15 strict reps is easy, slow the eccentric to 4 seconds rather than going to failure. No band loading needed today.",
      },
      {
        name: "Banded Pec & Shoulder Stretch",
        sets: 1,
        reps: "45s each side",
        description:
          "Final chest stretch to wind down. Holding the loaded chest stretch counter-balances all the pressing of the week and helps maintain shoulder mobility.",
        tip: "Anchor the band at chest height. Hold one end with one arm extended out to the side, slightly behind your body. Rotate your torso away from the anchor so you feel a deep stretch through the front of the shoulder and pec. Hold for 45 seconds, breathing slowly. Switch sides. Should feel relieving, not painful.",
      },
    ],
  },
  Sunday: {
    name: "Rest & Recovery",
    isRest: true,
    exercises: [],
  },
};
