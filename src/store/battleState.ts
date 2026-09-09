import { BattleState } from '../types/pokemon';

export const initialState: BattleState = {
  isDoubleBattle: false,
  activeFormat: 'champion-m-b',
  slots: {
    enemy: {
      evs: 32,
      nature: 1.1,
      stages: 0,
      isTailwind: false,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
    },
    playerA: {
      evs: 32,
      nature: 1.1,
      stages: 0,
      isTailwind: false,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
      baseSpeed: undefined,
      pokemon: null,
    },
    playerB: {
      evs: 32,
      nature: 1.1,
      stages: 0,
      isTailwind: false,
      isScarf: false,
      isAbilityBoost: false,
      abilityMultiplier: 1.0,
      isParalyzed: false,
      baseSpeed: undefined,
      pokemon: null,
    }
  }
};

type Listener = (state: BattleState) => void;

class Store {
  private state: BattleState;
  private listeners: Listener[] = [];

  constructor(initial: BattleState) {
    this.state = JSON.parse(JSON.stringify(initial));
  }

  get() {
    return this.state;
  }

  set(updater: (state: BattleState) => void) {
    updater(this.state);
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l(this.state);
    }
  }
}

export const battleStore = new Store(initialState);
