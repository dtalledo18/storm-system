// components/common/FilterBar.tsx

'use client';

import { FilterState } from "@/app/types/types-alert";
import { AddressPrioritizerModal} from "@/app/components/dashboard/AddressPrioritizerModal";
import {useState} from "react";
import {AddContactCampaignModal} from "@/app/components/dashboard/AddContactCampaignModal";
import {CampaignData} from "@/app/services/services-aiService";

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filterName: keyof FilterState, value: string) => void;
    onCampaignAdded: (data: CampaignData) => void; // Recibida desde la página principal
}

export function FilterBar({ filters, onFilterChange, onCampaignAdded }: FilterBarProps) {
    const [isPrioritizerOpen, setIsPrioritizerOpen] = useState(false);
    const [isCampaignOpen, setIsCampaignOpen] = useState(false);
    const filterBtnClass = (isActive: boolean) =>
        `px-4 py-1 text-xs rounded-full border transition-all font-medium ${
            isActive
                ? 'bg-[#FFD700] text-[#06142e] border-[#FFD700] font-bold' // Estado activo: Amarillo
                : 'bg-transparent border-[#1e3a8a] text-slate-300 hover:border-slate-500' // Estado inactivo: Borde azul
        }`;

    return (
        <div className="bg-[#06142e] border-b border-[#1e3a8a] px-4 py-3 flex items-center gap-4 flex-wrap">
            {/* State Filter */}
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">STATE:</div>
            <button
                className={filterBtnClass(filters.state === 'ALL')}
                onClick={() => onFilterChange('state', 'ALL')}
            >
                All Markets
            </button>
            <button
                className={filterBtnClass(filters.state === 'IL')}
                onClick={() => onFilterChange('state', 'IL')}
            >
                Illinois
            </button>
            <button
                className={filterBtnClass(filters.state === 'WI')}
                onClick={() => onFilterChange('state', 'WI')}
            >
                Wisconsin
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-[#1e3a8a]"></div>

            {/* Severity Filter */}
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">SEVERITY:</div>
            <select
                className={`px-4 py-1 text-xs rounded-full border transition-all font-medium bg-[#FFD700] text-[#06142e] border-[#FFD700] focus:outline-none`}
                value={filters.severity}
                onChange={(e) => onFilterChange('severity', e.target.value)}
            >
                <option value="ALL">All Severity ▾</option>
                <option value="Critical">Critical</option>
                <option value="Moderate">Moderate</option>
                <option value="Minor">Minor</option>
            </select>

            {/* Separator */}
            <div className="w-px h-5 bg-[#1e3a8a]"></div>

            {/* Event Type Filter */}
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">TYPE:</div>
            <button
                className={filterBtnClass(filters.eventType === 'ALL')}
                onClick={() => onFilterChange('eventType', 'ALL')}
            >
                All Types
            </button>
            <button
                className={filterBtnClass(filters.eventType === 'HAIL')}
                onClick={() => onFilterChange('eventType', 'HAIL')}
            >
                Hail
            </button>
            <button
                className={filterBtnClass(filters.eventType === 'WARNING')}
                onClick={() => onFilterChange('eventType', 'WARNING')}
            >
                Warnings
            </button>
            <button
                className={filterBtnClass(filters.eventType === 'WATCH')}
                onClick={() => onFilterChange('eventType', 'WATCH')}
            >
                Watches
            </button>
            {/* Nuevo botón a la derecha */}
            {/* Botones de Acción a la Derecha */}
            <div className="ml-auto flex items-center gap-2">
                <button
                    className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                    onClick={() => setIsCampaignOpen(true)}
                >
                    <span>📢</span> NEW CAMPAIGN
                </button>

                <button
                    className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                    onClick={() => setIsPrioritizerOpen(true)}
                >
                    <span>⚡</span> PRIORITIZER
                </button>
            </div>
            <AddressPrioritizerModal isOpen={isPrioritizerOpen} onClose={() => setIsPrioritizerOpen(false)} />

            <AddContactCampaignModal
                isOpen={isCampaignOpen}
                onClose={() => setIsCampaignOpen(false)}
                onCampaignAdded={onCampaignAdded}
            />
        </div>
    );
}