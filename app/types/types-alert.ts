// types/alert.ts

export interface AlertProperties {
  id: string;
  areaDesc: string;
  event: string;
  severity: 'Extreme' | 'Critical' | 'Severe' | 'High' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Unknown';
  certainty: 'Observed' | 'Likely' | 'Possible' | 'Unknown';
  status: string;
  sent: string;
  effective: string;
  expires: string;
  headline?: string;
  description?: string;
  instruction?: string;
  geocode?: {
    SAME: string[];
    UGC: string[];
  };
}

export interface AlertFeature {
  id: string;
  type: 'Feature';
  geometry: null;
  properties: AlertProperties;
}

export interface AlertResponse {
  type: 'FeatureCollection';
  features: AlertFeature[];
  updated: string;
}

export interface County {
  name: string;
  lat: number;
  lng: number;
  state: 'IL' | 'WI' | 'KY' | 'IN'  ;
}

export interface FilterState {
  state: 'ALL' | 'IL' | 'WI'| 'KY' | 'IN' ;
  severity: 'ALL' | 'Critical' | 'Severe' | 'Moderate' | 'Minor';
  eventType: 'ALL' | 'HAIL' | 'WARNING' | 'WATCH';
}

export interface KPIData {
  totalAlerts: number;
  severityLevel: string;
  affectedCounties: number;
  urgencyLevel: string;
  alertCoverage: string;
  lastUpdate: string;
}
