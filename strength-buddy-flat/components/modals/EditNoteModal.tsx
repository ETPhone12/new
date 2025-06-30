import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { QuickNote } from '../../types';

interface EditNoteModalProps {
    note: QuickNote;
    onClose: () => void;
    onSave: (noteId: string, newText: string) => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({ note, onClose, onSave }) => {
    const [text, setText] = useState<string>('');

    useEffect(() => {
        setText(note.note);
    }, [note]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(note.id, text.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Quick Note</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <main className="p-6">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-brand-dark/50 p-3 rounded-lg text-white text-md border border-slate-600 focus:ring-2 focus:ring-brand-primary min-h-[120px]"
                        placeholder="e.g., Felt strong on squats today!"
                        autoFocus
                    />
                </main>
                <footer className="p-4 border-t border-slate-700 flex gap-4">
                     <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                     <button
                        onClick={handleSave}
                        disabled={!text.trim() || text.trim() === note.note}
                        className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-green-500 flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditNoteModal;