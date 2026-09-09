import { describe, it, expect, beforeEach } from 'vitest';
import { renderSpeedTable } from './SpeedTable';
import { SpeedTableData } from '../types/pokemon';
import { battleStore } from '../store/battleState';
import { setLocale } from '../i18n';

describe('SpeedTable Component', () => {
  let container: HTMLDivElement;
  const mockData: SpeedTableData = {
    100: [
      {
        id: 1,
        formId: 'test',
        nameZh: '測試',
        nameEn: 'test',
        baseSpeed: 100,
        sprite: 'test.png',
        usageRankSingle: 1,
        usageRankDouble: 1
      }
    ]
  };

  beforeEach(() => {
    container = document.createElement('div');
    battleStore.set(state => {
      state.slots.playerA.baseSpeed = undefined;
      state.slots.playerA.pokemon = null;
      state.slots.playerB.baseSpeed = undefined;
      state.slots.playerB.pokemon = null;
    });
  });

  it('renders the core 4 sections structure', () => {
    renderSpeedTable(container, mockData, 'single');

    const table = container.querySelector('.speed-table-container');
    expect(table).toBeTruthy();

    const row = container.querySelector('.speed-table-row');
    expect(row).toBeTruthy();

    // Check for 4 sections
    expect(row?.querySelector('.col-base')).toBeTruthy();
    expect(row?.querySelector('.col-sprites-container')).toBeTruthy();
    expect(row?.querySelector('.col-dynamic')).toBeTruthy();
    expect(row?.querySelector('.col-benchmarks-container')).toBeTruthy();

    // Check dynamic column header title
    const dynamicHeader = container.querySelector('.speed-table-header .col-dynamic');
    expect(dynamicHeader?.textContent?.trim()).toBe('敵方實數');
  });

  it('renders 8 benchmark columns', () => {
    renderSpeedTable(container, mockData, 'single');
    const benchmarks = container.querySelectorAll('.speed-table-row:not(.header) .benchmark-cell');
    expect(benchmarks.length).toBe(8);
  });

  it('does not render pin divider when no pokemon selected', () => {
    battleStore.set(state => {
      state.slots.playerA.baseSpeed = undefined;
      state.slots.playerA.pokemon = null;
    });
    renderSpeedTable(container, mockData, 'single');
    const divider = container.querySelector('.speed-pin-divider');
    expect(divider).toBeNull();
  });

  it('renders speed watershed pin divider when pokemon is selected', () => {
    battleStore.set(state => {
      state.slots.playerA.baseSpeed = 100;
      state.slots.playerA.pokemon = {
        id: 1,
        formId: 'test',
        nameZh: '測試',
        nameEn: 'Test',
        baseSpeed: 100,
        sprite: 'test.png',
        usageRankSingle: 1,
        usageRankDouble: 1
      };
    });
    renderSpeedTable(container, mockData, 'single');
    const divider = container.querySelector('.speed-pin-divider');
    expect(divider).toBeTruthy();
    expect(divider?.querySelector('.pin-badge')).toBeTruthy();
    expect(divider?.querySelector('.pin-tooltip')).toBeTruthy();
  });

  it('preserves pin divider when switching between single and double battle modes', () => {
    battleStore.set(state => {
      state.slots.playerA.baseSpeed = 100;
      state.slots.playerA.pokemon = {
        id: 1,
        formId: 'p1',
        nameZh: '寶可夢1',
        nameEn: 'Pokemon 1',
        baseSpeed: 100,
        sprite: 'p1.png',
        usageRankSingle: 1,
        usageRankDouble: 1
      };
    });

    // 1. Render single mode
    renderSpeedTable(container, mockData, 'single');
    expect(container.querySelector('.speed-pin-divider')).toBeTruthy();

    // 2. Switch to double mode
    renderSpeedTable(container, mockData, 'double');
    expect(container.querySelector('.speed-pin-divider')).toBeTruthy();

    // 3. Switch back to single mode
    renderSpeedTable(container, mockData, 'single');
    expect(container.querySelector('.speed-pin-divider')).toBeTruthy();
  });

  it('synchronizes horizontal scrolling across all benchmark containers', async () => {
    const multiRowData: SpeedTableData = {
      100: [
        {
          id: 1,
          formId: 'test1',
          nameZh: '測試1',
          nameEn: 'test1',
          baseSpeed: 100,
          sprite: 'test1.png',
          usageRankSingle: 1,
          usageRankDouble: 1
        }
      ],
      90: [
        {
          id: 2,
          formId: 'test2',
          nameZh: '測試2',
          nameEn: 'test2',
          baseSpeed: 90,
          sprite: 'test2.png',
          usageRankSingle: 2,
          usageRankDouble: 2
        }
      ]
    };

    renderSpeedTable(container, multiRowData, 'single');
    const benchmarkContainers = container.querySelectorAll<HTMLElement>('.col-benchmarks-container:not(.divider-cell)');
    expect(benchmarkContainers.length).toBe(3); // header + 2 rows

    const containers = Array.from(benchmarkContainers);
    const first = containers[0];
    const targets = containers.slice(1);

    const values = new Map<HTMLElement, number>();
    targets.forEach(el => {
      let val = 0;
      Object.defineProperty(el, 'scrollLeft', {
        get: () => val,
        set: (v) => { val = v; },
        configurable: true
      });
      values.set(el, 0);
    });

    Object.defineProperty(first, 'scrollLeft', { value: 120, writable: true, configurable: true });
    first.dispatchEvent(new Event('scroll'));

    // Scroll sync is now batched via rAF; flush it
    await new Promise(resolve => requestAnimationFrame(resolve));

    targets.forEach((el, idx) => {
      expect(el.scrollLeft, `Target ${idx} of ${targets.length}`).toBe(120);
    });
  });

  it('respects adaptive sprite limits and defers loading of hidden sprites', () => {
    // 10 pokemon in base 100
    const tenPkmnData: SpeedTableData = {
      100: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        formId: `p-${i + 1}`,
        nameZh: `寶可夢${i + 1}`,
        nameEn: `pkmn${i + 1}`,
        baseSpeed: 100,
        sprite: `s-${i + 1}.png`,
        usageRankSingle: i + 1,
        usageRankDouble: i + 1,
      }))
    };

    // Standard desktop (1024px) -> 6 visible, 4 hidden
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    renderSpeedTable(container, tenPkmnData, 'single');

    const colSprites = container.querySelector('.col-sprites')!;
    const visibleImgs = colSprites.querySelectorAll(':scope > img.sprite-img');
    expect(visibleImgs.length).toBe(6);

    const hiddenContainer = container.querySelector('#hidden-sprites-100') as HTMLElement;
    expect(hiddenContainer).toBeTruthy();
    expect(hiddenContainer.classList.contains('is-hidden')).toBe(true);
    // Crucial: Zero initial img tags rendered inside hidden-sprites!
    expect(hiddenContainer.children.length).toBe(0);

    const moreBtn = container.querySelector('.more-btn[data-base="100"]') as HTMLElement;
    expect(moreBtn).toBeTruthy();
    expect(moreBtn.textContent?.trim()).toBe('+4 更多');

    // Click to expand -> dynamically populates images
    moreBtn.click();
    expect(hiddenContainer.classList.contains('is-hidden')).toBe(false);
    expect(hiddenContainer.children.length).toBe(4);
    expect(moreBtn.textContent?.trim()).toBe('收合');

    // Click again to collapse -> keeps DOM nodes, just hides
    moreBtn.click();
    expect(hiddenContainer.classList.contains('is-hidden')).toBe(true);
    expect(hiddenContainer.children.length).toBe(4);
    expect(moreBtn.textContent?.trim()).toBe('+4 更多');
  });

  it('adapts to mobile viewport (< 768px) with 4 visible sprites', () => {
    const tenPkmnData: SpeedTableData = {
      100: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        formId: `p-${i + 1}`,
        nameZh: `寶可夢${i + 1}`,
        nameEn: `pkmn${i + 1}`,
        baseSpeed: 100,
        sprite: `s-${i + 1}.png`,
        usageRankSingle: i + 1,
        usageRankDouble: i + 1,
      }))
    };

    // Mobile width (480px) -> 4 visible, 6 hidden
    Object.defineProperty(window, 'innerWidth', { value: 480, writable: true, configurable: true });
    renderSpeedTable(container, tenPkmnData, 'single');

    const colSprites = container.querySelector('.col-sprites')!;
    const visibleImgs = colSprites.querySelectorAll(':scope > img.sprite-img');
    expect(visibleImgs.length).toBe(4);

    const moreBtn = container.querySelector('.more-btn[data-base="100"]') as HTMLElement;
    expect(moreBtn.textContent?.trim()).toBe('+6 更多');
  });

  it('renders English column headers and more button when locale is set to en', () => {
    setLocale('en');
    renderSpeedTable(container, mockData, 'single');

    const baseHeader = container.querySelector('.speed-table-header .col-base');
    const pokemonHeader = container.querySelector('.speed-table-header .col-sprites-container');
    const dynamicHeader = container.querySelector('.speed-table-header .col-dynamic');
    const maxPlusHeader = container.querySelector('.speed-table-header .benchmark-cell');

    expect(baseHeader?.textContent?.trim()).toBe('Base');
    expect(pokemonHeader?.textContent?.trim()).toBe('Pokémon');
    expect(dynamicHeader?.textContent?.trim()).toBe('Enemy Speed');
    expect(maxPlusHeader?.textContent?.trim()).toBe('Max+(32+)');

    // Reset locale back to zh-TW
    setLocale('zh-TW');
  });
});


