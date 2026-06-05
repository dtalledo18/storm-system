// components/dashboard/MapContainer.tsx

'use client';

import { useEffect, useRef } from 'react';
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
              <div style="padding-top:6px;border-top:1px solid #1e3a5f">
                <div style="font-size:9px;color:#0ea5e9;line-height:1.6">
                  <div><strong>Sent:</strong> ${new Date(props.sent).toLocaleString()}</div>
                  <div><strong>Effective:</strong> ${new Date(props.effective).toLocaleString()}</div>
                </div>
              </div>
            </div>
          `);
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
      // Circle
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

      // Custom pin icon
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