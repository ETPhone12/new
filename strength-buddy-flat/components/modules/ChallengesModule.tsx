import React from 'react';
import { Challenge, ChallengeType } from '../../types';
import { Target, Droplets, Repeat, TrendingUp, Zap, BarChart3, Trophy } from 'lucide-react';

interface ChallengesModuleProps {
    challenges: Challenge[];
}

const challengeIcons: Record<ChallengeType, React.ElementType> = {
    'HYDRATION': Droplets,
    'CONSISTENCY_STREAK': Repeat,
    'TECHNIQUE_PRIMING': Target,
    'MICROLOAD': TrendingUp,
    'VOLUME_SURGE': Zap,
    'FREQUENCY_BOOSTER': BarChart3,
    'MONTHLY_PR': Trophy
};

export const ChallengesModule: React.FC<ChallengesModuleProps> = ({ challenges }) => {
    
    return (
        <div className="lg:col-span-2 bg-brand-secondary p-4 rounded-lg flex flex-col">
            <h3 className="font-bold text-white mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-brand-primary" />
                This Week's Challenges
            </h3>
            <div className="flex-grow flex flex-col justify-center">
                {challenges && challenges.length > 0 ? (
                    <ul className="space-y-3">
                        {challenges.map(challenge => {
                            const Icon = challengeIcons[challenge.type] || Target;
                            return (
                                <li key={challenge.id} className="flex items-start gap-3">
                                    <div className="p-1.5 bg-brand-primary/20 rounded-full mt-1">
                                      <Icon className="w-4 h-4 text-brand-primary" />
                                   </div>
                                    <p className="text-slate-300 text-sm">{challenge.description}</p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                     <div className="text-center py-4">
                        <p className="text-slate-400 text-sm">No new challenges right now. Check back next week!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
