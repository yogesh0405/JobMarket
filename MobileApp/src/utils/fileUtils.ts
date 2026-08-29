import { API_BASE_URL } from '../api/client';

export interface ExtractedResume {
  url: string;
  name: string;
  size?: string;
  uploadedAt?: string;
  type?: string;
}

/**
 * Universal resolver for candidate resumes (S3 URLs, Cloudinary URLs, relative URLs, or JSON objects).
 */
export function resolveResumeUrl(rawUrl: any): string {
  if (!rawUrl) return '';

  let url = '';
  if (typeof rawUrl === 'string') {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        url = parsed.url || parsed.fileUrl || parsed.uri || parsed.path || '';
      } catch (_) {
        url = trimmed;
      }
    } else {
      url = trimmed;
    }
  } else if (typeof rawUrl === 'object' && rawUrl !== null) {
    url = rawUrl.url || rawUrl.fileUrl || rawUrl.uri || rawUrl.path || '';
  }

  if (!url || url === 'default_resume_url' || url === 'null' || url === 'undefined') {
    return '';
  }

  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

  // If local host, map to current base URL
  if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
    url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
  } else if (url.startsWith('/')) {
    url = `${baseUrl}${url}`;
  }

  return url;
}

/**
 * Universal extractor for candidate & employee resumes from any data structure.
 */
export function extractCandidateResume(source: any): ExtractedResume {
  if (!source) {
    return { url: '', name: 'Candidate_Resume.pdf' };
  }

  // Check possible root or nested properties
  const candidateUser = source.user || source.candidate || source;
  const raw =
    candidateUser.resume ||
    candidateUser.resume_url ||
    candidateUser.resumeUrl ||
    source.resume ||
    source.resume_url ||
    source.resumeUrl;

  if (!raw) {
    return { url: '', name: 'Candidate_Resume.pdf' };
  }

  let finalUrl = '';
  let finalName = candidateUser.resumeName || source.resumeName || 'Candidate_Resume.pdf';
  let finalSize = '1.0 MB';
  let finalUploadedAt = '';
  let finalType = 'application/pdf';

  if (typeof raw === 'object' && raw !== null) {
    finalUrl = raw.url || raw.fileUrl || raw.uri || raw.path || '';
    if (raw.name) finalName = raw.name;
    if (raw.size) finalSize = raw.size;
    if (raw.uploadedAt) finalUploadedAt = raw.uploadedAt;
    if (raw.type) finalType = raw.type;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          finalUrl = parsed.url || parsed.fileUrl || parsed.uri || parsed.path || '';
          if (parsed.name) finalName = parsed.name;
          if (parsed.size) finalSize = parsed.size;
          if (parsed.uploadedAt) finalUploadedAt = parsed.uploadedAt;
          if (parsed.type) finalType = parsed.type;
        }
      } catch (_) {
        finalUrl = trimmed;
      }
    } else {
      finalUrl = trimmed;
      // Extract file name from URL if possible
      try {
        const parts = trimmed.split('?')[0].split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          finalName = decodeURIComponent(lastPart);
        }
      } catch (_) {}
    }
  }

  const resolved = resolveResumeUrl(finalUrl);

  return {
    url: resolved,
    name: finalName,
    size: finalSize,
    uploadedAt: finalUploadedAt,
    type: finalType,
  };
}
