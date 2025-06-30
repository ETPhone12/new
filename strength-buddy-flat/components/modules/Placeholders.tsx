import React, { useState, useEffect } from 'react';
import { ThermometerSun, Forward, Quote, Dumbbell, Trophy, PlayCircle, Star, RefreshCw, AlertTriangle } from 'lucide-react';
import { WorkoutDay, Exercise } from '../../types';

const PlaceholderCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode, colSpan?: string }> = ({ icon: Icon, title, children, colSpan = "lg:col-span-2" }) => (
    <div className={`${colSpan} bg-brand-secondary p-4 rounded-lg flex flex-col`}>
        <h3 className="font-bold text-white mb-3 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-brand-primary" />
            {title}
        </h3>
        <div className="flex-grow flex flex-col justify-between">
            {children}
        </div>
    </div>
);

const formatDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // FIX: Appending T00:00:00 ensures parsing in local timezone, not UTC.
    const workoutDate = new Date(dateString + 'T00:00:00'); 

    if (workoutDate.getTime() === today.getTime()) {
        return "Today";
    }
    if (workoutDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
    }
    
    return workoutDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

interface UpcomingWorkoutModuleProps {
    nextWorkout: WorkoutDay | null;
    nextWorkoutDate: string | null;
    onStartWorkout: () => void;
    onOpenAddAccessoryModal: (dateKey: string) => void;
}
export const UpcomingWorkoutModule: React.FC<UpcomingWorkoutModuleProps> = ({ nextWorkout, nextWorkoutDate, onStartWorkout, onOpenAddAccessoryModal }) => {
    if (!nextWorkout || !nextWorkoutDate) {
        return (
            <div className="lg:col-span-4 bg-brand-secondary p-6 rounded-lg text-center">
                <Trophy className="mx-auto h-12 w-12 text-brand-accent mb-2" />
                <h3 className="text-xl font-bold text-white">Program Complete!</h3>
                <p className="text-slate-400">You've finished all your scheduled workouts. Time to start a new program!</p>
            </div>
        );
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const workoutDate = new Date(nextWorkoutDate + 'T00:00:00');
    const isMissed = workoutDate < today;

    const liftsForToday = nextWorkout.exercises.filter(ex => ex.type !== 'warmup');
    
    const groupedLifts = liftsForToday.reduce((acc, lift) => {
        if (!acc[lift.name]) {
            acc[lift.name] = [];
        }
        acc[lift.name].push(lift);
        return acc;
    }, {} as Record<string, Exercise[]>);

    const formattedDateLabel = formatDate(nextWorkoutDate);
    const titleText = isMissed ? "Missed Workout" : nextWorkout.focus;


    return (
        <div className="lg:col-span-4 bg-brand-dark p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        {isMissed && <AlertTriangle className="h-6 w-6 text-brand-warning mr-2" />}
                        {titleText}
                    </h2>
                    <p className="text-slate-400">Scheduled for: <span className="font-semibold">{formattedDateLabel}</span></p>
                </div>
                <button 
                    onClick={onStartWorkout} 
                    className="mt-3 sm:mt-0 w-full sm:w-auto bg-brand-accent text-white font-bold py-2 px-5 rounded-lg hover:bg-green-500 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    <PlayCircle size={20} /> Start Workout
                </button>
            </div>

            <div className="border-t border-slate-700/50 pt-4">
                <h4 className="font-semibold text-white mb-2">Lifts for {formattedDateLabel}</h4>
                <div className="space-y-3">
                    {Object.keys(groupedLifts).length > 0 ? (
                        Object.entries(groupedLifts).map(([name, lifts]) => {
                            const setAggregator = new Map<string, number>();
                            lifts.forEach(lift => {
                                const reps = lift.reps;
                                const weight = lift.calculatedWeight;
                                const key = `${reps}${weight ? ` @ ${weight} lbs` : ''}`;
                                const currentCount = setAggregator.get(key) || 0;
                                setAggregator.set(key, currentCount + lift.sets);
                            });

                            const details = Array.from(setAggregator.entries())
                                .map(([setString, setCount]) => `${setCount} × ${setString}`)
                                .join(', ');

                            return (
                                <div key={name} className="flex items-start gap-3">
                                   <Star className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                                   <div>
                                    <p className="font-semibold text-white">{name}</p>
                                    {details && <p className="text-slate-400 text-sm">{details}</p>}
                                   </div>
                                </div>
                            );
                        })
                    ) : <p className="text-slate-400 text-sm">No lifts scheduled for today.</p>}
                </div>
            </div>
             <div className="mt-6 border-t border-slate-700/50 pt-4">
                <button
                    onClick={() => onOpenAddAccessoryModal(nextWorkoutDate)}
                    className="w-full text-center py-2 bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary font-semibold rounded-md transition-colors"
                >
                    + Add Accessory
                </button>
            </div>
        </div>
    );
};

const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Success isn't about greatness. It's about consistency. Consistent hard work gains success.",
    "Strive for progress, not perfection.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Push yourself, because no one else is going to do it for you.",
    "Strength does not come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    "The last three or four reps is what makes the muscle grow.",
    "It’s not about having time. It’s about making time.",
    "Discipline is choosing between what you want now and what you want most.",
    "Doubt kills more dreams than failure ever will.",
    "The clock is ticking. Are you becoming the person you want to be?",
    "Don't limit your challenges. Challenge your limits.",
    "The body achieves what the mind believes.",
    "A one-hour workout is 4% of your day. No excuses.",
    "Sweat is just fat crying.",
    "It's slow progress, but quitting won't speed it up.",
    "The difference between the impossible and the possible lies in a person’s determination.",
    "Wake up with determination. Go to bed with satisfaction.",
    "You are one workout away from a good mood.",
    "Obsessed is a word the lazy use to describe the dedicated.",
    "The only person you are destined to become is the person you decide to be.",
    "Success starts with self-discipline.",
    "Train insane or remain the same.",
    "Make your body the sexiest outfit you own.",
    "Your current body is the only body that can take you to your new body.",
    "Clear your mind of can't.",
    "Hustle for that muscle.",
    "Be stronger than your strongest excuse.",
    "Excuses don't build empires.",
    "Strength grows in the moments when you think you can't go on but you keep going anyway.",
    "You don't find willpower, you create it.",
    "The iron never lies to you. You can walk outside and listen to all kinds of talk, but the iron will always kick you the real deal.",
    "There are no shortcuts—everything is reps, reps, reps.",
    "Suffer the pain of discipline or suffer the pain of regret.",
    "If you're tired of starting over, stop giving up.",
    "On good days, work out. On bad days, work out harder.",
    "Every pro was once an amateur. Every expert was once a beginner.",
    "Fall in love with the process, and the results will come.",
    "When you feel like quitting, think about why you started.",
    "Victory is sweetest when you’ve known defeat.",
    "Go the extra mile. It’s never crowded there.",
    "If it doesn't challenge you, it won't change you.",
    "Pain is temporary. Quitting lasts forever.",
    "The real workout starts when you want to stop.",
    "Your future is created by what you do today, not tomorrow.",
    "Don’t wish for a good body, work for it.",
    "The best project you'll ever work on is you.",
    "What seems impossible today will one day become your warm-up.",
    "Be proud, but never satisfied."
];

export const DailyMessageModule: React.FC = () => {
    const [message, setMessage] = useState('');

    const pickAndSetNewQuote = () => {
        const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setMessage(newQuote);
        try {
            localStorage.setItem('dailyMotivation', JSON.stringify({
                quote: newQuote,
                timestamp: new Date().getTime()
            }));
        } catch(e) {
            console.error("Failed to save to localStorage", e);
        }
    };

    useEffect(() => {
        try {
            const savedQuoteData = localStorage.getItem('dailyMotivation');
            const twelveHours = 12 * 60 * 60 * 1000;
    
            if (savedQuoteData) {
                const { quote, timestamp } = JSON.parse(savedQuoteData);
                if (new Date().getTime() - timestamp < twelveHours) {
                    setMessage(quote);
                    return; // Use the saved quote
                }
            }
        } catch (e) {
            console.error("Failed to read from localStorage", e);
        }

        pickAndSetNewQuote();
    }, []);

     return (
        <PlaceholderCard icon={Quote} title="Daily Motivation">
           <p className="text-slate-300 italic">"{message}"</p>
           <div className="text-right mt-auto pt-2">
                 <button 
                    onClick={pickAndSetNewQuote} 
                    className="p-1.5 rounded-full hover:bg-brand-primary/20 text-slate-400 hover:text-white transition-colors"
                    aria-label="Get a new quote"
                 >
                    <RefreshCw size={16} />
                </button>
            </div>
       </PlaceholderCard>
    );
};