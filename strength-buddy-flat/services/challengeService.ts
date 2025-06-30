import { WorkoutLog, FailureLogEntry, UserPreferences, NutritionData, Challenge } from '../types';

interface ChallengeServiceInput {
    workoutLog: WorkoutLog;
    failureLog: FailureLogEntry[];
    userPreferences: UserPreferences;
    nutritionData: NutritionData;
}

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

export const generateChallenges = ({ workoutLog, failureLog, userPreferences, nutritionData }: ChallengeServiceInput): Challenge[] => {
    const challenges: Challenge[] = [];
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    // FIX: Appending T00:00:00 ensures date strings are parsed in local timezone.
    const recentLogEntries = Object.entries(workoutLog).filter(([date]) => new Date(date + 'T00:00:00') >= oneWeekAgo);

    // Rule 1: Hydration
    const waterGoal = nutritionData.waterGoal || 8;
    // This is a placeholder as daily water intake isn't logged historically. We'll use a mock check.
    if (nutritionData.waterIntake < waterGoal * 0.8) { 
        challenges.push({
            id: 'hydration_challenge',
            type: 'HYDRATION',
            description: `Drink at least ${waterGoal} glasses of water on 5 of the next 7 days.`,
            isCompleted: false
        });
    }

    // Rule 6 (checked early for priority): Frequency Booster
    const minSessions = 3; 
    if (recentLogEntries.length < minSessions) {
        challenges.push({
            id: 'frequency_booster',
            type: 'FREQUENCY_BOOSTER',
            description: `Schedule and complete ${minSessions} training sessions this week.`,
            isCompleted: false
        });
    }

    // Rule 3: Technique Priming (based on recent failures)
    // FIX: Appending T00:00:00 ensures date strings are parsed in local timezone.
    const recentFailures = failureLog.filter(f => new Date(f.date + 'T00:00:00') >= oneWeekAgo);
    if (recentFailures.length > 0) {
        const mostRecentFailure = recentFailures[recentFailures.length - 1];
        challenges.push({
            id: 'technique_priming',
            type: 'TECHNIQUE_PRIMING',
            description: `Before your next heavy ${mostRecentFailure.lift} session, perform 3x5 at 60% of your 1RM, focusing on perfect form.`,
            isCompleted: false,
            relatedLift: mostRecentFailure.lift
        });
    }

    // Rule 5: Volume Surge
    const allRepsHit = recentLogEntries.every(([, dayLog]) => 
        Object.values(dayLog.exercises).every(ex => 
            ex.loggedSets.every(set => set.status === 'completed')
        )
    );
    // Placeholder for volume growth check
    if (recentLogEntries.length >= minSessions && allRepsHit) {
        challenges.push({
            id: 'volume_surge',
            type: 'VOLUME_SURGE',
            description: `Add 2 back-off sets at 70% of 1RM across all main lifts this week.`,
            isCompleted: false
        });
    }
    
    // Rule 2: Consistency Streak
    const minStreak = 5;
    const streak = calculateStreak(workoutLog); // Re-using streak logic for simplicity
    if (streak > 0 && streak < minStreak) {
         challenges.push({
            id: 'consistency_streak',
            type: 'CONSISTENCY_STREAK',
            description: `Train on ${minStreak} different days this week to build consistency.`,
            isCompleted: false
        });
    }

    return challenges.slice(0, 3); // Return top 3 prioritized challenges
};


// Helper function to calculate streak, can be consolidated later
const calculateStreak = (log: WorkoutLog): number => {
    // FIX: Appending T00:00:00 ensures dates are sorted correctly across timezones.
    const dates = Object.keys(log).sort((a,b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());
    if (dates.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    // FIX: Appending T00:00:00 ensures parsing in local timezone.
    const lastWorkoutDate = new Date(dates[dates.length - 1] + 'T00:00:00');

    const diffSinceLast = Math.round((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffSinceLast > 3) {
      return 0; // Streak is broken
    }
    
    if (dates.length === 1 && diffSinceLast < 4) return 1;
    if (dates.length === 1 && diffSinceLast > 3) return 0;

    let currentStreak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
        // FIX: Appending T00:00:00 ensures parsing in local timezone.
        const currentDate = new Date(dates[i] + 'T00:00:00');
        const prevDate = new Date(dates[i-1] + 'T00:00:00');
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 3) {
            currentStreak++;
        } else {
            break; 
        }
    }
    return currentStreak;
};