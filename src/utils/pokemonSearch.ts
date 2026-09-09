import { PokemonSpeedData } from '../types/pokemon';

/**
 * Searches and ranks Pokemon by Chinese name, English name, or base speed stat.
 *
 * Matching rules:
 * 1. Chinese name contains query
 * 2. English name contains query (case-insensitive)
 * 3. Base speed exactly equals query
 * 4. Base speed starts with query
 *
 * Ranking rule:
 * Sorted ascendingly by usageRankDouble or usageRankSingle based on current mode,
 * with pokemon id as tiebreaker.
 *
 * @param allPokemon Array of Pokemon data
 * @param query Search query from user
 * @param isDouble Whether current mode is double battle
 * @param limit Maximum number of matches to return (default: 6)
 * @returns Filtered and sorted array of PokemonSpeedData
 */
export function searchPokemon(
  allPokemon: PokemonSpeedData[],
  query: string,
  isDouble: boolean,
  limit: number = 6
): PokemonSpeedData[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const matches = allPokemon.filter(p => {
    const nameZhMatch = p.nameZh.includes(normalizedQuery);
    const nameEnMatch = p.nameEn.toLowerCase().includes(normalizedQuery);
    const baseSpeedStr = p.baseSpeed.toString();
    const speedExactMatch = baseSpeedStr === normalizedQuery;
    const speedPrefixMatch = baseSpeedStr.startsWith(normalizedQuery);

    return nameZhMatch || nameEnMatch || speedExactMatch || speedPrefixMatch;
  });

  return matches
    .sort((a, b) => {
      const rankA = isDouble ? a.usageRankDouble : a.usageRankSingle;
      const rankB = isDouble ? b.usageRankDouble : b.usageRankSingle;
      if (rankA !== rankB) return rankA - rankB;
      return a.id - b.id;
    })
    .slice(0, limit);
}
