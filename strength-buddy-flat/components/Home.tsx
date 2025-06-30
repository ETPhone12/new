import React from 'react';
import { UserPreferences, NutritionData, Program, WorkoutDay, WorkoutLog, Challenge } from '../types';

import { StreakModule } from './modules/StreakModule';
import { NutritionModule } from './modules/NutritionModule';
import { QuickAddModule } from './modules/QuickAddModule';
import { UpcomingWorkoutModule, DailyMessageModule } from './modules/Placeholders';
import { ChallengesModule } from './modules/ChallengesModule';

interface HomeProps {
    userPreferences: UserPreferences;
    program: Program;
    workoutLog: WorkoutLog;
    onSelectWorkout: (day: WorkoutDay, date: string) => void;
    programStartDate: string | null;
    nutritionData: NutritionData;
    onOpenWaterModal: () => void;
    onOpenNoteModal: () => void;
    onNavigate: (view: 'home' | 'calendar' | 'log' | 'progress' | 'settings') => void;
    nextWorkoutDay: WorkoutDay | null;
    nextWorkoutDate: string | null;
    activeChallenges: Challenge[];
    onOpenAddAccessoryModal: (dateKey: string) => void;
}

const getGreeting = (name: string): string => {
    const hour = new Date().getHours();
    let timeOfDayGreeting = "Ready to crush it";
    if (hour < 12) {
        timeOfDayGreeting = "Good morning";
    } else if (hour < 18) {
        timeOfDayGreeting = "Good afternoon";
    } else {
        timeOfDayGreeting = "Good evening";
    }
    const firstName = name && name.trim() ? name.split(' ')[0] : 'there';
    return `${timeOfDayGreeting}, ${firstName}!`;
};


const Home: React.FC<HomeProps> = (props) => {
    
    const greeting = getGreeting(props.userPreferences.name);

    return (
        <div className="space-y-6">
            <header>
                <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-4xl font-bold text-white">{greeting}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <UpcomingWorkoutModule 
                    nextWorkout={props.nextWorkoutDay}
                    nextWorkoutDate={props.nextWorkoutDate}
                    onStartWorkout={() => {
                        if (props.nextWorkoutDay && props.nextWorkoutDate) {
                            props.onSelectWorkout(props.nextWorkoutDay, props.nextWorkoutDate);
                        }
                    }}
                    onOpenAddAccessoryModal={props.onOpenAddAccessoryModal}
                 />

                {/* Functional Modules */}
                <NutritionModule nutritionData={props.nutritionData} />
                <StreakModule workoutLog={props.workoutLog} activeChallenges={props.activeChallenges} />


                {/* Placeholder Modules */}
                <DailyMessageModule />
                <ChallengesModule challenges={props.activeChallenges} />
            </div>

            <QuickAddModule 
                onOpenWaterModal={props.onOpenWaterModal}
                onOpenNoteModal={props.onOpenNoteModal}
            />
        </div>
    );
};

export default Home;