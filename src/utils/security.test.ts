import { describe, it, expect } from 'vitest';
import { escapeHtml, clamp, sanitizeUrl } from './security';

describe('Security Utilities', () => {
  describe('escapeHtml', () => {
    it('escapes dangerous HTML special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      );
      expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
    });

    it('handles non-string or nullish values safely', () => {
      expect(escapeHtml(123)).toBe('123');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('clamp', () => {
    it('restricts values within the [min, max] range', () => {
      expect(clamp(35, 0, 32)).toBe(32);
      expect(clamp(-5, 0, 32)).toBe(0);
      expect(clamp(16, 0, 32)).toBe(16);
    });

    it('falls back to default value when encountering NaN or infinite', () => {
      expect(clamp(NaN, 0, 32, 32)).toBe(32);
      expect(clamp(Infinity, 0, 32, 0)).toBe(0);
    });
  });

  describe('sanitizeUrl', () => {
    it('allows safe https and data URLs', () => {
      expect(sanitizeUrl('https://example.com/sprite.png', '/fallback.png')).toBe(
        'https://example.com/sprite.png'
      );
      expect(sanitizeUrl('data:image/png;base64,123', '/fallback.png')).toBe(
        'data:image/png;base64,123'
      );
    });

    it('blocks dangerous javascript: or invalid protocols and returns fallback', () => {
      expect(sanitizeUrl('javascript:alert(1)', '/fallback.png')).toBe('/fallback.png');
      expect(sanitizeUrl('http://insecure.com', '/fallback.png')).toBe('/fallback.png');
      expect(sanitizeUrl('', '/fallback.png')).toBe('/fallback.png');
      expect(sanitizeUrl(null, '/fallback.png')).toBe('/fallback.png');
    });
  });
});
