import { describe, it, expect, vi } from 'vitest';
import { battleStore, createDefaultSlot } from './battleState';

describe('battleState Store', () => {
  it('initializes with default state', () => {
    const state = battleStore.get();
    expect(state.slots.enemy.evs).toBe(32);
    expect(state.slots.enemy.nature).toBe(1.1);
  });

  it('updates state and notifies listeners', async () => {
    const listener = vi.fn();
    const unsubscribe = battleStore.subscribe(listener);

    battleStore.set(state => {
      state.slots.enemy.evs = 0;
    });

    // State is updated synchronously
    expect(battleStore.get().slots.enemy.evs).toBe(0);

    // Notification is batched via rAF; flush it
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('can unsubscribe successfully', async () => {
    const listener = vi.fn();
    const unsubscribe = battleStore.subscribe(listener);
    unsubscribe();

    battleStore.set(state => {
      state.slots.enemy.evs = 32;
    });

    // Flush rAF
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(listener).not.toHaveBeenCalled();
  });

  it('creates default slot with default values or custom overrides', () => {
    const defaultSlot = createDefaultSlot();
    expect(defaultSlot.evs).toBe(32);
    expect(defaultSlot.nature).toBe(1.1);
    expect(defaultSlot.stages).toBe(0);
    expect(defaultSlot.isScarf).toBe(false);

    const customSlot = createDefaultSlot({ evs: 0, isScarf: true });
    expect(customSlot.evs).toBe(0);
    expect(customSlot.isScarf).toBe(true);
    expect(customSlot.nature).toBe(1.1);
  });
});

