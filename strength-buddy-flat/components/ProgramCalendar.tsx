
import React, { useState, useMemo } from 'react';
import { Program, WorkoutLog, WorkoutDay, Exercise } from '../types';
import { LIFT_COLORS } from '../constants';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, PlayCircle, Bed, AlertTriangle } from 'lucide-react';

interface ProgramCalendarProps {
    program: Program;
    workoutLog: WorkoutLog;
    onSelectPreview: (day: WorkoutDay, date: string, isStartable: boolean) => void;
    programStartDate: string;
    nextWorkoutDateKey: string | null;
}

type CalendarDay = {
    key: string;
    isEmpty: true;
} | {
    key: string;
    isEmpty: false;
    date: Date;
    dateKey: string;
};

const getPrimaryLiftInfo = (day: WorkoutDay): { key: string, colors: { bg: string, border: string, text: string } } => {
    const defaultInfo = { key: 'default', colors: LIFT_COLORS.default };
    if (!day || !day.exercises || day.exercises.length === 0) {
        return defaultInfo;
    }

    const mainFocus = day.focus.toLowerCase();
    
    if (mainFocus.includes('squat')) return { key: 'squat', colors: LIFT_COLORS.squat };
    if (mainFocus.includes('bench')) return { key: 'benchPress', colors: LIFT_COLORS.benchPress };
    if (mainFocus.includes('deadlift')) return { key: 'deadlift', colors: LIFT_COLORS.deadlift };
    if (mainFocus.includes('overhead') || mainFocus.includes('ohp')) return { key: 'overheadPress', colors: LIFT_COLORS.overheadPress };
    
    const workingExercises = day.exercises.filter(ex => ex.type === 'working');
    if(workingExercises.length > 0) {
      const firstLift = workingExercises[0].name.toLowerCase();
      if (firstLift.includes('squat')) return { key: 'squat', colors: LIFT_COLORS.squat };
      if (firstLift.includes('bench')) return { key: 'benchPress', colors: LIFT_COLORS.benchPress };
      if (firstLift.includes('deadlift')) return { key: 'deadlift', colors: LIFT_COLORS.deadlift };
      if (firstLift.includes('overhead')) return { key: 'overheadPress', colors: LIFT_COLORS.overheadPress };
    }


    return defaultInfo;
};

const ProgramCalendar: React.FC<ProgramCalendarProps> = ({ program, workoutLog, onSelectPreview, programStartDate, nextWorkoutDateKey }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const scheduledWorkoutMap = useMemo(() => {
        const map = new Map<string, WorkoutDay>();
        if (!program || !program.weeks) {
            return map;
        }
        
        const startDate = new Date(programStartDate + 'T00:00:00');
        if (isNaN(startDate.getTime())) {
            console.error("Invalid programStartDate received in ProgramCalendar:", programStartDate);
            return map;
        }

        program.weeks.forEach(week => {
            week.days.forEach((day, dayIndexInWeek) => {
                const dayDate = new Date(startDate);
                const dayOffset = (week.week - 1) * 7 + (day.day -1)
                dayDate.setDate(startDate.getDate() + dayOffset);
                const dateKey = dayDate.toISOString().split('T')[0];
                map.set(dateKey, day);
            });
        });
        return map;
    }, [program, programStartDate]);
    
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays: CalendarDay[] = Array.from({ length: firstDayOfMonth }, (_, i) => ({ key: `empty-start-${i}`, isEmpty: true }));

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        calendarDays.push({ key: dateKey, isEmpty: false, date: date, dateKey: dateKey });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="bg-brand-secondary p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-600"><ChevronLeft/></button>
                <h2 className="text-xl font-bold text-white">
                    {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-600"><ChevronRight/></button>
            </div>

             <div className="grid grid-cols-7 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-bold text-slate-400 p-2">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                    if (day.isEmpty) {
                        return <div key={day.key} />;
                    } else {
                        const { date, dateKey } = day;
                        const scheduledDay = scheduledWorkoutMap.get(dateKey);
                        const loggedDay = workoutLog[dateKey];
                        const isToday = date.getTime() === today.getTime();
                        const isNextWorkout = dateKey === nextWorkoutDateKey;
    
                        const pastDate = new Date(dateKey + 'T00:00:00');
                        const isPast = pastDate < today && !loggedDay && !!scheduledDay && scheduledDay.exercises.length > 0;
    
                        const isStartable = new Date(dateKey + 'T00:00:00') <= new Date() && !loggedDay && !!scheduledDay && scheduledDay.exercises.length > 0;
    
                        const primaryLift = scheduledDay ? getPrimaryLiftInfo(scheduledDay) : getPrimaryLiftInfo({ day: 0, focus: '', exercises: [] });
    
                        let dayClasses = `p-2 rounded-lg flex flex-col items-center justify-center min-h-[80px] transition-colors duration-200 aspect-square `;
    
                        let content = null;
    
                        let handler = () => { };
                        if (scheduledDay && scheduledDay.exercises.length > 0) {
                            dayClasses += ` ${primaryLift.colors.bg} border ${primaryLift.colors.border} hover:border-brand-primary cursor-pointer `;
                            handler = () => onSelectPreview(scheduledDay, dateKey, isStartable);
                            content = (
                                <>
                                    <span className={`font-bold text-lg ${primaryLift.colors.text}`}>{date.getDate()}</span>
                                    <span className="text-xs text-slate-300 capitalize mt-1">{primaryLift.key}</span>
                                    {loggedDay && <CheckCircle2 className="h-5 w-5 text-green-400 mt-1" />}
                                    {isNextWorkout && !loggedDay && <PlayCircle className="h-5 w-5 text-brand-accent mt-1" />}
                                    {isPast && <AlertTriangle className="h-5 w-5 text-yellow-400 mt-1" />}
                                </>
                            );
                        } else {
                            dayClasses += ' bg-brand-dark/30 ';
                            content = (
                                <>
                                    <span className="font-bold text-lg text-slate-600">{date.getDate()}</span>
                                    {loggedDay === undefined && <Bed className="h-5 w-5 text-slate-700 mt-1" />}
                                </>
                            );
                        }
                        if (isToday) {
                            dayClasses += ' ring-2 ring-brand-primary ';
                        }
    
                        return (
                            <div key={day.key} className={dayClasses} onClick={handler}>
                                {content}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default ProgramCalendar;
