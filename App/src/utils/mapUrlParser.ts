import { apiFetch } from './api';

export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

/**
 * Validates latitude and longitude values.
 */
export function isValidLatLong(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}

const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'hinjewadi': { lat: 18.5912, lng: 73.7389 },
  'kharadi': { lat: 18.5515, lng: 73.9349 },
  'chakan': { lat: 18.7606, lng: 73.8636 },
  'bhosari': { lat: 18.6298, lng: 73.8478 },
  'hadapsar': { lat: 18.5089, lng: 73.9260 },
  'magarpatta': { lat: 18.5158, lng: 73.9272 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  'baner': { lat: 18.5590, lng: 73.7868 },
  'wakad': { lat: 18.5987, lng: 73.7687 },
  'pimpri': { lat: 18.6298, lng: 73.7997 },
  'chinchwad': { lat: 18.6276, lng: 73.7831 },
  'talegaon': { lat: 18.7300, lng: 73.6756 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'nashik': { lat: 20.0059, lng: 73.7898 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'waluj': { lat: 19.8512, lng: 75.2536 },
  'ranjangaon': { lat: 18.8472, lng: 74.2255 },
  'taloja': { lat: 19.0531, lng: 73.1190 },
  'butibori': { lat: 20.9234, lng: 78.9863 },
  'shendra': { lat: 19.8661, lng: 75.4674 },
  'chikalthana': { lat: 19.8797, lng: 75.3986 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'solapur': { lat: 17.6599, lng: 75.9064 }
};

/**
 * Extracts latitude and longitude from all Google Maps link formats, URL paths, query parameters, or direct coordinate strings.
 */
export function extractCoordinatesFromMapInput(input: string): ParsedCoordinates | null {
  if (!input || typeof input !== 'string') return null;

  const text = input.trim();

  // If text contains a URL, try extracting the clean URL first
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
  const toScan = urlMatch ? urlMatch[0] : text;

  // 1. Standard Google Maps @lat,lng format (e.g., https://www.google.com/maps/place/.../@19.8762,75.3433,17z)
  const atMatch = toScan.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Maps path format: search/lat,+lng or dir/lat,lng or place/lat,lng
  const pathMatch =
    toScan.match(/(?:search|dir|place|maps)\/[^\/]*?(-?\d{1,2}\.\d+)\s*[,;\s]\s*\+?(-?\d{1,3}\.\d+)/i) ||
    text.match(/(?:search|dir|place|maps)\/[^\/]*?(-?\d{1,2}\.\d+)\s*[,;\s]\s*\+?(-?\d{1,3}\.\d+)/i);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Query param q=lat,lng or ll=lat,lng or query=lat,lng or center=lat,lng or destination=lat,lng or daddr=lat,lng
  const paramMatch =
    toScan.match(/[?&](?:q|ll|query|center|destination|near|daddr|saddr)=(-?\d{1,2}\.\d+)(?:%2C|%20|[\s,+])\+?(-?\d{1,3}\.\d+)/i) ||
    text.match(/[?&](?:q|ll|query|center|destination|near|daddr|saddr)=(-?\d{1,2}\.\d+)(?:%2C|%20|[\s,+])\+?(-?\d{1,3}\.\d+)/i);
  if (paramMatch) {
    const lat = parseFloat(paramMatch[1]);
    const lng = parseFloat(paramMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 4. Data parameters !3d19.8762!4d75.3433
  const data3d4d = toScan.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (data3d4d) {
    const lat = parseFloat(data3d4d[1]);
    const lng = parseFloat(data3d4d[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 5. Reverse data parameters !2d75.3433!3d19.8762
  const data2d3d = toScan.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/) || text.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (data2d3d) {
    const lng = parseFloat(data2d3d[1]);
    const lat = parseFloat(data2d3d[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 6. Static map center staticmap?center=lat,lng
  const staticMapMatch =
    toScan.match(/staticmap\?center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i) ||
    text.match(/staticmap\?center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
  if (staticMapMatch) {
    const lat = parseFloat(staticMapMatch[1]);
    const lng = parseFloat(staticMapMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 7. OpenStreetMap hash #map=15/19.8762/75.3433 or ?mlat=19.8762&mlon=75.3433
  const osmMatch = toScan.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i) || text.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 8. General coordinate pattern anywhere in string e.g. "18.458266, 73.846720"
  const looseMatch = text.match(/(-?\d{1,2}\.\d{3,15})\s*[,;\s]\s*\+?(-?\d{1,3}\.\d{3,15})/);
  if (looseMatch) {
    const lat = parseFloat(looseMatch[1]);
    const lng = parseFloat(looseMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 9. Known locality / city lookup matching (only for address strings or non-short URLs)
  if (!text.includes('goo.gl') && !text.includes('maps.app')) {
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(KNOWN_LOCATIONS)) {
      if (lowerText.includes(key)) {
        return {
          latitude: value.lat,
          longitude: value.lng
        };
      }
    }
  }

  return null;
}

/**
 * Fallback geocoder using OpenStreetMap Nominatim directly on the client.
 */
export async function geocodeQueryOnClient(query: string): Promise<ParsedCoordinates | null> {
  if (!query || typeof query !== 'string') return null;
  const cleaned = query.replace(/https?:\/\/[^\s]+/g, '').replace(/[^\w\s,]/g, ' ').trim();
  if (!cleaned || cleaned.length < 2) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (isValidLatLong(lat, lon)) {
          return { latitude: lat, longitude: lon, formattedAddress: data[0].display_name };
        }
      }
    }
  } catch (err) {
    console.warn('Client geocoding fallback failed:', err);
  }
  return null;
}

/**
 * Resolves short URLs (like maps.app.goo.gl or goo.gl/maps) via backend API or client fallback to get final coordinates.
 */
export async function resolveShortMapUrl(
  shortUrl: string
): Promise<ParsedCoordinates | null> {
  const trimmed = (shortUrl || '').trim();
  if (!trimmed) return null;

  // Extract clean URL if embedded in text
  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  const targetUrl = urlMatch ? urlMatch[0] : trimmed;

  // 1. Direct coordinate check on target URL
  const directExtract = extractCoordinatesFromMapInput(targetUrl);
  if (directExtract) return directExtract;

  // 2. Direct Redirect Follow & HTML Inspector (in browser)
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Check response URL
      if (response.url && response.url !== targetUrl) {
        const urlCoords = extractCoordinatesFromMapInput(response.url);
        if (urlCoords) return urlCoords;

        const placeMatch = response.url.match(/\/place\/([^\/@?]+)/i);
        if (placeMatch && placeMatch[1]) {
          const placeQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          const placeGeo = await geocodeQueryOnClient(placeQuery);
          if (placeGeo) return placeGeo;
        }
      }

      if (response.ok) {
        const html = await response.text();

        // Check HTML coordinates
        const htmlCoords = extractCoordinatesFromMapInput(html.slice(0, 150000));
        if (htmlCoords) return htmlCoords;

        // Staticmap meta
        const staticMapMatch = html.match(/staticmap\?center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
        if (staticMapMatch) {
          const lat = parseFloat(staticMapMatch[1]);
          const lng = parseFloat(staticMapMatch[2]);
          if (isValidLatLong(lat, lng)) {
            return { latitude: lat, longitude: lng };
          }
        }

        // Embedded JSON coordinates
        const jsonMatch = html.match(/\[null,null,(-?\d{1,2}\.\d{4,12}),(-?\d{1,3}\.\d{4,12})\]/);
        if (jsonMatch) {
          const lat = parseFloat(jsonMatch[1]);
          const lng = parseFloat(jsonMatch[2]);
          if (isValidLatLong(lat, lng)) {
            return { latitude: lat, longitude: lng };
          }
        }

        // Meta title
        const titleMatch = html.match(/<title>([^<]+?)(?:\s*[-–]\s*Google Maps)?<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const placeName = titleMatch[1].replace(/Google Maps/gi, '').trim();
          if (placeName && placeName.length > 2) {
            const titleGeo = await geocodeQueryOnClient(placeName);
            if (titleGeo) return titleGeo;
          }
        }
      }
    } catch (_) {
      // Proceed to backend
    }
  }

  // 3. Backend API Resolver (clean URL only)
  try {
    const res = await apiFetch('/api/v1/jobs/resolve-map-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.latitude && json.longitude) {
        return {
          latitude: json.latitude,
          longitude: json.longitude,
          formattedAddress: json.formattedAddress
        };
      }
    }
  } catch (err) {
    console.warn('Failed to resolve short map URL via backend:', err);
  }

  // 4. Place query fallback
  const queryMatch = targetUrl.match(/[?&]q=([^&]+)/i) || targetUrl.match(/\/place\/([^\/@?]+)/i);
  if (queryMatch && queryMatch[1]) {
    const placeQuery = decodeURIComponent(queryMatch[1].replace(/\+/g, ' '));
    const queryGeo = await geocodeQueryOnClient(placeQuery);
    if (queryGeo) return queryGeo;
  }

  return null;
}
