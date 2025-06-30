import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { ACCESSORY_LIFTS } from '../../constants';

interface AddAccessoryModalProps {
    onClose: () => void;
    onAddAccessory: (name: string) => void;
}

const AddAccessoryModal: React.FC<AddAccessoryModalProps> = ({ onClose, onAddAccessory }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLifts = Object.entries(ACCESSORY_LIFTS).map(([category, lifts]) => {
        const filtered = lifts.filter(lift => lift.toLowerCase().includes(searchTerm.toLowerCase()));
        return { category, lifts: filtered };
    }).filter(group => group.lifts.length > 0);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-secondary w-full max-w-lg max-h-[90vh] rounded-2xl border border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Add Accessory Exercise</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-600">
                        <X size={20}/>
                    </button>
                </header>
                <div className="p-4 border-b border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for an exercise"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-brand-dark/50 p-2 pl-10 rounded-lg text-white border border-slate-600 focus:ring-2 focus:ring-brand-primary"
                            autoFocus
                        />
                    </div>
                </div>
                <main className="flex-grow p-4 overflow-y-auto">
                    {filteredLifts.length > 0 ? (
                        <div className="space-y-4">
                            {filteredLifts.map(({ category, lifts }) => (
                                <div key={category}>
                                    <h3 className="text-md font-bold text-brand-primary mb-2">{category}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {lifts.map(lift => (
                                            <button
                                                key={lift}
                                                onClick={() => onAddAccessory(lift)}
                                                className="w-full text-left p-3 bg-brand-dark/50 hover:bg-brand-primary/30 rounded-md text-slate-300 font-semibold transition-colors"
                                            >
                                                {lift}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">No exercises found for "{searchTerm}".</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AddAccessoryModal;