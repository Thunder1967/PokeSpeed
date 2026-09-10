import championMC from './champion-m-c.json';
import { SpeedTableData } from '../../types/pokemon';
import championMB from './champion-m-b.json';
import { AppConfig } from '../../config/appConfig';

export { championMC, championMB };

export const formatDataRegistry: Record<string, SpeedTableData> = {
  'champion-m-c': championMC as unknown as SpeedTableData,
  'champion-m-b': championMB as unknown as SpeedTableData,
};

/**
 * 依據 formatId 取得對應賽季之速線資料
 * 若未匹配則回退至預設賽季資料 (動態參照 AppConfig.season.currentSeason)
 */
export function getFormatData(
  formatId: string,
  fallbackId: string = AppConfig.season.currentSeason
): SpeedTableData {
  return (
    formatDataRegistry[formatId] ||
    formatDataRegistry[fallbackId] ||
    formatDataRegistry[AppConfig.season.currentSeason] ||
    (championMB as unknown as SpeedTableData)
  );
}
