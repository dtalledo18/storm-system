// utils/constants.ts - COMPLETO CON CONDADOS DEL FLOOD WARNING

import { County} from "@/app/types/types-alert";

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
  // ============ ILLINOIS COUNTIES ============
  '017031': { name: 'Cook County, IL', lat: 41.8, lng: -87.9, state: 'IL' },
  '017097': { name: 'Lake County, IL', lat: 42.3, lng: -87.8, state: 'IL' },
  '017111': { name: 'McHenry County, IL', lat: 42.2, lng: -88.3, state: 'IL' },
  '017089': { name: 'Kane County, IL', lat: 41.9, lng: -88.3, state: 'IL' },
  '017043': { name: 'DuPage County, IL', lat: 41.9, lng: -88.1, state: 'IL' },
  '017093': { name: 'Kendall County, IL', lat: 41.6, lng: -88.3, state: 'IL' },
  '017063': { name: 'Grundy County, IL', lat: 41.4, lng: -88.4, state: 'IL' },
  '017197': { name: 'Will County, IL', lat: 41.5, lng: -87.9, state: 'IL' },
  '017099': { name: 'McLean County, IL', lat: 40.19, lng: -88.24, state: 'IL' },
  '017157': { name: 'Tazewell County, IL', lat: 40.58, lng: -88.55, state: 'IL' },
  '017077': { name: 'Fulton County, IL', lat: 40.38, lng: -89.85, state: 'IL' },
  '017055': { name: 'Iroquois County, IL', lat: 40.71, lng: -87.56, state: 'IL' },
  '017179': { name: 'Washington County, IL', lat: 38.29, lng: -89.42, state: 'IL' },
  '017133': { name: 'Perry County, IL', lat: 38.04, lng: -88.94, state: 'IL' },
  '017201': { name: 'Williamson County, IL', lat: 37.72, lng: -88.84, state: 'IL' },
  // NUEVOS PARA FLOOD WARNING
  '017059': { name: 'Gallatin County, IL', lat: 38.18, lng: -88.51, state: 'IL' },
  '017069': { name: 'Hardin County, IL', lat: 37.64, lng: -88.26, state: 'IL' },

  // ============ WISCONSIN COUNTIES ============
  '055079': { name: 'Dane County, WI', lat: 43.0731, lng: -89.4012, state: 'WI' },
  '055025': { name: 'Milwaukee County, WI', lat: 43.0326, lng: -87.9146, state: 'WI' },
  '055087': { name: 'Eau Claire County, WI', lat: 44.81, lng: -91.50, state: 'WI' },
  '055013': { name: 'Chippewa County, WI', lat: 45.14, lng: -91.39, state: 'WI' },
  '055011': { name: 'Clark County, WI', lat: 44.74, lng: -90.70, state: 'WI' },
  '055039': { name: 'Dunn County, WI', lat: 44.95, lng: -91.89, state: 'WI' },
  '055055': { name: 'Jefferson County, WI', lat: 43.01, lng: -88.73, state: 'WI' },
  '055059': { name: 'Kenosha County, WI', lat: 42.58, lng: -87.82, state: 'WI' },
  '055063': { name: 'La Crosse County, WI', lat: 43.81, lng: -91.24, state: 'WI' },
  '055067': { name: 'Langlade County, WI', lat: 45.24, lng: -88.76, state: 'WI' },
  '055089': { name: 'Florence County, WI', lat: 45.97, lng: -88.25, state: 'WI' },
  '055099': { name: 'Green Lake County, WI', lat: 43.85, lng: -88.89, state: 'WI' },

  // ============ KENTUCKY COUNTIES ============
  '021061': { name: 'Gallatin County, KY', lat: 38.74, lng: -84.42, state: 'KY' },
  '021087': { name: 'Hardin County, KY', lat: 37.78, lng: -85.94, state: 'KY' },
  '021041': { name: 'Crittenden County, KY', lat: 38.36, lng: -84.81, state: 'KY' },
  '021025': { name: 'Union County, KY', lat: 38.53, lng: -87.76, state: 'KY' },
  '021179': { name: 'Pendleton County, KY', lat: 38.64, lng: -84.07, state: 'KY' },
  '021015': { name: 'Bourbon County, KY', lat: 38.20, lng: -84.16, state: 'KY' },
  '021049': { name: 'Franklin County, KY', lat: 38.20, lng: -84.87, state: 'KY' },
  '021067': { name: 'Grant County, KY', lat: 38.48, lng: -84.51, state: 'KY' },
  '021111': { name: 'Jefferson County, KY', lat: 38.30, lng: -85.65, state: 'KY' },
  '021151': { name: 'Marion County, KY', lat: 37.68, lng: -85.09, state: 'KY' },
  '021175': { name: 'Owen County, KY', lat: 38.79, lng: -84.90, state: 'KY' },
  '021185': { name: 'Robertson County, KY', lat: 38.42, lng: -84.29, state: 'KY' },
  // NUEVOS PARA FLOOD WARNING
  '021055': { name: 'Estill County, KY', lat: 38.38, lng: -83.73, state: 'KY' },
  '021225': { name: 'Whitley County, KY', lat: 36.75, lng: -84.26, state: 'KY' },

  // ============ INDIANA COUNTIES ============
  '018095': { name: 'Posey County, IN', lat: 38.12, lng: -87.73, state: 'IN' },
  '018127': { name: 'Vanderburgh County, IN', lat: 37.97, lng: -87.55, state: 'IN' },
  '018163': { name: 'Warrick County, IN', lat: 38.24, lng: -87.32, state: 'IN' },
  '018007': { name: 'Dearborn County, IN', lat: 39.06, lng: -84.97, state: 'IN' },
  '018053': { name: 'Floyd County, IN', lat: 38.21, lng: -85.64, state: 'IN' },
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