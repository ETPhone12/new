
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserPreferences, Program, WorkoutLog, LoggedDay, ExerciseHistory, NutritionData, QuickNote, FailureLogEntry, Challenge, Exercise } from './types';
import { Dumbbell } from 'lucide-react';
import { generateProgramLocal } from './services/programService';
import { generateChallenges } from './services/challengeService';

const App: React.FC = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [program, setProgram] = useState<Program | null>(null);
    const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({});
    const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>({});
    const [programStartDate, setProgramStartDate] = useState<string | null>(null);
    const [nutritionData, setNutritionData] = useState<NutritionData>({ waterIntake: 0, waterGoal: 8, calorieTarget: 2500, proteinTarget: 180, carbTarget: 250, fatTarget: 80 });
    const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
    const [failureLog, setFailureLog] = useState<FailureLogEntry[]>([]);
    const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
    const [lastChallengeCheck, setLastChallengeCheck] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedPrefs = localStorage.getItem('userPreferences');
            const savedProgram = localStorage.getItem('program');
            const savedLog = localStorage.getItem('workoutLog');
            const savedHistory = localStorage.getItem('exerciseHistory');
            const savedStartDate = localStorage.getItem('programStartDate');
            const savedNutritionData = localStorage.getItem('nutritionData');
            const savedQuickNotes = localStorage.getItem('quickNotes');
            const savedFailures = localStorage.getItem('failureLog');
            const savedChallenges = localStorage.getItem('activeChallenges');
            const savedLastCheck = localStorage.getItem('lastChallengeCheck');


            if (savedPrefs) setUserPreferences(JSON.parse(savedPrefs));
            if (savedProgram) setProgram(JSON.parse(savedProgram));
            if (savedLog) setWorkoutLog(JSON.parse(savedLog));
            if (savedHistory) setExerciseHistory(JSON.parse(savedHistory));
            
            // Migration for programStartDate format
            if (savedStartDate) {
                if (savedStartDate.includes('T')) {
                    // It's the old, incorrect ISO format with timestamp. Correct it.
                    const dateObj = new Date(savedStartDate);
                    if (!isNaN(dateObj.getTime())) {
                      setProgramStartDate(dateObj.toISOString().split('T')[0]);
                    }
                } else {
                    setProgramStartDate(savedStartDate);
                }
            }
            
            if (savedNutritionData) {
                const parsed = JSON.parse(savedNutritionData);
                if (!('waterGoal' in parsed)) {
                    parsed.waterGoal = 8;
                }
                setNutritionData(parsed);
            }
            if (savedQuickNotes) setQuickNotes(JSON.parse(savedQuickNotes));
            if (savedFailures) setFailureLog(JSON.parse(savedFailures));
            if (savedChallenges) setActiveChallenges(JSON.parse(savedChallenges));
            if (savedLastCheck) setLastChallengeCheck(savedLastCheck);

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            setError("Could not load your saved data. Please try clearing your cache.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        try {
            if (userPreferences) localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            if (program) localStorage.setItem('program', JSON.stringify(program));
            if(programStartDate) localStorage.setItem('programStartDate', programStartDate);
            localStorage.setItem('workoutLog', JSON.stringify(workoutLog));
            localStorage.setItem('exerciseHistory', JSON.stringify(exerciseHistory));
            localStorage.setItem('nutritionData', JSON.stringify(nutritionData));
            localStorage.setItem('quickNotes', JSON.stringify(quickNotes));
            localStorage.setItem('failureLog', JSON.stringify(failureLog));
            localStorage.setItem('activeChallenges', JSON.stringify(activeChallenges));
            if(lastChallengeCheck) localStorage.setItem('lastChallengeCheck', lastChallengeCheck);
        } catch(e) {
            console.error("Error saving to local storage", e);
        }
    }, [userPreferences, program, workoutLog, programStartDate, exerciseHistory, nutritionData, quickNotes, failureLog, activeChallenges, lastChallengeCheck]);

    // Challenge generation logic
    useEffect(() => {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        
        // Only run if user exists
        if (!userPreferences) {
            return;
        }

        // Check if it's Monday and if we haven't checked for challenges this week
        const isMonday = today.getDay() === 1; 
        const lastCheckDate = lastChallengeCheck ? new Date(lastChallengeCheck) : null;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Get Monday of the current week
        
        const needsChallengeUpdate = !lastCheckDate || lastCheckDate < startOfWeek;

        if (isMonday && needsChallengeUpdate) {
            const newChallenges = generateChallenges({
                workoutLog,
                failureLog,
                userPreferences,
                nutritionData
            });
            setActiveChallenges(newChallenges);
            setLastChallengeCheck(todayKey);
        }

    }, [workoutLog, failureLog, userPreferences, nutritionData, lastChallengeCheck]);


    const handleOnboardingComplete = (prefs: UserPreferences, generatedProgram: Program) => {
        setUserPreferences(prefs);
        setProgram(generatedProgram);
        setProgramStartDate(new Date().toISOString().split('T')[0]); // FIX: Save in YYYY-MM-DD format
        setWorkoutLog({}); 
        setExerciseHistory({});
        setFailureLog([]);
        setNutritionData({ waterIntake: 0, waterGoal: 8, calorieTarget: 2500, proteinTarget: 180, carbTarget: 250, fatTarget: 80 });
        setQuickNotes([]);
        setActiveChallenges([]);
    };
    
    const handleWorkoutComplete = (dateKey: string, loggedDay: LoggedDay) => {
        setWorkoutLog(prev => ({prev, [dateKey]: loggedDay}));

        const newHistory = {exerciseHistory};
        let historyUpdated = false;
        Object.values(loggedDay.exercises).forEach(exercise => {
            const lastCompletedSet = [exercise.loggedSets].reverse().find(s => s.status === 'completed');
            if (lastCompletedSet && lastCompletedSet.weight > 0) {
                 if (!newHistory[exercise.name] || newHistory[exercise.name].lastWeight !== lastCompletedSet.weight) {
                    newHistory[exercise.name] = { lastWeight: lastCompletedSet.weight };
                    historyUpdated = true;
                }
            }
        });
    
        if (historyUpdated) {
            setExerciseHistory(newHistory);
        }
    };
    
    const handleLogWater = (glasses: number) => {
        setNutritionData(prev => ({
            prev,
            waterIntake: prev.waterIntake + glasses
        }))
    };
    
    const handleSaveQuickNote = (note: string) => {
        const now = new Date().toISOString();
        const newNote: QuickNote = {
            id: now,
            date: now,
            note: note
        };
        setQuickNotes(prev => [prev, newNote]);
    };

    const handleEditQuickNote = (noteId: string, newText: string) => {
        setQuickNotes(prev => prev.map(note => 
            note.id === noteId ? { note, note: newText } : note
        ));
    };

    const handleDeleteQuickNote = (noteId: string) => {
        setQuickNotes(prev => prev.filter(note => note.id !== noteId));
    };

    const handleDeleteAllQuickNotes = () => {
        setQuickNotes([]);
    };
    
    const handleLogFailure = (entry: FailureLogEntry) => {
        setFailureLog(prev => {
            const exists = prev.some(e => e.date === entry.date && e.lift === entry.lift && e.set === entry.set);
            if (exists) {
                return prev;
            }
            return [prev, entry];
        });
    };

    const handleStartNewProgram = (newProgramTemplate: string) => {
        if (!userPreferences) return;

        const newPreferences: UserPreferences = {
            userPreferences,
            programTemplate: newProgramTemplate,
        };

        const newProgram = generateProgramLocal(newPreferences);

        if (newProgram) {
            setUserPreferences(newPreferences);
            setProgram(newProgram);
            setProgramStartDate(new Date().toISOString().split('T')[0]); // FIX: Save in YYYY-MM-DD format
            // Do NOT reset workoutLog or exerciseHistory to preserve user data
        } else {
            setError(`Could not generate program for template: ${newProgramTemplate}.`);
        }
    };

    const handleUpdateNutritionSettings = (data: Partial<NutritionData>) => {
        setNutritionData(prev => ({prev, data}));
    };
    
    const handleAddAccessoryToDay = (dateKey: string, exerciseName: string) => {
        if (!program || !programStartDate) return;

        const startDate = new Date(programStartDate);
        if (isNaN(startDate.getTime())) {
            console.error("Invalid program start date while adding accessory:", programStartDate);
            return;
        }
        
        const targetDate = new Date(dateKey + 'T00:00:00');
        const dayOffset = Math.round((targetDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

        const newProgram = JSON.parse(JSON.stringify(program));

        let targetWeekIndex = -1;
        let targetDayIndex = -1;

        for (let i = 0; i < newProgram.weeks.length; i++) {
            const week = newProgram.weeks[i];
            for (let j = 0; j < week.days.length; j++) {
                const day = week.days[j];
                const programDayOffset = (week.week - 1) * 7 + (day.day - 1);
                if (programDayOffset === dayOffset) {
                    targetWeekIndex = i;
                    targetDayIndex = j;
                    break;
                }
            }
            if (targetWeekIndex !== -1) break;
        }

        if (targetWeekIndex !== -1 && targetDayIndex !== -1) {
            const newAccessory: Exercise = {
                name: exerciseName,
                sets: 3,
                reps: '8-12',
                type: 'working',
            };
            newProgram.weeks[targetWeekIndex].days[targetDayIndex].exercises.push(newAccessory);
            setProgram(newProgram);
        } else {
            console.error("Could not find the specified day to add accessory to:", dateKey);
        }
    };


    const resetApp = () => {
        localStorage.clear();
        setUserPreferences(null);
        setProgram(null);
        setWorkoutLog({});
        setExerciseHistory({});
        setProgramStartDate(null);
        setFailureLog([]);
        setNutritionData({ waterIntake: 0, waterGoal: 8, calorieTarget: 2500, proteinTarget: 180, carbTarget: 250, fatTarget: 80 });
        setQuickNotes([]);
        setActiveChallenges([]);
        setLastChallengeCheck(null);
    }

    if (isLoading) {
        return (
            <div className="bg-brand-dark min-h-screen flex flex-col items-center justify-center text-brand-light">
                <Dumbbell className="h-16 w-16 animate-pulse text-brand-primary" />
                <h1 className="text-2xl font-bold mt-4">Strength Buddy</h1>
                <p className="text-slate-400">Loading your profile</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-brand-dark min-h-screen flex flex-col items-center justify-center text-brand-light p-4">
                <h1 className="text-2xl font-bold text-brand-danger">An Error Occurred</h1>
                <p className="text-slate-400 mt-2">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                    Reload
                </button>
            </div>
        )
    }

    return (
        <div className="bg-brand-dark min-h-screen font-sans">
            {!userPreferences || !program ? (
                <Onboarding onOnboardingComplete={handleOnboardingComplete} />
            ) : (
                <Dashboard 
                    userPreferences={userPreferences} 
                    setUserPreferences={setUserPreferences}
                    program={program} 
                    workoutLog={workoutLog}
                    onWorkoutComplete={handleWorkoutComplete}
                    onReset={resetApp}
                    programStartDate={programStartDate}
                    exerciseHistory={exerciseHistory}
                    nutritionData={nutritionData}
                    onLogWater={handleLogWater}
                    onUpdateNutritionSettings={handleUpdateNutritionSettings}
                    quickNotes={quickNotes}
                    onSaveQuickNote={handleSaveQuickNote}
                    onEditQuickNote={handleEditQuickNote}
                    onDeleteQuickNote={handleDeleteQuickNote}
                    onDeleteAllQuickNotes={handleDeleteAllQuickNotes}
                    onStartNewProgram={handleStartNewProgram}
                    onLogFailure={handleLogFailure}
                    activeChallenges={activeChallenges}
                    onAddAccessoryToDay={handleAddAccessoryToDay}
                />
            )}
        </div>
    );
};

export default App;
