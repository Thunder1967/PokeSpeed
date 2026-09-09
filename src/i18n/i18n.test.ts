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
  });

  it('switches to en and updates dictionary', () => {
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(t().common.battleSettings).toBe('Battle Settings');
    expect(t().table.colDynamic).toBe('Enemy Speed');
    expect(t().drawer.enemyBenchmarkTitle).toBe('Enemy Benchmark');
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
});
