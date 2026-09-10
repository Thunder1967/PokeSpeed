import { BattleState, SlotState } from '../types/pokemon';
import { AppConfig } from '../config/appConfig';

/**
 * Creates a default SlotState with optional overrides.
 */
export function createDefaultSlot(overrides?: Partial<SlotState>): SlotState {
  return {
    evs: AppConfig.battle.defaultEvs,
    nature: AppConfig.battle.defaultNature,
    stages: 0,
    isTailwind: false,
    isScarf: false,
    isAbilityBoost: false,
    abilityMultiplier: 1.0,
    isParalyzed: false,
    baseSpeed: undefined,
    pokemon: null,
    ...overrides
  };
}

export const initialState: BattleState = {
  isDoubleBattle: false,
  activeFormat: AppConfig.season.currentSeason,
  slots: {
    enemy: createDefaultSlot(),
    playerA: createDefaultSlot(),
    playerB: createDefaultSlot()
  }
};


type Listener = (state: BattleState) => void;

class Store {
  private state: BattleState;
  private listeners: Listener[] = [];
  private rafPending = false;

  constructor(initial: BattleState) {
    this.state = JSON.parse(JSON.stringify(initial));
  }

  get() {
    return this.state;
  }

  set(updater: (state: BattleState) => void) {
    updater(this.state);
    this.scheduleNotify();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Batches notifications via requestAnimationFrame so multiple rapid set()
   * calls (e.g. slider drag) only trigger subscribers once per frame.
   */
  private scheduleNotify() {
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      for (const l of this.listeners) {
        l(this.state);
      }
    });
  }
}

export const battleStore = new Store(initialState);
