/**
 * Escapes HTML characters to prevent XSS injection.
 */
export function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') {
    return String(str ?? '');
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Clamps a number to a bounded range [min, max].
 * Falls back to defaultValue (or min) if value is NaN or not finite.
 */
export function clamp(val: number, min: number, max: number, defaultValue: number = min): number {
  if (!Number.isFinite(val)) {
    return defaultValue;
  }
  return Math.min(Math.max(val, min), max);
}

/**
 * Validates whether a URL starts with safe protocols (https:// or data:image/).
 * Returns the fallback if unsafe.
 */
export function sanitizeUrl(url: unknown, fallback: string): string {
  if (typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();
  // Safe protocols: https://, data:image/ or relative paths
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return trimmed;
  }
  return fallback;
}
