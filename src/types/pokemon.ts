export interface PokemonSpeedData {
  id: number;                // 全國圖鑑編號
  formId: string;            // 形態唯一代號
  nameZh: string;            // 繁體中文名稱
  nameEn: string;            // 英文名稱
  baseSpeed: number;         // 該形態專屬速度種族值
  sprite: string;            // 官方點陣/圖標檔名或 URL
  usageRankSingle: number;   // 單打環境使用率排名
  usageRankDouble: number;   // 雙打環境使用率排名
}

export type SpeedTableData = Record<number, PokemonSpeedData[]>;

export interface BattleState {
  isDoubleBattle: boolean;
  activeFormat: string;
  // Options for a specific slot (Player A, Player B, or Enemy Benchmark)
  slots: {
    enemy: SlotState;
    playerA: SlotState;
    playerB: SlotState;
  };
}

export interface SlotState {
  evs: number; // 0 ~ 32
  nature: 1.1 | 1.0 | 0.9;
  stages: number; // -6 to +6
  isTailwind: boolean;
  isScarf: boolean;
  isAbilityBoost: boolean; // e.g. Swift Swim
  abilityMultiplier: number; // e.g. 2.0 or 1.5
  isParalyzed: boolean;
  baseSpeed?: number;
}
