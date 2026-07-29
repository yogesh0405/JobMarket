import { apiFetch } from './api';

export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extracts latitude and longitude from various Google Maps link formats or direct coordinate strings.
 */
export function extractCoordinatesFromMapInput(input: string): ParsedCoordinates | null {
  if (!input || typeof input !== 'string') return null;

  const text = input.trim();

  // 1. Standard Google Maps URL with @lat,lng format e.g. https://www.google.com/maps/place/.../@19.8762,75.3433,17z
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Query param q=lat,lng or ll=lat,lng or center=lat,lng or destination=lat,lng
  const paramMatch = text.match(/[?&](?:q|ll|query|center|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/i);
  if (paramMatch) {
    const lat = parseFloat(paramMatch[1]);
    const lng = parseFloat(paramMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Google Maps data parameters !3d19.8762!4d75.3433
  const dataMatch = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    const lat = parseFloat(dataMatch[1]);
    const lng = parseFloat(dataMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 4. Reverse data parameters !2d75.3433!3d19.8762
  const reverseDataMatch = text.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (reverseDataMatch) {
    const lng = parseFloat(reverseDataMatch[1]);
    const lat = parseFloat(reverseDataMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 5. OpenStreetMap hash #map=15/19.8762/75.3433
  const osmMatch = text.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 6. Direct coordinate string e.g. "19.8762, 75.3433" or "19.8762,75.3433"
  const rawMatch = text.match(/^(-?\d{1,2}\.\d+)\s*[,;\s]\s*(-?\d{1,3}\.\d+)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  return null;
}

function isValidLatLong(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}

/**
 * Resolves short URLs (like maps.app.goo.gl or goo.gl/maps) via backend API to get final coordinates.
 */
export async function resolveShortMapUrl(shortUrl: string): Promise<ParsedCoordinates | null> {
  try {
    const res = await apiFetch('/api/v1/jobs/resolve-map-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: shortUrl })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.latitude && json.longitude) {
        return {
          latitude: json.latitude,
          longitude: json.longitude
        };
      }
    }
  } catch (err) {
    console.warn('Failed to resolve short map URL:', err);
  }
  return null;
}
