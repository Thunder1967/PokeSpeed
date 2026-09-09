import { fetchWithCache } from './cache-manager.js';
import { toShowdownId } from './showdown-parser.js';

const SMOGON_STATS_BASE = 'https://www.smogon.com/stats/';

export interface SmogonUsageEntry {
  rank: number;
  pokemon: string;
  usagePercent: number;
}

export interface SmogonStatsResult {
  month: string;
  doubles: Map<string, SmogonUsageEntry>;
  singles: Map<string, SmogonUsageEntry>;
}

/**
 * Parses a Smogon text stats table into a Map of normalized ID -> SmogonUsageEntry
 */
export function parseSmogonTable(text: string): Map<string, SmogonUsageEntry> {
  const map = new Map<string, SmogonUsageEntry>();
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([0-9.]+)%/);
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
 * Resolves the available month and fetches Doubles and Singles ladder data
 */
export async function fetchSmogonLadderStats(
  regulation: string = 'm-b',
  requestedMonth?: string,
  cutoff: number = 1500,
  force: boolean = false
): Promise<SmogonStatsResult> {
  const regCode = regulation.toLowerCase() === 'm-a' ? 'regma' : 'regmb';
  const doublesFormat = `gen9championsvgc2026${regCode}-${cutoff}.txt`;
  const singlesFormat = `gen9championsbss${regCode}-${cutoff}.txt`;

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

  try {
    doublesText = await fetchWithCache(doublesUrl, 24 * 60 * 60 * 1000, force);
  } catch (err) {
    console.warn(`[Smogon Stats] Warning: Failed to fetch doubles stats from ${doublesUrl}:`, err);
  }

  try {
    singlesText = await fetchWithCache(singlesUrl, 24 * 60 * 60 * 1000, force);
  } catch (err) {
    console.warn(`[Smogon Stats] Warning: Failed to fetch singles stats from ${singlesUrl}:`, err);
  }

  const doubles = parseSmogonTable(doublesText);
  const singles = parseSmogonTable(singlesText);

  console.log(`[Smogon Stats] Loaded ${doubles.size} ranked Doubles Pokémon and ${singles.size} ranked Singles Pokémon.`);

  return {
    month: targetMonth,
    doubles,
    singles,
  };
}
