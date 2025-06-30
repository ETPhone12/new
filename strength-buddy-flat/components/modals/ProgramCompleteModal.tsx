import React, { useMemo } from 'react';
import { UserPreferences, WorkoutLog } from '../../types';
import { estimateNewOneRepMaxes } from '../../services/programService';
import { X, ArrowRight, TrendingUp, Sparkles, Repeat, Trophy } from 'lucide-react';
import { LIFT_DETAILS } from '../../constants';

interface ProgramCompleteModalProps {
    userPreferences: UserPreferences;
    workoutLog: WorkoutLog;
    onClose: () => void;
    onAcceptAndStartNew: (updatedPreferences: UserPreferences) => void;
}

const ProgramCompleteModal: React.FC<ProgramCompleteModalProps> = ({
    userPreferences,
    workoutLog,
    onClose,
    onAcceptAndStartNew,
}) => {
    const newEstimatedMaxes = useMemo(() => {
        return estimateNewOneRepMaxes(workoutLog, userPreferences.oneRepMax);
    }, [workoutLog, userPreferences.oneRepMax]);

    const handleStartNew = () => {
        const updatedPreferences: UserPreferences = {
            userPreferences,
            oneRepMax: newEstimatedMaxes,
        };
        onAcceptAndStartNew(updatedPreferences);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <Trophy className="h-8 w-8 text-brand-accent"/>
                        <div>
                            <h2 className="text-xl font-bold text-white">Program Complete!</h2>
                            <p className="text-sm text-slate-400">Amazing work. Let's review your progress.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                     <div className="bg-brand-primary/10 border border-brand-primary/50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles size={18}/> New Estimated 1-Rep Maxes</h3>
                        <p className="text-slate-300 text-sm mt-1 mb-4">Based on your performance, here are your new estimated maxes:</p>
                        <div className="space-y-3">
                            {Object.entries(newEstimatedMaxes).map(([key, newMax]) => {
                                const oldMax = userPreferences.oneRepMax[key as keyof typeof newEstimatedMaxes];
                                const increase = newMax - oldMax;
                                const hasIncreased = increase > 0;

                                return (
                                    <div key={key} className="flex items-center justify-between bg-brand-dark/30 p-2 rounded-md">
                                        <span className="font-semibold text-white">{LIFT_DETAILS[key as keyof typeof newEstimatedMaxes].name}</span>
                                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                                            <span>{oldMax} lbs</span>
                                            <ArrowRight className="h-5 w-5 text-slate-500"/>
                                            <span>{newMax} lbs</span>
                                            {hasIncreased && (
                                                <div className="flex items-center text-xs font-bold text-brand-accent bg-brand-accent/20 px-2 py-0.5 rounded-full">
                                                    <TrendingUp size={12} className="mr-1"/>
                                                    +{increase} lbs
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-slate-700 bg-brand-dark/20">
                    <button 
                        onClick={handleStartNew}
                        className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg"
                    >
                        <Repeat size={20}/> Start New Program with Updated Maxes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ProgramCompleteModal;
