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
    expect(AppConfig.table.searchLimit).toBe(6);
    expect(AppConfig.table.adaptive.enabled).toBe(true);
    expect(AppConfig.table.adaptive.saveDataLimit).toBe(4);
    expect(AppConfig.table.adaptive.breakpoints.mobile).toBe(4);
    expect(AppConfig.table.adaptive.breakpoints.desktop).toBe(6);
    expect(AppConfig.table.adaptive.breakpoints.wide).toBe(8);

    expect(AppConfig.battle.defaultEvs).toBe(32);
    expect(AppConfig.battle.defaultNature).toBe(1.1);
    expect(AppConfig.battle.defaultLevel).toBe(50);
    expect(AppConfig.battle.defaultIv).toBe(31);

    expect(AppConfig.smogon.defaultCutoff).toBe(1500);
    expect(AppConfig.smogon.defaultDoublesPrefix).toBe('gen9championsvgc2026');
    expect(AppConfig.smogon.defaultSinglesPrefix).toBe('gen9championsbss');

    expect(AppConfig.ranking.unrankedRank).toBe(0);
  });

  it('should have valid season configuration in AppConfig', () => {
    expect(AppConfig.season).toBeDefined();
    expect(AppConfig.season.currentSeason).toBe('champion-m-b');
    expect(Array.isArray(AppConfig.season.availableSeasons)).toBe(true);
    expect(AppConfig.season.availableSeasons.length).toBeGreaterThanOrEqual(1);

    const current = AppConfig.season.availableSeasons.find(
      s => s.id === AppConfig.season.currentSeason
    );
    expect(current).toBeDefined();
    expect(current?.regulation).toBe('m-b');
    expect(current?.nameZh).toBeTruthy();
    expect(current?.nameEn).toBeTruthy();
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
