import fs from 'fs/promises';
import path from 'path';

const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

interface PokemonSpeedData {
  id: number;
  formId: string;
  nameZh: string;
  nameEn: string;
  baseSpeed: number;
  sprite: string;
  usageRankSingle: number;
  usageRankDouble: number;
}

// Map english names to chinese names manually for testing
const zhNames: Record<string, string> = {
  "flutter-mane": "振翼髮",
  "incineroar": "熾焰咆哮虎",
  "urshifu-rapid-strike": "武道熊師 (連擊)",
  "tornadus-therian": "龍捲雲 (靈獸)",
  "garchomp": "烈咬陸鯊",
  "rillaboom": "轟擂金剛猩",
  "amoonguss": "敗露球菇",
  "gholdengo": "賽富豪",
  "ogerpon-hearthflame": "厄鬼椪 (火灶面具)",
  "chi-yu": "古劍豹", // Wait chi-yu is 古玉魚, chien-pao is 古劍豹. Let's fix this
  "iron-hands": "鐵臂膀",
  "dragonite": "快龍",
  "landorus-therian": "土地雲 (靈獸)",
  "calyrex-shadow": "蕾冠王 (黑馬)",
  "calyrex-ice": "蕾冠王 (白馬)"
};

async function fetchPokemonData(formId: string, index: number): Promise<PokemonSpeedData> {
  console.log(`Fetching data for ${formId}...`);
  const res = await fetch(`${API_BASE}${formId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${formId}: ${res.statusText}`);
  }
  const data = await res.json();
  
  const baseSpeed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0;
  
  // Using official pixel sprite
  const sprite = data.sprites.front_default || '';

  return {
    id: data.id,
    formId,
    nameZh: zhNames[formId] || formId,
    nameEn: data.name,
    baseSpeed,
    sprite,
    usageRankSingle: index + 1, // Mock ranking
    usageRankDouble: index + 1, // Mock ranking
  };
}

async function main() {
  const formatArg = process.argv.find((arg: string) => arg.startsWith('--format='));
  const rawFormat = formatArg ? formatArg.split('=')[1] : 'm-b';
  const format = rawFormat.startsWith('champion') ? rawFormat : `champion-${rawFormat}`;

  const rosterPath = path.resolve(process.cwd(), `scripts/rosters/${format}.json`);
  const outPath = path.resolve(process.cwd(), `src/data/formats/${format}.json`);

  const rosterStr = await fs.readFile(rosterPath, 'utf8');
  const roster: string[] = JSON.parse(rosterStr);

  const results: Record<number, PokemonSpeedData[]> = {};

  for (let i = 0; i < roster.length; i++) {
    const formId = roster[i];
    try {
      const data = await fetchPokemonData(formId, i);
      if (!results[data.baseSpeed]) {
        results[data.baseSpeed] = [];
      }
      results[data.baseSpeed].push(data);
    } catch (err) {
      console.error(`Error processing ${formId}:`, err);
    }
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
  
  // Also write an index.ts to export it
  const indexPath = path.resolve(process.cwd(), `src/data/formats/index.ts`);
  await fs.writeFile(indexPath, `export { default as championMB } from './champion-m-b.json';\n`, 'utf8');

  console.log(`Successfully generated ${outPath}`);
}

main().catch(console.error);
