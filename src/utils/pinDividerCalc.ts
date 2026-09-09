import { SlotState } from '../types/pokemon';
import { AppConfig } from '../config/appConfig';
import { t, getLocale } from '../i18n';

export const DEFAULT_SUBSTITUTE_SPRITE = AppConfig.table.sprites.fallbackSubstitute;

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
 * Formats EVs count (0-32) to actual EV value (0-252).
 */
export function formatEvs(evs: number): { actualEv: number; evText: string } {
  const actualEv = evs === 32 ? 252 : (evs === 0 ? 0 : evs * 8 - 4);
  return { actualEv, evText: `${actualEv} (${evs})` };
}

/**
 * Formats nature multiplier (1.1, 1.0, 0.9) to descriptive label and color class.
 */
export function formatNature(nature: number): { natureText: string; colorClass: string } {
  const d = t().drawer;
  if (nature === 1.1) return { natureText: d.natureBoost, colorClass: 'text-red-400 font-bold' };
  if (nature === 0.9) return { natureText: d.natureHinder, colorClass: 'text-blue-400 font-bold' };
  return { natureText: d.natureNeutral, colorClass: 'text-gray-300' };
}

/**
 * Formats combat buffs/status of a slot into a string.
 */
export function formatSlotBuffs(slot: SlotState): string {
  const buffs: string[] = [];
  const p = t().pinDivider;
  if (slot.isTailwind) buffs.push(p.tailwind);
  if (slot.isScarf) buffs.push(p.scarf);
  if (slot.isAbilityBoost) buffs.push(p.abilityBoost);
  if (slot.isParalyzed) buffs.push(p.paralyzed);
  return buffs.length > 0 ? buffs.join(' ') : p.standardStatus;
}

/**
 * Normalizes Pokemon info from a SlotState with fallbacks.
 */
export function getSlotPokemonInfo(slot: SlotState, defaultZh: string, defaultEn: string) {
  return {
    nameZh: slot.pokemon?.nameZh ?? defaultZh,
    nameEn: slot.pokemon?.nameEn ?? defaultEn,
    sprite: (slot.pokemon?.sprite && slot.pokemon.sprite.trim() !== '') ? slot.pokemon.sprite : DEFAULT_SUBSTITUTE_SPRITE,
    baseSpeed: slot.pokemon?.baseSpeed ?? slot.baseSpeed ?? 100
  };
}

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
  const { actualEv } = formatEvs(slot.evs);
  const { natureText } = formatNature(slot.nature);
  const p = t().pinDivider;
  const isEn = getLocale() === 'en';
  const stageText = slot.stages !== 0 ? `${p.stageLabel}: ${slot.stages > 0 ? '+' : ''}${slot.stages}` : null;
  const buffStr = formatSlotBuffs(slot);
  const stageStr = stageText ? ` | ${stageText}` : '';
  const pokeName = slot.pokemon ? (isEn ? `${slot.pokemon.nameEn} (${slot.pokemon.nameZh})` : `${slot.pokemon.nameZh} (${slot.pokemon.nameEn})`) : label;
  const baseSpeed = slot.pokemon?.baseSpeed ?? slot.baseSpeed ?? 100;

  return `${pokeName} (${t().speedTable.baseCol} ${baseSpeed})
${p.actualSpeed}: ${realSpeed}
${p.evLabel}: ${actualEv} (${slot.evs}) | ${p.natureLabel}: ${natureText}${stageStr}
${p.statusLabel}: ${buffStr}`;
}

function createSinglePin(
  slotKey: 'playerA' | 'playerB',
  poke: ReturnType<typeof getSlotPokemonInfo>,
  slot: SlotState,
  speed: number,
  color: 'emerald' | 'violet',
  rows: RowSpeedInfo[],
  fallbackLabel: string
): PinDividerItem {
  const isEn = getLocale() === 'en';
  return {
    isMerged: false,
    slotKey,
    label: isEn ? poke.nameEn : poke.nameZh,
    speed,
    color,
    position: findDividerPosition(rows, speed),
    pokemon: poke,
    slotState: slot,
    tooltip: formatSlotTooltip(slot, fallbackLabel, speed)
  };
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

  const isEn = getLocale() === 'en';
  const pokeA = getSlotPokemonInfo(slotA, t().pinDivider.dividerAllyA, 'Player A');
  const pokeB = getSlotPokemonInfo(slotB, t().pinDivider.dividerAllyB, 'Player B');
  const labelA = isEn ? 'Player A' : '我方 A';
  const labelB = isEn ? 'Player B' : '我方 B';

  if (hasA && !hasB) {
    return [createSinglePin('playerA', pokeA, slotA, speedA, 'emerald', rows, labelA)];
  }

  if (!hasA && hasB) {
    return [createSinglePin('playerB', pokeB, slotB, speedB, 'violet', rows, labelB)];
  }

  // Both A and B are active
  const posA = findDividerPosition(rows, speedA);
  const posB = findDividerPosition(rows, speedB);

  // Check if speeds tie and positions are identical
  const isSamePos = posA.type === posB.type && posA.afterBase === posB.afterBase;
  if (speedA === speedB && isSamePos) {
    const nameA = isEn ? pokeA.nameEn : pokeA.nameZh;
    const nameB = isEn ? pokeB.nameEn : pokeB.nameZh;
    return [
      {
        isMerged: true,
        label: `${nameA} & ${nameB}`,
        speed: speedA,
        position: posA,
        pokemonA: pokeA,
        slotStateA: slotA,
        tooltipA: formatSlotTooltip(slotA, labelA, speedA),
        pokemonB: pokeB,
        slotStateB: slotB,
        tooltipB: formatSlotTooltip(slotB, labelB, speedB)
      }
    ];
  }

  return [
    createSinglePin('playerA', pokeA, slotA, speedA, 'emerald', rows, labelA),
    createSinglePin('playerB', pokeB, slotB, speedB, 'violet', rows, labelB)
  ];
}

