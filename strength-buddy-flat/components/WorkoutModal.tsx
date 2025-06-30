import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutDay, UserPreferences, LoggedExercise, WorkoutLog, LoggedSet, LoggedDay, Exercise, ExerciseHistory, FailureLogEntry, AccessorySuggestion } from '../types';
import { LIFT_DETAILS } from '../constants';
import { Check, X, ArrowLeft, MessageSquare, Plus, Minus, Search } from 'lucide-react';
import { getAccessoryRecommendation } from '../services/programService';
import AddAccessoryModal from './modals/AddAccessoryModal';

interface WorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    workoutDay: WorkoutDay;
    date: string;
    userPreferences: UserPreferences;
    onComplete: (dateKey: string, log: LoggedDay) => void;
    workoutLog: WorkoutLog;
    exerciseHistory: ExerciseHistory;
    programStartDate: string | null;
    onLogFailure: (entry: FailureLogEntry) => void;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, workoutDay, date, onComplete, userPreferences, workoutLog, exerciseHistory, programStartDate, onLogFailure }) => {
    const [view, setView] = useState<'setup' | 'log'>('log');
    const [log, setLog] = useState<{ [exerciseKey: string]: LoggedExercise }>({});
    const [notes, setNotes] = useState('');
    const [exercisesToSetup, setExercisesToSetup] = useState<Exercise[]>([]);
    const [setupWeights, setSetupWeights] = useState<Record<string, number>>({});
    const [suggestions, setSuggestions] = useState<Record<string, AccessorySuggestion[]>>({});
    const [isAddAccessoryModalOpen, setIsAddAccessoryModalOpen] = useState(false);

    const buildInitialLog = (setupOverrides: Record<string, number> = {}) => {
        const initialLog = workoutDay.exercises.reduce((acc, ex) => {
            const key = `${ex.name}-${ex.sets}x${ex.reps}-${ex.type || 'acc'}`;
            let weight = 0;
            if (ex.calculatedWeight) {
                weight = ex.calculatedWeight; // Main lift
            } else if (setupOverrides[ex.name]) {
                weight = setupOverrides[ex.name]; // New accessory from setup
            } else if (exerciseHistory[ex.name]) {
                weight = exerciseHistory[ex.name].lastWeight; // Accessory from history
            }
            
            acc[key] = {
                ex,
                loggedSets: Array.from({ length: ex.sets }, () => ({
                    status: 'skipped',
                    reps: ex.reps,
                    weight: weight,
                })),
            };
            return acc;
        }, {} as { [exerciseName: string]: LoggedExercise });
        setLog(initialLog);
    };

    useEffect(() => {
        if (!isOpen) return;
        
        setSuggestions({}); // Reset suggestions when modal opens
        setIsAddAccessoryModalOpen(false); // Close accessory modal if open
        const existingLogForDay = workoutLog[date];
        if (existingLogForDay) {
            setLog(existingLogForDay.exercises);
            setNotes(existingLogForDay.notes || '');
            setView('log');
            return;
        }

        const exercisesRequiringSetup = workoutDay.exercises.filter(ex => {
            const isAccessory = !ex.percentageOf1RM && ex.type !== 'warmup';
            const hasHistory = !!exerciseHistory[ex.name];
            return isAccessory && !hasHistory && typeof ex.calculatedWeight === 'undefined';
        });

        if (exercisesRequiringSetup.length > 0) {
            setExercisesToSetup(exercisesRequiringSetup);
            const initialSetupWeights = exercisesRequiringSetup.reduce((acc, ex) => {
                let suggestedWeight = 0;
                const exNameLower = ex.name.toLowerCase();
                const coreLiftKey = (Object.keys(LIFT_DETAILS) as Array<keyof typeof LIFT_DETAILS>).find(key => 
                    exNameLower.includes(LIFT_DETAILS[key].name.toLowerCase().split(' ')[0])
                );
                
                if (coreLiftKey) {
                    const oneRepMax = userPreferences.oneRepMax[coreLiftKey];
                    const calculated = oneRepMax * 0.6; // Suggest a weight for 10-12 rep range
                    suggestedWeight = Math.round(calculated / 5) * 5;
                }
                
                acc[ex.name] = suggestedWeight;
                return acc;
            }, {} as Record<string, number>);

            setSetupWeights(initialSetupWeights);
            setNotes('');
            setView('setup');
        } else {
            buildInitialLog();
            setView('log');
        }
    }, [isOpen, workoutDay, date, workoutLog, exerciseHistory, userPreferences.oneRepMax]);


    const handleWeightSetupChange = (name: string, value: string) => {
        setSetupWeights(prev => ({ prev, [name]: parseInt(value) || 0 }));
    };

    const handleConfirmSetup = () => {
        buildInitialLog(setupWeights);
        setView('log');
    };

    const handleSetStatusChange = (exerciseKey: string, setIndex: number, newStatus: 'completed' | 'failed' | 'skipped') => {
        setLog(prevLog => {
            const newLog = JSON.parse(JSON.stringify(prevLog));
            const exercise = newLog[exerciseKey];
            exercise.loggedSets[setIndex].status = newStatus;

            if (newStatus === 'failed') {
                const failedWeight = exercise.loggedSets[setIndex].weight;
                const deloadWeight = Math.round((failedWeight * 0.9) / 5) * 5;
                for (let i = setIndex + 1; i < exercise.loggedSets.length; i++) {
                    exercise.loggedSets[i].weight = deloadWeight;
                }
                
                if (programStartDate) {
                    // FIX: Ensure dates are handled consistently
                    const workoutDate = new Date(date + 'T00:00:00');
                    const startDate = new Date(programStartDate);
                    const programDay = Math.floor((workoutDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    const failureEntry: FailureLogEntry = {
                        programDay: programDay,
                        lift: exercise.name,
                        set: setIndex + 1,
                        date: date,
                    };
                    onLogFailure(failureEntry);
                }
                
                const recommendedAccessories = getAccessoryRecommendation(exercise.name);
                if (recommendedAccessories.length > 0) {
                     setSuggestions(prev => ({prev, [exerciseKey]: recommendedAccessories}));
                }

            } else {
                 const hasOtherFailures = newLog[exerciseKey].loggedSets.some((s: LoggedSet) => s.status === 'failed');
                 if (!hasOtherFailures) {
                     setSuggestions(prev => {
                         const newSuggestions = {prev};
                         delete newSuggestions[exerciseKey];
                         return newSuggestions;
                     });
                 }
            }
            return newLog;
        });
    };
    
    const handleAddExercise = (name: string, sets: number, reps: string) => {
        const newKey = `${name}-${Date.now()}`;
        const newExercise: LoggedExercise = {
            name: name,
            sets: sets,
            reps: reps,
            type: 'working',
            loggedSets: Array.from({ length: sets }, () => ({
                status: 'skipped',
                reps: reps,
                weight: 0,
            })),
        };
        setLog(prev => ({ prev, [newKey]: newExercise }));
        setIsAddAccessoryModalOpen(false);
    };

    const handleSetWeightChange = (exerciseKey: string, setIndex: number, delta: number) => {
        setLog(prevLog => {
            const newLog = JSON.parse(JSON.stringify(prevLog));
            const set = newLog[exerciseKey].loggedSets[setIndex];
            const newWeight = set.weight + delta;
            set.weight = Math.max(0, newWeight); // Prevent negative weight
            return newLog;
        });
    }

    const handleWeightInputChange = (exerciseKey: string, setIndex: number, newWeight: string) => {
        const weightValue = parseInt(newWeight, 10);
        if (isNaN(weightValue)) return;

        setLog(prevLog => {
             const newLog = JSON.parse(JSON.stringify(prevLog));
             newLog[exerciseKey].loggedSets[setIndex].weight = weightValue;
             return newLog;
        });
    };

    const handleComplete = () => {
        onComplete(date, { exercises: log, notes });
    };

    const allSetupWeightsConfirmed = exercisesToSetup.every(lift => (setupWeights[lift.name] || 0) > 0);
    
    const allUniqueSuggestions = useMemo(() => {
        const uniqueSuggestions = new Map<string, AccessorySuggestion>();
        Object.values(suggestions).flat().forEach(sugg => {
            if (!uniqueSuggestions.has(sugg.name)) {
                uniqueSuggestions.set(sugg.name, sugg);
            }
        });
        return Array.from(uniqueSuggestions.values());
    }, [suggestions]);


    const renderSetupView = () => (
        <>
            <header className="p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Setup New Exercises</h2>
                <p className="text-sm text-slate-400">Here's a suggested starting weight. Adjust if needed.</p>
            </header>
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {exercisesToSetup.map(ex => (
                    <div key={ex.name}>
                        <label className="block text-lg font-semibold text-brand-light mb-1">{ex.name}</label>
                        <p className="text-sm text-slate-400 mb-2">{ex.sets} sets of {ex.reps}</p>
                        <input
                            type="number"
                            value={setupWeights[ex.name] || ''}
                            onChange={(e) => handleWeightSetupChange(ex.name, e.target.value)}
                            className="w-full bg-brand-dark/50 p-3 rounded-lg text-white text-lg font-bold border border-slate-600 focus:ring-2 focus:ring-brand-primary"
                            placeholder="Enter weight (lbs)"
                        />
                    </div>
                ))}
            </main>
            <footer className="p-4 border-t border-slate-700 flex gap-4">
                <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                <button
                    onClick={handleConfirmSetup}
                    disabled={!allSetupWeightsConfirmed}
                    className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    Confirm Weights & Start
                </button>
            </footer>
        </>
    );

    const renderLogView = () => (
         <>
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">{workoutDay.focus}</h2>
                    <p className="text-sm text-slate-400">Log your sets for today's session.</p>
                </div>
                 {exercisesToSetup.length > 0 && <button onClick={() => setView('setup')} className="p-2 rounded-full hover:bg-slate-600"><ArrowLeft size={20}/></button>}
            </header>
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {Object.entries(log).map(([key, exercise]) => {
                    const isAccessory = !exercise.percentageOf1RM && exercise.type !== 'warmup';
                    return (
                        <div key={key} className="bg-brand-dark/50 p-3 rounded-lg">
                            <h3 className="font-bold text-brand-primary">{exercise.name}</h3>
                            <p className="text-xs text-slate-400 -mt-1 mb-2">{exercise.sets} sets of {exercise.reps}</p>
                            {exercise.loggedSets.map((set, setIndex) => (
                                 <div key={setIndex} className="grid grid-cols-12 gap-2 items-center mb-1">
                                    <span className="col-span-2 text-sm text-slate-400">Set {setIndex + 1}</span>
                                    <div className="col-span-5 flex items-center bg-brand-secondary rounded-md border border-slate-600">
                                        {isAccessory && <button onClick={() => handleSetWeightChange(key, setIndex, -5)} className="px-2 py-1 text-slate-400 hover:text-white"><Minus size={14}/></button>}
                                        <input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => handleWeightInputChange(key, setIndex, e.target.value)}
                                            className="w-full bg-transparent p-1.5 font-semibold text-white text-center"
                                        />
                                         {isAccessory && <button onClick={() => handleSetWeightChange(key, setIndex, 5)} className="px-2 py-1 text-slate-400 hover:text-white"><Plus size={14}/></button>}
                                         {!isAccessory && <span className="text-xs text-slate-400 pr-2">lbs</span>}
                                    </div>
                                     <span className="col-span-1 text-center text-slate-400">× {set.reps}</span>
                                     <div className="col-span-4 flex justify-end gap-1.5">
                                         <button onClick={() => handleSetStatusChange(key, setIndex, 'completed')} className={`p-2 rounded-md ${set.status === 'completed' ? 'bg-brand-accent' : 'bg-slate-600 hover:bg-brand-accent/50'}`}><Check size={16}/></button>
                                         <button onClick={() => handleSetStatusChange(key, setIndex, 'failed')} className={`p-2 rounded-md ${set.status === 'failed' ? 'bg-brand-danger' : 'bg-slate-600 hover:bg-brand-danger/50'}`}><X size={16}/></button>
                                     </div>
                                 </div>
                            ))}
                        </div>
                    )
                })}

                <div className="bg-brand-dark/50 p-3 rounded-lg">
                     {allUniqueSuggestions.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-brand-primary mb-2">Recommended for You</h4>
                            <div className="space-y-2">
                                {allUniqueSuggestions.map(sugg => {
                                    const isAlreadyAdded = Object.values(log).some(ex => ex.name === sugg.name);
                                    return (
                                        <div key={sugg.name} className="flex items-center justify-between bg-brand-secondary/50 p-2 rounded-md">
                                            <div>
                                                <p className="font-semibold text-white">{sugg.name}</p>
                                                <p className="text-xs text-slate-400">{sugg.reason}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleAddExercise(sugg.name, sugg.sets, sugg.reps)} 
                                                disabled={isAlreadyAdded}
                                                className="flex-shrink-0 ml-2 py-1 px-3 bg-brand-accent text-white font-semibold text-xs rounded-full hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                                            >
                                                {isAlreadyAdded ? 'Added' : '+ Add'}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                     )}
                     <button 
                        onClick={() => setIsAddAccessoryModalOpen(true)}
                        className="w-full text-center py-2 bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary font-semibold rounded-md transition-colors"
                     >
                        + Add an Exercise
                     </button>
                </div>
                
                <div className="bg-brand-dark/50 p-3 rounded-lg">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><MessageSquare size={18}/> Session Notes</h3>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did the session feel? Any PRs?"
                        className="w-full bg-brand-secondary rounded-md p-2 text-white border border-slate-600 min-h-[80px] focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </main>
            <footer className="p-4 border-t border-slate-700 flex gap-4">
                <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                <button onClick={handleComplete} className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-700">Complete Workout</button>
            </footer>
         </>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg max-h-[90vh] rounded-2xl border border-slate-700 flex flex-col">
                 {view === 'setup' ? renderSetupView() : renderLogView()}
            </div>
            {isAddAccessoryModalOpen && (
                <AddAccessoryModal 
                    onClose={() => setIsAddAccessoryModalOpen(false)}
                    onAddAccessory={(name) => handleAddExercise(name, 3, '8-12')}
                />
            )}
        </div>
    );
};

export default WorkoutModal;