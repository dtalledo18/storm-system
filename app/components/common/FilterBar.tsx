// components/common/FilterBar.tsx

'use client';

import { FilterState } from '@/types/alert';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filterName: keyof FilterState, value: string) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-label">State:</div>
      <button
        className={`filter-btn ${filters.state === 'ALL' ? 'active' : ''}`}
        onClick={() => onFilterChange('state', 'ALL')}
      >
        All Markets
      </button>
      <button
        className={`filter-btn ${filters.state === 'IL' ? 'active' : ''}`}
        onClick={() => onFilterChange('state', 'IL')}
      >
        Illinois
      </button>
      <button
        className={`filter-btn ${filters.state === 'WI' ? 'active' : ''}`}
        onClick={() => onFilterChange('state', 'WI')}
      >
        Wisconsin
      </button>

      <div className="filter-sep"></div>

      <div className="filter-label">Severity:</div>
      <select
        className="severity-select"
        value={filters.severity}
        onChange={(e) => onFilterChange('severity', e.target.value)}
      >
        <option value="ALL">All Severity</option>
        <option value="Critical">Critical</option>
        <option value="Moderate">Moderate</option>
        <option value="Minor">Minor</option>
      </select>

      <div className="filter-sep"></div>

      <div className="filter-label">Event Type:</div>
      <button
        className={`filter-btn ${filters.eventType === 'ALL' ? 'active' : ''}`}
        onClick={() => onFilterChange('eventType', 'ALL')}
      >
        All Types
      </button>
      <button
        className={`filter-btn ${filters.eventType === 'HAIL' ? 'active' : ''}`}
        onClick={() => onFilterChange('eventType', 'HAIL')}
      >
        Hail
      </button>
      <button
        className={`filter-btn ${filters.eventType === 'WARNING' ? 'active' : ''}`}
        onClick={() => onFilterChange('eventType', 'WARNING')}
      >
        Warnings
      </button>
      <button
        className={`filter-btn ${filters.eventType === 'WATCH' ? 'active' : ''}`}
        onClick={() => onFilterChange('eventType', 'WATCH')}
      >
        Watches
      </button>
    </div>
  );
}
