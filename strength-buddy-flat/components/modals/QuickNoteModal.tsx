import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface QuickNoteModalProps {
    onClose: () => void;
    onSave: (note: string) => void;
}

const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ onClose, onSave }) => {
    const [note, setNote] = useState<string>('');

    const handleSave = () => {
        if (note.trim()) {
            onSave(note.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Add Quick Note</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <main className="p-6">
                    <label htmlFor="quick-note" className="block text-sm font-medium text-slate-300 mb-2">
                        Jot down a quick thought, a PR you hit, or anything else.
                    </label>
                    <textarea
                        id="quick-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-brand-dark/50 p-3 rounded-lg text-white text-md border border-slate-600 focus:ring-2 focus:ring-brand-primary min-h-[120px]"
                        placeholder="e.g., Felt strong on squats today!"
                        autoFocus
                    />
                </main>
                <footer className="p-4 border-t border-slate-700 flex gap-4">
                     <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                     <button 
                        onClick={handleSave} 
                        disabled={!note.trim()}
                        className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-green-500 flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Save Note
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default QuickNoteModal;
