import React, { useState } from 'react';
import { Plus, Droplets, Pencil } from 'lucide-react';

interface QuickAddModuleProps {
    onOpenWaterModal: () => void;
    onOpenNoteModal: () => void;
}

export const QuickAddModule: React.FC<QuickAddModuleProps> = ({ onOpenWaterModal, onOpenNoteModal }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-24 right-6 z-20">
            {isOpen && (
                <div className="flex flex-col items-end gap-3 mb-3">
                    <button onClick={() => handleAction(onOpenWaterModal)} className="flex items-center gap-2 bg-slate-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-slate-500">
                        <Droplets size={18} /> Add Water
                    </button>
                    <button onClick={() => handleAction(onOpenNoteModal)} className="flex items-center gap-2 bg-slate-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-slate-500">
                        <Pencil size={18} /> Quick Note
                    </button>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                aria-label="Quick Add Actions"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};
