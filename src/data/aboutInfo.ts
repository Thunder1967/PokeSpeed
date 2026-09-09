/**
 * PokéSpeed 關於本站（佈告欄）設定檔
 * 
 * 可以在下方的 zhTW 或 en 陣列中自由新增、修改或排序文字區塊。
 * 格式範例：
 * {
 *   title: "區塊標題",
 *   date: "2026-09-09", // 可選：發布日期
 *   tag: "最新消息",     // 可選：標籤（如：更新公告、指南、資源）
 *   content: "在這裡輸入內文，可以插入超連結，例如：[前往官網](https://example.com) 或 [GitHub 專案](https://github.com)"
 * }
 */

export interface InfoBlock {
  id?: string;
  title?: string;
  date?: string;
  tag?: string;
  content: string;
}

export interface AboutData {
  'zh-TW': InfoBlock[];
  'en': InfoBlock[];
}

export const aboutInfo: AboutData = {
  'zh-TW': [
    {
      id: 'intro',
      title: '🎯 關於 PokéSpeed 冠軍速線表',
      date: '2026-09-09',
      tag: '網站簡介',
      content: 'PokéSpeed 是專為第 9 世代（朱/紫）對戰環境設計的即時速度線查詢與基準計算工具。提供單打與雙打環境完整的使用率排名、速度種族值階梯、極速/準速/圍巾即時速線，以及動態戰場狀態（順風、圍巾、能力階級、麻痺）試算。'
    },
    {
      id: 'features',
      title: '⚡ 核心功能與特色',
      tag: '功能指南',
      content: '1. **雙打 3 基準與即時速線**：在「對戰設定」中可同時配置我方 A、我方 B 與敵方基準，並在速線表中以頭像標籤動態呈現超越/落後分水嶺。\n2. **多維度極速搜尋**：支援透過中文名稱、英文名稱或速度種族值（如輸入 100）快速聚焦高亮目標寶可夢。\n3. **自適應排版與雙語系**：支援繁體中文與 English 雙語切換，且在手機、平板與桌機上均具備流暢的自適應佈局。'
    },
    {
      id: 'sources',
      title: '📚 數據來源與技術致謝',
      tag: '致謝與參考',
      content: '本站對戰數據與點陣精靈圖標參考自全球知名對戰平台 [Pokémon Showdown](https://play.pokemonshowdown.com) 以及對戰社群 [Smogon University](https://www.smogon.com/)。\n寶可夢所有版權歸 © Nintendo, Creatures, GAME FREAK 與 The Pokémon Company 所有。'
    },
    {
      id: 'feedback',
      title: '💬 回饋與開源社群',
      tag: '社群互動',
      content: '若在對戰計算或使用上有任何建議、錯誤回報，歡迎隨時至社群討論或查看開源專案與更新紀錄。祝各位訓練家在排位賽中連戰連勝！'
    }
  ],

  'en': [
    {
      id: 'intro',
      title: '🎯 About PokéSpeed Champion',
      date: '2026-09-09',
      tag: 'Overview',
      content: 'PokéSpeed is a competitive speed tier and battle benchmark tool tailored for Generation 9 VGC and Singles formats. It provides comprehensive usage rankings, base speed tiers, real-time speed calculation, and dynamic battle modifier testing (Tailwind, Choice Scarf, stat stages, and paralysis).'
    },
    {
      id: 'features',
      title: '⚡ Core Features & Highlights',
      tag: 'Guide',
      content: '1. **Doubles 3-Slot Benchmark & Speed Watersheds**: Configure Player A, Player B, and Enemy Benchmark simultaneously in Battle Settings to visualize speed tiers with avatar pin dividers.\n2. **Multi-dimensional Instant Search**: Search by Chinese name, English name, or base speed (e.g. typing 100) to instantly scroll and highlight target Pokémon.\n3. **Adaptive Layout & Bilingual Support**: Instant switching between Traditional Chinese and English with responsive layout tailored for mobile and desktop screens.'
    },
    {
      id: 'sources',
      title: '📚 Data Sources & Acknowledgments',
      tag: 'Credits',
      content: 'Battle statistics and sprite icons are referenced from [Pokémon Showdown](https://play.pokemonshowdown.com) and competitive analytics by [Smogon University](https://www.smogon.com/).\nPokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., GAME FREAK inc., and The Pokémon Company.'
    },
    {
      id: 'feedback',
      title: '💬 Community & Feedback',
      tag: 'Community',
      content: 'If you encounter any calculation discrepancies or have feature suggestions, feel free to reach out. Best of luck on the ladder, Trainers!'
    }
  ]
};
