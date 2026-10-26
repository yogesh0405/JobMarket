/**
 * Global Map Configuration for Web Application
 * Uses OpenStreetMap Humanitarian (HOT) tiles - 100% free, high clarity,
 * full global coverage, CORS enabled, and NO watermark / NO API key required.
 */

export const MAP_TILE_LAYER_URL =
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>';

export const FALLBACK_OSM_TILE_URL =
  'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
