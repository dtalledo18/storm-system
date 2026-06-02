// components/dashboard/RealTimeAlerts.tsx

'use client';

import { AlertFeature } from "@/app/types/types-alert";

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
                        className="bg-[#0a1b3a] border border-[#1e3a8a] rounded p-3"
                        style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                    >
                        <div className="text-sm font-bold uppercase tracking-wide mb-1.5" style={{ color }}>
                            {props.event || 'Alert'}
                        </div>
                        <div className="text-xs text-slate-300 mb-1.5 font-medium">
                            {props.areaDesc || 'Unknown Area'}
                        </div>
                        <div className="text-xs text-slate-400 leading-relaxed mb-2">
                            {props.headline || props.description?.substring(0, 80) || 'No description'}
                        </div>
                        <div className="text-xs text-slate-500">
                            Severity: <strong style={{ color }}>{severity}</strong> | Urgency:{' '}
                            <strong className="text-white">{props.urgency || '—'}</strong>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}