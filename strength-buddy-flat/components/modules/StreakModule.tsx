import React, { useMemo } from 'react';
import { WorkoutLog, Challenge } from '../../types';
import { Flame, Zap, Trophy } from 'lucide-react';

const calculateStreak = (log: WorkoutLog): number => {
    const dates = Object.keys(log).sort((a,b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());
    if (dates.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // FIX: Appending T00:00:00 ensures parsing in local timezone, not UTC.
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

const calculateTotalVolume = (log: WorkoutLog): number => {
    let total = 0;
    Object.values(log).forEach(dayLog => {
        Object.values(dayLog.exercises).forEach(exerciseLog => {
            exerciseLog.loggedSets.forEach(set => {
                if (set.status === 'completed') {
                    const reps = typeof set.reps === 'number' ? set.reps : parseInt(String(set.reps).split('-')[0], 10);
                    if (!isNaN(reps)) {
                        total += set.weight * reps;
                    }
                }
            });
        });
    });
    return total;
};

const StatTile: React.FC<{ icon: React.ElementType, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${color}/20`}>
            <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);

interface StreakModuleProps {
    workoutLog: WorkoutLog;
    activeChallenges: Challenge[];
}

export const StreakModule: React.FC<StreakModuleProps> = ({ workoutLog, activeChallenges }) => {
    const stats = useMemo(() => ({
        streak: calculateStreak(workoutLog),
        totalVolume: calculateTotalVolume(workoutLog),
        completedChallenges: activeChallenges.filter(c => c.isCompleted).length
    }), [workoutLog, activeChallenges]);

    return (
         <div className="lg:col-span-4 bg-brand-secondary p-4 rounded-lg">
            <h3 className="font-bold text-white mb-3">Habits & Totals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatTile icon={Flame} label="Workout Streak" value={`${stats.streak} days`} color="text-brand-warning" />
                <StatTile icon={Zap} label="Program Volume" value={`${stats.totalVolume.toLocaleString()} lbs`} color="text-brand-primary" />
                <StatTile icon={Trophy} label="Challenges Completed" value={`${stats.completedChallenges}`} color="text-brand-accent" />
            </div>
        </div>
    );
};