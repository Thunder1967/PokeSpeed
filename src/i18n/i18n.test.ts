import { describe, it, expect, beforeEach } from 'vitest';
import { getLocale, setLocale, toggleLocale, t, subscribeLocale } from './index';
import { zhTW } from './locales/zh-TW';
import { en } from './locales/en';
import { formatNature, formatSlotBuffs, formatSlotTooltip } from '../utils/pinDividerCalc';
import { SlotState } from '../types/pokemon';

describe('i18n core system', () => {
  beforeEach(() => {
    localStorage.clear();
    setLocale('zh-TW');
  });

  it('provides key parity between zh-TW and en dictionaries', () => {
    function getKeys(obj: any, prefix = ''): string[] {
      return Object.keys(obj).flatMap(k => {
        const path = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === 'object' && obj[k] !== null && typeof obj[k] !== 'function') {
          return getKeys(obj[k], path);
        }
        return [path];
      });
    }

    const zhKeys = getKeys(zhTW).sort();
    const enKeys = getKeys(en).sort();

    expect(zhKeys).toEqual(enKeys);
  });

  it('correctly sets and toggles locale', () => {
    expect(getLocale()).toBe('zh-TW');
    expect(t().header.single).toBe('單打');

    const next = toggleLocale();
    expect(next).toBe('en');
    expect(getLocale()).toBe('en');
    expect(t().header.single).toBe('Singles');
    expect(localStorage.getItem('pokespeed_locale')).toBe('en');

    toggleLocale();
    expect(getLocale()).toBe('zh-TW');
    expect(t().header.single).toBe('單打');
    expect(localStorage.getItem('pokespeed_locale')).toBe('zh-TW');
  });

  it('notifies subscribers on locale change', () => {
    let notifiedLocale: string | null = null;
    const unsubscribe = subscribeLocale((loc) => {
      notifiedLocale = loc;
    });

    setLocale('en');
    expect(notifiedLocale).toBe('en');

    setLocale('zh-TW');
    expect(notifiedLocale).toBe('zh-TW');

    unsubscribe();
    setLocale('en');
    expect(notifiedLocale).toBe('zh-TW'); // Unsubscribed, should not receive 'en'
  });

  it('moreBtn function generates correct string in both languages', () => {
    setLocale('zh-TW');
    expect(t().speedTable.moreBtn(5)).toBe('+5 更多');

    setLocale('en');
    expect(t().speedTable.moreBtn(5)).toBe('+5 more');
  });

  it('pinDividerCalc functions adapt to the active locale', () => {
    const mockSlot: SlotState = {
      baseSpeed: 100,
      evs: 32,
      nature: 1.1,
      stages: 1,
      isTailwind: true,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
      pokemon: {
        id: 6,
        formId: 'charizard',
        nameZh: '噴火龍',
        nameEn: 'Charizard',
        baseSpeed: 100,
        sprite: 'https://example.com/charizard.png',
        usageRankSingle: 10,
        usageRankDouble: 5
      }
    };

    setLocale('zh-TW');
    expect(formatNature(1.1).natureText).toBe('加速 (+10%)');
    expect(formatSlotBuffs(mockSlot)).toContain('順風');
    const tooltipZh = formatSlotTooltip(mockSlot, '我方 A', 200);
    expect(tooltipZh).toContain('噴火龍');
    expect(tooltipZh).toContain('努力值');
    expect(tooltipZh).toContain('階級: +1');

    setLocale('en');
    expect(formatNature(1.1).natureText).toBe('+Spe (+10%)');
    expect(formatSlotBuffs(mockSlot)).toContain('Tailwind');
    const tooltipEn = formatSlotTooltip(mockSlot, 'Player A', 200);
    expect(tooltipEn).toContain('Charizard');
    expect(tooltipEn).toContain('EVs');
    expect(tooltipEn).toContain('Stage: +1');
  });
});
