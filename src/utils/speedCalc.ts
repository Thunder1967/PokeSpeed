import { SlotState } from '../types/pokemon';

/**
 * Calculates the base speed at Level 50 before combat modifiers.
 * Speed_base = floor((Base + 20 + P) * Nature)
 */
export function calcBaseSpeedLv50(base: number, evs: number, nature: number): number {
  return Math.floor((base + 20 + evs) * nature);
}

/**
 * Calculates the final speed taking all combat modifiers into account.
 * Modifiers are applied in strict order, with Math.floor() after each step.
 */
export function calcFinalSpeed(base: number, state: SlotState): number {
  // Step 0: Calculate Base Speed at Lv 50
  const speedBase = calcBaseSpeedLv50(base, state.evs, state.nature);

  // Step 1: Stat Stages (-6 to +6)
  const stageMultipliers: Record<number, number> = {
    6: 4.0, 5: 3.5, 4: 3.0, 3: 2.5, 2: 2.0, 1: 1.5,
    0: 1.0,
    "-1": 2 / 3, "-2": 1 / 2, "-3": 2 / 5, "-4": 1 / 3, "-5": 2 / 7, "-6": 1 / 4
  };
  const stageMult = stageMultipliers[state.stages] ?? 1.0;
  let s1 = Math.floor(speedBase * stageMult);

  // Step 2: Item (Choice Scarf)
  let s2 = state.isScarf ? Math.floor(s1 * 1.5) : s1;

  // Step 3: Ability (Weather x2.0 or Protosynthesis/Quark Drive x1.5)
  let s3 = s2;
  if (state.isAbilityBoost && state.abilityMultiplier !== 1.0) {
    s3 = Math.floor(s2 * state.abilityMultiplier);
  }

  // Step 4: Tailwind
  let s4 = state.isTailwind ? Math.floor(s3 * 2.0) : s3;

  // Step 5: Status (Paralysis)
  let sFinal = state.isParalyzed ? Math.floor(s4 * 0.5) : s4;

  return sFinal;
}
