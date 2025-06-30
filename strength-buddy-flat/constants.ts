import { AccessorySuggestion } from "./types";

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const GOALS = ['Max Strength', 'Hypertrophy', 'Powerlifting Meet Prep'] as const;
export const CORE_LIFTS = ['benchPress', 'squat', 'deadlift', 'overheadPress'] as const;

export const PROGRAM_TEMPLATES = [
    {
        key: 'starting_strength',
        name: 'Starting Strength',
        description: 'Linear progression program focusing on squat, deadlift, bench press at each session. Ideal for beginners.',
        experienceTarget: ['Beginner']
    },
    {
        key: 'stronglifts_5x5',
        name: 'StrongLifts 5x5',
        description: 'Five sets of five reps for core lifts with incremental weight increases. Ideal for novice to intermediate lifters.',
        experienceTarget: ['Beginner']
    },
    {
        key: 'greyskull_lp',
        name: 'GreySkull LP',
        description: 'Modification of 5x5 with AMRAP top sets and two-week progression waves. Ideal for beginners.',
        experienceTarget: ['Beginner']
    },
    {
        key: 'phul',
        name: 'PHUL (Power Hypertrophy Upper Lower)',
        description: 'Four-day split combining power (low rep) and hypertrophy (high rep) sessions. For intermediate lifters.',
        experienceTarget: ['Beginner', 'Intermediate']
    },
    {
        key: 'wendler_531',
        name: 'Wendler 5/3/1',
        description: 'Four-week cycle with percentage-based lifts and accessory work. Ideal for intermediate lifters.',
        experienceTarget: ['Intermediate']
    },
    {
        key: 'texas_method',
        name: 'The Texas Method',
        description: 'Alternating volume, recovery, and intensity days per week. Ideal for advanced novices/intermediates.',
        experienceTarget: ['Intermediate']
    },
    {
        key: 'madcow_5x5',
        name: 'Madcow 5x5',
        description: 'An intermediate program focused on weekly progression with ramping sets to a top set of 5, followed by back-off sets.',
        experienceTarget: ['Intermediate']
    },
    {
        key: 'boring_but_big',
        name: '5/3/1 Boring But Big',
        description: 'Wendler’s 5/3/1 scheme plus high-volume accessory (5×10) on main lifts. For intermediate lifters wanting hypertrophy.',
        experienceTarget: ['Intermediate']
    },
    {
        key: 'juggernaut_method',
        name: 'Juggernaut Method',
        description: 'Four phases (Accumulation, Intensification, Realization, Deload) using percentage-based progression. For all levels.',
        experienceTarget: ['Intermediate', 'Advanced']
    },
    {
        key: 'sheiko',
        name: 'Sheiko Programs',
        description: 'High-frequency, high-volume Russian-style templates. Ideal for advanced lifters emphasizing technique.',
        experienceTarget: ['Advanced']
    },
    {
        key: 'cube_method',
        name: 'Cube Method',
        description: 'Rotating emphasis on max effort, dynamic effort, and repetition effort days. For lifters seeking variation.',
        experienceTarget: ['Advanced']
    },
];


export const LIFT_DETAILS = {
  benchPress: { name: 'Bench Press', key: 'benchPress' },
  squat: { name: 'Squat', key: 'squat' },
  deadlift: { name: 'Deadlift', key: 'deadlift' },
  overheadPress: { name: 'Overhead Press', key: 'overheadPress' },
} as const;

export const LIFT_COLORS: Record<string, { bg: string, border: string, text: string }> = {
    benchPress: { bg: 'bg-red-900/40', border: 'border-red-500/50', text: 'text-red-300' },
    squat: { bg: 'bg-blue-900/40', border: 'border-blue-500/50', text: 'text-blue-300' },
    deadlift: { bg: 'bg-purple-900/40', border: 'border-purple-500/50', text: 'text-purple-300' },
    overheadPress: { bg: 'bg-yellow-900/40', border: 'border-yellow-500/50', text: 'text-yellow-300' },
    default: { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-300' }
};

export const LOADING_TIPS = [
    "Fact: The 'Big 3' in powerlifting are the squat, bench press, and deadlift.",
    "Tip: Progressive overload is key. Aim to add a little more weight or reps over time.",
    "Fact: Rest days are when your muscles actually grow and repair.",
    "Tip: A proper warm-up increases blood flow and reduces injury risk.",
    "Fact: Compound exercises work multiple muscle groups at once, giving you more bang for your buck.",
    "Tip: Staying hydrated is crucial for performance and recovery. Drink water throughout the day.",
    "Fact: The 'sticking point' is the most difficult part of a lift.",
    "Tip: Control the eccentric (lowering) phase of a lift to build more strength and muscle.",
    "Tip: Don't neglect accessory work! It helps strengthen weak points and prevent imbalances.",
    "Fact: The Valsalva maneuver (bracing your core) can increase intra-abdominal pressure and help stabilize your spine during heavy lifts.",
    "Tip: Aim for 1.6-2.2 grams of protein per kilogram of body weight to optimize muscle growth.",
    "Tip: For squats, think about 'spreading the floor' with your feet to activate your glutes.",
    "Fact: Louie Simmons of Westside Barbell popularized the 'Conjugate Method,' which involves rotating exercises to avoid accommodation.",
    "Tip: Deload weeks are planned periods of lower volume and intensity to allow for full recovery and prevent overtraining.",
    "Tip: When bench pressing, keep your shoulder blades retracted and pinned to the bench to protect your shoulders.",
    "Fact: Sleep is one of the most powerful recovery tools. Aim for 7-9 hours per night.",
    "Tip: Use chalk to improve your grip on deadlifts and pull-ups.",
    "Tip: Don't let your ego dictate the weight on the bar. Proper form is always more important than lifting heavy with bad technique.",
    "Fact: The concept of 'training to failure' means performing reps until you can no longer complete another one with good form.",
    "Tip: Carbohydrates are your body's primary fuel source for high-intensity training. Don't skip them on workout days.",
    "Tip: Filming your lifts can be a great way to analyze your form and identify areas for improvement.",
    "Fact: The adductors (inner thigh muscles) play a significant role in stabilizing the squat.",
    "Tip: Use a lifting belt to increase core stability on your heaviest sets of squats and deadlifts, not for every set.",
    "Tip: Consistency over a long period of time beats short-term intensity every time.",
    "Fact: Creatine monohydrate is one of the most researched and effective supplements for improving strength and power output.",
    "Tip: For deadlifts, think about 'pushing the world away' with your legs rather than 'pulling the bar up' with your back.",
    "Tip: Active recovery, like light walking or stretching on rest days, can help reduce muscle soreness.",
    "Fact: Women can train just as hard as men and benefit equally from strength training without getting 'bulky' by accident.",
    "Tip: Keep a training journal to track your progress, including weights, reps, sets, and how you felt.",
    "Fact: Your central nervous system (CNS) also gets fatigued from heavy lifting and needs time to recover.",
    "Tip: Mind-muscle connection is real. Focus on the muscle you're trying to work during an exercise.",
    "Tip: Foam rolling before a workout can improve mobility and flexibility for your session.",
    "Fact: The 'overload principle' states that for a muscle to grow, it must be forced to adapt to a tension that is above and beyond what it has previously experienced.",
    "Tip: Eating a balanced meal with protein and carbs 1-2 hours before your workout can significantly improve performance.",
    "Tip: For the overhead press (OHP), squeeze your glutes and brace your core to create a stable base.",
    "Fact: Powerlifting and Olympic weightlifting are two different sports. Olympic lifts are the snatch and the clean & jerk."
];

export const FAILED_LIFT_RECOMMENDATIONS: Record<string, { suggestions: AccessorySuggestion[] }> = {
    'squat': {
        suggestions: [
            { name: 'Bulgarian Split Squat', reason: 'Improves single-leg stability and quad strength.', sets: 3, reps: '8-12' },
            { name: 'Goblet Squat', reason: 'Reinforces an upright torso and core bracing.', sets: 3, reps: '10-15' },
            { name: 'Box Squat', reason: 'Builds power out of the bottom of the squat.', sets: 4, reps: '5-8' },
            { name: 'Pause Squat', reason: 'Strengthens the sticking point at the bottom.', sets: 3, reps: '3-5' },
        ]
    },
    'bench press': {
        suggestions: [
            { name: 'Close-Grip Bench Press', reason: 'Builds triceps strength, crucial for lockout.', sets: 3, reps: '6-10' },
            { name: 'Seated Dumbbell Press', reason: 'Strengthens shoulders for a more powerful press.', sets: 3, reps: '8-12' },
            { name: 'Triceps Dips', reason: 'Adds overall pressing power and triceps mass.', sets: 3, reps: 'As many as possible' },
            { name: 'Pause Bench Press', reason: 'Develops power off the chest.', sets: 3, reps: '3-5' },
        ]
    },
    'overhead press': {
        suggestions: [
            { name: 'Seated Dumbbell Press', reason: 'Builds shoulder strength with less lower back strain.', sets: 4, reps: '8-10' },
            { name: 'Lateral Raises', reason: 'Targets the medial deltoids for shoulder width and power.', sets: 3, reps: '12-15' },
            { name: 'Triceps Dips', reason: 'Strengthens triceps for a powerful lockout.', sets: 3, reps: 'As many as possible' },
            { name: 'Push Press', reason: 'Uses leg drive to overcome sticking points.', sets: 3, reps: '5-8' }
        ]
    },
    'deadlift': {
        suggestions: [
            { name: 'Romanian Deadlift (RDL)', reason: 'Strengthens hamstrings and glutes for a better pull off the floor.', sets: 3, reps: '8-12' },
            { name: 'Back Extensions', reason: 'Builds lower back endurance and strength.', sets: 3, reps: '10-15' },
            { name: 'Glute Bridges', reason: 'Activates and strengthens glutes for lockout power.', sets: 3, reps: '10-15' },
            { name: 'Rack Pulls', reason: 'Focuses on the top half of the lift to improve lockout strength.', sets: 3, reps: '3-5' },
        ]
    }
};

export const ACCESSORY_LIFTS: Record<string, string[]> = {
    'Chest': ['DB Bench Press', 'Incline DB Press', 'Dips', 'Push-ups', 'Cable Flys', 'Machine Chest Press', 'Pec Deck'],
    'Back': ['Pull-ups', 'Chin-ups', 'Lat Pulldowns', 'BB Row', 'DB Row', 'T-Bar Row', 'Seated Cable Row', 'Face Pulls', 'Back Extensions'],
    'Shoulders': ['Seated DB Press', 'Arnold Press', 'Lateral Raises', 'Front Raises', 'Reverse Pec Deck', 'Upright Rows', 'Shrugs'],
    'Biceps': ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'],
    'Triceps': ['Triceps Dips', 'Skullcrushers', 'Tricep Pushdowns', 'Overhead Tricep Extension', 'Close-Grip Bench Press'],
    'Quads': ['Leg Press', 'Hack Squat', 'Goblet Squat', 'Bulgarian Split Squat', 'Leg Extensions'],
    'Hamstrings': ['Romanian Deadlift (RDL)', 'Good Mornings', 'Glute-Ham Raise (GHR)', 'Lying Leg Curls', 'Seated Leg Curls'],
    'Glutes': ['Hip Thrusts', 'Glute Bridges', 'Cable Pull-Throughs', 'Abduction Machine'],
    'Calves': ['Calf Raises (Seated)', 'Calf Raises (Standing)'],
    'Core': ['Hanging Leg Raises', 'Cable Crunches', 'Ab Rollouts', 'Weighted Planks', 'Russian Twists'],
};