export interface ExtractedCoordinates {
  latitude: number;
  longitude: number;
  accuracy: 'EXACT' | 'POSTAL' | 'CITY' | 'APPROXIMATE';
  source: 'DIRECT_URL' | 'COORDINATE_TEXT' | 'KNOWN_LOCATION_LOOKUP';
  formattedAddress?: string;
}

// Comprehensive lookup dictionary for common Indian industrial hubs & cities
export const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; accuracy: 'CITY' | 'POSTAL' | 'EXACT'; address: string }> = {
  'waluj midc': { lat: 19.8512, lng: 75.2536, accuracy: 'EXACT', address: 'Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra' },
  'waluj': { lat: 19.8512, lng: 75.2536, accuracy: 'EXACT', address: 'Waluj, Chhatrapati Sambhajinagar, Maharashtra' },
  'shendra midc': { lat: 19.8661, lng: 75.4674, accuracy: 'EXACT', address: 'Shendra MIDC, Chhatrapati Sambhajinagar, Maharashtra' },
  'shendra': { lat: 19.8661, lng: 75.4674, accuracy: 'EXACT', address: 'Shendra, Chhatrapati Sambhajinagar, Maharashtra' },
  'chikalthana midc': { lat: 19.8797, lng: 75.3986, accuracy: 'EXACT', address: 'Chikalthana MIDC, Chhatrapati Sambhajinagar, Maharashtra' },
  'chikalthana': { lat: 19.8797, lng: 75.3986, accuracy: 'EXACT', address: 'Chikalthana, Chhatrapati Sambhajinagar, Maharashtra' },
  'chakan midc': { lat: 18.7606, lng: 73.8636, accuracy: 'EXACT', address: 'Chakan MIDC Industrial Area, Pune, Maharashtra' },
  'chakan': { lat: 18.7606, lng: 73.8636, accuracy: 'EXACT', address: 'Chakan, Pune, Maharashtra' },
  'bhosari midc': { lat: 18.6298, lng: 73.8478, accuracy: 'EXACT', address: 'Bhosari MIDC Industrial Zone, Pune, Maharashtra' },
  'bhosari': { lat: 18.6298, lng: 73.8478, accuracy: 'EXACT', address: 'Bhosari, Pune, Maharashtra' },
  'talegaon midc': { lat: 18.7300, lng: 73.6756, accuracy: 'EXACT', address: 'Talegaon MIDC, Pune, Maharashtra' },
  'talegaon': { lat: 18.7300, lng: 73.6756, accuracy: 'EXACT', address: 'Talegaon Dabhade, Pune, Maharashtra' },
  'ranjangaon midc': { lat: 18.8472, lng: 74.2255, accuracy: 'EXACT', address: 'Ranjangaon MIDC Industrial Park, Pune, Maharashtra' },
  'ranjangaon': { lat: 18.8472, lng: 74.2255, accuracy: 'EXACT', address: 'Ranjangaon, Pune, Maharashtra' },
  'hinjewadi phase 1': { lat: 18.5912, lng: 73.7389, accuracy: 'EXACT', address: 'Hinjawadi Phase 1, Pune, Maharashtra' },
  'hinjewadi phase 2': { lat: 18.5985, lng: 73.7258, accuracy: 'EXACT', address: 'Hinjawadi Phase 2, Pune, Maharashtra' },
  'hinjewadi phase 3': { lat: 18.5936, lng: 73.7088, accuracy: 'EXACT', address: 'Hinjawadi Phase 3, Pune, Maharashtra' },
  'hinjewadi': { lat: 18.5912, lng: 73.7389, accuracy: 'EXACT', address: 'Hinjawadi IT Park, Pune, Maharashtra' },
  'hinjawadi': { lat: 18.5912, lng: 73.7389, accuracy: 'EXACT', address: 'Hinjawadi IT Park, Pune, Maharashtra' },
  'taloja midc': { lat: 19.0531, lng: 73.1190, accuracy: 'EXACT', address: 'Taloja MIDC Industrial Estate, Navi Mumbai, Maharashtra' },
  'taloja': { lat: 19.0531, lng: 73.1190, accuracy: 'EXACT', address: 'Taloja, Navi Mumbai, Maharashtra' },
  'rabale midc': { lat: 19.1415, lng: 73.0039, accuracy: 'EXACT', address: 'Rabale MIDC, Navi Mumbai, Maharashtra' },
  'rabale': { lat: 19.1415, lng: 73.0039, accuracy: 'EXACT', address: 'Rabale, Navi Mumbai, Maharashtra' },
  'thane belapur': { lat: 19.1550, lng: 73.0010, accuracy: 'EXACT', address: 'Thane-Belapur Industrial Zone, Navi Mumbai, Maharashtra' },
  'butibori midc': { lat: 20.9234, lng: 78.9863, accuracy: 'EXACT', address: 'Butibori MIDC, Nagpur, Maharashtra' },
  'butibori': { lat: 20.9234, lng: 78.9863, accuracy: 'EXACT', address: 'Butibori, Nagpur, Maharashtra' },
  'sinnar midc': { lat: 19.8458, lng: 73.9961, accuracy: 'EXACT', address: 'Sinnar MIDC, Nashik, Maharashtra' },
  'sinnar': { lat: 19.8458, lng: 73.9961, accuracy: 'EXACT', address: 'Sinnar, Nashik, Maharashtra' },
  'ambad midc': { lat: 19.9535, lng: 73.7431, accuracy: 'EXACT', address: 'Ambad MIDC, Nashik, Maharashtra' },
  'ambad': { lat: 19.9535, lng: 73.7431, accuracy: 'EXACT', address: 'Ambad, Nashik, Maharashtra' },
  'satpur midc': { lat: 19.9972, lng: 73.7381, accuracy: 'EXACT', address: 'Satpur MIDC, Nashik, Maharashtra' },
  'satpur': { lat: 19.9972, lng: 73.7381, accuracy: 'EXACT', address: 'Satpur, Nashik, Maharashtra' },
  'kurkumbh midc': { lat: 18.2831, lng: 74.5422, accuracy: 'EXACT', address: 'Kurkumbh MIDC, Daund, Maharashtra' },
  'tarapur midc': { lat: 19.8055, lng: 72.7092, accuracy: 'EXACT', address: 'Tarapur MIDC, Boisar, Palghar, Maharashtra' },
  'supa midc': { lat: 18.9664, lng: 74.4552, accuracy: 'EXACT', address: 'Supa MIDC, Ahmednagar, Maharashtra' },
  'pimpri': { lat: 18.6298, lng: 73.7997, accuracy: 'EXACT', address: 'Pimpri, Pune, Maharashtra' },
  'chinchwad': { lat: 18.6276, lng: 73.7831, accuracy: 'EXACT', address: 'Chinchwad, Pune, Maharashtra' },
  'hadapsar': { lat: 18.5089, lng: 73.9260, accuracy: 'EXACT', address: 'Hadapsar Industrial Area, Pune, Maharashtra' },
  'kharadi': { lat: 18.5515, lng: 73.9349, accuracy: 'EXACT', address: 'Kharadi, Pune, Maharashtra' },
  'viman nagar': { lat: 18.5679, lng: 73.9143, accuracy: 'EXACT', address: 'Viman Nagar, Pune, Maharashtra' },
  'baner': { lat: 18.5590, lng: 73.7868, accuracy: 'EXACT', address: 'Baner, Pune, Maharashtra' },
  'wakad': { lat: 18.5987, lng: 73.7687, accuracy: 'EXACT', address: 'Wakad, Pune, Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, accuracy: 'CITY', address: 'Pune, Maharashtra' },
  'mumbai': { lat: 19.0760, lng: 72.8777, accuracy: 'CITY', address: 'Mumbai, Maharashtra' },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, accuracy: 'CITY', address: 'Navi Mumbai, Maharashtra' },
  'thane': { lat: 19.2183, lng: 72.9781, accuracy: 'CITY', address: 'Thane, Maharashtra' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, accuracy: 'CITY', address: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra' },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433, accuracy: 'CITY', address: 'Chhatrapati Sambhajinagar, Maharashtra' },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433, accuracy: 'CITY', address: 'Chhatrapati Sambhajinagar, Maharashtra' },
  'nashik': { lat: 20.0059, lng: 73.7898, accuracy: 'CITY', address: 'Nashik, Maharashtra' },
  'nagpur': { lat: 21.1458, lng: 79.0882, accuracy: 'CITY', address: 'Nagpur, Maharashtra' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, accuracy: 'CITY', address: 'Kolhapur, Maharashtra' },
  'solapur': { lat: 17.6599, lng: 75.9064, accuracy: 'CITY', address: 'Solapur, Maharashtra' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, accuracy: 'CITY', address: 'Bengaluru, Karnataka' },
  'bangalore': { lat: 12.9716, lng: 77.5946, accuracy: 'CITY', address: 'Bengaluru, Karnataka' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, accuracy: 'CITY', address: 'Hyderabad, Telangana' },
  'delhi': { lat: 28.6139, lng: 77.2090, accuracy: 'CITY', address: 'Delhi NCR' },
  'noida': { lat: 28.5355, lng: 77.3910, accuracy: 'CITY', address: 'Noida, Uttar Pradesh' },
  'gurugram': { lat: 28.4595, lng: 77.0266, accuracy: 'CITY', address: 'Gurugram, Haryana' },
  'chennai': { lat: 13.0827, lng: 80.2707, accuracy: 'CITY', address: 'Chennai, Tamil Nadu' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, accuracy: 'CITY', address: 'Ahmedabad, Gujarat' },
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

// Prioritize EXACT industrial/locality matches first (sorted by length), then CITY matches
const PRIORITIZED_KEYS = [
  ...Object.keys(KNOWN_LOCATIONS)
    .filter((k) => KNOWN_LOCATIONS[k].accuracy === 'EXACT')
    .sort((a, b) => b.length - a.length),
  ...Object.keys(KNOWN_LOCATIONS)
    .filter((k) => KNOWN_LOCATIONS[k].accuracy !== 'EXACT')
    .sort((a, b) => b.length - a.length),
];

/**
 * Extracts coordinates immediately (<1ms) from text or URL with regex patterns and dictionary lookups.
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

  // 2. Maps path: search/lat,+lng or dir/lat,lng or place/lat,lng
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

  // 7. Prioritized Known locality / MIDC / city lookup matching
  const lowerText = text.toLowerCase();
  for (const key of PRIORITIZED_KEYS) {
    if (lowerText.includes(key)) {
      const entry = KNOWN_LOCATIONS[key];
      return {
        latitude: entry.lat,
        longitude: entry.lng,
        accuracy: entry.accuracy,
        source: 'KNOWN_LOCATION_LOOKUP',
        formattedAddress: entry.address,
      };
    }
  }

  return null;
}
