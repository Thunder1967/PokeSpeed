import { describe, it, expect, vi } from 'vitest';
import { battleStore } from './battleState';

describe('battleState Store', () => {
  it('initializes with default state', () => {
    const state = battleStore.get();
    expect(state.slots.enemy.evs).toBe(32);
    expect(state.slots.enemy.nature).toBe(1.1);
  });

  it('updates state and notifies listeners', () => {
    const listener = vi.fn();
    const unsubscribe = battleStore.subscribe(listener);

    battleStore.set(state => {
      state.slots.enemy.evs = 0;
    });

    expect(battleStore.get().slots.enemy.evs).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('can unsubscribe successfully', () => {
    const listener = vi.fn();
    const unsubscribe = battleStore.subscribe(listener);
    unsubscribe();

    battleStore.set(state => {
      state.slots.enemy.evs = 32;
    });

    expect(listener).not.toHaveBeenCalled();
  });
});
