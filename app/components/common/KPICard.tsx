// components/common/KPICard.tsx

'use client';

interface KPICardProps {
    label: string;
    value: string | number;
    delta?: string;
    variant?: 'default' | 'gold' | 'green' | 'purple' | 'orange';
}

export function KPICard({ label, value, delta, variant = 'default' }: KPICardProps) {
    const colorMap = {
        default: 'text-cyan-400',
        gold: 'text-amber-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        orange: 'text-orange-400'
    };

    const colorClass = colorMap[variant];

    return (
        <div className="bg-slate-800 border border-blue-900 rounded-lg p-2 hover:border-cyan-500 transition-all cursor-pointer">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                {label}
            </div>
            <div className={`text-lg font-bold font-mono ${colorClass}`}>
                {value}
            </div>
            {delta && (
                <div className="text-xs text-slate-500 mt-0.5">
                    {delta}
                </div>
            )}
        </div>
    );
}
