import React, { useState } from 'react';
import { X, AlertTriangle, Repeat } from 'lucide-react';
import { PROGRAM_TEMPLATES } from '../../constants';

interface StartNewProgramModalProps {
    onClose: () => void;
    onStart: (templateKey: string) => void;
}

const StartNewProgramModal: React.FC<StartNewProgramModalProps> = ({ onClose, onStart }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleConfirmStart = () => {
        if (selectedTemplate) {
            onStart(selectedTemplate);
        }
    };

    const handleSelectTemplate = (key: string) => {
        setSelectedTemplate(key);
        setShowConfirmation(false); // Reset confirmation if they change selection
    }

    const renderSelectionView = () => (
        <>
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Start a New Program</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                    <X size={20}/>
                </button>
            </header>
            <main className="flex-grow p-4 overflow-y-auto space-y-3 max-h-[60vh]">
                 {PROGRAM_TEMPLATES.map(template => (
                    <button 
                        key={template.key} 
                        onClick={() => handleSelectTemplate(template.key)} 
                        className={`p-4 rounded-lg text-left font-semibold border-2 transition-all w-full relative ${selectedTemplate === template.key ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-dark/50 border-slate-600 text-slate-300 hover:border-brand-primary'}`}>
                        {template.name}
                        <p className="font-normal text-sm opacity-80 mt-1">{template.description}</p>
                    </button>
                ))}
            </main>
            <footer className="p-4 border-t border-slate-700 flex gap-4">
                 <button onClick={onClose} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Cancel</button>
                 <button 
                    onClick={() => setShowConfirmation(true)}
                    disabled={!selectedTemplate}
                    className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </footer>
        </>
    );

    const renderConfirmationView = () => {
        const programName = PROGRAM_TEMPLATES.find(p => p.key === selectedTemplate)?.name;
        return (
             <>
                <header className="p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Confirm New Program</h2>
                </header>
                <main className="p-6">
                    <div className="bg-brand-primary/10 border border-brand-primary/50 text-slate-300 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-brand-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-white">Confirm Change</h3>
                            <p className="text-sm">This will start a new program schedule from today. Your past workout logs and history will be preserved.</p>
                        </div>
                    </div>
                    <p className="mt-4 text-slate-300">You are about to start the <span className="font-bold text-white">{programName}</span> program.</p>
                </main>
                <footer className="p-4 border-t border-slate-700 flex gap-4">
                     <button onClick={() => setShowConfirmation(false)} className="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">Back</button>
                     <button 
                        onClick={handleConfirmStart} 
                        className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <Repeat size={18} /> Yes, Start New Program
                    </button>
                </footer>
            </>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg rounded-2xl border border-slate-700 flex flex-col">
                {showConfirmation ? renderConfirmationView() : renderSelectionView()}
            </div>
        </div>
    );
};

export default StartNewProgramModal;