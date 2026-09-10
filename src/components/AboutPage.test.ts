import { describe, it, expect, beforeEach } from 'vitest';
import { parseMarkdownContent, renderAboutPage } from './AboutPage';
import { setLocale } from '../i18n';
import { aboutInfo } from '../data/aboutInfo';

describe('AboutPage & Markdown Parser', () => {
  beforeEach(() => {
    localStorage.clear();
    setLocale('zh-TW');
    window.location.hash = '#/about';
  });

  describe('parseMarkdownContent', () => {
    it('returns empty string for empty input', () => {
      expect(parseMarkdownContent('')).toBe('');
    });

    it('parses bold text correctly', () => {
      const html = parseMarkdownContent('This is **bold** text.');
      expect(html).toContain('<strong class="font-bold text-white">bold</strong>');
    });

    it('parses valid markdown links safely', () => {
      const html = parseMarkdownContent('Visit [Showdown](https://play.pokemonshowdown.com) now.');
      expect(html).toContain('<a href="https://play.pokemonshowdown.com" target="_blank" rel="noopener noreferrer"');
      expect(html).toContain('Showdown ↗</a>');
    });

    it('neutralizes malicious javascript: links', () => {
      const html = parseMarkdownContent('Click [evil](javascript:alert(1)) here');
      expect(html).not.toContain('javascript:alert');
      expect(html).toContain('href="#"');
    });

    it('escapes raw HTML to prevent XSS injection', () => {
      const html = parseMarkdownContent('<script>alert("xss")</script><img src=x onerror=alert(1)>');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;img');
    });

    it('handles multiple lines, empty lines, and paragraphs', () => {
      const html = parseMarkdownContent('Line 1\n\nLine 2');
      expect(html).toContain('<p class="leading-relaxed text-sm text-gray-300">Line 1</p>');
      expect(html).toContain('<div class="h-2"></div>');
      expect(html).toContain('<p class="leading-relaxed text-sm text-gray-300">Line 2</p>');
    });
  });

  describe('aboutInfo configuration data', () => {
    it('has valid blocks for zh-TW and en', () => {
      expect(Array.isArray(aboutInfo['zh-TW'])).toBe(true);
      expect(Array.isArray(aboutInfo['en'])).toBe(true);
      expect(aboutInfo['zh-TW'].length).toBeGreaterThan(0);
      expect(aboutInfo['en'].length).toBeGreaterThan(0);

      aboutInfo['zh-TW'].forEach(block => {
        expect(typeof block.content).toBe('string');
        expect(block.content.length).toBeGreaterThan(0);
      });

      aboutInfo['en'].forEach(block => {
        expect(typeof block.content).toBe('string');
        expect(block.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('renderAboutPage component', () => {
    it('renders cards and handles back navigation', () => {
      const container = document.createElement('div');
      const cleanup = renderAboutPage(container);

      expect(container.querySelector('#btn-back-to-table')).not.toBeNull();
      expect(container.querySelectorAll('article').length).toBe(aboutInfo['zh-TW'].length);

      // Check clicking back button changes hash to #/
      const backBtn = container.querySelector('#btn-back-to-table') as HTMLElement;
      backBtn.click();
      expect(window.location.hash).toBe('#/');

      // Check switching locale updates content
      setLocale('en');
      expect(container.textContent).toContain('About PokéSpeed');

      cleanup();
    });
  });
});
