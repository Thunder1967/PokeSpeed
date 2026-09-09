import { describe, it, expect } from 'vitest';
import {
  findDividerPosition,
  formatSlotTooltip,
  calcPinDividers,
  RowSpeedInfo
} from './pinDividerCalc';
import { SlotState } from '../types/pokemon';

describe('pinDividerCalc module', () => {
  const mockRows: RowSpeedInfo[] = [
    { baseSpeed: 130, dynamicSpeed: 200 },
    { baseSpeed: 100, dynamicSpeed: 167 },
    { baseSpeed: 80, dynamicSpeed: 145 },
    { baseSpeed: 50, dynamicSpeed: 112 }
  ];

  describe('findDividerPosition', () => {
    it('returns top when player speed is strictly greater than fastest enemy', () => {
      expect(findDividerPosition(mockRows, 205)).toEqual({ type: 'top' });
    });

    it('places divider below tied row when player ties with fastest enemy (同速在同速種族值下方)', () => {
      // Player is 200 (ties with base 130).
      // Divider must be placed below base 130.
      expect(findDividerPosition(mockRows, 200)).toEqual({
        type: 'after',
        afterBase: 130
      });
    });

    it('returns bottom when player speed is strictly less than slowest enemy', () => {
      expect(findDividerPosition(mockRows, 100)).toEqual({ type: 'bottom' });
      expect(findDividerPosition(mockRows, 50)).toEqual({ type: 'bottom' });
    });

    it('places divider below tied row when player ties with slowest enemy', () => {
      // Player is 112 (ties with base 50).
      // Below base 50 is bottom.
      expect(findDividerPosition(mockRows, 112)).toEqual({ type: 'bottom' });
    });

    it('returns after correct base when player speed is between rows', () => {
      // 180 is between 200 (base 130) and 167 (base 100)
      // So rows faster than 180 is base 130
      expect(findDividerPosition(mockRows, 180)).toEqual({
        type: 'after',
        afterBase: 130
      });

      // 150 is between 167 (base 100) and 145 (base 80)
      expect(findDividerPosition(mockRows, 150)).toEqual({
        type: 'after',
        afterBase: 100
      });
    });

    it('places divider below tied row when player ties with a middle row (同速在同速種族值下方)', () => {
      // Player is 167 (ties with base 100).
      // Row 100 is tied with player, so divider goes below base 100.
      expect(findDividerPosition(mockRows, 167)).toEqual({
        type: 'after',
        afterBase: 100
      });

      // Player is 145 (ties with base 80).
      // Divider goes below base 80.
      expect(findDividerPosition(mockRows, 145)).toEqual({
        type: 'after',
        afterBase: 80
      });
    });
  });

  describe('formatSlotTooltip', () => {
    it('formats basic slot with standard text', () => {
      const slot: SlotState = {
        baseSpeed: 100,
        evs: 32,
        nature: 1.1,
        stages: 0,
        isTailwind: false,
        isScarf: false,
        isAbilityBoost: false,
        abilityMultiplier: 1.0,
        isParalyzed: false
      };

      const result = formatSlotTooltip(slot, '我方 A', 167);
      expect(result).toContain('我方 A (種族 100)');
      expect(result).toContain('實數: 167');
      expect(result).toContain('努力值: 252 (32)');
      expect(result).toContain('加速 (+10%)');
      expect(result).toContain('常規狀態');
    });

    it('formats slot with custom pokemon and items, stages, status effects', () => {
      const slot: SlotState = {
        baseSpeed: 80,
        evs: 16,
        nature: 1.0,
        stages: 2,
        isTailwind: true,
        isScarf: true,
        isAbilityBoost: true,
        abilityMultiplier: 2.0,
        isParalyzed: true,
        pokemon: {
          id: 479,
          formId: 'rotomwash',
          nameZh: '清洗洛托姆',
          nameEn: 'Rotom-Wash',
          baseSpeed: 80,
          sprite: 'rotomwash.png',
          usageRankSingle: 10,
          usageRankDouble: 5
        }
      };

      const result = formatSlotTooltip(slot, '我方 B', 250);
      expect(result).toContain('清洗洛托姆 (Rotom-Wash)');
      expect(result).toContain('(種族 80)');
      expect(result).toContain('階級: +2');
      expect(result).toContain('順風');
      expect(result).toContain('圍巾');
      expect(result).toContain('特性(2x)');
      expect(result).toContain('麻痺');
    });
  });

  describe('calcPinDividers', () => {
    const slotA: SlotState = {
      baseSpeed: 100,
      evs: 32,
      nature: 1.1,
      stages: 0,
      isTailwind: false,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
      pokemon: {
        id: 151,
        formId: 'mew',
        nameZh: '夢幻',
        nameEn: 'Mew',
        baseSpeed: 100,
        sprite: 'mew.png',
        usageRankSingle: 1,
        usageRankDouble: 1
      }
    };

    const slotB: SlotState = {
      baseSpeed: 80,
      evs: 32,
      nature: 1.1,
      stages: 0,
      isTailwind: false,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
      pokemon: {
        id: 26,
        formId: 'raichu',
        nameZh: '雷丘',
        nameEn: 'Raichu',
        baseSpeed: 110,
        sprite: 'raichu.png',
        usageRankSingle: 2,
        usageRankDouble: 2
      }
    };

    it('returns empty array when neither slot has a selected pokemon/baseSpeed', () => {
      const emptySlotA: SlotState = { ...slotA, baseSpeed: undefined, pokemon: null };
      const emptySlotB: SlotState = { ...slotB, baseSpeed: undefined, pokemon: null };
      const result = calcPinDividers(mockRows, true, emptySlotA, 0, emptySlotB, 0);
      expect(result).toEqual([]);
    });

    it('returns single item for single battle with pokemon metadata', () => {
      const result = calcPinDividers(mockRows, false, slotA, 167, slotB, 145);
      expect(result.length).toBe(1);
      expect(result[0].isMerged).toBe(false);
      if (!result[0].isMerged) {
        expect(result[0].slotKey).toBe('playerA');
        expect(result[0].speed).toBe(167);
        expect(result[0].color).toBe('emerald');
        expect(result[0].pokemon.nameZh).toBe('夢幻');
        expect(result[0].pokemon.sprite).toBe('mew.png');
      }
    });

    it('returns separate items for double battle with different speeds', () => {
      const result = calcPinDividers(mockRows, true, slotA, 180, slotB, 130);
      expect(result.length).toBe(2);
      expect(result[0].isMerged).toBe(false);
      expect(result[1].isMerged).toBe(false);
      if (!result[0].isMerged && !result[1].isMerged) {
        expect(result[0].color).toBe('emerald');
        expect(result[0].pokemon.nameZh).toBe('夢幻');
        expect(result[1].color).toBe('violet');
        expect(result[1].pokemon.nameZh).toBe('雷丘');
      }
    });

    it('merges pins for double battle when speeds tie with both pokemon data', () => {
      const result = calcPinDividers(mockRows, true, slotA, 150, slotB, 150);
      expect(result.length).toBe(1);
      expect(result[0].isMerged).toBe(true);
      if (result[0].isMerged) {
        expect(result[0].speed).toBe(150);
        expect(result[0].pokemonA.nameZh).toBe('夢幻');
        expect(result[0].pokemonB.nameZh).toBe('雷丘');
      }
    });
  });
});
