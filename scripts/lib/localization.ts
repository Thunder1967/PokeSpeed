import { fetchWithCache } from './cache-manager.js';
import nameOverrideData from './name-override.json' with { type: 'json' };

const POKEAPI_SPECIES_NAMES_CSV = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv';

let idToZhMap: Map<number, string> | null = null;

/**
 * Loads and caches PokeAPI official Traditional Chinese names (language id = 4)
 */
export async function initLocalization(force: boolean = false): Promise<void> {
  if (idToZhMap && !force) return;

  const csvText = await fetchWithCache(POKEAPI_SPECIES_NAMES_CSV, 30 * 24 * 60 * 60 * 1000, force);
  const map = new Map<number, string>();

  for (const line of csvText.split('\n')) {
    const parts = line.split(',');
    // pokemon_species_id, local_language_id, name, genus
    if (parts.length >= 3 && parts[1] === '4') {
      const id = parseInt(parts[0], 10);
      map.set(id, parts[2].trim());
    }
  }

  idToZhMap = map;
}

/**
 * Clean and normalize a string key for dictionary lookup
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const overrideDict: Record<string, string> = {};
for (const [k, v] of Object.entries(nameOverrideData)) {
  overrideDict[normalizeKey(k)] = v;
}

export interface PokemonMeta {
  num: number;
  name: string;
  forme?: string;
  baseSpecies?: string;
}

/**
 * Resolves the Traditional Chinese name for a Pokemon / form
 */
export function getTraditionalChineseName(key: string, meta: PokemonMeta): string {
  const normKey = normalizeKey(key);
  if (overrideDict[normKey]) {
    return overrideDict[normKey];
  }

  const normName = normalizeKey(meta.name);
  if (overrideDict[normName]) {
    return overrideDict[normName];
  }

  const baseZh = idToZhMap?.get(meta.num) || meta.baseSpecies || meta.name;

  if (!meta.forme) {
    return baseZh;
  }

  const forme = meta.forme;

  // Handle Mega Evolutions
  if (forme === 'Mega') {
    return `超級${baseZh}`;
  }
  if (forme === 'Mega-X') {
    return `超級${baseZh} X`;
  }
  if (forme === 'Mega-Y') {
    return `超級${baseZh} Y`;
  }

  // Handle Regional Formes
  if (forme === 'Alola') {
    return `${baseZh} (阿羅拉)`;
  }
  if (forme === 'Galar') {
    return `${baseZh} (伽勒爾)`;
  }
  if (forme === 'Hisui') {
    return `${baseZh} (洗翠)`;
  }
  if (forme === 'Paldea') {
    return `${baseZh} (帕底亞)`;
  }
  if (forme === 'Paldea-Combat') {
    return `${baseZh} (帕底亞鬥戰種)`;
  }
  if (forme === 'Paldea-Blaze') {
    return `${baseZh} (帕底亞火熾種)`;
  }
  if (forme === 'Paldea-Aqua') {
    return `${baseZh} (帕底亞水瀾種)`;
  }

  // Handle Formes
  if (forme === 'Therian') {
    return `${baseZh} (靈獸)`;
  }
  if (forme === 'Wash') {
    return `${baseZh} (清洗)`;
  }
  if (forme === 'Heat') {
    return `${baseZh} (加熱)`;
  }
  if (forme === 'Frost') {
    return `${baseZh} (結冰)`;
  }
  if (forme === 'Fan') {
    return `${baseZh} (旋轉)`;
  }
  if (forme === 'Mow') {
    return `${baseZh} (切割)`;
  }
  if (forme === 'Origin') {
    return `${baseZh} (起源)`;
  }

  return `${baseZh} (${forme})`;
}
