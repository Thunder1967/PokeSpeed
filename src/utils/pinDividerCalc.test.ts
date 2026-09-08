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
    it('returns top when player speed is greater than or equal to fastest enemy', () => {
      expect(findDividerPosition(mockRows, 205)).toEqual({ type: 'top' });
      expect(findDividerPosition(mockRows, 200)).toEqual({ type: 'top' });
    });

    it('returns bottom when player speed is strictly less than slowest enemy', () => {
      expect(findDividerPosition(mockRows, 100)).toEqual({ type: 'bottom' });
      expect(findDividerPosition(mockRows, 50)).toEqual({ type: 'bottom' });
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

    it('places divider after previous row when player ties with a row', () => {
      // Player is 167 (ties with base 100).
      // Row 130 (200) is faster. Row 100 (167) is not faster (it ties).
      // So divider goes after base 130.
      expect(findDividerPosition(mockRows, 167)).toEqual({
        type: 'after',
        afterBase: 130
      });

      // Player is 112 (ties with base 50).
      // Faster are 130, 100, 80.
      expect(findDividerPosition(mockRows, 112)).toEqual({
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

    it('formats slot with items, stages and status effects', () => {
      const slot: SlotState = {
        baseSpeed: 80,
        evs: 16,
        nature: 1.0,
        stages: 2,
        isTailwind: true,
        isScarf: true,
        isAbilityBoost: true,
        abilityMultiplier: 2.0,
        isParalyzed: true
      };

      const result = formatSlotTooltip(slot, '我方 B', 250);
      expect(result).toContain('我方 B (種族 80)');
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
      isParalyzed: false
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
      isParalyzed: false
    };

    it('returns single item for single battle', () => {
      const result = calcPinDividers(mockRows, false, slotA, 167, slotB, 145);
      expect(result.length).toBe(1);
      expect(result[0].isMerged).toBe(false);
      if (!result[0].isMerged) {
        expect(result[0].slotKey).toBe('playerA');
        expect(result[0].speed).toBe(167);
      }
    });

    it('returns separate items for double battle with different speeds', () => {
      const result = calcPinDividers(mockRows, true, slotA, 180, slotB, 130);
      expect(result.length).toBe(2);
      expect(result[0].isMerged).toBe(false);
      expect(result[1].isMerged).toBe(false);
    });

    it('merges pins for double battle when speeds tie', () => {
      const result = calcPinDividers(mockRows, true, slotA, 150, slotB, 150);
      expect(result.length).toBe(1);
      expect(result[0].isMerged).toBe(true);
      if (result[0].isMerged) {
        expect(result[0].label).toBe('我方 A & B');
        expect(result[0].speed).toBe(150);
      }
    });
  });
});
