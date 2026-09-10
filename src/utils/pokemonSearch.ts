import { PokemonSpeedData, SpeedTableData } from '../types/pokemon';
import { escapeHtml, sanitizeUrl } from './security';
import { getPokemonDisplayNames, t, SupportedLocale } from '../i18n';
import { AppConfig, DEFAULT_SUBSTITUTE_SPRITE } from '../config/appConfig';

/** WeakMap cache to avoid re-flattening the same data reference. */
const flattenCache = new WeakMap<SpeedTableData, PokemonSpeedData[]>();

/**
 * Flattens all Pokemon from format speed table data into a single array.
 * Results are memoized per data reference so repeated calls with the
 * same object (e.g. from Header and Drawer) return a cached array.
 */
export function getAllPokemon(data: SpeedTableData): PokemonSpeedData[] {
  const cached = flattenCache.get(data);
  if (cached) return cached;

  const list: PokemonSpeedData[] = [];
  for (const base of Object.keys(data)) {
    const pokemons = data[Number(base)];
    if (pokemons) {
      list.push(...pokemons);
    }
  }
  flattenCache.set(data, list);
  return list;
}

/** Shared data preparation for search result rendering. */
function prepareSearchItemData(p: PokemonSpeedData, locale: SupportedLocale) {
  const dict = t(locale);
  const { primary, secondary } = getPokemonDisplayNames(p, locale);
  return {
    dict,
    safePrimary: escapeHtml(primary),
    safeSecondary: escapeHtml(secondary),
    safeSprite: sanitizeUrl(p.sprite, DEFAULT_SUBSTITUTE_SPRITE),
    safeFormId: escapeHtml(p.formId),
  };
}

/**
 * Renders HTML for a single search result item in the global Header search dropdown.
 */
export function renderHeaderSearchItem(p: PokemonSpeedData, locale: SupportedLocale): string {
  const { dict, safePrimary, safeSecondary, safeSprite, safeFormId } = prepareSearchItemData(p, locale);

  const doubleRankStr = p.usageRankDouble > 0 ? `#${p.usageRankDouble}` : '#--';
  const singleRankStr = p.usageRankSingle > 0 ? `#${p.usageRankSingle}` : '#--';

  return `
    <div class="search-item p-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0" 
         data-base="${p.baseSpeed}" data-form-id="${safeFormId}">
      <img src="${safeSprite}" class="w-8 h-8 object-contain flex-shrink-0" alt="${safePrimary}">
      <div class="flex flex-col min-w-0 flex-1">
        <span class="text-sm font-bold text-gray-200 truncate">${safePrimary}</span>
        <span class="text-xs text-gray-400 truncate">${safeSecondary} (${dict.common.searchSpeedLabel}: ${p.baseSpeed} | ${dict.common.searchDoublesLabel}: ${doubleRankStr} | ${dict.common.searchSinglesLabel}: ${singleRankStr})</span>
      </div>
    </div>
  `.trim();
}

/**
 * Renders HTML for a single search result item in the Battle Settings Drawer Pokemon dropdown.
 */
export function renderDrawerSearchItem(p: PokemonSpeedData, locale: SupportedLocale): string {
  const { dict, safePrimary, safeSecondary, safeSprite, safeFormId } = prepareSearchItemData(p, locale);

  return `
    <div class="slot-search-item p-2 hover:bg-white/10 cursor-pointer flex items-center justify-between gap-2 transition-colors" 
         data-form-id="${safeFormId}">
      <div class="flex items-center gap-2 min-w-0">
        <img src="${safeSprite}" class="w-7 h-7 object-contain flex-shrink-0" alt="${safePrimary}" />
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-gray-200 truncate">${safePrimary}</span>
          <span class="text-[10px] text-gray-400 truncate">${safeSecondary}</span>
        </div>
      </div>
      <span class="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
        ${dict.common.searchSpeedLabel} ${p.baseSpeed}
      </span>
    </div>
  `.trim();
}


interface SearchIndexEntry {
  pokemon: PokemonSpeedData;
  nameZh: string;
  nameEnLower: string;
  speedStr: string;
}

/** Memoized search index cache to avoid per-keystroke toLowerCase() and toString() string allocations. */
const searchIndexMap = new WeakMap<PokemonSpeedData[], SearchIndexEntry[]>();

function getSearchIndex(allPokemon: PokemonSpeedData[]): SearchIndexEntry[] {
  let index = searchIndexMap.get(allPokemon);
  if (!index) {
    index = allPokemon.map(p => ({
      pokemon: p,
      nameZh: p.nameZh,
      nameEnLower: p.nameEn.toLowerCase(),
      speedStr: p.baseSpeed.toString(),
    }));
    searchIndexMap.set(allPokemon, index);
  }
  return index;
}

/**
 * Searches and ranks Pokemon by Chinese name, English name, or base speed stat.
 *
 * Matching rules:
 * 1. Chinese name contains query
 * 2. English name contains query (case-insensitive)
 * 3. Base speed starts with query (covers exact match)
 *
 * Ranking rule:
 * Sorted ascendingly by usageRankDouble or usageRankSingle based on current mode,
 * with unranked (0) pushed to bottom (Infinity), and pokemon id as tiebreaker.
 *
 * @param allPokemon Array of Pokemon data
 * @param query Search query from user
 * @param isDouble Whether current mode is double battle
 * @param limit Maximum number of matches to return (default: AppConfig.table.searchLimit)
 * @returns Filtered and sorted array of PokemonSpeedData
 */
export function searchPokemon(
  allPokemon: PokemonSpeedData[],
  query: string,
  isDouble: boolean,
  limit: number = AppConfig.table.searchLimit
): PokemonSpeedData[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const index = getSearchIndex(allPokemon);
  const matches: PokemonSpeedData[] = [];
  for (let i = 0; i < index.length; i++) {
    const item = index[i];
    if (
      item.nameZh.includes(normalizedQuery) ||
      item.nameEnLower.includes(normalizedQuery) ||
      item.speedStr.startsWith(normalizedQuery)
    ) {
      matches.push(item.pokemon);
    }
  }

  return matches
    .sort((a, b) => {
      const rawRankA = isDouble ? a.usageRankDouble : a.usageRankSingle;
      const rawRankB = isDouble ? b.usageRankDouble : b.usageRankSingle;
      const rankA = rawRankA || Infinity;
      const rankB = rawRankB || Infinity;
      if (rankA !== rankB) return rankA - rankB;
      return a.id - b.id;
    })
    .slice(0, limit);
}
