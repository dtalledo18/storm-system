// utils/constants.ts

import { County } from '@/types/alert';

export const SEVERITY_COLORS: Record<string, string> = {
  'Extreme': '#ef4444',
  'Critical': '#ef4444',
  'Severe': '#f97316',
  'High': '#f97316',
  'Moderate': '#eab308',
  'Minor': '#94a3b8',
  'Likely': '#f97316',
  'Possible': '#eab308',
  'Expected': '#f97316',
  'Unknown': '#64748b'
};

export const COUNTY_COORDS: Record<string, County> = {
  // Illinois Counties
  '017031': { name: 'Cook County, IL', lat: 41.8, lng: -87.9, state: 'IL' },
  '017097': { name: 'Lake County, IL', lat: 42.3, lng: -87.8, state: 'IL' },
  '017111': { name: 'McHenry County, IL', lat: 42.2, lng: -88.3, state: 'IL' },
  '017089': { name: 'Kane County, IL', lat: 41.9, lng: -88.3, state: 'IL' },
  '017043': { name: 'DuPage County, IL', lat: 41.9, lng: -88.1, state: 'IL' },
  '017093': { name: 'Kendall County, IL', lat: 41.6, lng: -88.3, state: 'IL' },
  '017063': { name: 'Grundy County, IL', lat: 41.4, lng: -88.4, state: 'IL' },
  '017197': { name: 'Will County, IL', lat: 41.5, lng: -87.9, state: 'IL' },
  
  // Wisconsin Counties
  '055079': { name: 'Dane County, WI', lat: 43.0731, lng: -89.4012, state: 'WI' },
  '055025': { name: 'Milwaukee County, WI', lat: 43.0326, lng: -87.9146, state: 'WI' },
};

export const TILE_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const TILE_LAYER_ATTRIBUTION = '&copy; OpenStreetMap &copy; CartoDB';

export const MAP_DEFAULT_CENTER: [number, number] = [41.9, -88.0];

export const MAP_DEFAULT_ZOOM = 9;

export const COUNTIES_RADIUS = 15000; // metros

export const ALERT_REFRESH_INTERVAL = 60000; // 60 segundos

export const SEVERITY_LEVELS = ['Extreme', 'Critical', 'Severe', 'High', 'Moderate', 'Minor', 'Unknown'] as const;

export const EVENT_TYPES = {
  HAIL: 'hail',
  WARNING: 'warning',
  WATCH: 'watch'
} as const;

export const CHART_COLORS = {
  critical: '#ef4444',
  severe: '#f97316',
  moderate: '#eab308',
  minor: '#94a3b8'
} as const;
