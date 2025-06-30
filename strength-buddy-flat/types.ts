export interface UserPreferences {
    name: string;
    experience: 'Beginner' | 'Intermediate' | 'Advanced';
    goal: 'Max Strength' | 'Hypertrophy' | 'Powerlifting Meet Prep';
    programTemplate: string;
    oneRepMax: {
        benchPress: number;
        squat: number;
        deadlift: number;
        overheadPress: number;
    };
}

export interface ProgramRecommendation {
    top: {
        key: string;
        reason: string;
    };
    alternatives: string[];
}


export interface Exercise {
    name:string;
    sets: number;
    reps: number | string;
    percentageOf1RM?: number | null;
    calculatedWeight?: number;
    type?: 'warmup' | 'working';
}

export interface WorkoutDay {
    day: number;
    focus: string;
    exercises: Exercise[];
}

export interface Week {
    week: number;
    days: WorkoutDay[];
}

export interface Program {
    programName: string;
    description: string;
    weeks: Week[];
}

export interface LoggedSet {
    status: 'completed' | 'failed' | 'skipped';
    reps: number | string;
    weight: number;
}

export interface LoggedExercise extends Omit<Exercise, 'calculatedWeight'> {
   loggedSets: LoggedSet[];
}

export interface LoggedDay {
    exercises: { [exerciseKey: string]: LoggedExercise };
    notes: string;
}

export interface WorkoutLog {
    [date: string]: LoggedDay;
}

export interface ExerciseHistory {
    [exerciseName: string]: { lastWeight: number };
}

export interface MonthlyAnalysis {
    [lift: string]: {
        status: 'progressing' | 'plateaued' | 'regressing';
        summary: string;
        projection: string;
    };
}

export interface NutritionData {
    waterIntake: number; // glasses
    waterGoal: number; // glasses
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
}

export interface QuickNote {
    id: string; // ISO string, used as unique ID
    date: string; // ISO string
    note: string;
}

export interface FailureLogEntry {
    programDay: number;
    lift: string;
    set: number;
    date: string; // ISO string of the workout day
}

export interface AccessorySuggestion {
    name: string;
    reason: string;
    sets: number;
    reps: string;
}

export type ChallengeType = 'HYDRATION' | 'CONSISTENCY_STREAK' | 'TECHNIQUE_PRIMING' | 'MICROLOAD' | 'VOLUME_SURGE' | 'FREQUENCY_BOOSTER' | 'MONTHLY_PR';

export interface Challenge {
    id: string;
    type: ChallengeType;
    description: string;
    isCompleted: boolean;
    relatedLift?: string;
}