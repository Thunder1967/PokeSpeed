import { fetchWithCache } from './cache-manager.js';
import { toShowdownId } from './showdown-parser.js';
import { AppConfig } from '../../src/config/appConfig.js';

const SMOGON_STATS_BASE = 'https://www.smogon.com/stats/';

export interface FetchSmogonOptions {
  cutoff?: number;
  doublesPrefix?: string;
  singlesPrefix?: string;
}

export interface SmogonUsageEntry {
  rank: number;
  pokemon: string;
  usagePercent: number;
}

export interface SmogonStatsResult {
  month: string;
  doubles: Map<string, SmogonUsageEntry>;
  singles: Map<string, SmogonUsageEntry>;
  doublesSuccess: boolean;
  singlesSuccess: boolean;
  doublesUrl: string;
  singlesUrl: string;
  doublesError?: string;
  singlesError?: string;
}

/**
 * Parses a Smogon text stats table into a Map of normalized ID -> SmogonUsageEntry
 */
export function parseSmogonTable(text: string): Map<string, SmogonUsageEntry> {
  const map = new Map<string, SmogonUsageEntry>();
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([0-9.]+)%/);
    if (match) {
      const rank = parseInt(match[1], 10);
      const rawName = match[2].trim();
      const usagePercent = parseFloat(match[3]);
      const id = toShowdownId(rawName);

      map.set(id, {
        rank,
        pokemon: rawName,
        usagePercent,
      });
    }
  }

  return map;
}

/**
 * 將賽制代號轉為 Smogon 格式代碼 (例如: 'm-a' -> 'regma', 'm-b' -> 'regmb', 'm-c' -> 'regmc')
 */
export function toSmogonRegCode(regulation: string): string {
  const clean = regulation.toLowerCase().replace(/^champion-/, '').replace(/[^a-z0-9]/g, '');
  return clean.startsWith('reg') ? clean : `reg${clean}`;
}

/**
 * Generates the expected Smogon stats file name given a prefix, regCode, and cutoff
 */
export function getSmogonFormatFileName(
  prefix: string,
  regCode: string,
  cutoff: number
): string {
  return `${prefix}${regCode}-${cutoff}.txt`;
}

/**
 * Resolves the available month and fetches Doubles and Singles ladder data
 */
export async function fetchSmogonLadderStats(
  regulation: string = 'm-b',
  requestedMonth?: string,
  cutoff: number = AppConfig.smogon.defaultCutoff,
  force: boolean = false,
  options?: FetchSmogonOptions
): Promise<SmogonStatsResult> {
  const regCode = toSmogonRegCode(regulation);
  const targetCutoff = options?.cutoff ?? cutoff;
  const doublesPrefix = options?.doublesPrefix || AppConfig.smogon.defaultDoublesPrefix;
  const singlesPrefix = options?.singlesPrefix || AppConfig.smogon.defaultSinglesPrefix;

  const doublesFormat = getSmogonFormatFileName(doublesPrefix, regCode, targetCutoff);
  const singlesFormat = getSmogonFormatFileName(singlesPrefix, regCode, targetCutoff);

  let targetMonth = requestedMonth && requestedMonth !== 'latest' ? requestedMonth : '';

  if (!targetMonth) {
    // Discover available months from smogon index
    const indexHtml = await fetchWithCache(SMOGON_STATS_BASE, 6 * 60 * 60 * 1000, force);
    const months = [...indexHtml.matchAll(/href="(\d{4}-\d{2})\/"/g)].map(m => m[1]);
    months.sort().reverse();

    // Find the latest month that contains the doubles file
    for (const m of months) {
      try {
        const testUrl = `${SMOGON_STATS_BASE}${m}/${doublesFormat}`;
        const res = await fetch(testUrl, { method: 'HEAD' });
        if (res.ok) {
          targetMonth = m;
          break;
        }
      } catch {
        // Continue searching
      }
    }

    if (!targetMonth && months.length > 0) {
      targetMonth = months[0];
    }
  }

  console.log(`[Smogon Stats] Using month: ${targetMonth} (Cutoff: ${cutoff})`);

  const doublesUrl = `${SMOGON_STATS_BASE}${targetMonth}/${doublesFormat}`;
  const singlesUrl = `${SMOGON_STATS_BASE}${targetMonth}/${singlesFormat}`;

  let doublesText = '';
  let singlesText = '';
  let doublesSuccess = false;
  let singlesSuccess = false;
  let doublesError: string | undefined;
  let singlesError: string | undefined;

  try {
    doublesText = await fetchWithCache(doublesUrl, 24 * 60 * 60 * 1000, force);
    doublesSuccess = true;
  } catch (err: any) {
    doublesError = err?.message || String(err);
    console.warn(`[Smogon Stats] Warning: Failed to fetch doubles stats from ${doublesUrl}:`, doublesError);
  }

  try {
    singlesText = await fetchWithCache(singlesUrl, 24 * 60 * 60 * 1000, force);
    singlesSuccess = true;
  } catch (err: any) {
    singlesError = err?.message || String(err);
    console.warn(`[Smogon Stats] Warning: Failed to fetch singles stats from ${singlesUrl}:`, singlesError);
  }

  const doubles = parseSmogonTable(doublesText);
  const singles = parseSmogonTable(singlesText);

  console.log(`[Smogon Stats] Loaded ${doubles.size} ranked Doubles Pokémon and ${singles.size} ranked Singles Pokémon.`);

  return {
    month: targetMonth,
    doubles,
    singles,
    doublesSuccess,
    singlesSuccess,
    doublesUrl,
    singlesUrl,
    doublesError,
    singlesError,
  };
}
