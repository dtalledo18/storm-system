// app/dashboard/page.tsx

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAlerts } from "@/app/hooks/hooks-useAlerts";
import { SEVERITY_COLORS, COUNTY_COORDS } from "@/app/utils/utils-constants";

const MapContainer = dynamic(() => import('@/app/components/dashboard/MapContainer').then(mod => ({ default: mod.MapContainer })), { ssr: false });
const AlertZoneList = dynamic(() => import('@/app/components/dashboard/AlertZoneList').then(mod => ({ default: mod.AlertZoneList })), { ssr: false });
const RealTimeAlerts = dynamic(() => import('@/app/components/dashboard/RealTimeAlerts').then(mod => ({ default: mod.RealTimeAlerts })), { ssr: false });
const AlertDistributionChart = dynamic(() => import('@/app/components/dashboard/AlertDistributionChart').then(mod => ({ default: mod.AlertDistributionChart })), { ssr: false });
const Header = dynamic(() => import('@/app/components/common/Header').then(mod => ({ default: mod.Header })), { ssr: false });
const FilterBar = dynamic(() => import('@/app/components/common/FilterBar').then(mod => ({ default: mod.FilterBar })), { ssr: false });
const KPICard = dynamic(() => import('@/app/components/common/KPICard').then(mod => ({ default: mod.KPICard })), { ssr: false });

export default function DashboardPage() {
  const {
    alerts,
    filters,
    kpis,
    updateFilter,
    loadAlerts
  } = useAlerts();

  const [showCircles, setShowCircles] = useState(true);

  return (
      <div className="flex flex-col h-screen w-screen bg-[#06142e] text-slate-100 overflow-hidden">
        {/* HEADER */}
        <Header alertCount={alerts.length} lastUpdate={kpis.lastUpdate} />

        {/* FILTER BAR */}
        <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
        />

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden gap-0 min-h-0">

          {/* LEFT PANEL */}
          <div className="w-60 bg-[#0a1b3a] border-r border-[#1e3a8a] overflow-y-auto p-3 flex-shrink-0">
            {/* KPIs */}
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a]">
              Executive KPIs
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <KPICard label="Active Alerts" value={kpis.totalAlerts} delta="From NWS API" />
              <KPICard label="Severity Avg" value={kpis.severityLevel} delta="Current" variant="purple" />
              <KPICard label="Affected Counties" value={kpis.affectedCounties} delta="IL + WI" variant="green" />
              <KPICard label="Urgency Level" value={kpis.urgencyLevel} delta="Status" variant="orange" />
              <KPICard label="Alert Coverage" value={kpis.alertCoverage} delta="Zones Active" />
              <KPICard label="Last Update" value={kpis.lastUpdate} delta="API Sync" variant="gold" />
            </div>

            {/* Alert Zones */}
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a]">
              Alert Zones
            </div>
            <AlertZoneList
                alerts={alerts}
                countyCoords={COUNTY_COORDS}
                severityColors={SEVERITY_COLORS}
            />
          </div>

          {/* MAP CONTAINER */}
          <div className="flex-1 relative bg-[#06142e] overflow-hidden min-h-0">
            {/* MAP */}
            <MapContainer
                alerts={alerts}
                countyCoords={COUNTY_COORDS}
                severityColors={SEVERITY_COLORS}
                showCircles={showCircles}
                coverage={alerts.length}
            />

            {/* BADGES SUPERPUESTOS */}
            <div className="absolute top-3 left-15 z-999 pointer-events-none">
              <div className="bg-[#0a1b3a] bg-opacity-90 border border-[#1e3a8a] rounded px-3 py-2 mb-2 pointer-events-auto backdrop-blur-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Active Alerts</div>
                <div className="text-sm font-bold text-[#FFD700]">{alerts.length} Alerts</div>
              </div>
              <div className="bg-[#0a1b3a] bg-opacity-90 border border-[#1e3a8a] rounded px-3 py-2 pointer-events-auto backdrop-blur-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Data Source</div>
                <div className="text-sm font-bold text-[#FFD700]">weather.gov API</div>
              </div>
            </div>

            {/* LEGEND - BOTTOM LEFT */}
            <div className="absolute bottom-5 left-3 z-999">
              <div className="bg-[#0a1b3a] bg-opacity-90 border border-[#1e3a8a] rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-widest text-[#FFD700] font-bold mb-2">Alert Classification</div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></div>
                  <span className="text-xs text-slate-300">Critical / Extreme</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }}></div>
                  <span className="text-xs text-slate-300">Severe / High</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }}></div>
                  <span className="text-xs text-slate-300">Moderate</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-2 rounded" style={{ background: '#8b5cf6', opacity: 0.4 }}></div>
                  <span className="text-xs text-slate-300">Alert Zone Coverage</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-72 bg-[#0a1b3a] border-l border-[#1e3a8a] overflow-y-auto p-3 flex-shrink-0">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a]">
              Real-Time Alerts
            </div>
            <RealTimeAlerts
                alerts={alerts.slice(0, 4)}
                severityColors={SEVERITY_COLORS}
            />

            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a] mt-2.5">
              Alert Distribution
            </div>
            <AlertDistributionChart alerts={alerts} />

            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a] mt-2.5">
              Strategic Recommendations
            </div>

            <div className="flex gap-2 mb-1.5 p-1.5 bg-[#0a1b3a] border border-[#1e3a8a] rounded border-l-4 border-l-cyan-500">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-200 block text-sm mb-0.5">Monitor Active Zones</strong>
                Circles on map show real-time weather.gov alert boundaries.
              </div>
            </div>

            <div className="flex gap-2 mb-1.5 p-1.5 bg-[#0a1b3a] border border-[#1e3a8a] rounded border-l-4 border-l-purple-500">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-200 block text-sm mb-0.5">API Refresh Interval</strong>
                Data updates automatically from NOAA.
              </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-[#0a1b3a] border border-[#1e3a8a] rounded border-l-4 border-l-amber-500">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-200 block text-sm mb-0.5">Severity Filtering</strong>
                Use filters to isolate Critical/Severe events.
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="bg-[#0a1b3a] border-t border-[#1e3a8a] px-4 py-1.5 flex items-center justify-between flex-shrink-0">
          <div className="flex gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              Total Alerts: <span className="font-bold text-[#FFD700]">{alerts.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              Active Zones: <span className="font-bold text-[#FFD700]">{kpis.affectedCounties}</span>
            </div>
            <div className="flex items-center gap-1.5">
              Data Source: <span className="font-bold text-[#FFD700]">NOAA/NWS</span>
            </div>
            <div className="flex items-center gap-1.5">
              Last Sync: <span className="font-bold text-[#FFD700]">{kpis.lastUpdate}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
                onClick={() => setShowCircles(!showCircles)}
                className="px-3 py-1 text-xs bg-[#0a1b3a] border border-[#1e3a8a] rounded hover:border-[#FFD700] hover:text-[#FFD700] transition-all font-medium"
            >
              ⊞ {showCircles ? 'Hide' : 'Show'} Zones
            </button>
            <button
                onClick={loadAlerts}
                className="px-3 py-1 text-xs bg-[#0a1b3a] border border-[#1e3a8a] rounded hover:border-[#FFD700] hover:text-[#FFD700] transition-all font-medium"
            >
              ⊕ Fit Bounds
            </button>
            <button
                onClick={loadAlerts}
                className="px-3 py-1 text-xs bg-[#FFD700] border border-[#FFD700] rounded text-[#06142e] font-bold hover:opacity-90 transition-all"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
  );
}