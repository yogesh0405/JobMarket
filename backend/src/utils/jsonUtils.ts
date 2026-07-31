/**
 * Safely parse JSON strings with fallbacks to avoid throwing SyntaxErrors on empty or invalid inputs.
 */
export function safeJsonParse<T = any>(val: any, fallback: T = null as unknown as T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return fallback;
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    return fallback;
  }
}
