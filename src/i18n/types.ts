export type Locale = 'zh-TW' | 'en';

export interface TranslationSchema {
  meta: {
    title: string;
    description: string;
  };
  header: {
    title: string;
    searchPlaceholder: string;
    single: string;
    double: string;
    battleSettings: string;
    langSwitchLabel: string;
    noSearchResults: string;
    speed: string;
    rankSingle: string;
    rankDouble: string;
  };
  speedTable: {
    baseCol: string;
    pokemonCol: string;
    enemyActualCol: string;
    maxSpeed: string;
    neutralSpeed: string;
    zeroEvSpeed: string;
    minSpeed: string;
    maxScarf: string;
    neutralScarf: string;
    maxMinus1: string;
    neutralMinus1: string;
    moreBtn: (count: number) => string;
    collapseBtn: string;
    rankSingle: string;
    rankDouble: string;
  };
  drawer: {
    title: string;
    enemyTitle: string;
    enemyBenchmarkBadge: string;
    playerATitle: string;
    playerBTitle: string;
    speedActualBadge: string;
    myPokemon: string;
    searchPrompt: string;
    notSelected: string;
    selectViaSearchPrompt: string;
    searchPlaceholder: string;
    selectedBaseSpeed: string;
    changeBtn: string;
    evLabel: string;
    natureLabel: string;
    natureBoost: string;
    natureNeutral: string;
    natureHinder: string;
    stagesLabel: string;
    modifiersLabel: string;
    statusLabel: string;
    tailwind: string;
    scarf: string;
    ability: string;
    paralysis: string;
    noResults: string;
  };
  pinDivider: {
    dividerAllyA: string;
    dividerAllyB: string;
    actualSpeed: string;
    evLabel: string;
    natureLabel: string;
    stageLabel: string;
    statusLabel: string;
    standardStatus: string;
    tailwind: string;
    scarf: string;
    abilityBoost: string;
    paralyzed: string;
  };
}
