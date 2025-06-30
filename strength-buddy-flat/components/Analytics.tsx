import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutLog, UserPreferences, MonthlyAnalysis } from '../types';
import { LIFT_DETAILS } from '../constants';
import { getMonthlyAnalysisLocal } from '../services/programService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ChevronsRight, BarChart2 } from 'lucide-react';

interface AnalyticsProps {
    workoutLog: WorkoutLog;
    userPreferences: UserPreferences;
}

const Analytics: React.FC<AnalyticsProps> = ({ workoutLog, userPreferences }) => {
    
    const analysis = useMemo(() => {
        if (Object.keys(workoutLog).length > 1) {
            return getMonthlyAnalysisLocal(workoutLog);
        }
        return null;
    }, [workoutLog]);


    const chartData = useMemo(() => {
        const dataByLift: { [key: string]: { date: string; weight: number }[] } = {
            benchPress: [],
            squat: [],
            deadlift: [],
            overheadPress: [],
        };

        const sortedDates = Object.keys(workoutLog).sort((a,b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());

        sortedDates.forEach(date => {
            const dayLog = workoutLog[date];
            const maxWeightForDay: { [key: string]: number } = {};

            Object.values(dayLog.exercises).forEach(exercise => {
                const nameLower = exercise.name.toLowerCase();
                let associatedLiftKey: keyof typeof LIFT_DETAILS | null = null;
                
                const liftName = nameLower.split(' ')[0];
                if(nameLower.includes('squat')) associatedLiftKey = 'squat';
                else if (nameLower.includes('bench')) associatedLiftKey = 'benchPress';
                else if (nameLower.includes('deadlift')) associatedLiftKey = 'deadlift';
                else if (nameLower.includes('press')) associatedLiftKey = 'overheadPress';
                
                if (associatedLiftKey) {
                    const heaviestCompletedSet = exercise.loggedSets
                        .filter(s => s.status === 'completed')
                        .reduce((max, set) => set.weight > max ? set.weight : max, 0);

                    if (heaviestCompletedSet > (maxWeightForDay[associatedLiftKey] || 0)) {
                        maxWeightForDay[associatedLiftKey] = heaviestCompletedSet;
                    }
                }
            });

            Object.entries(maxWeightForDay).forEach(([liftKey, weight]) => {
                dataByLift[liftKey as keyof typeof LIFT_DETAILS].push({
                    date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
                    weight: weight
                });
            });
        });

        return dataByLift;
    }, [workoutLog]);

    const renderChart = (liftKey: keyof typeof LIFT_DETAILS) => {
        const data = chartData[liftKey];
        if (data.length < 2) {
            return <div className="flex items-center justify-center h-64 text-slate-400 bg-brand-secondary rounded-lg">Not enough data to plot a chart. Complete at least two sessions for this lift.</div>
        }

        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="weight" name={`${LIFT_DETAILS[liftKey].name} (lbs)`} stroke="#0062FF" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Progress Tracker</h1>
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BarChart2/> Progress Summary</h2>
                 {!analysis && (
                     <div className="bg-brand-secondary p-6 rounded-lg text-slate-400">
                        Complete a few more workouts to unlock your analysis.
                     </div>
                 )}
                {analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analysis).map(([liftKey, liftAnalysis]) => (
                            <div key={liftKey} className="bg-brand-secondary p-4 rounded-lg border border-slate-700">
                                <h3 className="font-bold text-lg text-white">{LIFT_DETAILS[liftKey as keyof typeof LIFT_DETAILS].name}</h3>
                                <p className={`mt-1 font-semibold ${liftAnalysis.status === 'progressing' ? 'text-brand-accent' : liftAnalysis.status === 'plateaued' ? 'text-brand-warning' : 'text-brand-danger'}`}>
                                    Status: {liftAnalysis.status}
                                </p>
                                <p className="text-slate-300 mt-2">{liftAnalysis.summary}</p>
                                <p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><TrendingUp className="h-4 w-4"/> {liftAnalysis.projection}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

             <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ChevronsRight/> Lift Progress Charts</h2>
                <div className="space-y-6">
                   {Object.keys(LIFT_DETAILS).map(liftKey => (
                       <div key={liftKey} className="bg-brand-secondary p-4 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-lg text-white mb-2">{LIFT_DETAILS[liftKey as keyof typeof LIFT_DETAILS].name}</h3>
                           {renderChart(liftKey as keyof typeof LIFT_DETAILS)}
                       </div>
                   ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;