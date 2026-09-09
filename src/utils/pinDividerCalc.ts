import { SlotState } from '../types/pokemon';

export const DEFAULT_SUBSTITUTE_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';

export interface RowSpeedInfo {
  baseSpeed: number;
  dynamicSpeed: number;
}

export type DividerPositionType = 'top' | 'after' | 'bottom';

export interface DividerPosition {
  type: DividerPositionType;
  /** When type is 'after', indicates the baseSpeed of the row above the divider */
  afterBase?: number;
}

export interface PlayerPinInfo {
  slotKey: 'playerA' | 'playerB';
  label: string;
  speed: number;
  color: 'emerald' | 'violet';
  position: DividerPosition;
  pokemon: {
    nameZh: string;
    nameEn: string;
    sprite: string;
    baseSpeed: number;
  };
  slotState: SlotState;
  tooltip: string;
}

export interface MergedPinInfo {
  isMerged: true;
  label: string;
  speed: number;
  position: DividerPosition;
  pokemonA: {
    nameZh: string;
    nameEn: string;
    sprite: string;
    baseSpeed: number;
  };
  slotStateA: SlotState;
  tooltipA: string;
  pokemonB: {
    nameZh: string;
    nameEn: string;
    sprite: string;
    baseSpeed: number;
  };
  slotStateB: SlotState;
  tooltipB: string;
}

export type PinDividerItem = 
  | ({ isMerged: false } & PlayerPinInfo)
  | MergedPinInfo;

/**
 * Calculates where the divider should be placed given rows sorted descending by base/speed.
 * Everything ABOVE the divider has dynamicSpeed >= playerSpeed (faster or tied).
 * Everything BELOW the divider has dynamicSpeed < playerSpeed (slower).
 * When dynamicSpeed === playerSpeed (tie), the divider is placed BELOW the tied row (同速時在同速種族值下方).
 */
export function findDividerPosition(rows: RowSpeedInfo[], playerSpeed: number): DividerPosition {
  if (rows.length === 0) {
    return { type: 'top' };
  }

  // If player speed is strictly greater than the fastest row, it goes at the very top (0 rows outspeed/tie)
  if (playerSpeed > rows[0].dynamicSpeed) {
    return { type: 'top' };
  }

  // If player speed is less than or equal to the slowest row, it goes below the last row (bottom)
  if (playerSpeed <= rows[rows.length - 1].dynamicSpeed) {
    return { type: 'bottom' };
  }

  // Find first row where dynamicSpeed is strictly less than playerSpeed.
  // Rows before i have dynamicSpeed >= playerSpeed (either faster or tied).
  // The divider is placed after rows[i-1].
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].dynamicSpeed < playerSpeed) {
      return {
        type: 'after',
        afterBase: rows[i - 1].baseSpeed
      };
    }
  }

  return { type: 'bottom' };
}

/**
 * Formats a SlotState into a descriptive tooltip string.
 */
export function formatSlotTooltip(slot: SlotState, label: string, realSpeed: number): string {
  const actualEv = slot.evs === 32 ? 252 : (slot.evs === 0 ? 0 : slot.evs * 8 - 4);
  const natureText = slot.nature === 1.1 ? '加速 (+10%)' : (slot.nature === 0.9 ? '減速 (-10%)' : '無關 (0%)');
  const stageText = slot.stages !== 0 ? `階級: ${slot.stages > 0 ? '+' : ''}${slot.stages}` : null;

  const buffs: string[] = [];
  if (slot.isTailwind) buffs.push('順風 🌪️');
  if (slot.isScarf) buffs.push('圍巾 🧣');
  if (slot.isAbilityBoost) buffs.push('特性(2x) ⚡');
  if (slot.isParalyzed) buffs.push('麻痺 🟡');

  const buffStr = buffs.length > 0 ? buffs.join(' ') : '常規狀態';
  const stageStr = stageText ? ` | ${stageText}` : '';
  const pokeName = slot.pokemon ? `${slot.pokemon.nameZh} (${slot.pokemon.nameEn})` : label;
  const baseSpeed = slot.pokemon?.baseSpeed ?? slot.baseSpeed ?? 100;

  return `${pokeName} (種族 ${baseSpeed})
實數: ${realSpeed}
努力值: ${actualEv} (${slot.evs}) | 性格: ${natureText}${stageStr}
狀態: ${buffStr}`;
}

/**
 * Calculates pin divider items for battle slots.
 * Handles single/double battle modes and merges pins when speeds tie.
 * If a slot has no pokemon/baseSpeed selected, it generates no pin.
 */
export function calcPinDividers(
  rows: RowSpeedInfo[],
  isDouble: boolean,
  slotA: SlotState,
  speedA: number,
  slotB: SlotState,
  speedB: number
): PinDividerItem[] {
  const hasA = slotA.baseSpeed !== undefined;
  const hasB = isDouble && slotB.baseSpeed !== undefined;

  if (!hasA && !hasB) {
    return [];
  }

  const pokeA = {
    nameZh: slotA.pokemon?.nameZh ?? '我方 A',
    nameEn: slotA.pokemon?.nameEn ?? 'Player A',
    sprite: (slotA.pokemon?.sprite && slotA.pokemon.sprite.trim() !== '') ? slotA.pokemon.sprite : DEFAULT_SUBSTITUTE_SPRITE,
    baseSpeed: slotA.baseSpeed ?? 100
  };

  const pokeB = {
    nameZh: slotB.pokemon?.nameZh ?? '我方 B',
    nameEn: slotB.pokemon?.nameEn ?? 'Player B',
    sprite: (slotB.pokemon?.sprite && slotB.pokemon.sprite.trim() !== '') ? slotB.pokemon.sprite : DEFAULT_SUBSTITUTE_SPRITE,
    baseSpeed: slotB.baseSpeed ?? 100
  };

  if (hasA && !hasB) {
    const posA = findDividerPosition(rows, speedA);
    const tooltipA = formatSlotTooltip(slotA, '我方 A', speedA);
    return [
      {
        isMerged: false,
        slotKey: 'playerA',
        label: pokeA.nameZh,
        speed: speedA,
        color: 'emerald',
        position: posA,
        pokemon: pokeA,
        slotState: slotA,
        tooltip: tooltipA
      }
    ];
  }

  if (!hasA && hasB) {
    const posB = findDividerPosition(rows, speedB);
    const tooltipB = formatSlotTooltip(slotB, '我方 B', speedB);
    return [
      {
        isMerged: false,
        slotKey: 'playerB',
        label: pokeB.nameZh,
        speed: speedB,
        color: 'violet',
        position: posB,
        pokemon: pokeB,
        slotState: slotB,
        tooltip: tooltipB
      }
    ];
  }

  // Both A and B are active
  const posA = findDividerPosition(rows, speedA);
  const tooltipA = formatSlotTooltip(slotA, '我方 A', speedA);
  const posB = findDividerPosition(rows, speedB);
  const tooltipB = formatSlotTooltip(slotB, '我方 B', speedB);

  // Check if speeds tie and positions are identical
  const isSamePos = posA.type === posB.type && posA.afterBase === posB.afterBase;
  if (speedA === speedB && isSamePos) {
    return [
      {
        isMerged: true,
        label: `${pokeA.nameZh} & ${pokeB.nameZh}`,
        speed: speedA,
        position: posA,
        pokemonA: pokeA,
        slotStateA: slotA,
        tooltipA,
        pokemonB: pokeB,
        slotStateB: slotB,
        tooltipB
      }
    ];
  }

  return [
    {
      isMerged: false,
      slotKey: 'playerA',
      label: pokeA.nameZh,
      speed: speedA,
      color: 'emerald',
      position: posA,
      pokemon: pokeA,
      slotState: slotA,
      tooltip: tooltipA
    },
    {
      isMerged: false,
      slotKey: 'playerB',
      label: pokeB.nameZh,
      speed: speedB,
      color: 'violet',
      position: posB,
      pokemon: pokeB,
      slotState: slotB,
      tooltip: tooltipB
    }
  ];
}
