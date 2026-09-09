import { TranslationSchema } from '../types';

export const zhTW: TranslationSchema = {
  meta: {
    title: 'PokéSpeed Champion - 寶可夢速度線對戰計算器',
    description: '寶可夢對戰速度線即時比較與配置計算工具'
  },
  header: {
    title: 'PokéSpeed',
    searchPlaceholder: '搜尋 中文 / 英文 / 速度種族...',
    single: '單打',
    double: '雙打',
    battleSettings: '對戰設定',
    langSwitchLabel: 'EN',
    noSearchResults: '無符合結果',
    speed: '速度',
    rankSingle: '單打',
    rankDouble: '雙打'
  },
  speedTable: {
    baseCol: '種族',
    pokemonCol: '寶可夢',
    enemyActualCol: '敵方實數',
    maxSpeed: '極速(32+)',
    neutralSpeed: '準速(32)',
    zeroEvSpeed: '無速(0)',
    minSpeed: '慢速(0-)',
    maxScarf: '極速圍巾',
    neutralScarf: '準速圍巾',
    maxMinus1: '極速-1',
    neutralMinus1: '準速-1',
    moreBtn: (count: number) => `+${count} 更多`,
    collapseBtn: '收合',
    rankSingle: '單打排名',
    rankDouble: '雙打排名'
  },
  drawer: {
    title: '對戰參數設定',
    enemyTitle: '敵方基準設定',
    enemyBenchmarkBadge: '速線基準',
    playerATitle: '我方 A (綠)',
    playerBTitle: '我方 B (紫)',
    speedActualBadge: '實數: ',
    myPokemon: '我方寶可夢',
    searchPrompt: '搜尋選擇精靈',
    notSelected: '尚未選擇寶可夢',
    selectViaSearchPrompt: '請透過下方搜尋框選擇精靈',
    searchPlaceholder: '搜尋 中文 / 英文 / 速度種族...',
    selectedBaseSpeed: '速度',
    changeBtn: '更換 ✕',
    evLabel: '努力值 (EVs)',
    natureLabel: '性格修正 (Nature)',
    natureBoost: '加速 (+10%)',
    natureNeutral: '無關 (0%)',
    natureHinder: '減速 (-10%)',
    stagesLabel: '能力階級 (Stat Stages)',
    modifiersLabel: '修正項目',
    statusLabel: '戰場狀態',
    tailwind: '順風',
    scarf: '圍巾',
    ability: '特性 (2x)',
    paralysis: '麻痺',
    noResults: '無符合結果'
  },
  pinDivider: {
    dividerAllyA: '我方 A',
    dividerAllyB: '我方 B',
    actualSpeed: '實數',
    evLabel: '努力值',
    natureLabel: '性格',
    stageLabel: '階級',
    statusLabel: '狀態',
    standardStatus: '常規狀態',
    tailwind: '順風 🌪️',
    scarf: '圍巾 🧣',
    abilityBoost: '特性(2x) ⚡',
    paralyzed: '麻痺 🟡'
  }
};
