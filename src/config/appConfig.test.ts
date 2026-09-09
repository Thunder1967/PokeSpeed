import { describe, it, expect, afterEach, vi } from 'vitest';
import { AppConfig, getAdaptiveSpriteLimit } from './appConfig';

describe('AppConfig & getAdaptiveSpriteLimit', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    vi.restoreAllMocks();
  });

  it('should have sensible defaults in AppConfig', () => {
    expect(AppConfig.table.defaultVisibleSprites).toBe(6);
    expect(AppConfig.table.adaptive.enabled).toBe(true);
    expect(AppConfig.table.adaptive.saveDataLimit).toBe(4);
    expect(AppConfig.table.adaptive.breakpoints.mobile).toBe(4);
    expect(AppConfig.table.adaptive.breakpoints.desktop).toBe(6);
    expect(AppConfig.table.adaptive.breakpoints.wide).toBe(8);
  });

  it('should return mobile limit (4) when window.innerWidth < 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
    expect(getAdaptiveSpriteLimit()).toBe(4);
  });

  it('should return desktop limit (6) when window.innerWidth is 1024', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    expect(getAdaptiveSpriteLimit()).toBe(6);
  });

  it('should return wide screen limit (8) when window.innerWidth >= 1440', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    expect(getAdaptiveSpriteLimit()).toBe(8);
  });

  it('should prioritize saveData limit (4) even on wide screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(global.navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    });

    expect(getAdaptiveSpriteLimit()).toBe(4);
  });

  it('should return defaultVisibleSprites if adaptive is disabled', () => {
    const customConfig = {
      ...AppConfig.table,
      defaultVisibleSprites: 10,
      adaptive: {
        ...AppConfig.table.adaptive,
        enabled: false,
      },
    };
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    expect(getAdaptiveSpriteLimit(customConfig)).toBe(10);
  });
});
