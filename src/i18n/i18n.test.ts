import { describe, it, expect, beforeEach } from 'vitest';
import { getLocale, setLocale, t, subscribeLocale, getPokemonDisplayNames } from './index';

describe('i18n module', () => {
  beforeEach(() => {
    localStorage.clear();
    setLocale('zh-TW');
  });

  it('defaults to zh-TW', () => {
    expect(getLocale()).toBe('zh-TW');
    expect(t().common.battleSettings).toBe('對戰設定');
    expect(t().table.colDynamic).toBe('敵方實數');
    expect(t().drawer.modeDoublesBadge).toBe('雙打 3 基準');
    expect(t().drawer.modeSinglesBadge).toBe('單打 2 基準');
    expect(t().drawer.abilityNone).toBe('無 (1.0x)');
    expect(t().drawer.abilityProtoQuark).toContain('1.5x');
    expect(t().drawer.abilityWeather).toContain('2.0x');
  });

  it('switches to en and updates dictionary', () => {
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(t().common.battleSettings).toBe('Battle Settings');
    expect(t().table.colDynamic).toBe('Enemy Speed');
    expect(t().drawer.enemyBenchmarkTitle).toBe('Enemy Benchmark');
    expect(t().drawer.modeDoublesBadge).toBe('Doubles (3 Slots)');
    expect(t().drawer.modeSinglesBadge).toBe('Singles (2 Slots)');
    expect(t().drawer.abilityNone).toBe('None (1.0x)');
    expect(t().drawer.abilityProtoQuark).toContain('1.5x');
    expect(t().drawer.abilityWeather).toContain('2.0x');
  });

  it('notifies subscribers upon locale switch', () => {
    let receivedLocale = '';
    const unsubscribe = subscribeLocale((locale) => {
      receivedLocale = locale;
    });

    setLocale('en');
    expect(receivedLocale).toBe('en');

    unsubscribe();
    setLocale('zh-TW');
    expect(receivedLocale).toBe('en'); // Unsubscribed, should not receive zh-TW
  });

  it('provides correct Pokemon primary and secondary names based on locale', () => {
    const poke = { nameZh: '烈咬陸鯊', nameEn: 'Garchomp' };
    
    setLocale('zh-TW');
    expect(getPokemonDisplayNames(poke)).toEqual({
      primary: '烈咬陸鯊',
      secondary: 'Garchomp'
    });

    setLocale('en');
    expect(getPokemonDisplayNames(poke)).toEqual({
      primary: 'Garchomp',
      secondary: '烈咬陸鯊'
    });
  });

  it('synchronizes document lang, title, and meta description', () => {
    setLocale('zh-TW');
    expect(document.documentElement.lang).toBe('zh-TW');
    expect(document.title).toContain('PokéSpeed Champion');
    const metaZh = document.querySelector('meta[name="description"]');
    expect(metaZh?.getAttribute('content')).toContain('寶可夢速度計算器');

    setLocale('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toContain('Pokémon Speed Tier');
    const metaEn = document.querySelector('meta[name="description"]');
    expect(metaEn?.getAttribute('content')).toContain('Pokémon Speed Tier');
  });
});
