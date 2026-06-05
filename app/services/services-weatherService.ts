// services/weatherService.ts

import { AlertResponse} from "@/app/types/types-alert";

const API_BASE = 'https://api.weather.gov/alerts/active';

export async function fetchAlerts(area: string = 'IL'): Promise<AlertResponse> {
  try {
    const response = await fetch(`${API_BASE}?area=${area}`, {
      next: { revalidate: 60 } // Revalidate cada 60 segundos
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    // Retornar respuesta vacía en caso de error
    return {
      type: 'FeatureCollection',
      features: [],
      updated: new Date().toISOString()
    };
  }
}

export function getLastUpdateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutos

  if (diff < 60) {
    return `${diff}m ago`;
  }
  const hours = Math.floor(diff / 60);
  return `${hours}h ago`;
}
