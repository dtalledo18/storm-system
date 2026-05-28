// app/dashboard/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAlerts} from "@/app/hooks/hooks-useAlerts";
import { SEVERITY_COLORS, COUNTY_COORDS, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM} from "@/app/utils/utils-constants";
import styles from '@/styles/dashboard.module.css';

// Importar Leaflet dinámicamente (requiere 'use client')
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
    loading,
    error,
    filters,
    kpis,
    updateFilter,
    loadAlerts
  } = useAlerts();

  const [showCircles, setShowCircles] = useState(true);

  return (
    <div className={styles.platform}>
      <Header alertCount={alerts.length} lastUpdate={kpis.lastUpdate} />

      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
      />

      <div className={styles.main}>
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.panelTitle}>Executive KPIs</div>
          <div className={styles.kpiMini}>
            <KPICard label="Active Alerts" value={kpis.totalAlerts} delta="From NWS API" />
            <KPICard label="Severity Avg" value={kpis.severityLevel} delta="Current" variant="purple" />
            <KPICard label="Affected Counties" value={kpis.affectedCounties} delta="IL + WI" variant="green" />
            <KPICard label="Urgency Level" value={kpis.urgencyLevel} delta="Status" variant="orange" />
            <KPICard label="Alert Coverage" value={kpis.alertCoverage} delta="Zones Active" />
            <KPICard label="Last Update" value={kpis.lastUpdate} delta="API Sync" variant="gold" />
          </div>

          <div className={styles.panelTitle}>Alert Zones</div>
          <AlertZoneList
            alerts={alerts}
            countyCoords={COUNTY_COORDS}
            severityColors={SEVERITY_COLORS}
          />
        </div>

        {/* MAP */}
        <MapContainer
          alerts={alerts}
          countyCoords={COUNTY_COORDS}
          severityColors={SEVERITY_COLORS}
          showCircles={showCircles}
          coverage={alerts.length}
        />

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <div className={styles.panelTitle}>Real-Time Alerts</div>
          <RealTimeAlerts
            alerts={alerts.slice(0, 4)}
            severityColors={SEVERITY_COLORS}
          />

          <div className={styles.panelTitle} style={{ marginTop: '10px' }}>Alert Distribution</div>
          <AlertDistributionChart alerts={alerts} />

          <div className={styles.panelTitle} style={{ marginTop: '10px' }}>Strategic Recommendations</div>
          <div className={styles.recItem}>
            <div className={styles.recIcon}>📍</div>
            <div className={styles.recText}>
              <strong>Monitor Active Zones</strong>
              Circles on map show real-time weather.gov alert boundaries. Check affected counties for deployment.
            </div>
          </div>
          <div className={styles.recItem} style={{ borderLeftColor: 'var(--purple)' }}>
            <div className={styles.recIcon}>🔄</div>
            <div className={styles.recText}>
              <strong>API Refresh Interval</strong>
              Data updates automatically from NOAA. Manual refresh available via button.
            </div>
          </div>
          <div className={styles.recItem} style={{ borderLeftColor: 'var(--gold)' }}>
            <div className={styles.recIcon}>⚡</div>
            <div className={styles.recText}>
              <strong>Severity Filtering</strong>
              Use filters above to isolate Critical/Severe events. Click markers for detailed alert info.
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomKpis}>
          <div className={styles.bkpi}>Total Alerts: <span className={styles.bkpiVal}>{alerts.length}</span></div>
          <div className={styles.bkpi}>Active Zones: <span className={styles.bkpiVal}>{kpis.affectedCounties}</span></div>
          <div className={styles.bkpi}>Data Source: <span className={styles.bkpiVal}>NOAA/NWS</span></div>
          <div className={styles.bkpi}>Last Sync: <span className={styles.bkpiVal}>{kpis.lastUpdate}</span></div>
        </div>
        <div className={styles.bottomRight}>
          <button className={styles.actionBtn} onClick={() => setShowCircles(!showCircles)}>
            ⊞ {showCircles ? 'Hide' : 'Show'} Zones
          </button>
          <button className={styles.actionBtn} onClick={loadAlerts}>
            ⊕ Fit Bounds
          </button>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={loadAlerts}>
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
