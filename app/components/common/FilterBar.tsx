// components/common/FilterBar.tsx

'use client';

import { FilterState} from "@/app/types/types-alert";

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filterName: keyof FilterState, value: string) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    const filterBtnClass = (isActive: boolean) =>
        `px-3 py-1 text-xs rounded-full border transition-all font-medium ${
            isActive
                ? 'bg-cyan-500 bg-opacity-15 border-cyan-500 text-white' // Cambiado text-cyan-400 a text-white
                : 'bg-slate-800 border-blue-900 text-slate-400 hover:border-cyan-500 hover:text-cyan-400'
        }`;

    return (
        <div className="bg-slate-900 border-b border-blue-900 px-4 py-2 flex items-center gap-3 flex-wrap">
            {/* State Filter */}
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">State:</div>
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
            <div className="w-px h-5 bg-blue-900"></div>

            {/* Severity Filter */}
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Severity:</div>
            <select
                className="px-2 py-1 text-xs bg-slate-800 border border-blue-900 rounded text-slate-400 hover:border-cyan-500 focus:outline-none focus:border-cyan-500 font-medium"
                value={filters.severity}
                onChange={(e) => onFilterChange('severity', e.target.value)}
            >
                <option value="ALL">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="Moderate">Moderate</option>
                <option value="Minor">Minor</option>
            </select>

            {/* Separator */}
            <div className="w-px h-5 bg-blue-900"></div>

            {/* Event Type Filter */}
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Event Type:</div>
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
        </div>
    );
}
