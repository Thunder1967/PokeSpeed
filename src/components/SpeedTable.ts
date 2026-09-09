import { SpeedTableData, PokemonSpeedData, DEFAULT_SUBSTITUTE_SPRITE } from '../types/pokemon';
import { calcBaseSpeedLv50, calcFinalSpeed } from '../utils/speedCalc';
import { battleStore } from '../store/battleState';
import { calcPinDividers, RowSpeedInfo } from '../utils/pinDividerCalc';
import { createPinDividerHTML } from './PinDivider';
import { AppConfig, getAdaptiveSpriteLimit } from '../config/appConfig';
import { escapeHtml, sanitizeUrl } from '../utils/security';
import { t, getLocale, getPokemonDisplayNames } from '../i18n';
import '../styles/table.css';

let lastBenchmarkScrollLeft = 0;
let activeHiddenPokemonsMap = new Map<number, PokemonSpeedData[]>();

/** Tracks the serialized key of the last rendered pin dividers for diffing. */
let lastPinDividerKey = '';

function renderSpriteImg(p: PokemonSpeedData): string {
  const safeSprite = sanitizeUrl(p.sprite, DEFAULT_SUBSTITUTE_SPRITE);
  const locale = getLocale();
  const dict = t(locale);
  const { primary, secondary } = getPokemonDisplayNames(p, locale);
  const safePrimary = escapeHtml(primary);
  const safeSecondary = escapeHtml(secondary);
  const safeFormId = escapeHtml(p.formId);

  return `
    <img src="${safeSprite}" alt="${safePrimary}" 
         title="${safePrimary} (${safeSecondary})\n${dict.table.rankTooltipSingles}: #${p.usageRankSingle}\n${dict.table.rankTooltipDoubles}: #${p.usageRankDouble}" 
         class="sprite-img" data-form-id="${safeFormId}"
         loading="${AppConfig.table.sprites.loadingStrategy}" />
  `.trim();
}


export function renderSpeedTable(
  container: HTMLElement,
  data: SpeedTableData,
  mode: 'single' | 'double'
) {
  const limit = getAdaptiveSpriteLimit();
  activeHiddenPokemonsMap.clear();

  // Sort base speeds descending
  const baseSpeeds = Object.keys(data)
    .map(Number)
    .sort((a, b) => b - a);

  const dict = t();

  let html = `
    <div class="speed-table-container">
      <div class="speed-table-header">
        <div class="col-base">${dict.table.colBase}</div>
        <div class="col-sprites-container">${dict.table.colPokemon}</div>
        <div class="col-dynamic">${dict.table.colDynamic}</div>
        <div class="col-benchmarks-container">
          <div class="col-benchmarks">
            <div class="benchmark-cell header">${dict.table.colMaxPlus}</div>
            <div class="benchmark-cell header">${dict.table.colMax}</div>
            <div class="benchmark-cell header">${dict.table.colZero}</div>
            <div class="benchmark-cell header">${dict.table.colMin}</div>
            <div class="benchmark-cell header">${dict.table.colMaxScarf}</div>
            <div class="benchmark-cell header">${dict.table.colNeuScarf}</div>
            <div class="benchmark-cell header">${dict.table.colMaxMinus1}</div>
            <div class="benchmark-cell header">${dict.table.colNeuMinus1}</div>
          </div>
        </div>
      </div>
  `;


  for (const base of baseSpeeds) {
    let pokemons = data[base];
    
    // Sort by usage rank
    pokemons.sort((a, b) => 
      mode === 'single' ? a.usageRankSingle - b.usageRankSingle : a.usageRankDouble - b.usageRankDouble
    );

    const visiblePokemons = pokemons.slice(0, limit);
    const hiddenPokemons = pokemons.slice(limit);
    if (hiddenPokemons.length > 0) {
      activeHiddenPokemonsMap.set(base, hiddenPokemons);
    }

    // Calculate benchmarks
    const max = calcBaseSpeedLv50(base, 32, 1.1);
    const neu = calcBaseSpeedLv50(base, 32, 1.0);
    const zero = calcBaseSpeedLv50(base, 0, 1.0);
    const neg = calcBaseSpeedLv50(base, 0, 0.9);
    const mScarf = Math.floor(max * 1.5);
    const nScarf = Math.floor(neu * 1.5);
    const mMinus1 = Math.floor(max * (2/3));
    const nMinus1 = Math.floor(neu * (2/3));

    html += `
      <div class="speed-table-row" data-base="${base}">
        <div class="col-base">${base}</div>
        <div class="col-sprites-container">
          <div class="col-sprites" data-base="${base}">
            ${visiblePokemons.map(renderSpriteImg).join('')}
            ${hiddenPokemons.length > 0 ? `
              <div class="hidden-sprites is-hidden" id="hidden-sprites-${base}"></div>
            ` : ''}
          </div>
          ${hiddenPokemons.length > 0 ? `
            <button type="button" class="more-btn" data-base="${base}" data-count="${hiddenPokemons.length}">
              ${dict.common.morePokemon(hiddenPokemons.length)}
            </button>
          ` : ''}
        </div>
        <div class="col-dynamic" id="dynamic-${base}">--</div>
        <div class="col-benchmarks-container">
          <div class="col-benchmarks">
            <div class="benchmark-cell font-bold text-gray-200">${max}</div>
            <div class="benchmark-cell">${neu}</div>
            <div class="benchmark-cell">${zero}</div>
            <div class="benchmark-cell">${neg}</div>
            <div class="benchmark-cell text-purple-400">${mScarf}</div>
            <div class="benchmark-cell text-purple-400">${nScarf}</div>
            <div class="benchmark-cell text-orange-400">${mMinus1}</div>
            <div class="benchmark-cell text-orange-400">${nMinus1}</div>
          </div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  const rows = container.querySelectorAll('.speed-table-row');
  const tableContainer = container.querySelector('.speed-table-container') as HTMLElement;

  // Synchronized horizontal scrolling for Section 4: Benchmarks
  const benchmarkContainers = container.querySelectorAll<HTMLElement>(
    '.col-benchmarks-container:not(.divider-cell)'
  );
  let isSyncingScroll = false;
  let scrollTimeout: any = null;

  // Restore previous scrollLeft if table was re-rendered (e.g. mode switch)
  if (lastBenchmarkScrollLeft > 0) {
    benchmarkContainers.forEach(el => {
      el.scrollLeft = lastBenchmarkScrollLeft;
    });
  }

  const handleBenchmarkScroll = (event: Event) => {
    const sourceEl = event.currentTarget as HTMLElement;
    if (!sourceEl || isSyncingScroll) return;

    isSyncingScroll = true;
    const newScrollLeft = sourceEl.scrollLeft;
    lastBenchmarkScrollLeft = newScrollLeft;

    sourceEl.classList.add('is-scrolling');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      sourceEl.classList.remove('is-scrolling');
    }, 400);

    // Batch scrollLeft writes inside rAF to avoid layout thrashing
    requestAnimationFrame(() => {
      benchmarkContainers.forEach(targetEl => {
        if (targetEl !== sourceEl && targetEl.scrollLeft !== newScrollLeft) {
          targetEl.scrollLeft = newScrollLeft;
        }
      });
      isSyncingScroll = false;
    });
  };

  benchmarkContainers.forEach(el => {
    el.addEventListener('scroll', handleBenchmarkScroll, { passive: true });
  });

  // Add store listener to update dynamic column & pin divider
  const updateDynamicColumn = () => {
    const state = battleStore.get();
    const enemy = state.slots.enemy;
    const playerA = state.slots.playerA;
    const playerB = state.slots.playerB;

    const hasPlayerA = playerA.baseSpeed !== undefined;
    const hasPlayerB = state.isDoubleBattle && playerB.baseSpeed !== undefined;

    const speedA = hasPlayerA ? calcFinalSpeed(playerA.baseSpeed!, playerA) : 0;
    const speedB = hasPlayerB ? calcFinalSpeed(playerB.baseSpeed!, playerB) : 0;
    const rowSpeedInfos: RowSpeedInfo[] = [];
    
    rows.forEach(row => {
      const base = parseInt((row as HTMLElement).dataset.base!, 10);
      const dynamicEl = row.querySelector(`#dynamic-${base}`);
      
      if (dynamicEl) {
        const enemySpeed = calcFinalSpeed(base, enemy);
        dynamicEl.textContent = enemySpeed.toString();
        rowSpeedInfos.push({ baseSpeed: base, dynamicSpeed: enemySpeed });

        // Remove previous threat classes
        row.classList.remove('threat-a', 'threat-b', 'threat-both');

        // Apply new threat classes only if players are actively configured
        const threatA = hasPlayerA && enemySpeed > speedA;
        const threatB = hasPlayerB && enemySpeed > speedB;

        if (threatA && threatB) {
          row.classList.add('threat-both');
        } else if (threatA) {
          row.classList.add('threat-a');
        } else if (threatB) {
          row.classList.add('threat-b');
        }
      }
    });

    // Update Speed Watershed Pin Dividers (with diff check to skip redundant DOM work)
    if (tableContainer) {
      const pinItems = calcPinDividers(
        rowSpeedInfos,
        state.isDoubleBattle,
        playerA,
        speedA,
        playerB,
        speedB
      );

      // Sort descending by speed so faster divider appears above slower
      const sortedPins = [...pinItems].sort((a, b) => b.speed - a.speed);

      // Build a serialized key to diff against last render (include locale)
      const pinKey = `${getLocale()};` + sortedPins.map(p =>
        `${p.speed}|${p.position.type}|${p.position.afterBase ?? ''}|${p.isMerged}`
      ).join(';');

      // Only rebuild pin divider DOM when the layout actually changed
      if (pinKey !== lastPinDividerKey) {
        lastPinDividerKey = pinKey;

        // Remove previous pin dividers
        tableContainer.querySelectorAll('.speed-pin-divider').forEach(el => el.remove());

        sortedPins.forEach(item => {
          const dividerHtml = createPinDividerHTML(item);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = dividerHtml.trim();
          const dividerEl = tempDiv.firstElementChild as HTMLElement;
          if (!dividerEl) return;

          if (item.position.type === 'top') {
            const firstRow = tableContainer.querySelector('.speed-table-row');
            if (firstRow) {
              tableContainer.insertBefore(dividerEl, firstRow);
            } else {
              tableContainer.appendChild(dividerEl);
            }
          } else if (item.position.type === 'bottom') {
            tableContainer.appendChild(dividerEl);
          } else if (item.position.type === 'after' && item.position.afterBase !== undefined) {
            const targetRow = tableContainer.querySelector(`.speed-table-row[data-base="${item.position.afterBase}"]`);
            if (targetRow) {
              let insertAfterNode: Element = targetRow;
              while (
                insertAfterNode.nextElementSibling && 
                insertAfterNode.nextElementSibling.classList.contains('speed-pin-divider')
              ) {
                insertAfterNode = insertAfterNode.nextElementSibling;
              }
              insertAfterNode.after(dividerEl);
            }
          }

          // Add touch/click listener on badge to toggle tooltip on mobile
          const badge = dividerEl.querySelector('.pin-badge');
          badge?.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = badge.classList.contains('active-tooltip');
            tableContainer.querySelectorAll('.pin-badge.active-tooltip').forEach(b => b.classList.remove('active-tooltip'));
            if (!wasActive) {
              badge.classList.add('active-tooltip');
            }
          });
        });
      }
    }
  };

  const onDocClick = () => {
    container.querySelectorAll('.pin-badge.active-tooltip').forEach(b => b.classList.remove('active-tooltip'));
  };
  document.addEventListener('click', onDocClick);

  // Lazy population helper for deferred hidden sprites
  const populateHiddenSprites = (base: number | string) => {
    const hiddenContainer = container.querySelector(`#hidden-sprites-${base}`);
    if (hiddenContainer && hiddenContainer.children.length === 0) {
      const list = activeHiddenPokemonsMap.get(Number(base)) || [];
      hiddenContainer.innerHTML = list.map(renderSpriteImg).join('');
    }
  };

  // Click listener for .more-btn expansion
  const onTableClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('.more-btn') as HTMLElement;
    if (btn) {
      e.stopPropagation();
      const base = btn.dataset.base;
      const count = btn.dataset.count;
      const row = container.querySelector(`.speed-table-row[data-base="${base}"]`);
      const hiddenContainer = container.querySelector(`#hidden-sprites-${base}`);
      if (row && hiddenContainer) {
        const isHidden = hiddenContainer.classList.contains('is-hidden');
        if (isHidden) {
          populateHiddenSprites(base!);
          hiddenContainer.classList.remove('is-hidden');
          row.classList.add('is-expanded');
          btn.classList.add('expanded');
          btn.textContent = getLocale() === 'en' ? 'Collapse' : '收合';
        } else {
          hiddenContainer.classList.add('is-hidden');
          row.classList.remove('is-expanded');
          btn.classList.remove('expanded');
          btn.textContent = t().common.morePokemon(Number(count));
        }
      }
    }
  };
  container.addEventListener('click', onTableClick);

  // Resize listener to re-evaluate sprite limits if window crosses adaptive breakpoints
  let currentLimit = limit;
  let resizeTimer: any = null;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newLimit = getAdaptiveSpriteLimit();
      if (newLimit !== currentLimit) {
        currentLimit = newLimit;
        renderSpeedTable(container, data, mode);
      }
    }, 200);
  };
  window.addEventListener('resize', onResize);

  const unsubscribe = battleStore.subscribe(updateDynamicColumn);
  updateDynamicColumn(); // Initial calculation

  return function cleanup() {
    unsubscribe();
    document.removeEventListener('click', onDocClick);
    container.removeEventListener('click', onTableClick);
    window.removeEventListener('resize', onResize);
    clearTimeout(scrollTimeout);
    clearTimeout(resizeTimer);
    benchmarkContainers.forEach(el => {
      el.removeEventListener('scroll', handleBenchmarkScroll);
    });
  };
}

/**
 * Smoothly scrolls to a Pokemon row, expands the row if hidden, vertically centers the row in viewport,
 * and highlights the target sprite
 */
export function focusAndHighlightPokemon(formId: string, baseSpeed: number | string) {
  const row = document.querySelector(`.speed-table-row[data-base="${baseSpeed}"]`) as HTMLElement | null;
  if (!row) return;

  const hiddenContainer = row.querySelector(`#hidden-sprites-${baseSpeed}`);
  const moreBtn = row.querySelector(`.more-btn[data-base="${baseSpeed}"]`) as HTMLElement;

  // On-demand populate hidden sprites if not already populated
  if (hiddenContainer && hiddenContainer.children.length === 0) {
    const list = activeHiddenPokemonsMap.get(Number(baseSpeed)) || [];
    hiddenContainer.innerHTML = list.map(renderSpriteImg).join('');
  }

  const targetImg = row.querySelector(`img[data-form-id="${formId}"]`) as HTMLElement;

  if (hiddenContainer && hiddenContainer.contains(targetImg) && hiddenContainer.classList.contains('is-hidden')) {
    hiddenContainer.classList.remove('is-hidden');
    row.classList.add('is-expanded');
    if (moreBtn) {
      moreBtn.classList.add('expanded');
      moreBtn.textContent = '收合';
    }
  }

  // Smoothly center the row vertically in the browser viewport
  const rowRect = row.getBoundingClientRect();
  const docTop = rowRect.top + window.scrollY;
  const targetY = Math.max(
    0,
    Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      Math.round(docTop - (window.innerHeight - row.offsetHeight) / 2)
    )
  );

  window.scrollTo({
    top: targetY,
    behavior: 'smooth'
  });

  if (targetImg) {
    // Horizontally scroll only within col-sprites without interfering with window vertical scroll
    const colSprites = row.querySelector('.col-sprites') as HTMLElement | null;
    if (colSprites) {
      const spriteRect = targetImg.getBoundingClientRect();
      const containerRect = colSprites.getBoundingClientRect();
      if (spriteRect.left < containerRect.left) {
        colSprites.scrollBy({ left: spriteRect.left - containerRect.left - 12, behavior: 'smooth' });
      } else if (spriteRect.right > containerRect.right) {
        colSprites.scrollBy({ left: spriteRect.right - containerRect.right + 12, behavior: 'smooth' });
      }
    }

    targetImg.classList.remove('sprite-focus-glow');
    void targetImg.offsetWidth;
    targetImg.classList.add('sprite-focus-glow');
    setTimeout(() => {
      targetImg.classList.remove('sprite-focus-glow');
    }, 2500);
  }
}

