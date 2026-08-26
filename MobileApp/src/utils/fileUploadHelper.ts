// ─────────────────────────────────────────────────────────────────────────────
// File Upload & Base64 Converter Utility for MobileApp (Native Expo FileSystem)
// ─────────────────────────────────────────────────────────────────────────────
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { File } from 'expo-file-system';

/**
 * Helper to convert Uint8Array / ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let binary = '';
  // Chunking to avoid call stack overflow on large files
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  // Fallback if btoa is not available
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < len) {
    const b0 = bytes[i++];
    const b1 = i < len ? bytes[i++] : 0;
    const b2 = i < len ? bytes[i++] : 0;
    const n = (b0 << 16) | (b1 << 8) | b2;
    result += chars[(n >> 18) & 63];
    result += chars[(n >> 12) & 63];
    result += i - 1 < len ? chars[(n >> 6) & 63] : '=';
    result += i < len ? chars[n & 63] : '=';
  }
  return result;
}

/**
 * Checks if a given URL string is a valid remote web URL (starts with http:// or https://)
 */
export function isRemoteHttpUrl(url: any): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Determine MIME type based on file extension or fallback
 */
export function getMimeType(fileNameOrUri: string, defaultMime = 'application/pdf'): string {
  if (!fileNameOrUri || typeof fileNameOrUri !== 'string') return defaultMime;
  const lower = fileNameOrUri.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return defaultMime;
}

/**
 * Converts any local file URI (file://, content://) or base64 into a valid base64 data URI (data:...;base64,...).
 * Uses native expo-file-system/legacy and modern File API for robust conversion on Android and iOS.
 */
export async function uriToDataUri(
  uri: string,
  mimeType?: string,
  fileName?: string
): Promise<string> {
  if (!uri || typeof uri !== 'string') {
    throw new Error('Invalid file URI provided for upload.');
  }

  // Already a valid base64 data URL
  if (uri.startsWith('data:')) {
    return uri;
  }

  const determinedMime = mimeType || getMimeType(fileName || uri, 'application/pdf');

  // Strategy 1: expo-file-system/legacy (Official recommended legacy export for readAsStringAsync in SDK 52/54)
  try {
    if (typeof FileSystemLegacy.readAsStringAsync === 'function') {
      const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });
      if (base64 && typeof base64 === 'string' && base64.length > 0) {
        return `data:${determinedMime};base64,${base64}`;
      }
    }
  } catch (fsErr) {
    console.warn('FileSystemLegacy read notice:', fsErr);
  }

  // Strategy 2: Modern Expo SDK 54 File API (arrayBuffer -> base64)
  try {
    if (typeof File === 'function') {
      const fileObj = new File(uri);
      if (typeof fileObj.arrayBuffer === 'function') {
        const buf = await fileObj.arrayBuffer();
        if (buf && buf.byteLength > 0) {
          const b64 = arrayBufferToBase64(buf);
          if (b64) {
            return `data:${determinedMime};base64,${b64}`;
          }
        }
      }
    }
  } catch (fileApiErr) {
    console.warn('Expo File API notice:', fileApiErr);
  }

  // Strategy 3: fetch ArrayBuffer fallback (React Native native fetch)
  try {
    const response = await fetch(uri);
    const buf = await response.arrayBuffer();
    if (buf && buf.byteLength > 0) {
      const b64 = arrayBufferToBase64(buf);
      if (b64) {
        return `data:${determinedMime};base64,${b64}`;
      }
    }
  } catch (fetchErr) {
    console.warn('Fetch ArrayBuffer notice:', fetchErr);
  }

  throw new Error(`Could not read local file URI for upload: ${uri}`);
}
