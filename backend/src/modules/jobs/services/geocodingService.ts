import { extractCoordinatesFromText, isValidCoordinate } from '../../../utils/coordinateExtractor';

export interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  accuracy: 'EXACT' | 'POSTAL' | 'CITY' | 'APPROXIMATE';
  provider: 'EXTRACTOR' | 'CACHE' | 'NOMINATIM' | 'PHOTON' | 'NONE';
}

export interface IGeocodingProvider {
  name: string;
  geocode(address: string): Promise<{ latitude: number; longitude: number; accuracy: 'EXACT' | 'POSTAL' | 'CITY' | 'APPROXIMATE' } | null>;
}

// 1. Primary Free Provider: OpenStreetMap Nominatim
export class NominatimProvider implements IGeocodingProvider {
  name = 'NOMINATIM';
  private lastCallTimestamp = 0;

  async geocode(address: string) {
    try {
      // Respect Nominatim Usage Policy (max 1 request per second)
      const now = Date.now();
      const elapsed = now - this.lastCallTimestamp;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }
      this.lastCallTimestamp = Date.now();

      const encodedQuery = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CSNJobMarket/1.0 (contact@jobmarket.org)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) return null;

      const data = (await response.json()) as any[];
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (isValidCoordinate(lat, lon)) {
          let accuracy: 'EXACT' | 'POSTAL' | 'CITY' | 'APPROXIMATE' = 'APPROXIMATE';
          const type = item.type || item.class;
          if (type === 'building' || type === 'house' || type === 'amenity' || type === 'commercial') {
            accuracy = 'EXACT';
          } else if (type === 'postcode') {
            accuracy = 'POSTAL';
          } else if (type === 'city' || type === 'town' || type === 'village' || type === 'administrative') {
            accuracy = 'CITY';
          }

          return { latitude: lat, longitude: lon, accuracy };
        }
      }
      return null;
    } catch (error) {
      console.warn('[NominatimProvider] Geocoding error:', error);
      return null;
    }
  }
}

// 2. Secondary Free Fallback Provider: Komoot Photon
export class PhotonProvider implements IGeocodingProvider {
  name = 'PHOTON';

  async geocode(address: string) {
    try {
      const encodedQuery = encodeURIComponent(address);
      const url = `https://photon.komoot.io/api/?q=${encodedQuery}&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CSNJobMarket/1.0 (contact@jobmarket.org)'
        }
      });

      if (!response.ok) return null;

      const data = (await response.json()) as any;
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
          const lon = feature.geometry.coordinates[0];
          const lat = feature.geometry.coordinates[1];

          if (isValidCoordinate(lat, lon)) {
            return {
              latitude: lat,
              longitude: lon,
              accuracy: 'APPROXIMATE' as const
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('[PhotonProvider] Geocoding error:', error);
      return null;
    }
  }
}

// 3. Main Geocoding Service with Cache & Fallback Cascade
export class GeocodingService {
  private static cache = new Map<string, GeocodeResult>();
  private static nominatim = new NominatimProvider();
  private static photon = new PhotonProvider();

  public static async geocodeAddress(fullText: string): Promise<GeocodeResult> {
    if (!fullText || typeof fullText !== 'string' || fullText.trim().length === 0) {
      return { latitude: null, longitude: null, status: 'SKIPPED', accuracy: 'APPROXIMATE', provider: 'NONE' };
    }

    const cleanText = fullText.trim();
    const cacheKey = cleanText.toLowerCase();

    // Step A: Check In-Memory Cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Step B: Synchronous Coordinate Extractor (URL / Text / Known Locality)
    const extracted = extractCoordinatesFromText(cleanText);
    if (extracted) {
      const result: GeocodeResult = {
        latitude: extracted.latitude,
        longitude: extracted.longitude,
        status: 'SUCCESS',
        accuracy: extracted.accuracy,
        provider: 'EXTRACTOR'
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Step C: Try Primary Provider (Nominatim)
    const nomRes = await this.nominatim.geocode(cleanText);
    if (nomRes) {
      const result: GeocodeResult = {
        latitude: nomRes.latitude,
        longitude: nomRes.longitude,
        status: 'SUCCESS',
        accuracy: nomRes.accuracy,
        provider: 'NOMINATIM'
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Step D: Try Secondary Fallback Provider (Photon)
    const photonRes = await this.photon.geocode(cleanText);
    if (photonRes) {
      const result: GeocodeResult = {
        latitude: photonRes.latitude,
        longitude: photonRes.longitude,
        status: 'SUCCESS',
        accuracy: photonRes.accuracy,
        provider: 'PHOTON'
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Step E: Failed graceful result (does NOT crash or throw)
    const failedResult: GeocodeResult = {
      latitude: null,
      longitude: null,
      status: 'FAILED',
      accuracy: 'APPROXIMATE',
      provider: 'NONE'
    };
    return failedResult;
  }
}
