// utils/constants.ts - COMPLETO CON ZIP CODES

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

  // ============ INDIANA COUNTIES ============
  '018095': { name: 'Posey County, IN', lat: 38.12, lng: -87.73, state: 'IN' },
  '018127': { name: 'Vanderburgh County, IN', lat: 37.97, lng: -87.55, state: 'IN' },
  '018163': { name: 'Warrick County, IN', lat: 38.24, lng: -87.32, state: 'IN' },
  '018007': { name: 'Dearborn County, IN', lat: 39.06, lng: -84.97, state: 'IN' },
  '018053': { name: 'Floyd County, IN', lat: 38.21, lng: -85.64, state: 'IN' },
};

// ZIP CODES Y DIRECCIONES POR CONDADO
export const COUNTY_ZIP_CODES: Record<string, { zips: string; address: string }> = {
  // Illinois
  '017031': { zips: '60601-60699', address: 'Chicago, IL 60601' },
  '017097': { zips: '60001-60099', address: 'Highland Park, IL 60035' },
  '017111': { zips: '60010-60099', address: 'Crystal Lake, IL 60014' },
  '017089': { zips: '60103-60199', address: 'Aurora, IL 60504' },
  '017043': { zips: '60101-60199', address: 'Wheaton, IL 60187' },
  '017093': { zips: '60417-60499', address: 'Joliet, IL 60432' },
  '017063': { zips: '60441-60499', address: 'Morris, IL 60450' },
  '017197': { zips: '60426-60499', address: 'Wilmington, IL 60481' },
  '017099': { zips: '61701-61799', address: 'Bloomington, IL 61701' },
  '017157': { zips: '61520-61599', address: 'Pekin, IL 61554' },
  '017077': { zips: '61330-61399', address: 'Lewistown, IL 61542' },
  '017055': { zips: '60914-60999', address: 'Gilman, IL 60938' },
  '017179': { zips: '62995-62999', address: 'Nashville, IL 62263' },
  '017133': { zips: '62895-62899', address: 'Du Quoin, IL 62832' },
  '017201': { zips: '62968-62999', address: 'Marion, IL 62959' },
  '017059': { zips: '62938-62999', address: 'Shawneetown, IL 62984' },
  '017069': { zips: '62821-62899', address: 'Elizabethtown, IL 62931' },

  // Wisconsin
  '055079': { zips: '53703-53799', address: 'Madison, WI 53703' },
  '055025': { zips: '53201-53299', address: 'Milwaukee, WI 53201' },
  '055087': { zips: '54701-54799', address: 'Eau Claire, WI 54701' },
  '055013': { zips: '54729-54799', address: 'Chippewa Falls, WI 54729' },
  '055011': { zips: '54401-54499', address: 'Neillsville, WI 54456' },
  '055039': { zips: '54703-54799', address: 'Menomonie, WI 54751' },
  '055055': { zips: '53934-53999', address: 'Jefferson, WI 53549' },
  '055059': { zips: '53140-53199', address: 'Kenosha, WI 53140' },
  '055063': { zips: '54601-54699', address: 'La Crosse, WI 54601' },
  '055067': { zips: '54520-54599', address: 'Antigo, WI 54409' },
  '055089': { zips: '54536-54599', address: 'Florence, WI 54121' },
  '055099': { zips: '54948-54999', address: 'Green Lake, WI 54941' },

  // Kentucky
  '021061': { zips: '41011-41099', address: 'Warsaw, KY 41095' },
  '021087': { zips: '40109-40199', address: 'Elizabethtown, KY 42701' },
  '021041': { zips: '41214-41299', address: 'Marion, KY 42064' },
  '021025': { zips: '42401-42499', address: 'Morganfield, KY 42437' },
  '021179': { zips: '40314-40399', address: 'Falmouth, KY 41040' },
  '021015': { zips: '40303-40399', address: 'Paris, KY 40361' },
  '021049': { zips: '40601-40699', address: 'Frankfort, KY 40601' },
  '021067': { zips: '41048-41099', address: 'Williamstown, KY 41097' },
  '021111': { zips: '40201-40299', address: 'Louisville, KY 40201' },
  '021151': { zips: '40346-40399', address: 'Lebanon, KY 40033' },
  '021175': { zips: '40359-40399', address: 'Owenton, KY 40359' },
  '021185': { zips: '41360-41399', address: 'Mount Olivet, KY 41064' },
  '021055': { zips: '41435-41499', address: 'Irvine, KY 40336' },
  '021225': { zips: '40701-40799', address: 'Williamsburg, KY 40769' },

  // Indiana
  '018095': { zips: '47659-47699', address: 'Mount Vernon, IN 47620' },
  '018127': { zips: '47701-47799', address: 'Evansville, IN 47701' },
  '018163': { zips: '47589-47699', address: 'Boonville, IN 47601' },
  '018007': { zips: '47012-47099', address: 'Lawrenceburg, IN 47025' },
  '018053': { zips: '47119-47199', address: 'New Albany, IN 47150' },
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