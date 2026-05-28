// components/dashboard/RealTimeAlerts.tsx

'use client';

import { AlertFeature} from "@/app/types/types-alert";

interface RealTimeAlertsProps {
  alerts: AlertFeature[];
  severityColors: Record<string, string>;
}

export function RealTimeAlerts({
                                 alerts,
                                 severityColors
                               }: RealTimeAlertsProps) {
  return (
      <div className="space-y-2">
        {alerts.map((alert, idx) => {
          const props = alert.properties;
          const severity = props.severity || 'Unknown';
          const color = severityColors[severity] || '#64748b';

          return (
              <div
                  key={idx}
                  className="bg-slate-800 border border-blue-900 rounded p-2"
                  style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
              >
                <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color }}>
                  {props.event || 'Alert'}
                </div>
                <div className="text-xs text-slate-500 mb-1">
                  {props.areaDesc || 'Unknown Area'}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed mb-1">
                  {props.headline || props.description?.substring(0, 80) || 'No description'}
                </div>
                <div className="text-xs text-slate-500">
                  Severity: <strong style={{ color }}>{severity}</strong> | Urgency:{' '}
                  <strong className="text-slate-300">{props.urgency || '—'}</strong>
                </div>
              </div>
          );
        })}
      </div>
  );
}
