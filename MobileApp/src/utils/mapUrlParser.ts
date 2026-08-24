import { apiFetch } from '../api/client';

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

// Industrial hubs and major cities
export const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; address: string; isExact: boolean }> = {
  'waluj midc': { lat: 19.8512, lng: 75.2536, address: 'Waluj MIDC Industrial Area, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'waluj': { lat: 19.8512, lng: 75.2536, address: 'Waluj, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'shendra midc': { lat: 19.8661, lng: 75.4674, address: 'Shendra MIDC Industrial Park, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'shendra': { lat: 19.8661, lng: 75.4674, address: 'Shendra, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'chikalthana midc': { lat: 19.8797, lng: 75.3986, address: 'Chikalthana MIDC, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'chikalthana': { lat: 19.8797, lng: 75.3986, address: 'Chikalthana, Chhatrapati Sambhajinagar, Maharashtra', isExact: true },
  'chakan midc': { lat: 18.7606, lng: 73.8636, address: 'Chakan MIDC Industrial Area, Pune, Maharashtra', isExact: true },
  'chakan': { lat: 18.7606, lng: 73.8636, address: 'Chakan, Pune, Maharashtra', isExact: true },
  'bhosari midc': { lat: 18.6298, lng: 73.8478, address: 'Bhosari MIDC Industrial Area, Pune, Maharashtra', isExact: true },
  'bhosari': { lat: 18.6298, lng: 73.8478, address: 'Bhosari, Pune, Maharashtra', isExact: true },
  'talegaon midc': { lat: 18.7300, lng: 73.6756, address: 'Talegaon MIDC, Pune, Maharashtra', isExact: true },
  'talegaon': { lat: 18.7300, lng: 73.6756, address: 'Talegaon Dabhade, Pune, Maharashtra', isExact: true },
  'ranjangaon midc': { lat: 18.8472, lng: 74.2255, address: 'Ranjangaon MIDC Industrial Park, Pune, Maharashtra', isExact: true },
  'ranjangaon': { lat: 18.8472, lng: 74.2255, address: 'Ranjangaon, Pune, Maharashtra', isExact: true },
  'hinjewadi phase 1': { lat: 18.5912, lng: 73.7389, address: 'Hinjawadi Phase 1, Pune, Maharashtra', isExact: true },
  'hinjewadi phase 2': { lat: 18.5985, lng: 73.7258, address: 'Hinjawadi Phase 2, Pune, Maharashtra', isExact: true },
  'hinjewadi phase 3': { lat: 18.5936, lng: 73.7088, address: 'Hinjawadi Phase 3, Pune, Maharashtra', isExact: true },
  'hinjewadi': { lat: 18.5912, lng: 73.7389, address: 'Hinjawadi IT Park, Pune, Maharashtra', isExact: true },
  'hinjawadi': { lat: 18.5912, lng: 73.7389, address: 'Hinjawadi IT Park, Pune, Maharashtra', isExact: true },
  'taloja midc': { lat: 19.0531, lng: 73.1190, address: 'Taloja MIDC Industrial Estate, Navi Mumbai, Maharashtra', isExact: true },
  'taloja': { lat: 19.0531, lng: 73.1190, address: 'Taloja, Navi Mumbai, Maharashtra', isExact: true },
  'rabale midc': { lat: 19.1415, lng: 73.0039, address: 'Rabale MIDC, Navi Mumbai, Maharashtra', isExact: true },
  'rabale': { lat: 19.1415, lng: 73.0039, address: 'Rabale, Navi Mumbai, Maharashtra', isExact: true },
  'thane belapur': { lat: 19.1550, lng: 73.0010, address: 'Thane-Belapur Industrial Zone, Navi Mumbai, Maharashtra', isExact: true },
  'butibori midc': { lat: 20.9234, lng: 78.9863, address: 'Butibori MIDC, Nagpur, Maharashtra', isExact: true },
  'butibori': { lat: 20.9234, lng: 78.9863, address: 'Butibori, Nagpur, Maharashtra', isExact: true },
  'sinnar midc': { lat: 19.8458, lng: 73.9961, address: 'Sinnar MIDC, Nashik, Maharashtra', isExact: true },
  'sinnar': { lat: 19.8458, lng: 73.9961, address: 'Sinnar, Nashik, Maharashtra', isExact: true },
  'ambad midc': { lat: 19.9535, lng: 73.7431, address: 'Ambad MIDC, Nashik, Maharashtra', isExact: true },
  'ambad': { lat: 19.9535, lng: 73.7431, address: 'Ambad, Nashik, Maharashtra', isExact: true },
  'satpur midc': { lat: 19.9972, lng: 73.7381, address: 'Satpur MIDC, Nashik, Maharashtra', isExact: true },
  'satpur': { lat: 19.9972, lng: 73.7381, address: 'Satpur, Nashik, Maharashtra', isExact: true },
  'kurkumbh midc': { lat: 18.2831, lng: 74.5422, address: 'Kurkumbh MIDC, Daund, Maharashtra', isExact: true },
  'tarapur midc': { lat: 19.8055, lng: 72.7092, address: 'Tarapur MIDC, Boisar, Palghar, Maharashtra', isExact: true },
  'supa midc': { lat: 18.9664, lng: 74.4552, address: 'Supa MIDC, Ahmednagar, Maharashtra', isExact: true },
  'pimpri': { lat: 18.6298, lng: 73.7997, address: 'Pimpri, Pune, Maharashtra', isExact: true },
  'chinchwad': { lat: 18.6276, lng: 73.7831, address: 'Chinchwad, Pune, Maharashtra', isExact: true },
  'hadapsar': { lat: 18.5089, lng: 73.9260, address: 'Hadapsar Industrial Area, Pune, Maharashtra', isExact: true },
  'kharadi': { lat: 18.5515, lng: 73.9349, address: 'Kharadi, Pune, Maharashtra', isExact: true },
  'viman nagar': { lat: 18.5679, lng: 73.9143, address: 'Viman Nagar, Pune, Maharashtra', isExact: true },
  'baner': { lat: 18.5590, lng: 73.7868, address: 'Baner, Pune, Maharashtra', isExact: true },
  'wakad': { lat: 18.5987, lng: 73.7687, address: 'Wakad, Pune, Maharashtra', isExact: true },

  // Cities
  'pune': { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra', isExact: false },
  'mumbai': { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra', isExact: false },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, address: 'Navi Mumbai, Maharashtra', isExact: false },
  'thane': { lat: 19.2183, lng: 72.9781, address: 'Thane, Maharashtra', isExact: false },
  'aurangabad': { lat: 19.8762, lng: 75.3433, address: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra', isExact: false },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433, address: 'Chhatrapati Sambhajinagar, Maharashtra', isExact: false },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433, address: 'Chhatrapati Sambhajinagar, Maharashtra', isExact: false },
  'nashik': { lat: 20.0059, lng: 73.7898, address: 'Nashik, Maharashtra', isExact: false },
  'nagpur': { lat: 21.1458, lng: 79.0882, address: 'Nagpur, Maharashtra', isExact: false },
  'kolhapur': { lat: 16.7050, lng: 74.2433, address: 'Kolhapur, Maharashtra', isExact: false },
  'solapur': { lat: 17.6599, lng: 75.9064, address: 'Solapur, Maharashtra', isExact: false },
  'bengaluru': { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka', isExact: false },
  'bangalore': { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka', isExact: false },
  'hyderabad': { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana', isExact: false },
  'delhi': { lat: 28.6139, lng: 77.2090, address: 'Delhi NCR', isExact: false },
  'noida': { lat: 28.5355, lng: 77.3910, address: 'Noida, Uttar Pradesh', isExact: false },
  'gurugram': { lat: 28.4595, lng: 77.0266, address: 'Gurugram, Haryana', isExact: false },
  'chennai': { lat: 13.0827, lng: 80.2707, address: 'Chennai, Tamil Nadu', isExact: false },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat', isExact: false },
};

const SORTED_KEYS = [
  ...Object.keys(KNOWN_LOCATIONS).filter((k) => KNOWN_LOCATIONS[k].isExact).sort((a, b) => b.length - a.length),
  ...Object.keys(KNOWN_LOCATIONS).filter((k) => !KNOWN_LOCATIONS[k].isExact).sort((a, b) => b.length - a.length),
];

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

  // 6. Static map center staticmap?center=lat,lng
  const staticMapMatch = text.match(/staticmap\?center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
  if (staticMapMatch) {
    const lat = parseFloat(staticMapMatch[1]);
    const lng = parseFloat(staticMapMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 7. OpenStreetMap hash #map=15/19.8762/75.3433 or ?mlat=19.8762&mlon=75.3433
  const osmMatch = text.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 8. General coordinate pattern anywhere in string e.g. "18.458266, 73.846720" or "18.458266,73.846720"
  const looseMatch = text.match(/(-?\d{1,2}\.\d{3,15})\s*[,;\s]\s*\+?(-?\d{1,3}\.\d{3,15})/);
  if (looseMatch) {
    const lat = parseFloat(looseMatch[1]);
    const lng = parseFloat(looseMatch[2]);
    if (isValidLatLong(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 9. Known locality / industrial hub dictionary lookup matching
  const lowerText = text.toLowerCase();
  for (const key of SORTED_KEYS) {
    if (lowerText.includes(key)) {
      const entry = KNOWN_LOCATIONS[key];
      return {
        latitude: entry.lat,
        longitude: entry.lng,
        formattedAddress: entry.address,
      };
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'JobMarketMobile/1.0' },
    });
    clearTimeout(timeoutId);
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
    // Network fallback
  }
  return null;
}

/**
 * Resolves short URLs (like maps.app.goo.gl or goo.gl/maps) directly on device via redirect-follow, backend API, or client geocoder.
 */
export async function resolveShortMapUrl(
  shortUrl: string,
  cityFallback?: string,
  midcZoneFallback?: string
): Promise<ParsedCoordinates | null> {
  const trimmed = (shortUrl || '').trim();
  if (!trimmed) return null;

  // 1. Instant check if URL already has coordinates or matches industrial dictionary
  const directExtract = extractCoordinatesFromMapInput(trimmed);
  if (directExtract) return directExtract;

  // 2. Direct On-Device Redirect Follow (Works even if remote backend is unreachable)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(trimmed, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (response.url) {
        const urlCoords = extractCoordinatesFromMapInput(response.url);
        if (urlCoords) return urlCoords;
      }

      if (response.ok) {
        const html = await response.text();
        const htmlCoords = extractCoordinatesFromMapInput(html.slice(0, 35000));
        if (htmlCoords) return htmlCoords;
      }
    } catch (e) {
      // Proceed to backend or geocoder fallback
    }
  }

  // 3. Backend API Resolver
  try {
    const res = await apiFetch('/api/v1/jobs/resolve-map-url', {
      method: 'POST',
      body: JSON.stringify({
        url: trimmed,
        city: cityFallback,
        location: cityFallback,
        midcZone: midcZoneFallback,
      }),
    });

    if (res && res.success) {
      const lat = res.latitude ?? res.data?.latitude;
      const lng = res.longitude ?? res.data?.longitude;
      const address = res.formattedAddress ?? res.data?.formattedAddress;
      if (lat && lng && isValidLatLong(lat, lng)) {
        return {
          latitude: lat,
          longitude: lng,
          formattedAddress: address,
        };
      }
    }
  } catch (err) {
    // Proceed to local fallbacks
  }

  // 4. Fallback 1: Extract coordinates from fallback text directly
  if (cityFallback && cityFallback.trim()) {
    const fallbackCoords = extractCoordinatesFromMapInput(cityFallback);
    if (fallbackCoords) return fallbackCoords;
  }
  if (midcZoneFallback && midcZoneFallback.trim()) {
    const zoneCoords = extractCoordinatesFromMapInput(midcZoneFallback);
    if (zoneCoords) return zoneCoords;
  }

  // 5. Fallback 2: Geocode query on client
  const clientGeo = await geocodeQueryOnClient(trimmed);
  if (clientGeo) return clientGeo;

  if (cityFallback && cityFallback.trim()) {
    const cityGeo = await geocodeQueryOnClient(cityFallback);
    if (cityGeo) return cityGeo;
  }

  return null;
}
