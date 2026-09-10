import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from '../src/config/appConfig.js';
import { fetchSmogonLadderStats } from './lib/smogon-stats.js';
import { toShowdownId } from './lib/showdown-parser.js';

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

type SpeedTableData = Record<string | number, PokemonSpeedData[]>;

/**
 * 記錄錯誤訊息至 scripts/logs/update-error.log
 */
async function logErrorToFile(message: string) {
  try {
    const logsDir = path.resolve(process.cwd(), 'scripts/logs');
    await fs.mkdir(logsDir, { recursive: true });
    const logFilePath = path.join(logsDir, 'update-error.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(logFilePath, logEntry, 'utf8');
    console.log(`[Log] Recorded failure details to ${logFilePath}`);
  } catch (err) {
    console.warn(`[Log] Failed to write to update-error.log:`, err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const formatArg = args.find(a => a.startsWith('--format='));
  const monthArg = args.find(a => a.startsWith('--month='));
  const cutoffArg = args.find(a => a.startsWith('--cutoff='));
  const doublesPrefixArg = args.find(a => a.startsWith('--doubles-prefix='));
  const singlesPrefixArg = args.find(a => a.startsWith('--singles-prefix='));
  const force = args.includes('--force');

  // 若未指定 --format，預設使用 AppConfig.season.currentSeason
  const targetFormatId = formatArg
    ? formatArg.split('=')[1]
    : AppConfig.season.currentSeason;

  const regulation = targetFormatId.replace(/^champion-/, '');
  const formatName = targetFormatId.startsWith('champion-')
    ? targetFormatId
    : `champion-${regulation}`;

  // 取得賽季定義以檢查是否有賽季專屬之 Smogon 前綴
  const seasonDef = AppConfig.season.availableSeasons.find(
    s => s.id === targetFormatId || s.regulation === regulation
  );

  const requestedMonth = monthArg ? monthArg.split('=')[1] : undefined;
  const cutoff = cutoffArg ? parseInt(cutoffArg.split('=')[1], 10) : AppConfig.smogon.defaultCutoff;
  const doublesPrefix = doublesPrefixArg
    ? doublesPrefixArg.split('=')[1]
    : seasonDef?.smogonDoublesPrefix || AppConfig.smogon.defaultDoublesPrefix;
  const singlesPrefix = singlesPrefixArg
    ? singlesPrefixArg.split('=')[1]
    : seasonDef?.smogonSinglesPrefix || AppConfig.smogon.defaultSinglesPrefix;

  console.log(`====================================================`);
  console.log(`PokéSpeed Rankings Pipeline: ${formatName} (Reg ${regulation.toUpperCase()})`);
  console.log(`Smogon Cutoff: ${cutoff} | Doubles: ${doublesPrefix} | Singles: ${singlesPrefix}`);
  console.log(`====================================================`);

  // Step 1: 讀取現有的賽季資料 JSON
  const formatFilePath = path.resolve(process.cwd(), `src/data/formats/${formatName}.json`);
  let dataRaw: string;
  try {
    dataRaw = await fs.readFile(formatFilePath, 'utf8');
  } catch {
    console.error(`[Error] Target format file not found: ${formatFilePath}`);
    console.error(`Please run "npm run fetch:season -- --format=${regulation}" first to download the roster.`);
    process.exit(1);
  }

  const speedData: SpeedTableData = JSON.parse(dataRaw);
  console.log(`Loaded existing format file with ${Object.keys(speedData).length} speed tiers.`);

  // Step 2: 自 Smogon Stats 抓取單雙打天梯數據
  console.log(`Fetching Smogon Stats for Regulation ${regulation.toUpperCase()}...`);
  const stats = await fetchSmogonLadderStats(regulation, requestedMonth, cutoff, force, {
    doublesPrefix,
    singlesPrefix,
  });

  // Step 3: 404 容錯檢測
  const bothFailed = !stats.doublesSuccess && !stats.singlesSuccess;
  const partialFailed = (!stats.doublesSuccess && stats.singlesSuccess) || (stats.doublesSuccess && !stats.singlesSuccess);

  if (bothFailed) {
    const errorMsg = `Failed to fetch Smogon ladder rankings for format "${formatName}" (month: ${stats.month || 'unknown'}):
  - Doubles URL: ${stats.doublesUrl} (${stats.doublesError || '404 Not Found'})
  - Singles URL: ${stats.singlesUrl} (${stats.singlesError || '404 Not Found'})
  All rankings remain unchanged (${AppConfig.ranking.unrankedRank} or previous values). Waiting for next scheduled update cycle.`;

    console.warn(`\n[Warning] ${errorMsg}\n`);
    await logErrorToFile(errorMsg);
    console.log(`[Done] Exiting cleanly with code 0 (no data changes).`);
    process.exitCode = 0;
    return;
  }

  if (partialFailed) {
    const failedMode = !stats.doublesSuccess ? 'Doubles' : 'Singles';
    const failedUrl = !stats.doublesSuccess ? stats.doublesUrl : stats.singlesUrl;
    const failedErr = !stats.doublesSuccess ? stats.doublesError : stats.singlesError;

    const warnMsg = `Partial ladder data fetch for format "${formatName}" (month: ${stats.month}):
  ${failedMode} URL failed: ${failedUrl} (${failedErr || '404 Not Found'}).
  Only updating successful mode while keeping ${failedMode} rankings unchanged.`;

    console.warn(`\n[Warning] ${warnMsg}\n`);
    await logErrorToFile(warnMsg);
  }

  // Step 4: 遍歷更新各 speedTier 內部寶可夢之排名與使用率
  console.log(`Applying rankings from month "${stats.month}" to ${formatName}...`);
  let updatedCount = 0;

  for (const speed of Object.keys(speedData)) {
    const list = speedData[speed];
    for (const poke of list) {
      const normId = toShowdownId(poke.nameEn);
      const formIdNorm = toShowdownId(poke.formId);

      // 若雙打抓取成功，更新雙打排名；若雙打失敗則保留原值
      if (stats.doublesSuccess) {
        const doubleEntry = stats.doubles.get(normId) || stats.doubles.get(formIdNorm);
        if (doubleEntry) {
          poke.usageRankDouble = doubleEntry.rank;
          poke.usagePercentDouble = doubleEntry.usagePercent;
          updatedCount++;
        } else {
          poke.usageRankDouble = AppConfig.ranking.unrankedRank;
          poke.usagePercentDouble = 0;
        }
      }

      // 若單打抓取成功，更新單打排名；若單打失敗則保留原值
      if (stats.singlesSuccess) {
        const singleEntry = stats.singles.get(normId) || stats.singles.get(formIdNorm);
        if (singleEntry) {
          poke.usageRankSingle = singleEntry.rank;
          poke.usagePercentSingle = singleEntry.usagePercent;
          updatedCount++;
        } else {
          poke.usageRankSingle = AppConfig.ranking.unrankedRank;
          poke.usagePercentSingle = 0;
        }
      }
    }

    // 依雙打排名由小到大 (熱門度由高到低) 重新排序，未上榜 (0) 置底
    list.sort((a, b) => {
      const rankA = a.usageRankDouble || Infinity;
      const rankB = b.usageRankDouble || Infinity;
      if (rankA !== rankB) return rankA - rankB;
      return a.id - b.id;
    });
  }

  // Step 5: 寫回 JSON 檔案
  await fs.writeFile(formatFilePath, JSON.stringify(speedData, null, 2), 'utf8');

  console.log(`----------------------------------------------------`);
  console.log(`[Success] Rankings updated successfully!`);
  console.log(`  Target Format:  ${formatName}`);
  console.log(`  File Updated:   ${formatFilePath}`);
  console.log(`  Ladder Month:   ${stats.month}`);
  console.log(`  Ranked Updates: ${updatedCount} entries updated`);
  console.log(`----------------------------------------------------`);
}

main().catch(err => {
  console.error('[Error] Rankings update pipeline failed:', err);
  process.exit(1);
});
