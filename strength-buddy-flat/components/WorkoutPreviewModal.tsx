import React from 'react';
import { WorkoutDay } from '../types';
import { X, PlayCircle } from 'lucide-react';

interface WorkoutPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    workoutDay: WorkoutDay;
    date: string;
    isStartable: boolean;
    onStartWorkout: () => void;
}

const WorkoutPreviewModal: React.FC<WorkoutPreviewModalProps> = ({
    isOpen,
    onClose,
    workoutDay,
    date,
    isStartable,
    onStartWorkout
}) => {
    if (!isOpen) return null;

    // FIX: Appending T00:00:00 ensures the date string is parsed in the local timezone,
    // preventing off-by-one-day errors in different browsers.
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg max-h-[90vh] rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">{workoutDay.focus}</h2>
                        <p className="text-sm text-slate-400">{formattedDate}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto space-y-3">
                    {workoutDay.exercises.length > 0 ? (
                        workoutDay.exercises.map((ex, index) => (
                            <div key={index} className="flex justify-between items-center bg-brand-dark/50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-brand-light">{ex.name}</p>
                                    <p className={`text-sm ${ex.type === 'warmup' ? 'text-slate-400' : 'text-slate-300'}`}>
                                        {ex.sets} × {ex.reps} {ex.calculatedWeight ? `@ ${ex.calculatedWeight} lbs` : ''}
                                    </p>
                                </div>
                                {ex.type === 'warmup' && (
                                     <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 py-0.5 px-2 rounded-full">WARM-UP</span>
                                )}
                            </div>
                        ))
                    ) : (
                         <p className="text-slate-400 text-center py-8">This is a planned rest day.</p>
                    )}
                </main>
                <footer className="p-4 border-t border-slate-700 flex gap-4">
                     <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Close</button>
                     {isStartable && (
                        <button onClick={onStartWorkout} className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-green-500 flex items-center justify-center gap-2">
                            <PlayCircle size={20} /> Start This Workout
                        </button>
                     )}
                </footer>
            </div>
        </div>
    );
};

export default WorkoutPreviewModal;