// Global App Configuration for PokéSpeed Champion

export interface TableConfig {
  /** 預設顯示的寶可夢圖示隻數 (基準值) */
  defaultVisibleSprites: number;
  /** 寶可夢搜尋自動補全建議上限 */
  searchLimit: number;
  /** 網路與視口自適應調節設定 */
  adaptive: {
    enabled: boolean;
    /** 開啟省流量模式 (saveData) 或極慢連線時的上限 */
    saveDataLimit: number;
    /** 視口寬度斷點與對應顯示隻數 */
    breakpoints: {
      /** 手機窄螢幕 (< 768px) */
      mobile: number;
      /** 一般桌機 / 平板 (768px ~ 1439px) */
      desktop: number;
      /** 寬螢幕高效能 (>= 1440px) */
      wide: number;
    };
  };
  /** 寶可夢圖片載入策略 */
  sprites: {
    /** 替換圖片 / 破圖預設回退網址 */
    fallbackSubstitute: string;
    /** 原生圖片載入模式 ('lazy' | 'eager') */
    loadingStrategy: 'lazy' | 'eager';
  };
}

export interface BattleDefaultsConfig {
  defaultEvs: number;
  defaultNature: 0.9 | 1.0 | 1.1;
  /** 官方 VGC / 級位對戰標準等級基準 (Lv.50，速度能力值計算核心常數) */
  defaultLevel: number;
  /** 官方標準頂個體值 (31 IV，無隨機或自訂時的速線基準常數) */
  defaultIv: number;
}

export interface SeasonDefinition {
  /** 唯一識別代號，對應 formatName (如 'champion-m-b') */
  id: string;
  /** 賽制代號 (如 'm-b') */
  regulation: string;
  /** 繁體中文顯示名稱 (如 'Regulation M-B') */
  nameZh: string;
  /** 英文顯示名稱 (如 'Regulation M-B') */
  nameEn: string;
  /** 建立/發布時間註記 (可選) */
  releaseDate?: string;
  /** Smogon 雙打格式前綴覆蓋 (可選，預設依 AppConfig.smogon.defaultDoublesPrefix) */
  smogonDoublesPrefix?: string;
  /** Smogon 單打格式前綴覆蓋 (可選，預設依 AppConfig.smogon.defaultSinglesPrefix) */
  smogonSinglesPrefix?: string;
}

export interface SeasonConfig {
  /** 網站預設載入賽季 ID (GitHub Action 每 7 天亦依此更新排名) */
  currentSeason: string;
  /** 系統中已收錄並開放切換的賽季清單 (依重要/最新順序排列) */
  availableSeasons: SeasonDefinition[];
}

export interface SmogonConfig {
  /** 預設天梯分數排名門檻 (如 1500) */
  defaultCutoff: number;
  /** 雙打 Smogon 格式前綴 (如 'gen9championsvgc2026') */
  defaultDoublesPrefix: string;
  /** 單打 Smogon 格式前綴 (如 'gen9championsbss') */
  defaultSinglesPrefix: string;
}

export interface RankingConfig {
  /** 爬蟲未上榜預設排名 (0 代表未上榜，排序時安全置底) */
  unrankedRank: number;
}

export interface AppConfigType {
  season: SeasonConfig;
  table: TableConfig;
  battle: BattleDefaultsConfig;
  smogon: SmogonConfig;
  ranking: RankingConfig;
}

export const AppConfig: AppConfigType = {
  season: {
    currentSeason: 'champion-m-c',
    availableSeasons: [
      {
        id: 'champion-m-c',
        regulation: 'm-c',
        nameZh: 'Regulation M-C',
        nameEn: 'Regulation M-C',
      },
      {
        id: 'champion-m-b',
        regulation: 'm-b',
        nameZh: 'Regulation M-B',
        nameEn: 'Regulation M-B',
      },
    ],
  },
  table: {
    defaultVisibleSprites: 6,
    searchLimit: 6,
    adaptive: {
      enabled: true,
      saveDataLimit: 4,
      breakpoints: {
        mobile: 4,   // < 768px
        desktop: 6,  // 768px ~ 1439px
        wide: 8,     // >= 1440px
      },
    },
    sprites: {
      fallbackSubstitute: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
      loadingStrategy: 'lazy',
    },
  },
  battle: {
    defaultEvs: 32,
    defaultNature: 1.1,
    defaultLevel: 50,
    defaultIv: 31,
  },
  smogon: {
    defaultCutoff: 1500,
    defaultDoublesPrefix: 'gen9championsvgc2026',
    defaultSinglesPrefix: 'gen9championsbss',
  },
  ranking: {
    unrankedRank: 0,
  },
};

/**
 * 依據當前網路省流量狀態與設備視口寬度，動態計算該顯示的最適寶可夢圖示隻數
 */
export function getAdaptiveSpriteLimit(config: TableConfig = AppConfig.table): number {
  if (!config.adaptive.enabled) {
    return config.defaultVisibleSprites;
  }

  // 1. 檢測使用者是否開啟瀏覽器省流量 (Data Saver) 模式
  if (typeof navigator !== 'undefined') {
    const conn = (navigator as any).connection;
    if (conn && conn.saveData === true) {
      return config.adaptive.saveDataLimit;
    }
  }

  // 2. 檢測當前視口寬度
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) {
      return config.adaptive.breakpoints.mobile; // 4
    }
    if (width >= 1440) {
      return config.adaptive.breakpoints.wide;   // 8
    }
    return config.adaptive.breakpoints.desktop;   // 6
  }

  return config.defaultVisibleSprites;
}

/** 替換圖片 / 破圖預設回退網址 */
export const DEFAULT_SUBSTITUTE_SPRITE = AppConfig.table.sprites.fallbackSubstitute;
