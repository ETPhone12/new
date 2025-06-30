import React, { useState, useEffect } from 'react';
import { UserPreferences, Program, ProgramRecommendation } from '../types';
import { PROGRAM_TEMPLATES, LIFT_DETAILS, LOADING_TIPS } from '../constants';
import { generateProgramLocal, getProgramRecommendationByExperience } from '../services/programService';
import { Dumbbell, Loader2, BookCopy, Sparkles } from 'lucide-react';

interface OnboardingProps {
    onOnboardingComplete: (preferences: UserPreferences, program: Program) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onOnboardingComplete }) => {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
        name: '',
        oneRepMax: {
            benchPress: 0,
            squat: 0,
            deadlift: 0,
            overheadPress: 0,
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<ProgramRecommendation | null>(null);
    const [showAllPrograms, setShowAllPrograms] = useState(false);

    useEffect(() => {
        if (!isLoading) return;

        const shuffled = [LOADING_TIPS].sort(() => 0.5 - Math.random());
        let currentIndex = 0;
        setLoadingTip(shuffled[currentIndex]); // Set initial tip

        const tipInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % shuffled.length;
            setLoadingTip(shuffled[currentIndex]);
        }, 15000); // 15 seconds
        
        return () => clearInterval(tipInterval);
    }, [isLoading]);

    const handleInputChange = (lift: keyof UserPreferences['oneRepMax'] | 'name', value: string) => {
        if (lift === 'name') {
            setPreferences(prev => ({
                prev,
                name: value,
            }));
            return;
        }

        const numValue = parseInt(value, 10);
        setPreferences(prev => ({
            prev,
            oneRepMax: {
                prev!.oneRepMax,
                [lift]: isNaN(numValue) ? 0 : numValue,
            },
        }));
    };

    const handleSelectChange = (field: 'programTemplate', value: string) => {
        setPreferences(prev => ({ prev, [field]: value }));
    };

    const handleGoToStep2 = () => {
        if (Object.values(preferences.oneRepMax!).some(v => v === undefined || v <= 0)) {
            setError("Please enter a valid 1-Rep Max for all lifts.");
            return;
        }
        setError(null);
        
        const recommendationResult = getProgramRecommendationByExperience(preferences.oneRepMax as UserPreferences['oneRepMax']);

        if (recommendationResult) {
            setRecommendation(recommendationResult);
            setPreferences(prev => ({ prev, programTemplate: recommendationResult.top.key }));
        } else {
            // This case should be rare, but handles it gracefully.
            setError("Could not generate a recommendation. Please choose a program manually.");
            setRecommendation(null); // Ensure no old recommendation is shown
            setShowAllPrograms(true); // Show all programs if recommendation fails
        }
        
        setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingMessage("Generating your program");
        setError(null);

        const finalPreferences = {
            preferences,
            experience: 'Intermediate', 
            goal: 'Max Strength' 
        } as UserPreferences;

        if (!finalPreferences.programTemplate) {
            setError("Please select a program template.");
            setIsLoading(false);
            return;
        }

        try {
            const program = generateProgramLocal(finalPreferences);
            if (program) {
                onOnboardingComplete(finalPreferences, program);
            } else {
                setError("Failed to generate a program. This template may not be implemented yet. Please select another.");
                setIsLoading(false);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please check your connection and try again.");
            console.error(err);
        } finally {
            // A small timeout to make it feel like something is happening
            setTimeout(() => setIsLoading(false), 500);
        }
    };
    
     if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-center">
                 <Loader2 className="w-16 h-16 animate-spin text-brand-primary mb-6" />
                 <h2 className="text-2xl font-bold text-white mb-2">{loadingMessage}</h2>
                 <p className="text-slate-400 max-w-md">{loadingTip}</p>
            </div>
        )
    }
    
    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-brand-light">Welcome! Let's get started.</h2>
                        <p className="text-center text-slate-400 mb-8">First, tell us your name and your estimated 1-Rep Maxes (in lbs).</p>
                        
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">First Name (Optional)</label>
                            <input
                                type="text"
                                id="name"
                                value={preferences.name || ''}
                                onChange={e => handleInputChange('name', e.target.value)}
                                className="w-full bg-brand-secondary border border-slate-600 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                placeholder="e.g., Andy"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.values(LIFT_DETAILS).map(lift => (
                                <div key={lift.key}>
                                    <label htmlFor={lift.key} className="block text-sm font-medium text-slate-300 mb-1">{lift.name}</label>
                                    <input
                                        type="number"
                                        id={lift.key}
                                        value={preferences.oneRepMax?.[lift.key] || ''}
                                        onChange={e => handleInputChange(lift.key, e.target.value)}
                                        className="w-full bg-brand-secondary border border-slate-600 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="e.g., 225"
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGoToStep2} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg mt-8 hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center disabled:bg-slate-500">
                           Get Recommendation
                        </button>
                    </div>
                );
            case 2:
                const recommendedKeys = recommendation ? [recommendation.top.key, recommendation.alternatives] : [];
                const displayedTemplates = showAllPrograms ? PROGRAM_TEMPLATES : PROGRAM_TEMPLATES.filter(p => recommendedKeys.includes(p.key));

                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-brand-light">Choose Your Program</h2>
                        <p className="text-center text-slate-400 mb-8">We've recommended a program based on your experience, but feel free to choose another.</p>
                        
                        {recommendation && (
                            <div className="bg-brand-primary/10 border-2 border-brand-primary p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="text-brand-primary" /> Recommendation</h3>
                                <p className="text-slate-300 mt-1">{recommendation.top.reason}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                             <div>
                                <h3 className="text-lg font-semibold text-brand-light mb-2 flex items-center"><BookCopy className="w-5 h-5 mr-2 text-brand-primary"/> Program Template</h3>
                                 <div className="grid grid-cols-1 gap-3">
                                    {displayedTemplates.map(template => (
                                        <button key={template.key} onClick={() => handleSelectChange('programTemplate', template.key)} className={`p-4 rounded-lg text-left font-semibold border-2 transition-all w-full relative ${preferences.programTemplate === template.key ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-secondary border-slate-600 text-slate-300 hover:border-brand-primary'}`}>
                                            {recommendation?.top.key === template.key && (
                                                <span className="absolute top-2 right-2 text-xs bg-brand-primary text-white font-bold py-0.5 px-2 rounded-full">Recommended</span>
                                            )}
                                            {template.name}
                                            <p className="font-normal text-sm opacity-80 mt-1">{template.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {!showAllPrograms && (
                           <div className="mt-6 text-center">
                               <button
                                   onClick={() => setShowAllPrograms(true)}
                                   className="text-brand-primary font-semibold hover:underline"
                               >
                                   Show More Programs
                               </button>
                           </div>
                        )}

                        <div className="flex items-center gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors duration-300">Back</button>
                            <button onClick={handleSubmit} disabled={!preferences.programTemplate} className="w-full bg-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors duration-300 flex items-center justify-center disabled:bg-slate-500 disabled:cursor-not-allowed">
                                Generate My Program
                            </button>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                     <Dumbbell className="mx-auto h-12 w-12 text-brand-primary" />
                    <h1 className="text-4xl font-black text-white mt-2">Strength Buddy</h1>
                    <p className="text-slate-400">Your personalized strength coach.</p>
                </div>
                <div className="bg-brand-dark p-8 rounded-xl border border-slate-800 shadow-2xl">
                    {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6">{error}</div>}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;