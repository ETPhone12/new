import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface LogWaterModalProps {
    onClose: () => void;
    onSave: (glasses: number) => void;
}

const LogWaterModal: React.FC<LogWaterModalProps> = ({ onClose, onSave }) => {
    const [glasses, setGlasses] = useState<string>('1');

    const handleSave = () => {
        const glassesValue = parseInt(glasses, 10);
        if (!isNaN(glassesValue) && glassesValue > 0) {
            onSave(glassesValue);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-sm rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Add Water</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <main className="p-6">
                    <label htmlFor="water" className="block text-sm font-medium text-slate-300 mb-2">
                        How many glasses of water are you logging?
                    </label>
                    <input
                        id="water"
                        type="number"
                        value={glasses}
                        onChange={(e) => setGlasses(e.target.value)}
                        className="w-full bg-brand-dark/50 p-3 rounded-lg text-white text-lg font-bold border border-slate-600 focus:ring-2 focus:ring-brand-primary"
                        autoFocus
                    />
                </main>
                <footer className="p-4 border-t border-slate-700 flex gap-4">
                     <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                     <button 
                        onClick={handleSave} 
                        disabled={!glasses || parseInt(glasses) <= 0}
                        className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-green-500 flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Add
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LogWaterModal;
