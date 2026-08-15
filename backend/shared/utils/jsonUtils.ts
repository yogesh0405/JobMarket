export function safeJsonParse<T>(data: any, fallback: T): T {
  if (data === null || data === undefined) return fallback;
  if (typeof data === 'object') return data as T;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return fallback;
  }
}
