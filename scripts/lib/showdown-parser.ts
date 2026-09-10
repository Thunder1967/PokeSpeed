import { fetchWithCache } from './cache-manager.js';

const SHOWDOWN_POKEDEX_URL = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/pokedex.ts';

export interface ShowdownSpeciesData {
  num: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: Record<string, string>;
  baseSpecies?: string;
  forme?: string;
  isMega?: boolean;
}

export interface ShowdownFormatEntry {
  tier?: string;
  doublesTier?: string;
  isNonstandard?: string;
}

/**
 * Normalizes an identifier string into Showdown's standard key format
 */
export function toShowdownId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Loads and parses Showdown's complete Pokédex
 */
export async function loadShowdownPokedex(force: boolean = false): Promise<Record<string, ShowdownSpeciesData>> {
  const text = await fetchWithCache(SHOWDOWN_POKEDEX_URL, 24 * 60 * 60 * 1000, force);
  const cleaned = text.replace(/export const Pokedex:[^=]+=\s*/, 'return ');
  return new Function(cleaned)() as Record<string, ShowdownSpeciesData>;
}

/**
 * Loads and parses Showdown's Champions formats-data for a specific regulation
 */
export async function loadChampionsFormatsData(regulation: string = 'm-b', force: boolean = false): Promise<Record<string, ShowdownFormatEntry>> {
  const clean = regulation.toLowerCase().replace(/^champion-/, '').replace(/[^a-z0-9]/g, '');
  const regCode = clean.startsWith('reg') ? clean : `reg${clean}`;

  // 優先嘗試專屬 mod 目錄 (例如 championsregma, championsregmc)，若不存在則回退至現行主目錄 champions
  const modCandidates = [
    `champions${regCode}`,
    'champions',
  ];

  let lastError: unknown;
  for (const modName of modCandidates) {
    const url = `https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/mods/${modName}/formats-data.ts`;
    try {
      const text = await fetchWithCache(url, 24 * 60 * 60 * 1000, force);
      const cleaned = text.replace(/export const FormatsData:[^=]+=\s*/, 'return ');
      return new Function(cleaned)() as Record<string, ShowdownFormatEntry>;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to load Showdown formats-data for regulation ${regulation}`);
}

/**
 * Extracts all legal species for the target regulation
 */
export async function getLegalSpecies(
  regulation: string = 'm-b',
  force: boolean = false
): Promise<Map<string, { id: string; pokedex: ShowdownSpeciesData; format: ShowdownFormatEntry }>> {
  const [pokedex, formatsData] = await Promise.all([
    loadShowdownPokedex(force),
    loadChampionsFormatsData(regulation, force),
  ]);

  const legalMap = new Map<string, { id: string; pokedex: ShowdownSpeciesData; format: ShowdownFormatEntry }>();

  for (const [id, format] of Object.entries(formatsData)) {
    // Exclude illegal / past / future entries
    if (format.tier === 'Illegal' || format.isNonstandard === 'Past' || format.isNonstandard === 'Future') {
      continue;
    }

    const poke = pokedex[id];
    if (!poke || !poke.baseStats) {
      continue;
    }

    legalMap.set(id, {
      id,
      pokedex: poke,
      format,
    });
  }

  return legalMap;
}

/**
 * Computes Showdown's standard sprite slug for a Pokemon or form
 */
export function getSpriteSlug(_id: string, poke: ShowdownSpeciesData): string {
  if (poke.forme) {
    const base = (poke.baseSpecies || poke.name.split('-')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    const f = poke.forme.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${base}-${f}`;
  }
  return poke.name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves the accurate sprite URL for a Pokémon (Mega, Regional form, or normal)
 */
export async function resolveBestSpriteUrl(id: string, poke: ShowdownSpeciesData): Promise<string> {
  const slug = getSpriteSlug(id, poke);
  const candidates = [
    `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`,
    `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`,
    `https://play.pokemonshowdown.com/sprites/dex/${slug}.png`,
    `https://play.pokemonshowdown.com/sprites/gen5/${id}.png`,
    `https://play.pokemonshowdown.com/sprites/ani/${id}.gif`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.num}.png`
  ];

  for (const u of candidates) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      if (res.ok) {
        return u;
      }
    } catch {}
  }

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.num || 0}.png`;
}
