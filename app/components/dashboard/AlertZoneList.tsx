// components/dashboard/AlertZoneList.tsx

'use client';

import { useState } from 'react';
import { AlertFeature, County } from '@/types/alert';

interface AlertZoneListProps {
  alerts: AlertFeature[];
  countyCoords: Record<string, County>;
  severityColors: Record<string, string>;
}

export function AlertZoneList({
  alerts,
  countyCoords,
  severityColors
}: AlertZoneListProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <div className="territory-list">
      {alerts.slice(0, 5).map((alert, idx) => {
        const props = alert.properties;
        const severity = props.severity || 'Unknown';
        const barColor = severityColors[severity] || '#64748b';
        const counties = props.areaDesc || 'Unknown Area';

        return (
          <div
            key={idx}
            className={`territory-item ${selectedIdx === idx ? 'active' : ''}`}
            onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
            style={{ cursor: 'pointer' }}
          >
            <div className="t-header">
              <span className="t-name" style={{ fontSize: '11px' }}>
                {props.event || 'Alert'}
              </span>
              <span className="t-state">{severity}</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text3)', marginBottom: '4px' }}>
              {counties}
            </div>
            <div className="t-bar-wrap">
              <div
                className="t-bar"
                style={{
                  width: '100%',
                  background: `linear-gradient(90deg, ${barColor}88, ${barColor})`
                }}
              ></div>
            </div>
            <div className="t-meta">
              <span style={{ fontSize: '8px' }}>{props.certainty || '—'}</span>
              <span style={{ fontSize: '8px' }}>{props.urgency || '—'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
