// hooks/useAlerts.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertFeature, FilterState, KPIData} from "@/app/types/types-alert";
import { fetchAlerts, getLastUpdateTime} from "@/app/services/services-weatherService";
import { COUNTY_COORDS} from "@/app/utils/utils-constants";

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    state: 'ALL',
    severity: 'ALL',
    eventType: 'ALL'
  });

  // Cargar alertas
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts('IL');
      setAlerts(data.features);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar alertas al montar el componente
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Filtrar alertas según los filtros aplicados
  const filteredAlerts = alerts.filter(alert => {
    const props = alert.properties;

    // Filtro por estado
    if (filters.state !== 'ALL') {
      const same = props.geocode?.SAME || [];
      const inState = same.some(code => COUNTY_COORDS[code]?.state === filters.state);
      if (!inState) return false;
    }

    // Filtro por severidad
    if (filters.severity !== 'ALL') {
      if (props.severity !== filters.severity) return false;
    }

    // Filtro por tipo de evento
    if (filters.eventType !== 'ALL') {
      const event = props.event || '';
      if (filters.eventType === 'HAIL' && !event.toLowerCase().includes('hail')) return false;
      if (filters.eventType === 'WARNING' && !event.toLowerCase().includes('warning')) return false;
      if (filters.eventType === 'WATCH' && !event.toLowerCase().includes('watch')) return false;
    }

    return true;
  });

  // Calcular KPIs
  const kpis: KPIData = {
    totalAlerts: filteredAlerts.length,
    severityLevel: calculateSeverityLevel(filteredAlerts),
    affectedCounties: calculateAffectedCounties(filteredAlerts),
    urgencyLevel: getTopUrgency(filteredAlerts),
    alertCoverage: `${filteredAlerts.length} zones`,
    lastUpdate: lastUpdated
  };

  // Actualizar un filtro
  const updateFilter = (filterName: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value as any
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      state: 'ALL',
      severity: 'ALL',
      eventType: 'ALL'
    });
  };

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    loading,
    error,
    lastUpdated,
    filters,
    kpis,
    loadAlerts,
    updateFilter,
    resetFilters
  };
}

/**
 * Calcula el nivel de severidad promedio
 */
function calculateSeverityLevel(alerts: AlertFeature[]): string {
  if (alerts.length === 0) return 'NONE';

  const severities = alerts.map(a => a.properties.severity);
  if (severities.some(s => s === 'Extreme' || s === 'Critical')) return 'CRITICAL';
  if (severities.some(s => s === 'Severe' || s === 'High')) return 'HIGH';
  if (severities.some(s => s === 'Moderate')) return 'MODERATE';
  return 'LOW';
}

/**
 * Calcula el número de condados afectados
 */
function calculateAffectedCounties(alerts: AlertFeature[]): number {
  const counties = new Set<string>();
  alerts.forEach(alert => {
    const same = alert.properties.geocode?.SAME || [];
    same.forEach(code => {
      if (COUNTY_COORDS[code]) {
        counties.add(COUNTY_COORDS[code].name);
      }
    });
  });
  return counties.size;
}

/**
 * Obtiene la urgencia más alta
 */
function getTopUrgency(alerts: AlertFeature[]): string {
  if (alerts.length === 0) return 'NONE';
  const urgencies = alerts.map(a => a.properties.urgency).filter(Boolean);
  return urgencies[0]?.substring(0, 3).toUpperCase() || 'UNK';
}
