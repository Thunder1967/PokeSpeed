import { SlotState } from '../types/pokemon';

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
  color: 'blue' | 'yellow';
  position: DividerPosition;
  tooltip: string;
}

export interface MergedPinInfo {
  isMerged: true;
  label: string;
  speed: number;
  position: DividerPosition;
  tooltipA: string;
  tooltipB: string;
}

export type PinDividerItem = 
  | ({ isMerged: false } & PlayerPinInfo)
  | MergedPinInfo;

/**
 * Calculates where the divider should be placed given rows sorted descending by base/speed.
 * Everything ABOVE the divider has dynamicSpeed > playerSpeed.
 * Everything BELOW the divider has dynamicSpeed <= playerSpeed.
 */
export function findDividerPosition(rows: RowSpeedInfo[], playerSpeed: number): DividerPosition {
  if (rows.length === 0) {
    return { type: 'top' };
  }

  // If player speed is greater than or equal to the fastest row, it goes at the very top (0 rows outspeed)
  if (playerSpeed >= rows[0].dynamicSpeed) {
    return { type: 'top' };
  }

  // If player speed is strictly less than the slowest row, it goes at the bottom (all rows outspeed)
  if (playerSpeed < rows[rows.length - 1].dynamicSpeed) {
    return { type: 'bottom' };
  }

  // Find first row where dynamicSpeed <= playerSpeed
  // The divider should be placed right AFTER rows[i-1] (which is > playerSpeed)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].dynamicSpeed <= playerSpeed) {
      // Divider is between rows[i-1] and rows[i]
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

  return `${label} (種族 ${slot.baseSpeed ?? 100})
實數: ${realSpeed}
努力值: ${actualEv} (${slot.evs}) | 性格: ${natureText}${stageStr}
狀態: ${buffStr}`;
}

/**
 * Calculates pin divider items for battle slots.
 * Handles single/double battle modes and merges pins when speeds tie.
 */
export function calcPinDividers(
  rows: RowSpeedInfo[],
  isDouble: boolean,
  slotA: SlotState,
  speedA: number,
  slotB: SlotState,
  speedB: number
): PinDividerItem[] {
  const posA = findDividerPosition(rows, speedA);
  const tooltipA = formatSlotTooltip(slotA, '我方 A', speedA);

  if (!isDouble) {
    return [
      {
        isMerged: false,
        slotKey: 'playerA',
        label: '我方 A',
        speed: speedA,
        color: 'blue',
        position: posA,
        tooltip: tooltipA
      }
    ];
  }

  const posB = findDividerPosition(rows, speedB);
  const tooltipB = formatSlotTooltip(slotB, '我方 B', speedB);

  // Check if speeds tie and positions are identical
  const isSamePos = posA.type === posB.type && posA.afterBase === posB.afterBase;
  if (speedA === speedB && isSamePos) {
    return [
      {
        isMerged: true,
        label: '我方 A & B',
        speed: speedA,
        position: posA,
        tooltipA,
        tooltipB
      }
    ];
  }

  return [
    {
      isMerged: false,
      slotKey: 'playerA',
      label: '我方 A',
      speed: speedA,
      color: 'blue',
      position: posA,
      tooltip: tooltipA
    },
    {
      isMerged: false,
      slotKey: 'playerB',
      label: '我方 B',
      speed: speedB,
      color: 'yellow',
      position: posB,
      tooltip: tooltipB
    }
  ];
}
