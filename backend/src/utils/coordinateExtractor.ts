export interface ExtractedCoordinates {
  latitude: number;
  longitude: number;
  accuracy: 'EXACT' | 'POSTAL' | 'CITY' | 'APPROXIMATE';
  source: 'DIRECT_URL' | 'COORDINATE_TEXT' | 'KNOWN_LOCATION_LOOKUP';
}

// Comprehensive lookup dictionary for common Indian industrial hubs & cities used in job postings
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; accuracy: 'CITY' | 'POSTAL' | 'EXACT' }> = {
  'hinjewadi': { lat: 18.5912, lng: 73.7389, accuracy: 'EXACT' },
  'hinjewadi phase 1': { lat: 18.5912, lng: 73.7389, accuracy: 'EXACT' },
  'hinjewadi phase 2': { lat: 18.5985, lng: 73.7258, accuracy: 'EXACT' },
  'hinjewadi phase 3': { lat: 18.5936, lng: 73.7088, accuracy: 'EXACT' },
  'kharadi': { lat: 18.5515, lng: 73.9349, accuracy: 'EXACT' },
  'chakan': { lat: 18.7606, lng: 73.8636, accuracy: 'EXACT' },
  'bhosari': { lat: 18.6298, lng: 73.8478, accuracy: 'EXACT' },
  'hadapsar': { lat: 18.5089, lng: 73.9260, accuracy: 'EXACT' },
  'magarpatta': { lat: 18.5158, lng: 73.9272, accuracy: 'EXACT' },
  'viman nagar': { lat: 18.5679, lng: 73.9143, accuracy: 'EXACT' },
  'baner': { lat: 18.5590, lng: 73.7868, accuracy: 'EXACT' },
  'wakad': { lat: 18.5987, lng: 73.7687, accuracy: 'EXACT' },
  'pimpri': { lat: 18.6298, lng: 73.7997, accuracy: 'EXACT' },
  'chinchwad': { lat: 18.6276, lng: 73.7831, accuracy: 'EXACT' },
  'talegaon': { lat: 18.7300, lng: 73.6756, accuracy: 'EXACT' },
  'pune': { lat: 18.5204, lng: 73.8567, accuracy: 'CITY' },
  'mumbai': { lat: 19.0760, lng: 72.8777, accuracy: 'CITY' },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, accuracy: 'CITY' },
  'thane': { lat: 19.2183, lng: 72.9781, accuracy: 'CITY' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, accuracy: 'CITY' },
  'bangalore': { lat: 12.9716, lng: 77.5946, accuracy: 'CITY' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, accuracy: 'CITY' },
  'delhi': { lat: 28.6139, lng: 77.2090, accuracy: 'CITY' },
  'noida': { lat: 28.5355, lng: 77.3910, accuracy: 'CITY' },
  'gurugram': { lat: 28.4595, lng: 77.0266, accuracy: 'CITY' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, accuracy: 'CITY' },
  'chennai': { lat: 13.0827, lng: 80.2707, accuracy: 'CITY' },
  'kolkata': { lat: 22.5726, lng: 88.3639, accuracy: 'CITY' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, accuracy: 'CITY' },
  'nashik': { lat: 20.0059, lng: 73.7898, accuracy: 'CITY' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, accuracy: 'CITY' },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433, accuracy: 'CITY' },
  'waluj': { lat: 19.8512, lng: 75.2536, accuracy: 'EXACT' },
  'waluj midc': { lat: 19.8512, lng: 75.2536, accuracy: 'EXACT' },
  'ranjangaon': { lat: 18.8472, lng: 74.2255, accuracy: 'EXACT' },
  'ranjangaon midc': { lat: 18.8472, lng: 74.2255, accuracy: 'EXACT' },
  'taloja': { lat: 19.0531, lng: 73.1190, accuracy: 'EXACT' },
  'taloja midc': { lat: 19.0531, lng: 73.1190, accuracy: 'EXACT' },
  'butibori': { lat: 20.9234, lng: 78.9863, accuracy: 'EXACT' },
  'butibori midc': { lat: 20.9234, lng: 78.9863, accuracy: 'EXACT' },
  'shendra': { lat: 19.8661, lng: 75.4674, accuracy: 'EXACT' },
  'chikalthana': { lat: 19.8797, lng: 75.3986, accuracy: 'EXACT' },
  'kurkumbh': { lat: 18.2831, lng: 74.5422, accuracy: 'EXACT' },
  'tarapur': { lat: 19.8055, lng: 72.7092, accuracy: 'EXACT' },
  'supa': { lat: 18.9664, lng: 74.4552, accuracy: 'EXACT' },
  'sinnar': { lat: 19.8458, lng: 73.9961, accuracy: 'EXACT' },
  'ambad': { lat: 19.9535, lng: 73.7431, accuracy: 'EXACT' },
  'satpur': { lat: 19.9972, lng: 73.7381, accuracy: 'EXACT' },
  'nagpur': { lat: 21.1458, lng: 79.0882, accuracy: 'CITY' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, accuracy: 'CITY' },
  'solapur': { lat: 17.6599, lng: 75.9064, accuracy: 'CITY' }
};

/**
 * Fallback geocodes location text or city names via OpenStreetMap Nominatim when link parsing fails.
 */
export async function geocodeLocationText(query: string): Promise<ExtractedCoordinates | null> {
  if (!query || typeof query !== 'string') return null;
  const cleaned = query.replace(/https?:\/\/[^\s]+/g, '').replace(/[^\w\s,]/g, ' ').trim();
  if (!cleaned || cleaned.length < 2) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JobMarketApp/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (isValidCoordinate(lat, lon)) {
          return {
            latitude: lat,
            longitude: lon,
            accuracy: 'CITY',
            source: 'KNOWN_LOCATION_LOOKUP'
          };
        }
      }
    }
  } catch (err) {
    console.warn('Geocoding fallback failed:', err);
  }

  return null;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Extracts coordinates directly from text, URLs, embedded map tags, or known locality names.
 * Returns null if no direct coordinates or known localities are found.
 */
export function extractCoordinatesFromText(input: string): ExtractedCoordinates | null {
  if (!input || typeof input !== 'string') return null;

  const text = input.trim();

  // 1. Google Maps @lat,lng format e.g. @18.5204303,73.8567437,15z
  const matchAt = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 2. Maps path: search/lat,+lng or dir/lat,lng or place/lat,lng (e.g. /search/18.458266,+73.846720)
  const pathMatch = text.match(/(?:search|dir|place|maps)\/[^\/]*?(-?\d{1,2}\.\d+)\s*[,;\s]\s*\+?(-?\d{1,3}\.\d+)/i);
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lng = parseFloat(pathMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 3. Query param q=lat,lng or ll=lat,lng or query=lat,lng or center=lat,lng or destination=lat,lng
  const matchParam = text.match(/[?&](?:q|ll|query|center|destination|near)=(-?\d{1,2}\.\d+)(?:%2C|%20|[\s,+])\+?(-?\d{1,3}\.\d+)/i);
  if (matchParam) {
    const lat = parseFloat(matchParam[1]);
    const lng = parseFloat(matchParam[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 4. Data params !3d19.8762!4d75.3433 or !2d75.3433!3d19.8762
  const data3d4d = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (data3d4d) {
    const lat = parseFloat(data3d4d[1]);
    const lng = parseFloat(data3d4d[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }
  const data2d3d = text.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (data2d3d) {
    const lng = parseFloat(data2d3d[1]);
    const lat = parseFloat(data2d3d[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 5. OpenStreetMap #map=16/18.5204/73.8567 or ?mlat=18.5204&mlon=73.8567
  const matchOsmHash = text.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i);
  if (matchOsmHash) {
    const lat = parseFloat(matchOsmHash[1]);
    const lng = parseFloat(matchOsmHash[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  const matchOsmMlat = text.match(/[?&]mlat=(-?\d+\.\d+).*?[?&]mlon=(-?\d+\.\d+)/i);
  if (matchOsmMlat) {
    const lat = parseFloat(matchOsmMlat[1]);
    const lng = parseFloat(matchOsmMlat[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 6. Direct Raw Coordinate string e.g. "18.520430, 73.856743" or "18.5204, 73.8567"
  const looseMatch = text.match(/(-?\d{1,2}\.\d{3,15})\s*[,;\s]\s*\+?(-?\d{1,3}\.\d{3,15})/);
  if (looseMatch) {
    const lat = parseFloat(looseMatch[1]);
    const lng = parseFloat(looseMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'COORDINATE_TEXT' };
    }
  }

  // 7. Known locality / city lookup matching
  const lowerText = text.toLowerCase();
  for (const [key, value] of Object.entries(KNOWN_LOCATIONS)) {
    if (lowerText.includes(key)) {
      return {
        latitude: value.lat,
        longitude: value.lng,
        accuracy: value.accuracy,
        source: 'KNOWN_LOCATION_LOOKUP'
      };
    }
  }

  return null;
}
