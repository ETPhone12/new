import React, { useState, useEffect } from 'react';
import { UserPreferences, NutritionData } from '../types';
import { User, LogOut, Dumbbell, Edit, Save, X, Trash2, Repeat, Settings as SettingsIcon, Droplets } from 'lucide-react';
import { LIFT_DETAILS, PROGRAM_TEMPLATES } from '../constants';

interface SettingsViewProps {
    userPreferences: UserPreferences;
    onReset: () => void;
    onSetUserPreferences: (prefs: UserPreferences) => void;
    onStartNewProgram: () => void;
    onDeleteAllQuickNotes: () => void;
    quickNotesCount: number;
    nutritionData: NutritionData;
    onUpdateNutritionSettings: (data: Partial<NutritionData>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    userPreferences, 
    onReset,
    onSetUserPreferences,
    onStartNewProgram,
    onDeleteAllQuickNotes,
    quickNotesCount,
    nutritionData,
    onUpdateNutritionSettings
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editablePrefs, setEditablePrefs] = useState<UserPreferences>(userPreferences);
    const [editableNutrition, setEditableNutrition] = useState<NutritionData>(nutritionData);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showConfirmDeleteNotes, setShowConfirmDeleteNotes] = useState(false);
    
    useEffect(() => {
        if (!isEditing) {
            setEditablePrefs(userPreferences);
            setEditableNutrition(nutritionData);
        }
    }, [userPreferences, nutritionData, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setEditablePrefs(prev => ({ prev, name: value }));
        } else {
            setEditablePrefs(prev => ({
                prev,
                oneRepMax: {
                    prev.oneRepMax,
                    [name]: parseInt(value) || 0,
                }
            }))
        }
    };

    const handleNutritionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableNutrition(prev => ({
            prev,
            [name]: parseInt(value) || 0,
        }));
    };
    
    const handleSave = () => {
        onSetUserPreferences(editablePrefs);
        onUpdateNutritionSettings(editableNutrition);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditablePrefs(userPreferences);
        setEditableNutrition(nutritionData);
        setIsEditing(false);
    };
    
    const handleDeleteNotes = () => {
        onDeleteAllQuickNotes();
        setShowConfirmDeleteNotes(false);
    }
    
    const handleResetApp = () => {
        onReset();
        setShowConfirmReset(false);
    }

    const programName = PROGRAM_TEMPLATES.find(p => p.key === userPreferences.programTemplate)?.name || userPreferences.programTemplate;
    const isSaveDisabled = (JSON.stringify(userPreferences) === JSON.stringify(editablePrefs) && JSON.stringify(nutritionData) === JSON.stringify(editableNutrition)) || editablePrefs.name.trim() === '';


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><SettingsIcon /> Settings</h1>

            <section className="bg-brand-secondary p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><User /> Profile & Goals</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-brand-primary hover:text-blue-400 font-semibold py-1 px-3 rounded-md bg-brand-primary/10 hover:bg-brand-primary/20">
                           <Edit size={14} /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        {isEditing ? (
                             <input
                                type="text"
                                name="name"
                                value={editablePrefs.name}
                                onChange={handleInputChange}
                                className="w-full bg-brand-dark border border-slate-600 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-primary"
                            />
                        ) : (
                            <p className="text-lg font-bold text-white p-2">{userPreferences.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Daily Water Goal</label>
                        {isEditing ? (
                            <div className="flex items-center gap-2 max-w-xs">
                                <input
                                    type="number"
                                    name="waterGoal"
                                    value={editableNutrition.waterGoal}
                                    onChange={handleNutritionInputChange}
                                    className="w-full bg-brand-dark border border-slate-600 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-primary"
                                />
                                <span className="text-slate-400">glasses</span>
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-white p-2 bg-brand-dark/50 rounded-md max-w-xs">{nutritionData.waterGoal} glasses</p>
                        )}
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-slate-400 mb-1">1-Rep Maxes (lbs)</label>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.values(LIFT_DETAILS).map(lift => (
                                <div key={lift.key}>
                                    <p className="text-sm font-semibold text-slate-300 mb-1">{lift.name}</p>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name={lift.key}
                                            value={editablePrefs.oneRepMax[lift.key] || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-brand-dark border border-slate-600 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-primary"
                                        />
                                    ) : (
                                         <p className="text-lg font-bold text-white p-2 bg-brand-dark/50 rounded-md">{userPreferences.oneRepMax[lift.key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex gap-4 border-t border-slate-700 pt-4">
                         <button onClick={handleCancel} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500">
                            <X size={18} /> Cancel
                         </button>
                         <button onClick={handleSave} disabled={isSaveDisabled} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed">
                             <Save size={18} /> Save Changes
                         </button>
                    </div>
                )}
            </section>
            
            <section className="bg-brand-secondary p-6 rounded-lg border border-slate-700">
                 <h2 className="text-xl font-bold text-white mb-4">Program & Data Actions</h2>
                 <div className="space-y-4">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-brand-dark/50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-brand-light flex items-center gap-2"><Repeat size={16}/> Start a New Program</h3>
                            <p className="text-slate-400 text-sm">Current: <span className="font-bold text-brand-primary">{programName}</span></p>
                        </div>
                         <button 
                            onClick={onStartNewProgram} 
                            className="mt-2 sm:mt-0 w-full sm:w-auto bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                           Change Program
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-brand-dark/50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-brand-light flex items-center gap-2"><Trash2 size={16}/> Delete All Quick Notes</h3>
                            <p className="text-slate-400 text-sm">{quickNotesCount} notes currently saved.</p>
                        </div>
                        <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                            {showConfirmDeleteNotes ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-brand-warning">Are you sure?</p>
                                    <button onClick={handleDeleteNotes} className="text-sm font-bold text-brand-danger hover:underline">Yes, Delete</button>
                                    <button onClick={() => setShowConfirmDeleteNotes(false)} className="text-sm text-slate-400 hover:underline">Cancel</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setShowConfirmDeleteNotes(true)}
                                    disabled={quickNotesCount === 0}
                                    className="w-full sm:w-auto bg-brand-danger/20 text-brand-danger border border-brand-danger/50 font-bold py-2 px-4 rounded-lg hover:bg-brand-danger/40 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed"
                                >
                                   Delete Notes
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-brand-dark/50 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-brand-light flex items-center gap-2"><LogOut size={16}/> Reset All Data</h3>
                             <p className="text-slate-400 text-sm">This will clear your profile, program, and all logs.</p>
                        </div>
                         <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                           {showConfirmReset ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-brand-warning">This is permanent!</p>
                                    <button onClick={handleResetApp} className="text-sm font-bold text-brand-danger hover:underline">Yes, Reset</button>
                                    <button onClick={() => setShowConfirmReset(false)} className="text-sm text-slate-400 hover:underline">Cancel</button>
                                </div>
                           ) : (
                                 <button 
                                    onClick={() => setShowConfirmReset(true)} 
                                    className="w-full sm:w-auto bg-brand-danger/20 text-brand-danger border border-brand-danger/50 font-bold py-2 px-4 rounded-lg hover:bg-brand-danger/40 transition-colors"
                                >
                                   Reset App
                                </button>
                           )}
                        </div>
                    </div>

                 </div>
            </section>
        </div>
    );
};

export default SettingsView;