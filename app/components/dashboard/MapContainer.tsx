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

        console.log(results);

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

    alerts.forEach(alert => {
      const props = alert.properties;
      const severity = props.severity || 'Unknown';
      const color = severityColors[severity] || '#64748b';
      const same = props.geocode?.SAME || [];

      same.forEach(code => {
        const county = countyCoords[code];
        if (!county) return;

        const zipData = COUNTY_ZIP_CODES[code] || { zips: 'N/A', address: 'N/A' };

        if (showCircles) {
          try {
            const circle = L.circle([county.lat, county.lng], {
              radius: COUNTIES_RADIUS,
              color,
              fillColor: color,
              fillOpacity: 0.12,
              opacity: 0.35,
              weight: 1.5,
            }).addTo(map);
            circlesRef.current.push(circle);
          } catch {}
        }

        try {
          const sz = severity === 'Critical' || severity === 'Extreme' ? 14
              : severity === 'Severe' || severity === 'High' ? 11 : 9;

          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,.6);box-shadow:0 0 ${sz}px ${color}88;position:relative;">
              <div style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border-radius:50%;border:1px solid ${color};opacity:.4;animation:ping 2s infinite"></div>
            </div>`,
            iconSize: [sz, sz],
            iconAnchor: [sz / 2, sz / 2],
            popupAnchor: [0, -sz / 2],
          });

          const marker = L.marker([county.lat, county.lng], { icon }).addTo(map);
          // Sanitize: colons, dots, slashes in alert.id break getElementById in some browsers
          const safeAlertId = alert.id.replace(/[^a-zA-Z0-9]/g, '_');
          const popupId = `popup_${code}_${safeAlertId}`;

          // The popup HTML always starts with the loading spinner in the AI section.
          // We never put "Data pending..." here — we let JS handle the update.
          marker.bindPopup(`
            <div style="min-width:280px;color:#e2e8f0;font-family:'Rajdhani',sans-serif;">
              <div style="font-size:14px;font-weight:700;color:${color};margin-bottom:8px">${props.event || 'Alert'}</div>
              <div style="font-size:11px;color:#e2e8f0;margin-bottom:8px">
                <div style="color:#0ea5e9;font-weight:600">${zipData.address}</div>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:2px"><strong>County:</strong> ${county.name}</div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:8px"><strong>ZIP Codes:</strong> <span style="color:#38bdf8;font-weight:600">${zipData.zips}</span></div>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;margin-bottom:8px">
                <div style="color:#94a3b8">Severity</div><div style="color:${color};font-weight:700">${severity}</div>
                <div style="color:#94a3b8">Urgency</div><div style="color:#e2e8f0">${props.urgency || '—'}</div>
                <div style="color:#94a3b8">Certainty</div><div style="color:#e2e8f0">${props.certainty || '—'}</div>
                <div style="color:#94a3b8">Status</div><div style="color:#e2e8f0">${props.status || '—'}</div>
              </div>

              <div id="${popupId}" style="padding-top:6px;border-top:1px solid #1e3a5f; margin-top:4px;">
                <div style="display:flex; align-items:center; gap:8px; color:#94a3b8; font-size:10px; padding-top:6px;">
                  <div class="spinner"></div> Analyzing Lead Potential...
                </div>
              </div>

              <div style="padding-top:6px;border-top:1px solid #1e3a5f; margin-top:4px;">
                <div style="font-size:9px;color:#0ea5e9;line-height:1.6">
                  <div><strong>Sent:</strong> ${new Date(props.sent).toLocaleString()}</div>
                  <div><strong>Effective:</strong> ${new Date(props.effective).toLocaleString()}</div>
                </div>
              </div>
            </div>
          `);

          marker.on('popupopen', () => {
            const container = document.getElementById(popupId);
            if (!container) return;

            // Case 1: Data already available — render immediately
            const scoreData = leadScoresRef.current[alert.id];
            if (scoreData) {
              renderScore(container, scoreData);
              return;
            }

            // Case 2: Data not yet available — show spinner and poll the ref
            // (The spinner is already in the HTML from bindPopup, so no change needed yet)
            renderLoading(container);

            // Poll every 500ms until data arrives or popup closes
            const watcherKey = popupId;
            const interval = setInterval(() => {
              // If the container is no longer in the DOM, the popup was closed — stop polling
              if (!document.getElementById(popupId)) {
                clearInterval(interval);
                activeWatchersRef.current.delete(watcherKey);
                return;
              }

              const data = leadScoresRef.current[alert.id];
              if (data) {
                clearInterval(interval);
                activeWatchersRef.current.delete(watcherKey);
                const el = document.getElementById(popupId);
                if (el) renderScore(el, data);
              }
            }, 500);

            // Store so we can clean up if needed
            activeWatchersRef.current.set(watcherKey, interval);
          });

          // Clear the watcher when popup closes to avoid memory leaks
          marker.on('popupclose', () => {
            const existing = activeWatchersRef.current.get(popupId);
            if (existing) {
              clearInterval(existing);
              activeWatchersRef.current.delete(popupId);
            }
          });

          markersRef.current.push(marker);
        } catch {}
      });
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