import { calcBaseSpeedLv50 } from './speedCalc';

export interface ReverseCalcResult {
  possible: boolean;
  evsNeeded: number;
  natureNeeded: 1.1 | 1.0;
}

/**
 * Calculates the minimum EVs and Nature required for a base speed to reach a target speed.
 * @param baseSpeed The base speed of the Pokemon
 * @param targetSpeed The exact speed stat to reach or exceed
 * @returns Object indicating if it's possible, and what EVs/Nature are required.
 */
export function calcRequiredEvsLv50(baseSpeed: number, targetSpeed: number): ReverseCalcResult {
  // Try with neutral nature first
  for (let evs = 0; evs <= 32; evs++) {
    const speed = calcBaseSpeedLv50(baseSpeed, evs, 1.0);
    if (speed >= targetSpeed) {
      return { possible: true, evsNeeded: evs, natureNeeded: 1.0 };
    }
  }

  // Try with positive nature
  for (let evs = 0; evs <= 32; evs++) {
    const speed = calcBaseSpeedLv50(baseSpeed, evs, 1.1);
    if (speed >= targetSpeed) {
      return { possible: true, evsNeeded: evs, natureNeeded: 1.1 };
    }
  }

  // Impossible
  return { possible: false, evsNeeded: 0, natureNeeded: 1.1 };
}
