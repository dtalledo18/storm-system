'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAlerts } from "@/app/hooks/hooks-useAlerts";
import { useJobsites } from "@/app/hooks/hooks-useJobsites";
import { SEVERITY_COLORS, COUNTY_COORDS } from "@/app/utils/utils-constants";

const MapContainer = dynamic(() => import('@/app/components/dashboard/MapContainer').then(mod => ({ default: mod.MapContainer })), { ssr: false });
const AlertZoneList = dynamic(() => import('@/app/components/dashboard/AlertZoneList').then(mod => ({ default: mod.AlertZoneList })), { ssr: false });
const RealTimeAlerts = dynamic(() => import('@/app/components/dashboard/RealTimeAlerts').then(mod => ({ default: mod.RealTimeAlerts })), { ssr: false });
const AlertDistributionChart = dynamic(() => import('@/app/components/dashboard/AlertDistributionChart').then(mod => ({ default: mod.AlertDistributionChart })), { ssr: false });
const Header = dynamic(() => import('@/app/components/common/Header').then(mod => ({ default: mod.Header })), { ssr: false });
const FilterBar = dynamic(() => import('@/app/components/common/FilterBar').then(mod => ({ default: mod.FilterBar })), { ssr: false });
const KPICard = dynamic(() => import('@/app/components/common/KPICard').then(mod => ({ default: mod.KPICard })), { ssr: false });
const JobsitePanel = dynamic(() => import('@/app/components/dashboard/JobsitePanel').then(mod => ({ default: mod.JobsitePanel })), { ssr: false });
const CampaignModal = dynamic(() => import('@/app/components/dashboard/CampaignModal').then(mod => ({ default: mod.CampaignModal })), { ssr: false });

export default function DashboardPage() {
  const {
    alerts,
    filters,
    kpis,
    updateFilter,
    loadAlerts,
  } = useAlerts();

  const {
    jobsites,
    removeJobsite,
    toggleJobsite,
    addJobsite,
  } = useJobsites();

  const [showCircles, setShowCircles] = useState(true);
  const [showJobsites, setShowJobsites] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const campaignsLoadedRef = useRef(false);

  // Carga inicial desde Postgres (Single source of truth)
  useEffect(() => {
    if (campaignsLoadedRef.current) return;
    campaignsLoadedRef.current = true;

    const loadStoredCampaigns = async () => {
      try {
        const res = await fetch('/api/campaigns');
        if (!res.ok) throw new Error("Error fetching baseline campaigns");

        const storedCampaigns = await res.json();
        console.log("[Campaigns] Fetched from DB:", storedCampaigns.length, storedCampaigns);

        storedCampaigns.forEach((campaign: any) => {
          const jobsite = {
            id: campaign.id,
            name: campaign.name,
            address: campaign.address || `${campaign.lat}, ${campaign.lng}`,
            radiusKm: campaign.radiusKm,
            channels: campaign.channels || "SMS",
            lat: campaign.lat,
            lng: campaign.lng,
            active: campaign.active
          };
          addJobsite(jobsite as any);
        });
      } catch (error) {
        console.error("[Campaigns] Failed to load:", error);
      }
    };

    loadStoredCampaigns();
  }, [addJobsite]);

  // 💡 FUNCIÓN UNIFICADA NUEVA: Procesa cualquier campaña guardada por Postgres e inyecta al mapa en tiempo real
  const handleCampaignAdded = (savedCampaign: any) => {
    console.log("[Dashboard] Agregando campaña al mapa en tiempo real:", savedCampaign);

    addJobsite({
      id: savedCampaign.id, // Requerido por la validación del hook
      name: savedCampaign.name,
      address: savedCampaign.address || `${savedCampaign.lat}, ${savedCampaign.lng}`,
      lat: parseFloat(savedCampaign.lat),
      lng: parseFloat(savedCampaign.lng),
      radiusKm: parseFloat(savedCampaign.radiusKm),
      channels: savedCampaign.channels || "Ads + SMS",
      active: savedCampaign.active ?? true
    } as any);
  };

  return (
      <div className="flex flex-col h-screen w-screen bg-[#06142e] text-slate-100 overflow-hidden">

        {/* HEADER */}
        <Header alertCount={alerts.length} lastUpdate={kpis.lastUpdate} />

        {/* FILTER BAR - Ahora conectado a la función unificada */}
        <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onCampaignAdded={handleCampaignAdded}
        />

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden gap-0 min-h-0">

          {/* LEFT PANEL */}
          <div className="w-60 bg-[#0a1b3a] border-r border-[#1e3a8a] overflow-y-auto p-3 flex-shrink-0">
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

            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a]">
              Alert Zones
            </div>
            <AlertZoneList
                alerts={alerts}
                countyCoords={COUNTY_COORDS}
                severityColors={SEVERITY_COLORS}
            />

            <div className="mt-3">
              <JobsitePanel
                  jobsites={jobsites}
                  onAdd={() => setShowCampaignModal(true)}
                  onRemove={removeJobsite}
                  onToggle={toggleJobsite}
              />
            </div>
          </div>

          {/* MAP CONTAINER */}
          <div className="flex-1 relative bg-[#06142e] overflow-hidden min-h-0">
            <MapContainer
                alerts={alerts}
                countyCoords={COUNTY_COORDS}
                severityColors={SEVERITY_COLORS}
                showCircles={showCircles}
                coverage={alerts.length}
                jobsites={jobsites}
                showJobsites={showJobsites}
            />

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

            <div className="absolute bottom-5 left-3 z-999">
              <div className="bg-[#0a1b3a] bg-opacity-90 border border-[#1e3a8a] rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-widest text-[#FFD700] font-bold mb-2">Alert Classification</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                  <span className="text-xs text-slate-300">Critical / Extreme</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }} />
                  <span className="text-xs text-slate-300">Severe / High</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                  <span className="text-xs text-slate-300">Moderate</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-2 rounded" style={{ background: '#8b5cf6', opacity: 0.4 }} />
                  <span className="text-xs text-slate-300">Alert Zone Coverage</span>
                </div>
                {jobsites.length > 0 && (
                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[#1e3a8a]">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                      <span className="text-xs text-slate-300">Campaign Zone</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-72 bg-[#0a1b3a] border-l border-[#1e3a8a] overflow-y-auto p-3 flex-shrink-0">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a]">
              Real-Time Alerts
            </div>
            <RealTimeAlerts alerts={alerts.slice(0, 4)} severityColors={SEVERITY_COLORS} />

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

            {jobsites.length > 0 && (
                <>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1.5 border-b border-[#1e3a8a] mt-2.5">
                    Active Campaigns
                  </div>
                  <div className="flex gap-2 p-1.5 bg-[#0a1b3a] border border-[#10b98133] rounded border-l-4 border-l-emerald-500">
                    <div className="text-xs text-slate-400">
                      <strong className="text-[#10b981] block text-sm mb-0.5">
                        {jobsites.filter(j => j.active).length} Active Jobsite{jobsites.filter(j => j.active).length !== 1 ? 's' : ''}
                      </strong>
                      {jobsites.filter(j => j.active).map(j => j.name).join(', ')}
                    </div>
                  </div>
                </>
            )}
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
              Campaigns: <span className="font-bold text-[#10b981]">{jobsites.filter(j => j.active).length}</span>
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
                onClick={() => setShowJobsites(!showJobsites)}
                className={`px-3 py-1 text-xs border rounded hover:border-[#10b981] hover:text-[#10b981] transition-all font-medium ${
                    showJobsites
                        ? 'bg-[#10b98115] border-[#10b981] text-[#10b981]'
                        : 'bg-[#0a1b3a] border-[#1e3a8a] text-slate-400'
                }`}
            >
              📍 {showJobsites ? 'Hide' : 'Show'} Campaigns
            </button>
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

        {/* CAMPAIGN MODAL (MÉTODO CLÁSICO LADO IZQUIERDO) - Conectado al nuevo handler */}
        {showCampaignModal && (
            <CampaignModal
                isOpen={showCampaignModal}
                onClose={() => setShowCampaignModal(false)}
                onCampaignAdded={handleCampaignAdded}
            />
        )}
      </div>
  );
}