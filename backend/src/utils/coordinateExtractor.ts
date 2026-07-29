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
  'nagpur': { lat: 21.1458, lng: 79.0882, accuracy: 'CITY' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, accuracy: 'CITY' },
  'solapur': { lat: 17.6599, lng: 75.9064, accuracy: 'CITY' }
};

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

  // 1. Google Maps / OSM URL Regex patterns
  // Example: @18.5204303,73.8567437,15z
  const gmapsAtPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const matchAt = text.match(gmapsAtPattern);
  if (matchAt) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // Example: q=18.5204,73.8567 or ll=18.5204,73.8567 or query=18.5204,73.8567
  const paramPattern = /[?&](?:q|ll|query|center|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/i;
  const matchParam = text.match(paramPattern);
  if (matchParam) {
    const lat = parseFloat(matchParam[1]);
    const lng = parseFloat(matchParam[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // Example: OpenStreetMap #map=16/18.5204/73.8567 or ?mlat=18.5204&mlon=73.8567
  const osmHashPattern = /#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/i;
  const matchOsmHash = text.match(osmHashPattern);
  if (matchOsmHash) {
    const lat = parseFloat(matchOsmHash[1]);
    const lng = parseFloat(matchOsmHash[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  const osmMlatPattern = /[?&]mlat=(-?\d+\.\d+).*?[?&]mlon=(-?\d+\.\d+)/i;
  const matchOsmMlat = text.match(osmMlatPattern);
  if (matchOsmMlat) {
    const lat = parseFloat(matchOsmMlat[1]);
    const lng = parseFloat(matchOsmMlat[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'DIRECT_URL' };
    }
  }

  // 2. Direct Raw Coordinate string e.g. "18.520430, 73.856743" or "Lat: 18.52, Lng: 73.85"
  const rawCoordPattern = /(?:lat(?:itude)?[:\s]*)?(-?\d{1,2}\.\d+)\s*[,;\s]\s*(?:lng|long(?:itude)?[:\s]*)?(-?\d{1,3}\.\d+)/i;
  const matchRaw = text.match(rawCoordPattern);
  if (matchRaw) {
    const lat = parseFloat(matchRaw[1]);
    const lng = parseFloat(matchRaw[2]);
    if (isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, accuracy: 'EXACT', source: 'COORDINATE_TEXT' };
    }
  }

  // 3. Known locality / city lookup matching
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
