
import React, { useState, useMemo, useEffect } from 'react';
import { UserPreferences, Program, WorkoutLog, WorkoutDay, LoggedDay, ExerciseHistory, NutritionData, QuickNote, FailureLogEntry, Challenge, Exercise } from '../types';
import ProgramCalendar from './ProgramCalendar';
import WorkoutModal from './WorkoutModal';
import Analytics from './Analytics';
import Home from './Home';
import WorkoutLogView from './WorkoutLogView';
import SettingsView from './SettingsView';
import WorkoutPreviewModal from './WorkoutPreviewModal';
import LogWaterModal from './modals/LogWaterModal';
import QuickNoteModal from './modals/QuickNoteModal';
import EditNoteModal from './modals/EditNoteModal';
import StartNewProgramModal from './modals/StartNewProgramModal';
import ProgramCompleteModal from './modals/ProgramCompleteModal';
import AddAccessoryModal from './modals/AddAccessoryModal';
import { Home as HomeIcon, Calendar, ScrollText, BarChart2, Settings } from 'lucide-react';

interface DashboardProps {
    userPreferences: UserPreferences;
    program: Program;
    workoutLog: WorkoutLog;
    exerciseHistory: ExerciseHistory;
    nutritionData: NutritionData;
    quickNotes: QuickNote[];
    activeChallenges: Challenge[];
    onWorkoutComplete: (dateKey: string, loggedDay: LoggedDay) => void;
    onReset: () => void;
    onLogWater: (glasses: number) => void;
    onUpdateNutritionSettings: (data: Partial<NutritionData>) => void;
    onSaveQuickNote: (note: string) => void;
    onEditQuickNote: (noteId: string, newText: string) => void;
    onDeleteQuickNote: (noteId: string) => void;
    onDeleteAllQuickNotes: () => void;
    programStartDate: string | null;
    setUserPreferences: (prefs: UserPreferences) => void;
    onStartNewProgram: (templateKey: string) => void;
    onLogFailure: (entry: FailureLogEntry) => void;
    onAddAccessoryToDay: (dateKey: string, exerciseName: string) => void;
}

type View = 'home' | 'calendar' | 'log' | 'progress' | 'settings';

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs sm:text-sm transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-slate-400 hover:text-white'}`}
    >
        <Icon className="h-6 w-6 mb-1" />
        {label}
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ 
    userPreferences, 
    program, 
    workoutLog, 
    exerciseHistory,
    nutritionData,
    quickNotes,
    activeChallenges,
    onWorkoutComplete, 
    onReset, 
    programStartDate,
    onLogWater,
    onUpdateNutritionSettings,
    onSaveQuickNote,
    onEditQuickNote,
    onDeleteQuickNote,
    onDeleteAllQuickNotes,
    setUserPreferences,
    onStartNewProgram,
    onLogFailure,
    onAddAccessoryToDay,
}) => {
    const [activeView, setActiveView] = useState<View>('home');
    const [selectedWorkout, setSelectedWorkout] = useState<{ day: WorkoutDay, date: string } | null>(null);
    const [previewWorkout, setPreviewWorkout] = useState<{ day: WorkoutDay, date: string, isStartable: boolean } | null>(null);

    const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
    const [isNewProgramModalOpen, setIsNewProgramModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [isAddAccessoryModalOpen, setIsAddAccessoryModalOpen] = useState(false);
    const [accessoryTargetDate, setAccessoryTargetDate] = useState<string | null>(null);


    const handleSelectWorkout = (day: WorkoutDay, date: string) => {
        setSelectedWorkout({ day, date });
    };

    const handleCloseModal = () => {
        setSelectedWorkout(null);
    };

    const handleSelectPreview = (day: WorkoutDay, date: string, isStartable: boolean) => {
        setPreviewWorkout({ day, date, isStartable });
    };

    const handleClosePreview = () => {
        setPreviewWorkout(null);
    };

    const handleStartFromPreview = () => {
        if (previewWorkout) {
            handleSelectWorkout(previewWorkout.day, previewWorkout.date);
            handleClosePreview();
        }
    };

    const handleCompleteWorkout = (dateKey: string, loggedDay: LoggedDay) => {
        onWorkoutComplete(dateKey, loggedDay);
        handleCloseModal();
    };
    
    const handleStartNewProgram = (templateKey: string) => {
        onStartNewProgram(templateKey);
        setIsNewProgramModalOpen(false);
    };
    
    const handleAcceptNewMaxesAndStartNewProgram = (newPrefs: UserPreferences) => {
        setUserPreferences(newPrefs);
        setIsCompletionModalOpen(false);
        setIsNewProgramModalOpen(true);
    };

    const handleOpenAddAccessoryModal = (dateKey: string) => {
        setAccessoryTargetDate(dateKey);
        setIsAddAccessoryModalOpen(true);
    };

    const handleCloseAddAccessoryModal = () => {
        setIsAddAccessoryModalOpen(false);
        setAccessoryTargetDate(null);
    };

    const handleAddAccessory = (exerciseName: string) => {
        if (accessoryTargetDate) {
            onAddAccessoryToDay(accessoryTargetDate, exerciseName);
        }
        handleCloseAddAccessoryModal();
    };


    const nextWorkoutInfo = useMemo(() => {
        if (!programStartDate || !program || !program.weeks) return { nextWorkoutDay: null, nextWorkoutDate: null };

        const baseStartDate = new Date(programStartDate + 'T00:00:00');
        if (isNaN(baseStartDate.getTime())) {
            console.error("Invalid programStartDate received in Dashboard:", programStartDate);
            return { nextWorkoutDay: null, nextWorkoutDate: null };
        }

        const loggedDates = Object.keys(workoutLog);
        
        for (const week of program.weeks) {
            for (const day of week.days) {
                const workoutDate = new Date(baseStartDate);
                const dayOffset = (week.week - 1) * 7 + (day.day - 1);
                workoutDate.setDate(workoutDate.getDate() + dayOffset);
                const dateKey = workoutDate.toISOString().split('T')[0];

                if (day.exercises.length > 0 && !loggedDates.includes(dateKey)) {
                    return { 
                        nextWorkoutDay: day, 
                        nextWorkoutDate: dateKey 
                    };
                }
            }
        }

        return { nextWorkoutDay: null, nextWorkoutDate: null };
    }, [program, workoutLog, programStartDate]);

    useEffect(() => {
        const programHasStarted = !!programStartDate;
        const isFinished = programHasStarted && !nextWorkoutInfo.nextWorkoutDay;
        const hasWorkouts = program?.weeks?.some(w => w.days.some(d => d.exercises.length > 0));

        if (isFinished && hasWorkouts && !isCompletionModalOpen) {
            setIsCompletionModalOpen(true);
        }
    }, [nextWorkoutInfo.nextWorkoutDay, program, programStartDate, isCompletionModalOpen]);


    const renderContent = () => {
        switch(activeView) {
            case 'home':
                return <Home 
                    userPreferences={userPreferences}
                    program={program} 
                    workoutLog={workoutLog} 
                    onSelectWorkout={handleSelectWorkout} 
                    programStartDate={programStartDate}
                    nutritionData={nutritionData}
                    onOpenWaterModal={() => setIsWaterModalOpen(true)}
                    onOpenNoteModal={() => setIsNoteModalOpen(true)}
                    onNavigate={setActiveView}
                    nextWorkoutDay={nextWorkoutInfo.nextWorkoutDay}
                    nextWorkoutDate={nextWorkoutInfo.nextWorkoutDate}
                    activeChallenges={activeChallenges}
                    onOpenAddAccessoryModal={handleOpenAddAccessoryModal}
                 />;
            case 'calendar':
                 return <ProgramCalendar
                    program={program}
                    workoutLog={workoutLog}
                    onSelectPreview={handleSelectPreview}
                    programStartDate={programStartDate || new Date().toISOString()}
                    nextWorkoutDateKey={nextWorkoutInfo.nextWorkoutDate}
                 />;
            case 'log':
                return <WorkoutLogView 
                    workoutLog={workoutLog} 
                    quickNotes={quickNotes} 
                    onEditNote={setEditingNote}
                    onDeleteNote={onDeleteQuickNote}
                    onDeleteAllNotes={onDeleteAllQuickNotes}
                    />;
            case 'progress':
                return <Analytics workoutLog={workoutLog} userPreferences={userPreferences} />;
            case 'settings':
                return <SettingsView 
                    userPreferences={userPreferences} 
                    onReset={onReset} 
                    onSetUserPreferences={setUserPreferences}
                    onStartNewProgram={() => setIsNewProgramModalOpen(true)}
                    onDeleteAllQuickNotes={onDeleteAllQuickNotes}
                    quickNotesCount={quickNotes.length}
                    nutritionData={nutritionData}
                    onUpdateNutritionSettings={onUpdateNutritionSettings}
                />;
            default:
                return <Home userPreferences={userPreferences} program={program} workoutLog={workoutLog} onSelectWorkout={handleSelectWorkout} programStartDate={programStartDate} nutritionData={nutritionData} onOpenWaterModal={() => setIsWaterModalOpen(true)} onOpenNoteModal={() => setIsNoteModalOpen(true)} onNavigate={setActiveView}  nextWorkoutDay={nextWorkoutInfo.nextWorkoutDay} nextWorkoutDate={nextWorkoutInfo.nextWorkoutDate} activeChallenges={activeChallenges} onOpenAddAccessoryModal={handleOpenAddAccessoryModal}/>;
        }
    }

    return (
        <div className="bg-brand-dark text-brand-light min-h-screen flex flex-col">
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24">
                {renderContent()}
            </main>
            
            {isWaterModalOpen && (
                <LogWaterModal 
                    onClose={() => setIsWaterModalOpen(false)}
                    onSave={(glasses) => {
                        onLogWater(glasses);
                        setIsWaterModalOpen(false);
                    }}
                />
            )}

            {isNoteModalOpen && (
                <QuickNoteModal 
                    onClose={() => setIsNoteModalOpen(false)}
                    onSave={(note) => {
                        onSaveQuickNote(note);
                        setIsNoteModalOpen(false);
                    }}
                />
            )}

            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    onClose={() => setEditingNote(null)}
                    onSave={(noteId, newText) => {
                        onEditQuickNote(noteId, newText);
                        setEditingNote(null);
                    }}
                />
            )}
            
            {isCompletionModalOpen && (
                <ProgramCompleteModal
                    userPreferences={userPreferences}
                    workoutLog={workoutLog}
                    onClose={() => setIsCompletionModalOpen(false)}
                    onAcceptAndStartNew={handleAcceptNewMaxesAndStartNewProgram}
                />
            )}


            {isNewProgramModalOpen && (
                <StartNewProgramModal 
                    onClose={() => setIsNewProgramModalOpen(false)}
                    onStart={handleStartNewProgram}
                />
            )}


            {previewWorkout && (
                <WorkoutPreviewModal
                    isOpen={!!previewWorkout}
                    onClose={handleClosePreview}
                    workoutDay={previewWorkout.day}
                    date={previewWorkout.date}
                    isStartable={previewWorkout.isStartable}
                    onStartWorkout={handleStartFromPreview}
                />
            )}

            {selectedWorkout && (
                <WorkoutModal
                    isOpen={!!selectedWorkout}
                    onClose={handleCloseModal}
                    workoutDay={selectedWorkout.day}
                    date={selectedWorkout.date}
                    userPreferences={userPreferences}
                    onComplete={handleCompleteWorkout}
                    workoutLog={workoutLog}
                    exerciseHistory={exerciseHistory}
                    programStartDate={programStartDate}
                    onLogFailure={onLogFailure}
                />
            )}

            {isAddAccessoryModalOpen && (
                <AddAccessoryModal
                    onClose={handleCloseAddAccessoryModal}
                    onAddAccessory={handleAddAccessory}
                />
            )}
            
            <nav className="fixed bottom-0 left-0 right-0 bg-brand-secondary border-t border-slate-700 flex justify-around z-10">
                <NavItem icon={HomeIcon} label="Home" isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
                <NavItem icon={Calendar} label="Calendar" isActive={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
                <NavItem icon={ScrollText} label="Log" isActive={activeView === 'log'} onClick={() => setActiveView('log')} />
                <NavItem icon={BarChart2} label="Progress" isActive={activeView === 'progress'} onClick={() => setActiveView('progress')} />
                <NavItem icon={Settings} label="Settings" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
            </nav>
        </div>
    );
};

export default Dashboard;
