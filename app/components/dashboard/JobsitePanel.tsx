// components/dashboard/JobsitePanel.tsx
'use client';

import { useState } from 'react';
import { Jobsite } from '@/app/types/types-jobsite';

interface JobsitePanelProps {
    jobsites: Jobsite[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onToggle: (id: string) => void;
}

export function JobsitePanel({ jobsites, onAdd, onRemove, onToggle }: JobsitePanelProps) {
    const [expanded, setExpanded] = useState<string | null>(null);

    // 💡 SOLUCIÓN DIRECTA: Filtramos duplicados por ID antes de renderizar la lista
    const uniqueJobsites = Array.from(new Map(jobsites.map(j => [j.id, j])).values());

    return (
        <div>
            {/* Section Header + Add Button */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1e3a8a]">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Campaign Zones
                </span>
                <button
                    onClick={onAdd}
                    className="flex cursor-pointer items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#10b981] text-[#06142e] rounded hover:opacity-90 transition-all"
                >
                    <span className="text-sm leading-none">+</span> Add
                </button>
            </div>

            {/* Empty State */}
            {uniqueJobsites.length === 0 && (
                <div className="text-center py-4">
                    <div className="text-slate-600 text-xs">No campaign zones yet.</div>
                    <button
                        onClick={onAdd}
                        className="mt-2 text-[10px] text-[#10b981] hover:underline"
                    >
                        + Add your first jobsite
                    </button>
                </div>
            )}

            {/* Jobsite Cards */}
            <div className="space-y-1">
                {/* 💡 MODIFICADO: Mapeamos la lista ya sanitizada sin duplicados */}
                {uniqueJobsites.map(j => {
                    const isExpanded = expanded === j.id;
                    return (
                        <div
                            key={j.id}
                            className={`border rounded-lg transition-all overflow-hidden ${
                                j.active
                                    ? 'border-[#10b98155] bg-[#10b98108]'
                                    : 'border-[#1e3a8a] bg-[#06142e] opacity-60'
                            }`}
                        >
                            {/* Card Header */}
                            <div
                                className="flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => setExpanded(isExpanded ? null : j.id)}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${j.active ? 'bg-[#10b981]' : 'bg-slate-600'}`} />

                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-200 truncate">{j.name}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{j.address}</div>
                                </div>

                                <span className="text-[10px] text-[#10b981] font-bold flex-shrink-0">
                                  {j.radiusKm}km
                                </span>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-2 pb-2 border-t border-[#10b98122]">
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mt-2 mb-2">
                                        <span className="text-slate-500">Channels</span>
                                        <span className="text-[#38bdf8] font-bold">{j.channels}</span>
                                        <span className="text-slate-500">Radius</span>
                                        <span className="text-[#10b981] font-bold">{j.radiusKm} KM</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => onToggle(j.id)}
                                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                                                j.active
                                                    ? 'border-slate-600 text-slate-400 hover:border-slate-400'
                                                    : 'border-[#10b981] text-[#10b981] hover:bg-[#10b98115]'
                                            }`}
                                        >
                                            {j.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => onRemove(j.id)}
                                            className="px-2 py-1 text-[10px] font-bold uppercase rounded border border-red-900 text-red-500 hover:border-red-500 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}