// components/dashboard/RealTimeAlerts.tsx

'use client';

import { AlertFeature } from '@/types/alert';

interface RealTimeAlertsProps {
  alerts: AlertFeature[];
  severityColors: Record<string, string>;
}

export function RealTimeAlerts({
  alerts,
  severityColors
}: RealTimeAlertsProps) {
  return (
    <div id="alertsContainer">
      {alerts.map((alert, idx) => {
        const props = alert.properties;
        const severity = props.severity || 'Unknown';
        const color = severityColors[severity] || '#64748b';

        return (
          <div
            key={idx}
            className="insight-card"
            style={{ borderLeft: `3px solid ${color}` }}
          >
            <div className="insight-title" style={{ color }}>
              {props.event || 'Alert'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text3)', marginBottom: '6px' }}>
              {props.areaDesc || 'Unknown Area'}
            </div>
            <div className="insight-text">
              {props.headline || props.description?.substring(0, 80) || 'No description'}
            </div>
            <div style={{ marginTop: '6px', fontSize: '8px', color: 'var(--text3)' }}>
              Severity: <strong style={{ color }}>{severity}</strong> | Urgency:{' '}
              <strong>{props.urgency || '—'}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
