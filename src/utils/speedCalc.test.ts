import { describe, it, expect } from 'vitest';
import { calcBaseSpeedLv50, calcFinalSpeed } from './speedCalc';
import { SlotState } from '../types/pokemon';

describe('calcBaseSpeedLv50', () => {
  it('calculates Max Speed correctly (Base 100, 32 EVs, 1.1 Nature)', () => {
    // floor((100 + 20 + 32) * 1.1) = floor(152 * 1.1) = 167
    expect(calcBaseSpeedLv50(100, 32, 1.1)).toBe(167);
  });

  it('calculates Neutral Speed correctly (Base 100, 32 EVs, 1.0 Nature)', () => {
    // floor((100 + 20 + 32) * 1.0) = 152
    expect(calcBaseSpeedLv50(100, 32, 1.0)).toBe(152);
  });

  it('calculates 0 EVs Speed correctly (Base 100, 0 EVs, 1.0 Nature)', () => {
    // floor((100 + 20 + 0) * 1.0) = 120
    expect(calcBaseSpeedLv50(100, 0, 1.0)).toBe(120);
  });

  it('calculates Min Speed correctly (Base 100, 0 EVs, 0.9 Nature)', () => {
    // floor((100 + 20 + 0) * 0.9) = floor(120 * 0.9) = 108
    expect(calcBaseSpeedLv50(100, 0, 0.9)).toBe(108);
  });
});

describe('calcFinalSpeed (Sequential Flooring)', () => {
  const getDefaultState = (): SlotState => ({
    evs: 32,
    nature: 1.1,
    stages: 0,
    isTailwind: false,
    isScarf: false,
    isAbilityBoost: false,
    abilityMultiplier: 1.0,
    isParalyzed: false
  });

  it('handles +1 Stage correctly', () => {
    const state = { ...getDefaultState(), stages: 1 };
    // Base 100 Max = 167. 167 * 1.5 = 250.5 -> 250
    expect(calcFinalSpeed(100, state)).toBe(250);
  });

  it('handles -1 Stage correctly', () => {
    const state = { ...getDefaultState(), stages: -1 };
    // Base 100 Max = 167. 167 * (2/3) = 111.33 -> 111
    expect(calcFinalSpeed(100, state)).toBe(111);
  });

  it('handles Choice Scarf correctly', () => {
    const state = { ...getDefaultState(), isScarf: true };
    // Base 100 Max = 167. 167 * 1.5 = 250.5 -> 250
    expect(calcFinalSpeed(100, state)).toBe(250);
  });

  it('handles Ability Boost 2x (e.g. Swift Swim) correctly', () => {
    const state = { ...getDefaultState(), isAbilityBoost: true, abilityMultiplier: 2.0 as const };
    // Base 100 Max = 167. 167 * 2.0 = 334
    expect(calcFinalSpeed(100, state)).toBe(334);
  });

  it('handles Tailwind correctly', () => {
    const state = { ...getDefaultState(), isTailwind: true };
    // Base 100 Max = 167. 167 * 2.0 = 334
    expect(calcFinalSpeed(100, state)).toBe(334);
  });

  it('handles Paralysis correctly', () => {
    const state = { ...getDefaultState(), isParalyzed: true };
    // Base 100 Max = 167. 167 * 0.5 = 83.5 -> 83
    expect(calcFinalSpeed(100, state)).toBe(83);
  });

  it('handles combination of Modifiers: Tailwind + Scarf', () => {
    const state = { ...getDefaultState(), isTailwind: true, isScarf: true };
    // Base 100 Max = 167
    // Scarf -> floor(167 * 1.5) = 250
    // Tailwind -> floor(250 * 2.0) = 500
    expect(calcFinalSpeed(100, state)).toBe(500);
  });

  it('handles combination: -1 Stage + Scarf', () => {
    const state = { ...getDefaultState(), stages: -1, isScarf: true };
    // Base 100 Max = 167
    // Stage -1 -> floor(167 * 2/3) = 111
    // Scarf -> floor(111 * 1.5) = 166
    expect(calcFinalSpeed(100, state)).toBe(166);
  });

  it('handles combination: Swift Swim + Tailwind', () => {
    const state = { ...getDefaultState(), isAbilityBoost: true, abilityMultiplier: 2.0 as const, isTailwind: true };
    // Base 100 Max = 167
    // Ability -> floor(167 * 2.0) = 334
    // Tailwind -> floor(334 * 2.0) = 668
    expect(calcFinalSpeed(100, state)).toBe(668);
  });
  
  it('handles all modifiers combined with strict flooring', () => {
    const state = {
      evs: 32,
      nature: 1.1 as const,
      stages: -1,
      isScarf: true,
      isAbilityBoost: true,
      abilityMultiplier: 1.5 as const,
      isTailwind: true,
      isParalyzed: true
    };
    // Base 100 Max = 167
    // Stage -1 -> floor(167 * 2/3) = 111
    // Scarf -> floor(111 * 1.5) = 166.5 -> 166
    // Ability 1.5x -> floor(166 * 1.5) = 249
    // Tailwind -> floor(249 * 2.0) = 498
    // Paralysis -> floor(498 * 0.5) = 249
    expect(calcFinalSpeed(100, state)).toBe(249);
  });
});
