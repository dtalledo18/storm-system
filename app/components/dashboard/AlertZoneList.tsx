// components/dashboard/AlertZoneList.tsx

'use client';

import { useState } from 'react';
import { AlertFeature, County} from "@/app/types/types-alert";

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
      <div className="space-y-1">
        {alerts.slice(0, 5).map((alert, idx) => {
          const props = alert.properties;
          const severity = props.severity || 'Unknown';
          const barColor = severityColors[severity] || '#64748b';
          const counties = props.areaDesc || 'Unknown Area';
          const isActive = selectedIdx === idx;

          return (
              <div
                  key={idx}
                  className={`bg-slate-800 border rounded-lg p-2 cursor-pointer transition-all ${
                      isActive
                          ? 'border-cyan-500 bg-slate-700 bg-opacity-50'
                          : 'border-blue-900 hover:border-cyan-500'
                  }`}
                  onClick={() => setSelectedIdx(isActive ? null : idx)}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-200">
                {props.event || 'Alert'}
              </span>
                  <span className="text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                {severity}
              </span>
                </div>

                {/* Area Description */}
                <div className="text-xs text-slate-500 mb-1 truncate">
                  {counties}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-slate-900 rounded mb-1 overflow-hidden">
                  <div
                      className="h-full rounded"
                      style={{
                        width: '100%',
                        background: `linear-gradient(90deg, ${barColor}88, ${barColor})`
                      }}
                  ></div>
                </div>

                {/* Meta Info */}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{props.certainty || '—'}</span>
                  <span>{props.urgency || '—'}</span>
                </div>
              </div>
          );
        })}
      </div>
  );
}
