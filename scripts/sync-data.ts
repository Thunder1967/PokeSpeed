import fs from 'fs/promises';
import path from 'path';
import { initLocalization, getTraditionalChineseName } from './lib/localization.js';
import { getLegalSpecies, toShowdownId, resolveBestSpriteUrl } from './lib/showdown-parser.js';
import { fetchSmogonLadderStats } from './lib/smogon-stats.js';

interface PokemonSpeedData {
  id: number;
  formId: string;
  nameZh: string;
  nameEn: string;
  baseSpeed: number;
  sprite: string;
  usageRankSingle: number;
  usageRankDouble: number;
  usagePercentSingle?: number;
  usagePercentDouble?: number;
}

function toKebabCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  const formatArg = args.find(a => a.startsWith('--format='));
  const monthArg = args.find(a => a.startsWith('--month='));
  const cutoffArg = args.find(a => a.startsWith('--cutoff='));
  const force = args.includes('--force');

  const rawFormat = formatArg ? formatArg.split('=')[1] : 'm-b';
  const regulation = rawFormat.replace(/^champion-/, '');
  const formatName = `champion-${regulation}`;
  const requestedMonth = monthArg ? monthArg.split('=')[1] : undefined;
  const cutoff = cutoffArg ? parseInt(cutoffArg.split('=')[1], 10) : 1500;

  console.log(`====================================================`);
  console.log(`PokéSpeed Data Pipeline: Regulation ${regulation.toUpperCase()}`);
  console.log(`====================================================`);

  // Step 1: Initialize Localization dictionary
  console.log(`[Step 1/5] Initializing PokeAPI localization dictionary...`);
  await initLocalization(force);

  // Step 2: Fetch legal species from Pokemon Showdown
  console.log(`[Step 2/5] Fetching legal species from Pokémon Showdown (${regulation})...`);
  const legalSpecies = await getLegalSpecies(regulation, force);
  console.log(`Found ${legalSpecies.size} legal species entries for Regulation ${regulation.toUpperCase()}.`);

  // Step 3: Fetch Smogon Stats (Singles & Doubles ladder rankings)
  console.log(`[Step 3/5] Fetching Smogon Stats ladder rankings...`);
  const stats = await fetchSmogonLadderStats(regulation, requestedMonth, cutoff, force);

  // Step 4: Assemble PokemonSpeedData entries with accurate sprite resolution
  console.log(`[Step 4/5] Resolving sprites and assembling speed entries...`);
  const allEntries: PokemonSpeedData[] = [];
  const rosterFormIds: string[] = [];

  const speciesList = Array.from(legalSpecies.entries());
  const batchSize = 30;

  for (let i = 0; i < speciesList.length; i += batchSize) {
    const chunk = speciesList.slice(i, i + batchSize);
    const chunkEntries = await Promise.all(
      chunk.map(async ([id, entry]) => {
        const poke = entry.pokedex;
        const formId = toKebabCase(poke.name);

        const nameZh = getTraditionalChineseName(id, {
          num: poke.num,
          name: poke.name,
          forme: poke.forme,
          baseSpecies: poke.baseSpecies,
        });

        // Lookup ladder ranking by normalized ID
        const normId = toShowdownId(poke.name);
        const doubleStats = stats.doubles.get(normId) || stats.doubles.get(id);
        const singleStats = stats.singles.get(normId) || stats.singles.get(id);

        // Resolve accurate sprite URL (handles Megas, Regional forms, and normal Pokémon)
        const sprite = await resolveBestSpriteUrl(id, poke);

        const item: PokemonSpeedData = {
          id: poke.num,
          formId,
          nameZh,
          nameEn: poke.name,
          baseSpeed: poke.baseStats.spe,
          sprite,
          usageRankSingle: singleStats ? singleStats.rank : 999,
          usageRankDouble: doubleStats ? doubleStats.rank : 999,
          usagePercentSingle: singleStats ? singleStats.usagePercent : 0,
          usagePercentDouble: doubleStats ? doubleStats.usagePercent : 0,
        };

        return { formId, item };
      })
    );

    for (const { formId, item } of chunkEntries) {
      rosterFormIds.push(formId);
      allEntries.push(item);
    }
  }

  // Step 5: Group by baseSpeed and sort internally by usageRankDouble
  console.log(`[Step 5/5] Grouping by speed and sorting by popularity...`);
  const groupedData: Record<number, PokemonSpeedData[]> = {};

  for (const p of allEntries) {
    if (!groupedData[p.baseSpeed]) {
      groupedData[p.baseSpeed] = [];
    }
    groupedData[p.baseSpeed].push(p);
  }

  // Sort each row so most popular Pokemon appear first in Doubles
  for (const speed of Object.keys(groupedData)) {
    const numSpeed = Number(speed);
    groupedData[numSpeed].sort((a, b) => a.usageRankDouble - b.usageRankDouble);
  }

  // File outputs
  const outDir = path.resolve(process.cwd(), 'src/data/formats');
  const rosterDir = path.resolve(process.cwd(), 'scripts/rosters');
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(rosterDir, { recursive: true });

  const outPath = path.join(outDir, `${formatName}.json`);
  const rosterPath = path.join(rosterDir, `${formatName}.json`);

  await fs.writeFile(outPath, JSON.stringify(groupedData, null, 2), 'utf8');
  await fs.writeFile(rosterPath, JSON.stringify(rosterFormIds, null, 2), 'utf8');

  // Update src/data/formats/index.ts
  const indexPath = path.join(outDir, 'index.ts');
  const indexContent = `export { default as championMB } from './champion-m-b.json';\n`;
  await fs.writeFile(indexPath, indexContent, 'utf8');

  console.log(`----------------------------------------------------`);
  console.log(`[Success] Output generated successfully!`);
  console.log(`  Format Data:   ${outPath}`);
  console.log(`  Roster List:   ${rosterPath}`);
  console.log(`  Total Pokémon: ${allEntries.length}`);
  console.log(`  Speed Tiers:   ${Object.keys(groupedData).length} distinct base speeds`);
  console.log(`----------------------------------------------------`);
}

main().catch(err => {
  console.error('[Error] Pipeline failed:', err);
  process.exit(1);
});
