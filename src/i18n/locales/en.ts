import { TranslationSchema } from '../types';

export const en: TranslationSchema = {
  meta: {
    title: 'PokéSpeed Champion - Pokémon Speed Tier Calculator',
    description: 'Real-time competitive Pokémon speed tier benchmark and battle speed calculator'
  },
  header: {
    title: 'PokéSpeed',
    searchPlaceholder: 'Search Pokémon / Base Speed...',
    single: 'Singles',
    double: 'Doubles',
    battleSettings: 'Battle Settings',
    langSwitchLabel: '繁中',
    noSearchResults: 'No matching results',
    speed: 'Spe',
    rankSingle: 'Singles',
    rankDouble: 'Doubles'
  },
  speedTable: {
    baseCol: 'Base',
    pokemonCol: 'Pokémon',
    enemyActualCol: 'Enemy Stat',
    maxSpeed: 'Max (32+)',
    neutralSpeed: 'Neutral (32)',
    zeroEvSpeed: '0 EV (0)',
    minSpeed: 'Min (0-)',
    maxScarf: 'Max Scarf',
    neutralScarf: 'Neutral Scarf',
    maxMinus1: 'Max -1',
    neutralMinus1: 'Neutral -1',
    moreBtn: (count: number) => `+${count} more`,
    collapseBtn: 'Collapse',
    rankSingle: 'Singles Rank',
    rankDouble: 'Doubles Rank'
  },
  drawer: {
    title: 'Battle Settings',
    enemyTitle: 'Opponent Benchmark',
    enemyBenchmarkBadge: 'Benchmark',
    playerATitle: 'Player A (Green)',
    playerBTitle: 'Player B (Purple)',
    speedActualBadge: 'Stat: ',
    myPokemon: 'My Pokémon',
    searchPrompt: 'Search to select',
    notSelected: 'No Pokémon selected',
    selectViaSearchPrompt: 'Use search box below to select',
    searchPlaceholder: 'Search Pokémon / Base Speed...',
    selectedBaseSpeed: 'Spe',
    changeBtn: 'Change ✕',
    evLabel: 'Effort Values (EVs)',
    natureLabel: 'Nature Modifier',
    natureBoost: '+Spe (+10%)',
    natureNeutral: 'Neutral (0%)',
    natureHinder: '-Spe (-10%)',
    stagesLabel: 'Stat Stages',
    modifiersLabel: 'Modifiers',
    statusLabel: 'Battle Status',
    tailwind: 'Tailwind',
    scarf: 'Scarf',
    ability: 'Ability (2x)',
    paralysis: 'Paralysis',
    noResults: 'No matching results'
  },
  pinDivider: {
    dividerAllyA: 'Player A',
    dividerAllyB: 'Player B',
    actualSpeed: 'Actual',
    evLabel: 'EVs',
    natureLabel: 'Nature',
    stageLabel: 'Stage',
    statusLabel: 'Status',
    standardStatus: 'Standard',
    tailwind: 'Tailwind 🌪️',
    scarf: 'Scarf 🧣',
    abilityBoost: 'Ability(2x) ⚡',
    paralyzed: 'Paralysis 🟡'
  }
};
