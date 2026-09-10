import { SlotState } from '../types/pokemon';

/**
 * Calculates the base speed at Level 50 before combat modifiers.
 * Speed_base = floor((Base + 20 + P) * Nature)
 */
export function calcBaseSpeedLv50(base: number, evs: number, nature: number): number {
  return Math.floor((base + 20 + evs) * nature);
}

/**
 * Stage multiplier lookup, hoisted to module scope to avoid
 * re-creating the object on every calcFinalSpeed call.
 */
const stageMultipliers: Record<number, number> = {
  6: 4.0, 5: 3.5, 4: 3.0, 3: 2.5, 2: 2.0, 1: 1.5,
  0: 1.0,
  "-1": 2 / 3, "-2": 1 / 2, "-3": 2 / 5, "-4": 1 / 3, "-5": 2 / 7, "-6": 1 / 4
};

/**
 * Calculates the final speed taking all combat modifiers into account.
 * Modifiers are applied in strict order, with Math.floor() after each step.
 */
export function calcFinalSpeed(base: number, state: SlotState): number {
  // Step 0: Calculate Base Speed at Lv 50
  const speedBase = calcBaseSpeedLv50(base, state.evs, state.nature);

  // Step 1: Stat Stages (-6 to +6)
  const stageMult = stageMultipliers[state.stages] ?? 1.0;
  const afterStages = Math.floor(speedBase * stageMult);

  // Step 2: Item (Choice Scarf)
  const afterScarf = state.isScarf ? Math.floor(afterStages * 1.5) : afterStages;

  // Step 3: Ability (Weather x2.0 or Protosynthesis/Quark Drive x1.5)
  const abilityMult = (state.abilityMultiplier && state.abilityMultiplier > 1.0) ? state.abilityMultiplier : 2.0;
  const afterAbility = state.isAbilityBoost ? Math.floor(afterScarf * abilityMult) : afterScarf;

  // Step 4: Tailwind
  const afterTailwind = state.isTailwind ? Math.floor(afterAbility * 2.0) : afterAbility;

  // Step 5: Status (Paralysis)
  const finalSpeed = state.isParalyzed ? Math.floor(afterTailwind * 0.5) : afterTailwind;

  return finalSpeed;
}
