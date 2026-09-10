import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from '../src/config/appConfig.js';
import { initLocalization, getTraditionalChineseName } from './lib/localization.js';
import { getLegalSpecies, resolveBestSpriteUrl } from './lib/showdown-parser.js';

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

/**
 * 格式化 Regulation 代號轉成標準變數名稱 (e.g. 'm-b' -> 'championMB', 'm-c' -> 'championMC')
 */
function toCamelCaseIdentifier(formatName: string): string {
  return formatName.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase());
}

/**
 * 自動將新賽季追加註冊至 src/config/appConfig.ts
 */
async function registerSeasonInAppConfig(formatName: string, regulation: string) {
  const configPath = path.resolve(process.cwd(), 'src/config/appConfig.ts');
  try {
    let content = await fs.readFile(configPath, 'utf8');

    // 檢查是否已存在該賽季 ID
    if (content.includes(`id: '${formatName}'`) || content.includes(`id: "${formatName}"`)) {
      console.log(`[Auto-Register] Season ${formatName} already exists in appConfig.ts.`);
      return;
    }

    const regUpper = regulation.toUpperCase();
    const newEntry = `      {\n        id: '${formatName}',\n        regulation: '${regulation}',\n        nameZh: 'Regulation ${regUpper}',\n        nameEn: 'Regulation ${regUpper}',\n      },`;

    // 在 availableSeasons: [ 後方插入
    if (content.includes('availableSeasons: [')) {
      content = content.replace(
        'availableSeasons: [',
        `availableSeasons: [\n${newEntry}`
      );
      await fs.writeFile(configPath, content, 'utf8');
      console.log(`[Auto-Register] Successfully registered ${formatName} in src/config/appConfig.ts.`);
    }
  } catch (err) {
    console.warn(`[Auto-Register] Failed to auto-update appConfig.ts:`, err);
  }
}

/**
 * 自動將新賽季追加註冊至 src/data/formats/index.ts
 */
async function registerSeasonInFormatsIndex(formatName: string) {
  const indexPath = path.resolve(process.cwd(), 'src/data/formats/index.ts');
  try {
    let content = await fs.readFile(indexPath, 'utf8');

    if (content.includes(`'${formatName}':`)) {
      console.log(`[Auto-Register] Season ${formatName} already exported in formats/index.ts.`);
      return;
    }

    const varName = toCamelCaseIdentifier(formatName);
    const importLine = `import ${varName} from './${formatName}.json';\n`;

    // 插入 import 敘述
    content = `${importLine}${content}`;

    // 在 export { ... } 中匯出
    if (content.includes('export {')) {
      content = content.replace('export {', `export { ${varName},`);
    }

    // 在 formatDataRegistry 中註冊
    if (content.includes('formatDataRegistry: Record<string, SpeedTableData> = {')) {
      content = content.replace(
        'formatDataRegistry: Record<string, SpeedTableData> = {',
        `formatDataRegistry: Record<string, SpeedTableData> = {\n  '${formatName}': ${varName} as unknown as SpeedTableData,`
      );
    }

    await fs.writeFile(indexPath, content, 'utf8');
    console.log(`[Auto-Register] Successfully registered ${formatName} in src/data/formats/index.ts.`);
  } catch (err) {
    console.warn(`[Auto-Register] Failed to auto-update formats/index.ts:`, err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const formatArg = args.find(a => a.startsWith('--format='));
  const force = args.includes('--force');

  const rawFormat = formatArg ? formatArg.split('=')[1] : AppConfig.season.currentSeason;
  const regulation = rawFormat.replace(/^champion-/, '');
  const formatName = `champion-${regulation}`;

  console.log(`====================================================`);
  console.log(`PokéSpeed Season Downloader: Regulation ${regulation.toUpperCase()}`);
  console.log(`(Legal Pokémon list without ladder rankings)`);
  console.log(`====================================================`);

  // Step 1: Initialize Localization dictionary
  console.log(`[Step 1/4] Initializing PokeAPI localization dictionary...`);
  await initLocalization(force);

  // Step 2: Fetch legal species from Pokemon Showdown
  console.log(`[Step 2/4] Fetching legal species from Pokémon Showdown (${regulation})...`);
  const legalSpecies = await getLegalSpecies(regulation, force);
  console.log(`Found ${legalSpecies.size} legal species entries for Regulation ${regulation.toUpperCase()}.`);

  if (legalSpecies.size === 0) {
    console.error(`[Error] No legal species found for regulation ${regulation}. Aborting.`);
    process.exit(1);
  }

  // Step 3: Assemble PokemonSpeedData entries with accurate sprite resolution
  console.log(`[Step 3/4] Resolving sprites and assembling speed entries (rank defaults to ${AppConfig.ranking.unrankedRank})...`);
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

        const sprite = await resolveBestSpriteUrl(id, poke);

        const item: PokemonSpeedData = {
          id: poke.num,
          formId,
          nameZh,
          nameEn: poke.name,
          baseSpeed: poke.baseStats.spe,
          sprite,
          usageRankSingle: AppConfig.ranking.unrankedRank,
          usageRankDouble: AppConfig.ranking.unrankedRank,
          usagePercentSingle: 0,
          usagePercentDouble: 0,
        };

        return { formId, item };
      })
    );

    for (const { formId, item } of chunkEntries) {
      rosterFormIds.push(formId);
      allEntries.push(item);
    }
  }

  // Step 4: Group by baseSpeed and sort internally by Dex ID (or formId)
  console.log(`[Step 4/4] Grouping by speed and writing JSON outputs...`);
  const groupedData: Record<number, PokemonSpeedData[]> = {};

  for (const p of allEntries) {
    if (!groupedData[p.baseSpeed]) {
      groupedData[p.baseSpeed] = [];
    }
    groupedData[p.baseSpeed].push(p);
  }

  for (const speed of Object.keys(groupedData)) {
    const numSpeed = Number(speed);
    groupedData[numSpeed].sort((a, b) => a.id - b.id);
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

  // Auto-register in appConfig.ts and formats/index.ts
  await registerSeasonInAppConfig(formatName, regulation);
  await registerSeasonInFormatsIndex(formatName);

  console.log(`----------------------------------------------------`);
  console.log(`[Success] Season data generated successfully!`);
  console.log(`  Format Data:   ${outPath}`);
  console.log(`  Roster List:   ${rosterPath}`);
  console.log(`  Total Pokémon: ${allEntries.length}`);
  console.log(`  Speed Tiers:   ${Object.keys(groupedData).length} distinct base speeds`);
  console.log(`----------------------------------------------------`);
}

main().catch(err => {
  console.error('[Error] Fetch season pipeline failed:', err);
  process.exit(1);
});
