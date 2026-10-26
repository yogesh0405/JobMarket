/**
 * Global Map Configuration for Mobile Application
 * Uses OpenStreetMap Humanitarian (HOT) tiles - 100% free, high clarity,
 * full global coverage, CORS enabled, and NO watermark / NO API key required.
 */

export const MAP_TILE_LAYER_URL =
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION =
  '&copy; OpenStreetMap contributors, Tiles by Humanitarian OpenStreetMap Team';

export const FALLBACK_OSM_TILE_URL =
  'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
