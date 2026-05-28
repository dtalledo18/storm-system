// components/dashboard/MapContainer.tsx

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertFeature, County} from "@/app/types/types-alert";
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, COUNTIES_RADIUS, COUNTY_ZIP_CODES } from "@/app/utils/utils-constants";

interface MapContainerProps {
  alerts: AlertFeature[];
  countyCoords: Record<string, County>;
  severityColors: Record<string, string>;
  showCircles: boolean;
  coverage: number;
}

export function MapContainer({
                               alerts,
                               countyCoords,
                               severityColors,
                               showCircles,
                               coverage
                             }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        zoom: MAP_DEFAULT_ZOOM,
        center: MAP_DEFAULT_CENTER as L.LatLngExpression
      });

      L.tileLayer(TILE_LAYER_URL, {
        attribution: TILE_LAYER_ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  useEffect(() => {
    alerts.forEach((alert, idx) => {
      const props = alert.properties;
      const same = props.geocode?.SAME || [];

      if (same.length === 0) {
        // Corrección: Usar backticks (`) para que ${variable} funcione
        console.warn(`⚠️ Alert ${idx} has no SAME codes: ${props.event}, ${props.areaDesc}`);
      } else {
        const missingCodes = same.filter(code => !countyCoords[code]);
        if (missingCodes.length > 0) {
          // Corrección: Usar backticks y separar variables correctamente
          console.warn(`⚠️ Alert ${props.event} has missing county codes:`, missingCodes);
          console.log('Available codes:', same);
        }
      }
    });
  }, [alerts, countyCoords]);

  // Actualizar marcadores y círculos cuando cambien las alertas
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        console.error('Error removing marker:', e);
      }
    });
    circlesRef.current.forEach(circle => {
      try {
        map.removeLayer(circle);
      } catch (e) {
        console.error('Error removing circle:', e);
      }
    });
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

        // Obtener ZIP code y dirección del condado
        const zipData = COUNTY_ZIP_CODES[code] || { zips: 'N/A', address: 'N/A' };

        if (showCircles) {
          try {
            const circle = L.circle([county.lat, county.lng], {
              radius: COUNTIES_RADIUS,
              color: color,
              fillColor: color,
              fillOpacity: 0.12,
              opacity: 0.35,
              weight: 1.5
            }).addTo(map);
            circlesRef.current.push(circle);
          } catch (e) {
            console.error('Error adding circle:', e);
          }
        }

        try {
          const sz = severity === 'Critical' || severity === 'Extreme' ? 14 : severity === 'Severe' || severity === 'High' ? 11 : 9;
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,.6);box-shadow:0 0 ${sz}px ${color}88;position:relative;">
              <div style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border-radius:50%;border:1px solid ${color};opacity:.4;animation:ping 2s infinite"></div>
            </div>`,
            iconSize: [sz, sz],
            iconAnchor: [sz / 2, sz / 2],
            popupAnchor: [0, -sz / 2]
          });

          const marker = L.marker([county.lat, county.lng], { icon }).addTo(map);

          const popupContent = `
            <div style="min-width:280px; color: #e2e8f0; font-family: 'Rajdhani', sans-serif;">
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
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        } catch (e) {
          console.error('Error adding marker:', e);
        }
      });
    });

    console.log(`Rendered ${markersRef.current.length} markers and ${circlesRef.current.length} circles`);
  }, [alerts, countyCoords, severityColors, showCircles]);

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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5) !important;
            color: #e2e8f0 !important;
          }

          .leaflet-popup-tip {
            background: rgba(15, 23, 42, 0.95) !important;
          }

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

          .leaflet-control-zoom a:last-child {
            border-bottom: none !important;
          }

          .leaflet-attribution-flag {
            display: none !important;
          }

          .leaflet-control-attribution {
            background: rgba(15, 23, 42, 0.7) !important;
            color: #64748b !important;
            font-size: 8px !important;
          }

          .custom-marker {
            background: none !important;
            border: none !important;
          }

          @keyframes ping {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            75%, 100% {
              opacity: 0;
              transform: scale(2);
            }
          }
        `}</style>
      </>
  );
}