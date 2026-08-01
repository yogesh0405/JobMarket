import { apiFetch } from './api';

export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Validates latitude and longitude values.
 */
export function isValidLatLong(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}

/**
 * Extracts latitude and longitude from all Google Maps link formats, URL paths, query parameters, or direct coordinate strings.
 */
export function extractCoordinatesFromMapInput(input: string): ParsedCoordinates | null {
  if (!input || typeof input !== 'string') return null;

  const text = input.trim();

  // 1. Standard Google Maps @lat,lng format (e.g., https://www.google.com/maps/place/.../@19.8762,75.3433,17z)
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Maps path format: search/lat,+lng or dir/lat,lng or place/lat,lng (e.g. /search/18.458266,+73.846720)
  const pathMatch = text.match(/(?:search|dir|place|maps)\/[^\/]*?(-?\d{1,2}\.\d+)\s*[,;\s]\s*\+?(-?\d{1,3}\.\d+)/i);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Query param q=lat,lng or ll=lat,lng or center=lat,lng or query=lat,lng or destination=lat,lng
  const paramMatch = text.match(/[?&](?:q|ll|query|center|destination|near)=(-?\d{1,2}\.\d+)(?:%2C|%20|[\s,+])\+?(-?\d{1,3}\.\d+)/i);
  if (paramMatch) {
    const lat = parseFloat(paramMatch[1]);
    const lng = parseFloat(paramMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 4. Data parameters !3d19.8762!4d75.3433
  const data3d4d = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (data3d4d) {
    const lat = parseFloat(data3d4d[1]);
    const lng = parseFloat(data3d4d[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 5. Reverse data parameters !2d75.3433!3d19.8762
  const data2d3d = text.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (data2d3d) {
    const lng = parseFloat(data2d3d[1]);
    const lat = parseFloat(data2d3d[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 6. OpenStreetMap hash #map=15/19.8762/75.3433 or ?mlat=19.8762&mlon=75.3433
  const osmMatch = text.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 7. General coordinate pattern anywhere in string e.g. "18.458266, 73.846720" or "18.458266,73.846720"
  const looseMatch = text.match(/(-?\d{1,2}\.\d{3,15})\s*[,;\s]\s*\+?(-?\d{1,3}\.\d{3,15})/);
  if (looseMatch) {
    const lat = parseFloat(looseMatch[1]);
    const lng = parseFloat(looseMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  return null;
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
