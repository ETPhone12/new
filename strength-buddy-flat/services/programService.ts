
import { PROGRAM_TEMPLATES, LIFT_DETAILS, FAILED_LIFT_RECOMMENDATIONS } from '../constants';
import { ProgramRecommendation, UserPreferences, Program, Week, WorkoutDay, Exercise, WorkoutLog, MonthlyAnalysis, AccessorySuggestion } from '../types';

type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type ProgramTemplate = (typeof PROGRAM_TEMPLATES)[0];

const roundToNearest5 = (weight: number) => Math.round(weight / 5) * 5;

/**
 * Determines a lifter's experience level based on their 1-Rep Max values.
 * This uses general strength standards as a guideline.
 */
export const determineExperienceLevel = (oneRepMax: UserPreferences['oneRepMax']): ExperienceLevel => {
    const { squat, benchPress, deadlift } = oneRepMax;

    // Advanced Check: Lifters with very high strength numbers on any main lift.
    if (squat >= 405 || benchPress >= 315 || deadlift >= 495) {
        return 'Advanced';
    }

    // Intermediate Check: Lifters who have surpassed novice strength levels.
    if (squat >= 225 || benchPress >= 185 || deadlift >= 315) {
        return 'Intermediate';
    }

    // Beginner: Default level for those not meeting intermediate standards.
    return 'Beginner';
};

/**
 * Generates a ProgramRecommendation object from a list of suitable programs and the user's level.
 */
const createRecommendation = (programs: ProgramTemplate[], level: ExperienceLevel): ProgramRecommendation | null => {
    if (programs.length === 0) {
        return null;
    }
    
    const top = programs[0];
    const alternatives = programs.slice(1, 3).map(p => p.key);

    let reason = '';
    switch (level) {
        case 'Beginner':
            reason = "Based on your current strength, a program with linear progression is the fastest way to build a strong foundation.";
            break;
        case 'Intermediate':
            reason = "You're past the beginner stage, so a program with weekly progression will help you continue making consistent gains.";
            break;
        case 'Advanced':
            reason = "As an advanced lifter, you'll benefit from a program with more complex periodization to keep breaking plateaus.";
            break;
    }

    return {
        top: {
            key: top.key,
            reason: reason,
        },
        alternatives: alternatives,
    };
};

/**
 * Gets a program recommendation based on the user's calculated experience level.
 * @param oneRepMax - The user's 1-Rep Max values.
 * @returns A ProgramRecommendation object.
 */
export const getProgramRecommendationByExperience = (oneRepMax: UserPreferences['oneRepMax']): ProgramRecommendation | null => {
    const level = determineExperienceLevel(oneRepMax);

    const suitablePrograms = PROGRAM_TEMPLATES.filter(p => p.experienceTarget.includes(level));

    if (suitablePrograms.length > 0) {
        return createRecommendation(suitablePrograms, level);
    }
    
    // Fallback logic: If no direct match, try a lower experience level
    if (level === 'Advanced') {
        const intermediatePrograms = PROGRAM_TEMPLATES.filter(p => p.experienceTarget.includes('Intermediate'));
        if (intermediatePrograms.length > 0) return createRecommendation(intermediatePrograms, 'Intermediate');
    }
    if (level === 'Intermediate') {
        const beginnerPrograms = PROGRAM_TEMPLATES.filter(p => p.experienceTarget.includes('Beginner'));
        if (beginnerPrograms.length > 0) return createRecommendation(beginnerPrograms, 'Beginner');
    }

    // If still no programs, return a default recommendation from all programs
    if (PROGRAM_TEMPLATES.length > 0) {
        return createRecommendation(PROGRAM_TEMPLATES, 'Beginner');
    }

    return null; // Should not be reached if PROGRAM_TEMPLATES is not empty
};


// --- PROGRAM GENERATION LOGIC ---

// Helper to create a Wendler 5/3/1 cycle
const generateWendler531Cycle = (cycleNum: number, trainingMaxes: UserPreferences['oneRepMax']): Week[] => {
    const weeks: Week[] = [];
    
    // Increase TM for each new cycle (after the first one)
    const lowerBodyIncrease = 10;
    const upperBodyIncrease = 5;

    const currentTMs = {
        squat: trainingMaxes.squat + (lowerBodyIncrease * (cycleNum - 1)),
        deadlift: trainingMaxes.deadlift + (lowerBodyIncrease * (cycleNum - 1)),
        benchPress: trainingMaxes.benchPress + (upperBodyIncrease * (cycleNum - 1)),
        overheadPress: trainingMaxes.overheadPress + (upperBodyIncrease * (cycleNum - 1)),
    };
    
    const percentages = [
        // Week 1: 3x5
        [0.65, 0.75, 0.85],
        // Week 2: 3x3
        [0.70, 0.80, 0.90],
        // Week 3: 5/3/1
        [0.75, 0.85, 0.95],
        // Week 4: Deload
        [0.40, 0.50, 0.60]
    ];
    const reps: (string|number)[] = [5, 3, '5/3/1', 5];
    const topSetReps = ['5+', '3+', '1+', 5];

    for (let i = 0; i < 4; i++) { // 4 weeks in a cycle
        const weekPercs = percentages[i];
        
        const createWorkoutDay = (lift: keyof UserPreferences['oneRepMax'], focus: string, accessories: { name: string, sets: number, reps: string }[]): WorkoutDay => {
            const tm = currentTMs[lift];
            const exercises: Exercise[] = [];

            // Warmups are implicit for simplicity in this generator
            
            // Working Sets
            weekPercs.forEach((p, index) => {
                const repCount = (index === weekPercs.length - 1) ? topSetReps[i] : reps[i];
                exercises.push({ name: LIFT_DETAILS[lift].name, sets: 1, reps: repCount, percentageOf1RM: p, calculatedWeight: roundToNearest5(tm * p), type: 'working' });
            });
            
            // Accessories
            accessories.forEach(acc => {
                exercises.push({ name: acc.name, sets: acc.sets, reps: acc.reps });
            });
            return { day: 0, focus, exercises };
        };
        
        const OHPDay = createWorkoutDay('overheadPress', 'Overhead Press & Upper Body', [{ name: 'DB Press', sets: 5, reps: '10' }, { name: 'Lat Pulldown', sets: 5, reps: '10' }]);
        const DeadliftDay = createWorkoutDay('deadlift', 'Deadlift & Lower Body', [{ name: 'Good Mornings', sets: 5, reps: '12' }, { name: 'Hanging Leg Raises', sets: 5, reps: '15' }]);
        const BenchDay = createWorkoutDay('benchPress', 'Bench Press & Upper Body', [{ name: 'DB Bench Press', sets: 5, reps: '10' }, { name: 'DB Rows', sets: 5, reps: '10' }]);
        const SquatDay = createWorkoutDay('squat', 'Squat & Lower Body', [{ name: 'Leg Press', sets: 5, reps: '10' }, { name: 'Leg Curls', sets: 5, reps: '10' }]);
        
        const weekDays = [SquatDay, BenchDay, {day:0, focus: 'Rest', exercises: []}, DeadliftDay, OHPDay, {day:0, focus: 'Rest', exercises: []}, {day:0, focus: 'Rest', exercises: []}];
        
        const weekNumberForCycle = (cycleNum - 1) * 4 + i + 1;

        weeks.push({
            week: weekNumberForCycle,
            days: weekDays.map((d, idx) => ({ d, day: idx + 1 }))
        });
    }
    return weeks;
};

// Helper to create StrongLifts 5x5
const generateStrongLifts5x5Weeks = (oneRepMax: UserPreferences['oneRepMax']): Week[] => {
    const weeks: Week[] = [];
    const startingWeight = (lift: keyof UserPreferences['oneRepMax']) => roundToNearest5(oneRepMax[lift] * 0.75);

    const workoutA = (weightMultipliers: Record<string, number>, dayNum: number): WorkoutDay => ({
        day: 0, focus: `Day ${dayNum}: Squat, Bench, Row`, exercises: [
            { name: 'Squat', sets: 5, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('squat') + (5 * weightMultipliers.squat)) },
            { name: 'Bench Press', sets: 5, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('benchPress') + (5 * weightMultipliers.benchPress)) },
            { name: 'BB Row', sets: 5, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('benchPress') * 0.9 + (5 * weightMultipliers.benchPress)) },
        ]
    });
    const workoutB = (weightMultipliers: Record<string, number>, dayNum: number): WorkoutDay => ({
        day: 0, focus: `Day ${dayNum}: Squat, OHP, Deadlift`, exercises: [
            { name: 'Squat', sets: 5, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('squat') + (5 * weightMultipliers.squat)) },
            { name: 'Overhead Press', sets: 5, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('overheadPress') + (5 * weightMultipliers.overheadPress)) },
            { name: 'Deadlift', sets: 1, reps: 5, type: 'working', calculatedWeight: roundToNearest5(startingWeight('deadlift') + (10 * weightMultipliers.deadlift)) },
        ]
    });

    let isWorkoutA = true;
    let workoutDayCounter = 0;
    for (let i = 1; i <= 12; i++) {
        const weekDays: WorkoutDay[] = [];
        for (let d = 1; d <= 7; d++) {
            if (d === 1 || d === 3 || d === 5) { // Mon, Wed, Fri
                const multipliers = { 
                    squat: workoutDayCounter, 
                    benchPress: Math.floor(workoutDayCounter / 2), 
                    deadlift: Math.floor(workoutDayCounter / 2),
                    overheadPress: Math.floor(workoutDayCounter / 2)
                };
                weekDays.push(isWorkoutA ? workoutA(multipliers, workoutDayCounter + 1) : workoutB(multipliers, workoutDayCounter + 1));
                isWorkoutA = !isWorkoutA;
                workoutDayCounter++;
            } else {
                weekDays.push({ day: d, focus: 'Rest', exercises: [] });
            }
        }
        weeks.push({ week: i, days: weekDays.map((d, idx) => ({d, day: idx+1})) });
    }
    return weeks;
};

export const generateProgramLocal = (preferences: UserPreferences): Program | null => {
    const programDetails = PROGRAM_TEMPLATES.find(p => p.key === preferences.programTemplate);
    if (!programDetails) return null;

    let weeks: Week[] = [];
    const trainingMaxes = {
      squat: preferences.oneRepMax.squat * 0.9,
      benchPress: preferences.oneRepMax.benchPress * 0.9,
      deadlift: preferences.oneRepMax.deadlift * 0.9,
      overheadPress: preferences.oneRepMax.overheadPress * 0.9,
    };

    switch (preferences.programTemplate) {
        case 'wendler_531':
        case 'boring_but_big':
            weeks = [
                generateWendler531Cycle(1, trainingMaxes),
                generateWendler531Cycle(2, trainingMaxes),
                generateWendler531Cycle(3, trainingMaxes),
            ];
            break;
        case 'stronglifts_5x5':
             weeks = generateStrongLifts5x5Weeks(preferences.oneRepMax);
             break;
        default:
            // Fallback for other programs - can be expanded. Default to StrongLifts.
            weeks = generateStrongLifts5x5Weeks(preferences.oneRepMax);
            break;
    }

    return {
        programName: programDetails.name,
        description: programDetails.description,
        weeks: weeks
    };
};


// --- LOCAL ANALYSIS LOGIC ---
export const getMonthlyAnalysisLocal = (log: WorkoutLog): MonthlyAnalysis | null => {
    const analysis: MonthlyAnalysis = {};
    const liftKeys = Object.keys(LIFT_DETAILS) as Array<keyof typeof LIFT_DETAILS>;
    const sortedDates = Object.keys(log).sort((a,b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());
    
    if (sortedDates.length < 2) return null;

    liftKeys.forEach(liftKey => {
        const liftName = LIFT_DETAILS[liftKey].name.toLowerCase().split(' ')[0];
        const liftData: { date: string, weight: number }[] = [];

        sortedDates.forEach(date => {
            let maxWeightForDay = 0;
            Object.values(log[date].exercises).forEach(ex => {
                if (ex.name.toLowerCase().includes(liftName)) {
                     const heaviestSet = ex.loggedSets
                        .filter(s => s.status === 'completed')
                        .reduce((max, set) => set.weight > max ? set.weight : max, 0);
                    if (heaviestSet > maxWeightForDay) {
                        maxWeightForDay = heaviestSet;
                    }
                }
            });
            if (maxWeightForDay > 0) {
                liftData.push({ date, weight: maxWeightForDay });
            }
        });
        
        if (liftData.length < 2) {
             analysis[liftKey] = {
                 status: 'plateaued',
                 summary: `Not enough data for ${LIFT_DETAILS[liftKey].name}. Log more sessions.`,
                 projection: 'N/A'
             }
             return;
        }

        const firstHalf = liftData.slice(0, Math.ceil(liftData.length / 2));
        const secondHalf = liftData.slice(Math.ceil(liftData.length / 2));
        
        const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, d) => sum + d.weight, 0) / firstHalf.length : 0;
        const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, d) => sum + d.weight, 0) / secondHalf.length : 0;

        let status: 'progressing' | 'plateaued' | 'regressing' = 'plateaued';
        let summary = '';
        const change = secondAvg - firstAvg;

        if (change > 2.5) {
            status = 'progressing';
            summary = `${LIFT_DETAILS[liftKey].name} is trending up. Keep up the great work!`
        } else if (change < -2.5) {
            status = 'regressing';
            summary = `Looks like ${LIFT_DETAILS[liftKey].name} weight has slightly decreased. Check recovery.`;
        } else {
            status = 'plateaued';
            summary = `${LIFT_DETAILS[liftKey].name} has remained stable. Consider increasing volume or intensity.`
        }

        analysis[liftKey] = {
            status,
            summary,
            projection: `Current top set is ${liftData[liftData.length - 1].weight} lbs.`
        }
    });

    return analysis;
};

export const estimateNewOneRepMaxes = (log: WorkoutLog, currentMaxes: UserPreferences['oneRepMax']): UserPreferences['oneRepMax'] => {
    const estimatedMaxes = { currentMaxes };
    const liftKeys = Object.keys(LIFT_DETAILS) as Array<keyof typeof LIFT_DETAILS>;

    liftKeys.forEach(liftKey => {
        const liftName = LIFT_DETAILS[liftKey].name.toLowerCase().split(' ')[0];
        let bestCalculated1RM = 0;

        Object.values(log).forEach(dayLog => {
            Object.values(dayLog.exercises).forEach(ex => {
                if (ex.name.toLowerCase().includes(liftName)) {
                    ex.loggedSets.forEach(set => {
                        if (set.status === 'completed' && typeof set.reps === 'number' && set.reps > 0 && set.weight > 0) {
                            // Epley Formula: 1RM = w * (1 + r/30)
                            const calculated1RM = set.weight * (1 + (set.reps / 30));
                            if (calculated1RM > bestCalculated1RM) {
                                bestCalculated1RM = calculated1RM;
                            }
                        }
                    });
                }
            });
        });
        
        // Only update if the new estimated max is greater than the old one.
        if (bestCalculated1RM > estimatedMaxes[liftKey]) {
            estimatedMaxes[liftKey] = roundToNearest5(bestCalculated1RM);
        }
    });

    return estimatedMaxes;
};

export const getAccessoryRecommendation = (failedLiftName: string): AccessorySuggestion[] => {
    const liftNameLower = failedLiftName.toLowerCase();
    
    // Find the main lift key (e.g., 'bench press') that matches the failed lift name
    const mainLiftKey = Object.keys(FAILED_LIFT_RECOMMENDATIONS).find(key => liftNameLower.includes(key));

    if (mainLiftKey) {
        return FAILED_LIFT_RECOMMENDATIONS[mainLiftKey].suggestions;
    }

    return [];
};
