export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatSalary = (min?: number, max?: number): string => {
  if (!min && !max) return 'Not Disclosed';
  const format = (n: number) => {
    if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, '') + ' LPA';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  };
  if (min !== undefined && max !== undefined) return `₹${format(min)} - ₹${format(max)}`;
  if (min !== undefined) return `₹${format(min)}+`;
  return `Up to ₹${format(max || 0)}`;
};

export const timeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return 'Just now';
  const str = String(dateStr).trim();
  if (/^\d+[mhdws]\s+ago$/i.test(str) || str.toLowerCase() === 'just now') {
    return str;
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff <= 0 || diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const truncate = (text: string, len: number = 100): string => {
  if (!text || text.length <= len) return text;
  return text.substring(0, len) + '...';
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const titleCase = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

export const getInitials = (name: any): string => {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
};

export const getCompanyColor = (seed: string): string => {
  const colors = [
    '#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B',
    '#EF4444', '#EC4899', '#8B5CF6', '#0891B2', '#059669',
    '#D97706', '#DC2626', '#DB2777', '#6D28D9', '#0E7490'
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const openBase64InNewTab = (base64Data: string, mimeType: string, fileName: string) => {
  try {
    const base64Parts = base64Data.split(',');
    const base64WithoutHeader = base64Parts.length > 1 ? base64Parts[1] : base64Data;
    const actualMimeType = base64Parts.length > 1 ? base64Parts[0].split(';')[0].split(':')[1] : mimeType;

    const byteCharacters = atob(base64WithoutHeader);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: actualMimeType });
    const blobUrl = URL.createObjectURL(blob);
    
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.click();
    }
  } catch (err) {
    console.error('Error opening base64 document:', err);
  }
};

/**
 * Universal Clipboard Copy supporting HTTP IP address, non-secure context, and mobile devices
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard API failed, using fallback:', err);
  }

  // Fallback for non-HTTPS / IP network access / mobile webviews
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copyToClipboard failed:', err);
    return false;
  }
};

/**
 * Universal Share Helper supporting Web Share API + Clipboard Fallback
 */
export const shareContent = async (
  title: string,
  text: string,
  url: string,
  onCopySuccess?: () => void
): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err: any) {
      if (err && (err.name === 'AbortError' || err.code === 20)) {
        return; // User dismissed share modal cleanly
      }
      console.warn('Native share failed, trying clipboard fallback:', err);
    }
  }

  const copied = await copyToClipboard(url);
  if (copied && onCopySuccess) {
    onCopySuccess();
  }
};

export function safeJsonParse<T = any>(val: any, fallback: T = null as unknown as T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

