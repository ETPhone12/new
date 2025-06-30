import React from 'react';
import { NutritionData } from '../../types';
import { Droplets, Flame } from 'lucide-react';

interface NutritionModuleProps {
    nutritionData: NutritionData;
}

const ProgressBar: React.FC<{ value: number, max: number, colorClass: string }> = ({ value, max, colorClass }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-brand-dark/50 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export const NutritionModule: React.FC<NutritionModuleProps> = ({ nutritionData }) => {
    const { waterIntake, waterGoal } = nutritionData;
    return (
        <div className="lg:col-span-2 bg-brand-secondary p-4 rounded-lg">
            <h3 className="font-bold text-white mb-3">Daily Nutrition & Hydration</h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-slate-300 flex items-center"><Droplets className="w-4 h-4 mr-1.5 text-blue-400"/> Water Intake</span>
                        <span className="text-slate-400">{waterIntake} / {waterGoal} glasses</span>
                    </div>
                    <ProgressBar value={waterIntake} max={waterGoal} colorClass="bg-blue-500" />
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-slate-300 flex items-center"><Flame className="w-4 h-4 mr-1.5 text-orange-400"/> Calories</span>
                        <span className="text-slate-400">--- / {nutritionData.calorieTarget.toLocaleString()} kcal</span>
                    </div>
                    <ProgressBar value={0} max={nutritionData.calorieTarget} colorClass="bg-orange-500" />
                </div>
            </div>
        </div>
    );
};