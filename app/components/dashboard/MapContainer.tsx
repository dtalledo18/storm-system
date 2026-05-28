// components/dashboard/MapContainer.tsx

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertFeature, County } from '@/types/alert';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, COUNTIES_RADIUS } from '@/utils/constants';

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

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      // No destruir el mapa para evitar memory leaks
    };
  }, []);

  // Actualizar marcadores y círculos
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Limpiar marcadores y círculos anteriores
    markersRef.current.forEach(marker => map.removeLayer(marker));
    circlesRef.current.forEach(circle => map.removeLayer(circle));
    markersRef.current = [];
    circlesRef.current = [];

    // Agregar nuevos marcadores y círculos
    alerts.forEach(alert => {
      const props = alert.properties;
      const severity = props.severity || 'Unknown';
      const color = severityColors[severity] || '#64748b';
      const same = props.geocode?.SAME || [];

      same.forEach(code => {
        const county = countyCoords[code];
        if (!county) return;

        // Crear círculo
        if (showCircles) {
          const circle = L.circle([county.lat, county.lng], {
            radius: COUNTIES_RADIUS,
            color: color,
            fillColor: color,
            fillOpacity: 0.12,
            opacity: 0.35,
            weight: 1.5
          }).addTo(map);
          circlesRef.current.push(circle);
        }

        // Crear marcador
        const sz = severity === 'Critical' || severity === 'Extreme' ? 14 : severity === 'Severe' || severity === 'High' ? 11 : 9;
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,.6);box-shadow:0 0 ${sz}px ${color}88;position:relative">
            <div style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border-radius:50%;border:1px solid ${color};opacity:.4;animation:ping 2s infinite"></div>
          </div>`,
          iconSize: [sz, sz],
          iconAnchor: [sz / 2, sz / 2]
        });

        const marker = L.marker([county.lat, county.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:220px">
            <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:6px">${props.event || 'Alert'}</div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:8px"><strong>Area:</strong> ${county.name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px">
              <div style="color:#94a3b8">Severity</div><div style="color:${color};font-weight:700">${severity}</div>
              <div style="color:#94a3b8">Urgency</div><div style="color:#e2e8f0">${props.urgency || '—'}</div>
              <div style="color:#94a3b8">Certainty</div><div style="color:#e2e8f0">${props.certainty || '—'}</div>
              <div style="color:#94a3b8">Status</div><div style="color:#e2e8f0">${props.status || '—'}</div>
            </div>
            <div style="margin-top:8px;padding-top:6px;border-top:1px solid #1e3a5f;font-size:9px;color:#0ea5e9">
              Sent: ${new Date(props.sent).toLocaleString()}
            </div>
          </div>
        `);
        markersRef.current.push(marker);
      });
    });
  }, [alerts, countyCoords, severityColors, showCircles]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div className="map-overlay">
        <div className="map-badge">
          <div className="map-badge-title">Active Alerts</div>
          <div className="map-badge-val">{coverage} Active Alerts</div>
        </div>
        <div className="map-badge">
          <div className="map-badge-title">Data Source</div>
          <div className="map-badge-val">weather.gov API</div>
        </div>
      </div>
      <div className="legend">
        <div className="legend-inner">
          <div className="legend-title">Alert Classification</div>
          <div className="legend-row">
            <div className="legend-dot" style={{ background: '#ef4444' }}></div>
            Critical / Extreme
          </div>
          <div className="legend-row">
            <div className="legend-dot" style={{ background: '#f97316' }}></div>
            Severe / High
          </div>
          <div className="legend-row">
            <div className="legend-dot" style={{ background: '#eab308' }}></div>
            Moderate
          </div>
          <div className="legend-row">
            <div className="legend-dot" style={{ background: '#8b5cf6', opacity: 0.4, width: '24px', height: '12px', borderRadius: '2px' }}></div>
            Alert Zone Coverage
          </div>
        </div>
      </div>
    </div>
  );
}
