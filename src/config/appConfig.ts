// Global App Configuration for PokéSpeed Champion

export interface TableConfig {
  /** 預設顯示的寶可夢圖示隻數 (基準值) */
  defaultVisibleSprites: number;
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
  defaultNature: number;
  defaultLevel: number;
  defaultIv: number;
}

export interface AppConfigType {
  table: TableConfig;
  battle: BattleDefaultsConfig;
}

export const AppConfig: AppConfigType = {
  table: {
    defaultVisibleSprites: 6,
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
    defaultNature: 1.0,
    defaultLevel: 50,
    defaultIv: 31,
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
