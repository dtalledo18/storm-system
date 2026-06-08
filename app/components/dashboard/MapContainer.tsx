// components/dashboard/MapContainer.tsx

'use client';

import {useEffect, useRef, useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertFeature, County } from "@/app/types/types-alert";
import { Jobsite } from "@/app/types/types-jobsite";
import {
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  COUNTIES_RADIUS,
  COUNTY_ZIP_CODES
} from "@/app/utils/utils-constants";

interface MapContainerProps {
  alerts: AlertFeature[];
  countyCoords: Record<string, County>;
  severityColors: Record<string, string>;
  showCircles: boolean;
  coverage: number;
  jobsites?: Jobsite[];
  showJobsites?: boolean;
}

// Renders score HTML into a container element
function renderScore(container: HTMLElement, data: { score: number; reason: string }) {
  container.innerHTML = `
    <div style="margin: 8px">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">
          Lead Quality
        </span>
        <div class="score-tooltip" style="cursor: help;">
          <span style="font-size: 20px; font-weight: 800; color: #10b981; line-height: 1;">
            ${data.score}/10
          </span>
          <span class="tooltip-text">${data.reason}</span>
        </div>
      </div>
    </div>
  `;
}

// Renders the loading spinner HTML
function renderLoading(container: HTMLElement) {
  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; color:#94a3b8; font-size:10px; padding-top:6px;">
      <div class="spinner"></div> Analyzing Lead Potential...
    </div>
  `;
}

export function MapContainer({
                               alerts,
                               countyCoords,
                               severityColors,
                               showCircles,
                               coverage,
                               jobsites = [],
                               showJobsites = true,
                             }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const jobsiteMarkersRef = useRef<L.Marker[]>([]);
  const jobsiteCirclesRef = useRef<L.Circle[]>([]);

  // Single source of truth: a ref for instant reads + state to trigger re-renders
  const leadScoresRef = useRef<Record<string, { score: number, reason: string }>>({});
  const [leadScores, setLeadScores] = useState<Record<string, { score: number, reason: string }>>({});

  // Mutex: tracks IDs currently being fetched to prevent duplicate API calls
  // (React StrictMode double-mounts effects in dev; this guards against that too)
  const fetchingIdsRef = useRef<Set<string>>(new Set());

  // Track active polling intervals so we can clear them on unmount / popup close
  const activeWatchersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Batch-fetch scores for all alerts that aren't yet in the ref.
  // Depends ONLY on `alerts` — never on `leadScores` state, which would
  // cause an infinite loop (state update → effect re-run → new batch call).
  useEffect(() => {
    const processAllAlerts = async () => {
      // Filter out already-scored AND currently-in-flight alerts
      const alertsToProcess = alerts.filter(
          a => !leadScoresRef.current[a.id] && !fetchingIdsRef.current.has(a.id)
      );
      if (alertsToProcess.length === 0) return;

      // Mark these IDs as in-flight immediately (before the async call)
      alertsToProcess.forEach(a => fetchingIdsRef.current.add(a.id));

      // Use index-based payload — never send real IDs to the AI model.
      // LLMs can silently corrupt long URL strings (e.g. urn:oid → urn:ico).
      // We map results back by index, which is 100% reliable.
      const payload = alertsToProcess.map((a, idx) => ({
        idx,
        alert: a,
        county: a.properties.areaDesc || "Unknown County"
      }));

      console.log(`[Map] Sending ${alertsToProcess.length} alerts to batch API.`);

      try {
        const response = await fetch('/api/leads/quality/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload })
        });

        // API returns [{ idx: number, score: number, reason: string }]
        const results: Array<{ idx: number; score: number; reason: string }> = await response.json();

        console.log(`[Map] Batch results received: ${results.length}/${alertsToProcess.length}`);

        // Map back by index — immune to AI ID corruption
        results.forEach(r => {
          const originalAlert = alertsToProcess[r.idx];
          if (!originalAlert) {
            console.warn(`[Map] No alert at idx ${r.idx}`);
            return;
          }
          leadScoresRef.current[originalAlert.id] = { score: r.score, reason: r.reason };
        });

        setLeadScores(prev => {
          const updated = { ...prev };
          results.forEach(r => {
            const originalAlert = alertsToProcess[r.idx];
            if (originalAlert) updated[originalAlert.id] = { score: r.score, reason: r.reason };
          });
          return updated;
        });

        console.log("[Map] Ref now contains:", Object.keys(leadScoresRef.current).length, "entries");

      } catch (e) {
        console.error("[Map] Batch API error:", e);
        // On failure, release the mutex so a retry is possible
        alertsToProcess.forEach(a => fetchingIdsRef.current.delete(a.id));
      }
    };

    if (alerts.length > 0) processAllAlerts();
  }, [alerts]); // ← ONLY alerts — never leadScores

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        zoom: MAP_DEFAULT_ZOOM,
        center: MAP_DEFAULT_CENTER as L.LatLngExpression,
      });
      L.tileLayer(TILE_LAYER_URL, {
        attribution: TILE_LAYER_ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      activeWatchersRef.current.forEach(interval => clearInterval(interval));
      activeWatchersRef.current.clear();
    };
  }, []);

  // Render alert markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => { try { map.removeLayer(m); } catch {} });
    circlesRef.current.forEach(c => { try { map.removeLayer(c); } catch {} });
    markersRef.current = [];
    circlesRef.current = [];

    // Group alerts by SAME code so counties with multiple alerts
    // get ONE marker with a multi-section popup instead of stacked invisible markers.
    const alertsByCounty = new Map<string, AlertFeature[]>();
    alerts.forEach(alert => {
      (alert.properties.geocode?.SAME || []).forEach(code => {
        if (!countyCoords[code]) return;
        if (!alertsByCounty.has(code)) alertsByCounty.set(code, []);
        alertsByCounty.get(code)!.push(alert);
      });
    });

    alertsByCounty.forEach((countyAlerts, code) => {
      const county = countyCoords[code];
      const zipData = COUNTY_ZIP_CODES[code] || { zips: 'N/A', address: 'N/A' };

      // Use highest severity alert to determine the marker color/size
      const severityRank = ['Extreme','Critical','Severe','High','Moderate','Minor','Unknown'];
      const topAlert = countyAlerts.sort((a, b) =>
          severityRank.indexOf(a.properties.severity) - severityRank.indexOf(b.properties.severity)
      )[0];
      const topSeverity = topAlert.properties.severity || 'Unknown';
      const topColor = severityColors[topSeverity] || '#64748b';

      // Circles — one per alert (different colors)
      if (showCircles) {
        countyAlerts.forEach(alert => {
          const color = severityColors[alert.properties.severity] || '#64748b';
          try {
            const circle = L.circle([county.lat, county.lng], {
              radius: COUNTIES_RADIUS,
              color, fillColor: color,
              fillOpacity: 0.12, opacity: 0.35, weight: 1.5,
            }).addTo(map);
            circlesRef.current.push(circle);
          } catch {}
        });
      }

      // Single marker per county
      try {
        const sz = topSeverity === 'Critical' || topSeverity === 'Extreme' ? 14
            : topSeverity === 'Severe' || topSeverity === 'High' ? 11 : 9;

        // Show alert count badge if multiple alerts
        const badge = countyAlerts.length > 1
            ? `<div style="position:absolute;top:-6px;right:-6px;background:#f59e0b;color:#000;border-radius:50%;width:14px;height:14px;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1;">${countyAlerts.length}</div>`
            : '';

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="position:relative;width:${sz}px;height:${sz}px;">
            <div style="width:${sz}px;height:${sz}px;background:${topColor};border-radius:50%;border:2px solid rgba(255,255,255,.6);box-shadow:0 0 ${sz}px ${topColor}88;">
              <div style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border-radius:50%;border:1px solid ${topColor};opacity:.4;animation:ping 2s infinite"></div>
            </div>
            ${badge}
          </div>`,
          iconSize: [sz + 8, sz + 8],
          iconAnchor: [(sz + 8) / 2, (sz + 8) / 2],
          popupAnchor: [0, -(sz + 8) / 2],
        });

        const marker = L.marker([county.lat, county.lng], { icon }).addTo(map);
        const popupId = `popup_county_${code}`;

        // Build popup HTML with one section per alert
        const alertSections = countyAlerts.map((alert, i) => {
          const props = alert.properties;
          const color = severityColors[props.severity] || '#64748b';
          const safeId = `${popupId}_alert_${i}`;
          return `
            <div style="margin-bottom:${i < countyAlerts.length - 1 ? '10px' : '0'};padding-bottom:${i < countyAlerts.length - 1 ? '10px' : '0'};${i < countyAlerts.length - 1 ? 'border-bottom:1px solid #1e3a5f;' : ''}">
              <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:6px">${props.event || 'Alert'}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:10px;margin-bottom:6px">
                <div style="color:#94a3b8">Severity</div><div style="color:${color};font-weight:700">${props.severity || '—'}</div>
                <div style="color:#94a3b8">Urgency</div><div style="color:#e2e8f0">${props.urgency || '—'}</div>
                <div style="color:#94a3b8">Certainty</div><div style="color:#e2e8f0">${props.certainty || '—'}</div>
              </div>
              <div id="${safeId}" style="padding-top:4px;">
                <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:10px;">
                  <div class="spinner"></div> Analyzing...
                </div>
              </div>
              <div style="font-size:9px;color:#0ea5e9;margin-top:4px;">
                <strong>Effective:</strong> ${new Date(props.effective).toLocaleString()}
              </div>
            </div>
          `;
        }).join('');

        marker.bindPopup(`
          <div style="min-width:280px;color:#e2e8f0;font-family:'Rajdhani',sans-serif;">
            <div style="font-size:11px;color:#0ea5e9;font-weight:600;margin-bottom:4px">${zipData.address}</div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:2px"><strong>County:</strong> ${county.name}</div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:8px"><strong>ZIP Codes:</strong> <span style="color:#38bdf8;font-weight:600">${zipData.zips}</span></div>
            ${countyAlerts.length > 1 ? `<div style="font-size:10px;color:#f59e0b;font-weight:700;margin-bottom:8px;">⚠ ${countyAlerts.length} Active Alerts</div>` : ''}
            <div style="border-top:1px solid #1e3a5f;padding-top:8px;">
              ${alertSections}
            </div>
          </div>
        `, { maxHeight: 400 });

        marker.on('popupopen', () => {
          countyAlerts.forEach((alert, i) => {
            const safeId = `${popupId}_alert_${i}`;
            const container = document.getElementById(safeId);
            if (!container) return;

            const scoreData = leadScoresRef.current[alert.id];
            if (scoreData) {
              renderScore(container, scoreData);
              return;
            }

            renderLoading(container);

            const watcherKey = safeId;
            const interval = setInterval(() => {
              if (!document.getElementById(safeId)) {
                clearInterval(interval);
                activeWatchersRef.current.delete(watcherKey);
                return;
              }
              const data = leadScoresRef.current[alert.id];
              if (data) {
                clearInterval(interval);
                activeWatchersRef.current.delete(watcherKey);
                const el = document.getElementById(safeId);
                if (el) renderScore(el, data);
              }
            }, 500);

            activeWatchersRef.current.set(watcherKey, interval);
          });
        });

        marker.on('popupclose', () => {
          countyAlerts.forEach((_, i) => {
            const safeId = `${popupId}_alert_${i}`;
            const existing = activeWatchersRef.current.get(safeId);
            if (existing) {
              clearInterval(existing);
              activeWatchersRef.current.delete(safeId);
            }
          });
        });

        markersRef.current.push(marker);
      } catch {}
    });
  }, [alerts, countyCoords, severityColors, showCircles]);

  // Render jobsite markers + circles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    jobsiteMarkersRef.current.forEach(m => { try { map.removeLayer(m); } catch {} });
    jobsiteCirclesRef.current.forEach(c => { try { map.removeLayer(c); } catch {} });
    jobsiteMarkersRef.current = [];
    jobsiteCirclesRef.current = [];

    if (!showJobsites) return;

    jobsites.filter(j => j.active).forEach(j => {
      try {
        const circle = L.circle([j.lat, j.lng], {
          radius: j.radiusKm * 1000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.10,
          opacity: 0.55,
          weight: 1.5,
          dashArray: '4,4',
        }).addTo(map);
        jobsiteCirclesRef.current.push(circle);
      } catch {}

      try {
        const icon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:22px;height:28px">
            <svg viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:28px;filter:drop-shadow(0 0 6px #10b98188)">
              <path d="M11 0C6.48 0 2 4.03 2 9c0 6.75 9 17 9 17s9-10.25 9-17c0-4.97-4.03-9-9-9z" fill="#10b981"/>
              <circle cx="11" cy="9" r="4" fill="#0d1420"/>
              <circle cx="11" cy="9" r="2" fill="#10b981"/>
            </svg>
          </div>`,
          iconSize: [22, 28],
          iconAnchor: [11, 28],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([j.lat, j.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:230px;color:#e2e8f0;font-family:'Rajdhani',sans-serif;">
            <div style="font-size:13px;font-weight:700;color:#10b981;margin-bottom:6px">📍 ${j.name}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${j.address}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;margin-bottom:8px">
              <div style="color:#64748b">Campaign Radius</div>
              <div style="color:#10b981;font-weight:700">${j.radiusKm} KM</div>
              <div style="color:#64748b">Channels</div>
              <div style="color:#38bdf8">${j.channels}</div>
            </div>
            <div style="padding-top:6px;border-top:1px solid #1e3a5f;font-size:10px;color:#10b981">
              ✅ Active Jobsite Campaign Zone
            </div>
          </div>
        `);
        jobsiteMarkersRef.current.push(marker);
      } catch {}
    });
  }, [jobsites, showJobsites]);

  return (
      <>
        <div ref={mapRef} className="w-full h-full" />

        <style jsx global>{`
          .score-tooltip { position: relative; display: inline-block; }

          .score-tooltip .tooltip-text {
            visibility: hidden;
            width: 220px;
            background-color: #0f172a;
            color: #e2e8f0;
            text-align: left;
            border-radius: 6px;
            padding: 10px;
            position: absolute;
            z-index: 9999;
            bottom: 150%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 11px;
            font-weight: 400;
            border: 1px solid #38bdf8;
            line-height: 1.4;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          }

          .score-tooltip .tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #38bdf8 transparent transparent transparent;
          }

          .score-tooltip:hover .tooltip-text { visibility: visible; }

          /* Spinner animation */
          .spinner {
            width: 10px;
            height: 10px;
            border: 2px solid #1e3a5f;
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            flex-shrink: 0;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .leaflet-container {
            background: #080c14 !important;
            font-family: 'Rajdhani', sans-serif;
            width: 100% !important;
            height: 100% !important;
          }
          .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid #1e3a5f !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.5) !important;
            color: #e2e8f0 !important;
          }
          .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95) !important; }
          .leaflet-popup-content {
            color: #e2e8f0 !important;
            font-family: 'Rajdhani', sans-serif !important;
            font-size: 12px !important;
            line-height: 1.6;
            margin: 0 !important;
          }
          .leaflet-control-zoom {
            border: 1px solid #1e3a5f !important;
            border-radius: 6px !important;
            overflow: hidden;
          }
          .leaflet-control-zoom a {
            background: #111a2e !important;
            color: #94a3b8 !important;
            border-color: #1e3a5f !important;
            border-bottom: 1px solid #1e3a5f !important;
            font-weight: bold;
            width: 30px !important;
            height: 30px !important;
            line-height: 30px !important;
          }
          .leaflet-control-zoom a:hover {
            background: #162040 !important;
            color: #38bdf8 !important;
          }
          .leaflet-control-zoom a:last-child { border-bottom: none !important; }
          .leaflet-attribution-flag { display: none !important; }
          .leaflet-control-attribution {
            background: rgba(15, 23, 42, 0.7) !important;
            color: #64748b !important;
            font-size: 8px !important;
          }
          .custom-marker { background: none !important; border: none !important; }

          @keyframes ping {
            0% { opacity: 1; transform: scale(1); }
            75%, 100% { opacity: 0; transform: scale(2); }
          }
        `}</style>
      </>
  );
}