import React, { useMemo, useState } from 'react';
import { WorkoutLog, LoggedDay, QuickNote } from '../types';
import { CheckCircle2, XCircle, CalendarDays, Weight, MessageSquare, Trash2, Edit, FileText } from 'lucide-react';

interface WorkoutLogViewProps {
    workoutLog: WorkoutLog;
    quickNotes: QuickNote[];
    onEditNote: (note: QuickNote) => void;
    onDeleteNote: (noteId: string) => void;
    onDeleteAllNotes: () => void;
}

const getDayStatus = (logDay: LoggedDay): 'completed' | 'failed' | 'partial' => {
    const allSets = Object.values(logDay.exercises).flatMap((ex: any) => ex.loggedSets);
    if (allSets.length === 0) return 'partial'; 
    if (allSets.some((s: any) => s.status === 'failed')) return 'failed';
    if (allSets.every((s: any) => s.status === 'completed')) return 'completed';
    return 'partial';
};

const calculateDayVolume = (dayLog: LoggedDay): number => {
    let total = 0;
    Object.values(dayLog.exercises).forEach((exerciseLog: any) => {
        exerciseLog.loggedSets.forEach((set: any) => {
            if (set.status === 'completed') {
                const reps = typeof set.reps === 'number' ? set.reps : parseInt(String(set.reps).split('-')[0], 10);
                if (!isNaN(reps)) {
                    total += set.weight * reps;
                }
            }
        });
    });
    return total;
};

const WorkoutEntry: React.FC<{ date: Date, log: LoggedDay }> = ({ date, log }) => {
    const mainLift = Object.values(log.exercises).find(ex => ex.type === 'working' && ex.percentageOf1RM);
    const focus = mainLift ? mainLift.name : 'Workout';
    const totalVolume = calculateDayVolume(log);
    const status = getDayStatus(log);
    const statusIcon = status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-brand-accent"/> : <XCircle className="h-5 w-5 text-brand-danger"/>;

    return (
        <div className="bg-brand-secondary p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-400">{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-lg font-bold text-white">{focus}</h3>
                </div>
            </div>
           
            {log.notes && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-2 mb-1"><MessageSquare size={14}/> Session Notes</h4>
                    <p className="text-slate-400 text-sm whitespace-pre-wrap">{log.notes}</p>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 font-semibold">
                    {statusIcon}
                    <span className={`${status === 'completed' ? 'text-brand-accent' : 'text-brand-danger'}`}>{status === 'completed' ? 'Completed' : 'Failed Sets'}</span>
                </div>
                <div className="font-semibold text-slate-300 flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Volume: <span className="text-white">{totalVolume.toLocaleString()} lbs</span>
                </div>
            </div>
        </div>
    )
};
    
const NoteEntry: React.FC<{ note: QuickNote; onEdit: (note: QuickNote) => void; onDelete: (noteId: string) => void; }> = ({ note, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            className="bg-brand-secondary/50 p-4 rounded-lg border border-slate-800 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                        <FileText size={14} /> Quick Note
                    </p>
                    <p className="text-white whitespace-pre-wrap">{note.note}</p>
                </div>
                <p className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
            </div>
            {isHovered && (
                 <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button onClick={() => onEdit(note)} className="p-1.5 rounded-md bg-slate-600 hover:bg-brand-primary text-white"><Edit size={14}/></button>
                    <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-md bg-slate-600 hover:bg-brand-danger text-white"><Trash2 size={14}/></button>
                 </div>
            )}
        </div>
    )
};

const WorkoutLogView: React.FC<WorkoutLogViewProps> = ({ workoutLog, quickNotes, onEditNote, onDeleteNote, onDeleteAllNotes }) => {
    const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
    
    const combinedLog = useMemo(() => {
        const workoutEntries = Object.entries(workoutLog).map(([date, log]) => ({
            type: 'workout' as const,
            // FIX: Appending T00:00:00 ensures parsing in local timezone.
            date: new Date(date + 'T00:00:00'),
            data: log,
        }));

        const noteEntries = quickNotes.map(note => ({
            type: 'note' as const,
            date: new Date(note.date),
            data: note,
        }));

        return [workoutEntries, noteEntries].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [workoutLog, quickNotes]);
    
    const handleDeleteAll = () => {
        onDeleteAllNotes();
        setShowConfirmDeleteAll(false);
    }

    if (combinedLog.length === 0) {
        return (
            <div className="text-center text-slate-400 mt-16">
                 <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-600"/>
                <h2 className="text-xl font-bold text-white">No Logs Yet</h2>
                <p>Complete a workout or add a Quick Note to see your history here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Logs</h1>
                 {quickNotes.length > 0 && !showConfirmDeleteAll && (
                    <button 
                        onClick={() => setShowConfirmDeleteAll(true)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-brand-danger font-semibold"
                    >
                       <Trash2 size={14} /> Delete All Notes
                    </button>
                )}
                 {showConfirmDeleteAll && (
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-brand-warning">Are you sure?</p>
                        <button onClick={handleDeleteAll} className="text-sm font-bold text-brand-danger hover:underline">Yes, Delete</button>
                        <button onClick={() => setShowConfirmDeleteAll(false)} className="text-sm text-slate-400 hover:underline">Cancel</button>
                    </div>
                )}
            </div>
            <ul className="space-y-4">
                 {combinedLog.map((item) => {
                    const key = item.type === 'note' ? (item.data as QuickNote).id : item.date.toISOString();
                    return (
                        <li key={key}>
                            {item.type === 'workout' 
                                ? <WorkoutEntry date={item.date} log={item.data as LoggedDay} /> 
                                : <NoteEntry note={item.data as QuickNote} onEdit={onEditNote} onDelete={onDeleteNote} />
                            }
                        </li>
                    )
                 })}
            </ul>
        </div>
    );
};

export default WorkoutLogView;