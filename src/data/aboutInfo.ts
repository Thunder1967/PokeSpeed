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
      title: '關於 PokéSpeed',
      tag: '網站簡介',
      content: 'PokéSpeed 是專為 pokémon champion 對戰環境設計的即時速線查詢與速度比較工具。提供速度種族值階梯、動態戰場速線比較。'
    },
    {
      id: 'features',
      title: '功能介紹',
      tag: '功能',
      content: '**速線比較介紹：**可在 "對戰設定" 中設置要比較的敵方狀態和我方寶可夢狀態。敵方狀態會被套用至所有種族值，計算出對應的速度實數，也就是 "敵方實數" 項 ; 比較器會依照我方寶可夢速度實數標示出指定敵方狀態下比我方快的寶可夢。此外，比較器支援雙打比較。\n**搜尋框介紹：**可用寶可夢中文名、英文名、速度種族值進行查詢。\n**備註：**站上顯示的寶可夢排名僅供參考，不一定是最新資料'
    },
    {
      id: 'github',
      title: 'GitHub',
      tag: '開源',
      content: '[Github 連結](https://github.com/Thunder1967/PokeSpeed)'
    },
    {
      id: 'sources',
      title: '數據來源與致謝',
      tag: '資料與致謝',
      content: '本站對戰數據與部份寶可夢圖參考自知名對戰平台 [Pokémon Showdown](https://play.pokemonshowdown.com)\n部份寶可夢圖參考自 [PokeAPI](https://github.com/PokeAPI/sprites/)\n對戰數據參考自 [Smogon University](https://www.smogon.com/)\n寶可夢所有版權歸 Nintendo、Creatures Inc.、GAME FREAK inc. 及 The Pokémon Company 所有。'
    },
    {
      id: 'disclaimer',
      title: '免責聲明',
      tag: '聲明',
      content: 'PokéSpeed 為非官方、免費的粉絲自製工具，與 Nintendo、Creatures Inc.、GAME FREAK inc. 及 The Pokémon Company 無任何關聯，亦未獲得其授權或背書。Pokémon 及所有相關名稱之商標與著作權均屬各原權利人所有。'
    },
    {
      id: 'feedback',
      title: '意見回饋',
      tag: '意見回饋',
      content: '若在對戰計算或使用上有任何建議、錯誤回報，歡迎填寫 [意見回饋表單](https://docs.google.com/forms/d/e/1FAIpQLSecYgH3X76K7zKufvV6WSz6BzuUEddqg50dCHFEB6EVYcTrdw/viewform?usp=publish-editor)。'
    }
  ],

  'en': [
    {
      id: 'intro',
      title: 'About PokéSpeed',
      tag: 'Overview',
      content: 'PokéSpeed is a real-time speed tier and benchmark tool tailored for Pokémon Champions competitive battle formats. It provides base speed tiers and dynamic in-battle speed comparisons.'
    },
    {
      id: 'features',
      title: 'Features',
      tag: 'Features',
      content: '**Speed Tier Comparison:** In "Battle Settings", you can configure battle modifiers for both the enemy benchmark and your own Pokémon. The enemy modifiers are applied across all base speed tiers to calculate corresponding actual speed stats (shown in the "Enemy Speed" column). The comparator marks Pokémon that outspeed yours under the specified enemy conditions. In addition, the comparator fully supports Doubles comparison.\n**Search Bar:** Search instantly by Pokémon Chinese name, English name, or base speed stat.\n**Note:** The Pokémon usage rankings displayed on the site are for reference and may not always reflect real-time live ladder data.'
    },
    {
      id: 'github',
      title: 'GitHub',
      tag: 'Open Source',
      content: '[GitHub Link](https://github.com/Thunder1967/PokéSpeed)'
    },
    {
      id: 'sources',
      title: 'Data Sources & Acknowledgments',
      tag: 'Credits',
      content: 'Battle data and select Pokémon sprites referenced from [Pokémon Showdown](https://play.pokemonshowdown.com)\nSelect Pokémon sprites referenced from [PokeAPI](https://github.com/PokeAPI/sprites/)\nBattle data and usage statistics referenced from [Smogon University](https://www.smogon.com/)\nAll Pokémon copyright belongs to Nintendo, Creatures Inc., GAME FREAK inc., and The Pokémon Company.'
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      tag: 'Disclaimer',
      content: 'PokéSpeed is an unofficial, free fan-made tool with no affiliation to, endorsement from, or authorization by Nintendo, Creatures Inc., GAME FREAK inc., or The Pokémon Company. Pokémon and all related names, trademarks, and copyrights belong to their respective owners.'
    },
    {
      id: 'feedback',
      title: 'Feedback',
      tag: 'Feedback',
      content: 'If you have any suggestions, calculation discrepancies, or bug reports, feel free to fill out the [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSecYgH3X76K7zKufvV6WSz6BzuUEddqg50dCHFEB6EVYcTrdw/viewform?usp=publish-editor).'
    }
  ]
};
