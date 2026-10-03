/**
 * Global Map Configuration for Mobile Application
 * Uses CARTO Voyager tile layer with authenticated API key,
 * with automatic fallback to OpenStreetMap.
 */

export const CARTO_API_KEY =
  process.env.EXPO_PUBLIC_CARTO_API_KEY || 'cb1_487g_1_09b2acff1a2e8161e1d62095';

export const MAP_TILE_LAYER_URL = CARTO_API_KEY
  ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`
  : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION = CARTO_API_KEY
  ? '&copy; OpenStreetMap contributors &copy; CARTO'
  : '&copy; OpenStreetMap contributors';

export const FALLBACK_OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
