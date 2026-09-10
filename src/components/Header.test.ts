import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHeader } from './Header';
import { battleStore } from '../store/battleState';
import { AppConfig } from '../config/appConfig';
import { setLocale } from '../i18n';

describe('Header Component & Season Switcher', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    localStorage.clear();
    setLocale('zh-TW');
    battleStore.set(state => {
      state.isDoubleBattle = false;
      state.activeFormat = AppConfig.season.currentSeason;
    });
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders season dropdowns with all available seasons', () => {
    renderHeader(container);

    const selectDesktop = container.querySelector('#season-select') as HTMLSelectElement | null;
    const selectMobile = container.querySelector('#season-select-m') as HTMLSelectElement | null;

    expect(selectDesktop).not.toBeNull();
    expect(selectMobile).not.toBeNull();

    const expectedCount = AppConfig.season.availableSeasons.length;
    expect(selectDesktop?.options.length).toBe(expectedCount);
    expect(selectMobile?.options.length).toBe(expectedCount);
    expect(selectDesktop?.value).toBe(AppConfig.season.currentSeason);
  });

  it('updates battleStore activeFormat when season selector changes', () => {
    renderHeader(container);

    const selectDesktop = container.querySelector('#season-select') as HTMLSelectElement;
    expect(selectDesktop).not.toBeNull();

    // Change format
    selectDesktop.value = 'champion-m-b';
    selectDesktop.dispatchEvent(new Event('change'));

    expect(battleStore.get().activeFormat).toBe('champion-m-b');
  });

  it('synchronizes select value when battleStore activeFormat changes externally', async () => {
    renderHeader(container);

    const selectDesktop = container.querySelector('#season-select') as HTMLSelectElement;
    const selectMobile = container.querySelector('#season-select-m') as HTMLSelectElement;

    battleStore.set(state => {
      state.activeFormat = 'champion-m-b';
    });

    // Wait for rAF batching in battleStore
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(selectDesktop.value).toBe('champion-m-b');
    expect(selectMobile.value).toBe('champion-m-b');
  });

  it('updates season dropdown text when locale changes', () => {
    renderHeader(container);

    const selectDesktop = container.querySelector('#season-select') as HTMLSelectElement;
    expect(selectDesktop.options[0].textContent).toBe(AppConfig.season.availableSeasons[0].nameZh);

    // Switch to English
    setLocale('en');
    expect(selectDesktop.options[0].textContent).toBe(AppConfig.season.availableSeasons[0].nameEn);
  });

  it('toggles battle modes and updates store', () => {
    renderHeader(container);

    const btnDouble = container.querySelector('#btn-mode-double') as HTMLButtonElement;
    expect(btnDouble).not.toBeNull();

    btnDouble.click();
    expect(battleStore.get().isDoubleBattle).toBe(true);

    const btnSingle = container.querySelector('#btn-mode-single') as HTMLButtonElement;
    btnSingle.click();
    expect(battleStore.get().isDoubleBattle).toBe(false);
  });
});
