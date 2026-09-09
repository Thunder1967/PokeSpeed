import { battleStore } from '../store/battleState';
import { Icons } from '../assets/icons';
import { calcFinalSpeed } from '../utils/speedCalc';
import { SpeedTableData, SlotState, PokemonSpeedData } from '../types/pokemon';

import championMB from '../data/formats/champion-m-b.json';
import { DEFAULT_SUBSTITUTE_SPRITE } from '../utils/pinDividerCalc';
import { searchPokemon, getAllPokemon } from '../utils/pokemonSearch';
import { escapeHtml, clamp, sanitizeUrl } from '../utils/security';

// Flatten all Pokemon from the format data
const allPokemon = getAllPokemon(championMB as unknown as SpeedTableData);

/** Simple debounce helper for high-frequency input events. */
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as unknown as T;
}


import { t, getLocale, subscribeLocale, TranslationSchema, SupportedLocale } from '../i18n';

interface SlotUIConfig {
  key: 'enemy' | 'playerA' | 'playerB';
  theme: {
    title: string;
    border: string;
    accent: string;
    activeNature: string;
    badge: string;
  };
  isPlayerSlot: boolean;
}

const slotConfigs: SlotUIConfig[] = [
  {
    key: 'enemy',
    theme: {
      title: 'text-red-400',
      border: 'border-red-500/30',
      accent: 'accent-red-500',
      activeNature: 'data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20 data-[active=true]:text-red-300',
      badge: 'bg-red-500/20 text-red-300'
    },
    isPlayerSlot: false
  },
  {
    key: 'playerA',
    theme: {
      title: 'text-emerald-400',
      border: 'border-emerald-500/30',
      accent: 'accent-emerald-500',
      activeNature: 'data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300'
    },
    isPlayerSlot: true
  },
  {
    key: 'playerB',
    theme: {
      title: 'text-purple-400',
      border: 'border-purple-500/30',
      accent: 'accent-purple-500',
      activeNature: 'data-[active=true]:border-purple-500 data-[active=true]:bg-purple-500/20 data-[active=true]:text-purple-300',
      badge: 'bg-purple-500/20 text-purple-300'
    },
    isPlayerSlot: true
  }
];

function getSlotTitle(key: 'enemy' | 'playerA' | 'playerB', dict: TranslationSchema): string {
  if (key === 'enemy') return dict.drawer.enemyBenchmarkTitle;
  if (key === 'playerA') return dict.drawer.playerATitle;
  return dict.drawer.playerBTitle;
}

function renderSlotHTML(cfg: SlotUIConfig): string {
  const { key, theme, isPlayerSlot } = cfg;
  const dict = t();
  const title = getSlotTitle(key, dict);

  return `
    <div id="${key}-section" class="bg-white/[0.03] border ${theme.border} rounded-xl p-3.5 sm:p-4 flex flex-col gap-3.5 shadow-lg backdrop-blur-sm transition-all ${key === 'playerB' ? 'hidden' : ''}">
      <div class="flex justify-between items-center border-b ${theme.border} pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${key === 'enemy' ? 'bg-red-400' : key === 'playerA' ? 'bg-emerald-400' : 'bg-purple-400'} shadow-sm"></span>
          <h3 id="${key}-slot-title" class="text-sm sm:text-base font-bold ${theme.title} tracking-wide">${title}</h3>
        </div>
        ${isPlayerSlot ? `<span id="${key}-speed-badge" class="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold ${theme.badge} border border-white/10 shadow-sm">${dict.drawer.realSpeedBadge('--')}</span>` : `<span id="${key}-benchmark-badge" class="text-xs px-2 py-0.5 rounded font-medium bg-red-500/20 text-red-300 border border-red-500/30">${dict.drawer.speedBenchmarkBadge}</span>`}
      </div>
      
      ${isPlayerSlot ? `
      <div>
        <div class="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
          <span id="${key}-pokemon-label">${dict.drawer.selectedPokemon}</span>
          <span id="${key}-search-hint" class="text-gray-500">${dict.drawer.searchHint}</span>
        </div>
        
        <!-- Unselected state container -->
        <div id="${key}-pokemon-unselected" class="flex flex-col gap-2 p-2.5 bg-black/40 border border-dashed border-white/15 rounded-lg">
          <div class="flex items-center gap-2.5">
            <img src="${DEFAULT_SUBSTITUTE_SPRITE}" 
                 alt="${dict.drawer.notSelected}" class="w-8 h-8 object-contain opacity-70 p-0.5 bg-white/5 rounded-md flex-shrink-0" />
            <div class="flex flex-col flex-1 min-w-0">
              <span id="${key}-unselected-title" class="text-xs font-semibold text-gray-300">${dict.drawer.notSelected}</span>
              <span id="${key}-unselected-desc" class="text-[11px] text-gray-500">${dict.drawer.clickToSearchHint}</span>
            </div>
          </div>
          <div class="relative w-full">
            <input type="text" id="${key}-search-input" 
                   maxlength="50"
                   placeholder="${dict.drawer.searchPokemonPlaceholder}" 
                   autocomplete="off"
                   class="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors" />
            <div id="${key}-search-dropdown" 
                 class="absolute top-full left-0 w-full mt-1 bg-[#1a1e29] border border-white/15 rounded-lg shadow-2xl max-h-52 overflow-y-auto hidden z-50 divide-y divide-white/5">
            </div>
          </div>
        </div>

        <!-- Selected state container -->
        <div id="${key}-pokemon-selected" class="hidden items-center justify-between p-2.5 bg-black/50 border ${theme.border} rounded-lg shadow-sm">
          <div class="flex items-center gap-2.5 min-w-0">
            <img id="${key}-selected-img" src="${DEFAULT_SUBSTITUTE_SPRITE}" 
                 alt="Selected" 
                 class="w-10 h-10 object-contain p-0.5 bg-black/40 rounded-lg border border-white/10 flex-shrink-0" />
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5">
                <span id="${key}-selected-name-zh" class="text-xs sm:text-sm font-bold text-white truncate">--</span>
                <span id="${key}-selected-base" class="text-[11px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-gray-200 whitespace-nowrap">
                  ${dict.common.searchSpeedLabel} --
                </span>
              </div>
              <span id="${key}-selected-name-en" class="text-[11px] text-gray-400 truncate">--</span>
            </div>
          </div>
          <button type="button" id="${key}-clear-pokemon" 
                  class="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 transition-colors flex-shrink-0 cursor-pointer ml-2"
                  title="Clear Pokémon">
            <span id="${key}-clear-pokemon-text">${dict.drawer.clearSelection}</span>
          </button>
        </div>
      </div>
      ` : ''}

      <div>
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span id="${key}-evs-label">${dict.drawer.evs}</span>
          <span class="font-mono text-xs font-bold text-gray-200" id="${key}-evs-val">32 (252 EV)</span>
        </div>
        <input type="range" id="${key}-evs" min="0" max="32" value="32" class="w-full ${theme.accent} cursor-pointer">
      </div>

      <div>
        <label id="${key}-nature-label" class="block text-xs text-gray-400 mb-1">${dict.drawer.nature}</label>
        <div class="grid grid-cols-3 gap-1.5">
          <button type="button" id="${key}-nature-btn-11" class="${key}-nature py-1.5 px-1 text-[11px] sm:text-xs font-medium rounded-lg border border-white/10 ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors text-center" data-val="1.1">${dict.drawer.naturePositive}</button>
          <button type="button" id="${key}-nature-btn-10" class="${key}-nature py-1.5 px-1 text-[11px] sm:text-xs font-medium rounded-lg border border-white/10 ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors text-center" data-val="1.0">${dict.drawer.natureNeutral}</button>
          <button type="button" id="${key}-nature-btn-09" class="${key}-nature py-1.5 px-1 text-[11px] sm:text-xs font-medium rounded-lg border border-white/10 ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors text-center" data-val="0.9">${dict.drawer.natureNegative}</button>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span id="${key}-stages-label">${dict.drawer.stages}</span>
          <span class="font-mono text-xs font-bold text-gray-200" id="${key}-stages-val">0</span>
        </div>
        <input type="range" id="${key}-stages" min="-6" max="6" value="0" class="w-full ${theme.accent} cursor-pointer">
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <label class="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 select-none transition-colors">
          <input type="checkbox" id="${key}-tailwind" class="${theme.accent} rounded">
          <span id="${key}-tailwind-text" class="flex items-center gap-1">${Icons.tailwind} ${dict.drawer.tailwind}</span>
        </label>
        <label class="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 select-none transition-colors">
          <input type="checkbox" id="${key}-scarf" class="${theme.accent} rounded">
          <span id="${key}-scarf-text" class="flex items-center gap-1">${Icons.scarf} ${dict.drawer.choiceScarf}</span>
        </label>
        <label class="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 select-none transition-colors">
          <input type="checkbox" id="${key}-ability" class="${theme.accent} rounded">
          <span id="${key}-ability-text" class="flex items-center gap-1">${Icons.abilityBoost} ${dict.drawer.speedAbility}</span>
        </label>
        <label class="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10 select-none transition-colors">
          <input type="checkbox" id="${key}-para" class="${theme.accent} rounded">
          <span id="${key}-para-text" class="flex items-center gap-1">${Icons.paralysis} ${dict.drawer.paralysis}</span>
        </label>
      </div>
    </div>
  `;
}

export function renderDrawer(container: HTMLElement) {
  const html = `
    <div id="settings-drawer" class="fixed top-0 right-0 h-full bg-[#0f1219] border-l border-white/10 shadow-2xl transform translate-x-full transition-transform duration-300 ease-out z-50 flex flex-col drawer-double">
      <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/60 flex-shrink-0">
        <div class="flex items-center gap-3">
          <h2 class="text-base sm:text-lg font-bold tracking-wide text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span id="drawer-title-text">${t().drawer.title}</span>
          </h2>
          <span id="drawer-mode-badge" class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ${getLocale() === 'en' ? 'Doubles (3 Slots)' : '雙打 3 基準'}
          </span>
        </div>

        <button id="close-drawer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/15 hover:text-white border border-white/10 transition-colors cursor-pointer active:scale-95">
          <span id="close-drawer-text">${t().drawer.close}</span>
          <span class="text-sm">✕</span>
        </button>
      </div>
      
      <div class="flex-grow overflow-y-auto p-4 sm:p-5">
        <div id="slots-container" class="grid gap-4 auto-fit-slots">
          ${slotConfigs.map(renderSlotHTML).join('')}
        </div>
      </div>
    </div>
    
    <div id="drawer-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300 md:hidden"></div>
  `;

  container.innerHTML = html;

  const drawer = document.getElementById('settings-drawer')!;
  const backdrop = document.getElementById('drawer-backdrop')!;
  const closeBtn = document.getElementById('close-drawer')!;

  let isDrawerOpen = false;

  function closeDrawer() {
    isDrawerOpen = false;
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }

  function openDrawer() {
    isDrawerOpen = true;
    updateDrawerBounds();
    backdrop.classList.remove('hidden');
    void backdrop.offsetWidth; // flush layout
    backdrop.classList.remove('opacity-0');
    drawer.classList.remove('translate-x-full');
  }

  function toggleDrawer() {
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  (window as any).openSettingsDrawer = openDrawer;
  (window as any).closeSettingsDrawer = closeDrawer;
  (window as any).toggleSettingsDrawer = toggleDrawer;

  // rAF-throttled version of updateDrawerBounds to avoid layout thrashing on scroll
  let boundsRafPending = false;
  const scheduleUpdateDrawerBounds = () => {
    if (boundsRafPending) return;
    boundsRafPending = true;
    requestAnimationFrame(() => {
      boundsRafPending = false;
      updateDrawerBounds();
    });
  };

  window.addEventListener('resize', scheduleUpdateDrawerBounds, { passive: true });
  window.addEventListener('scroll', scheduleUpdateDrawerBounds, { passive: true });

  // Handle Esc key to close drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
    }
  });

  // Setup bindings for each slot
  slotConfigs.forEach(cfg => {
    const { key, isPlayerSlot } = cfg;

    // Pokemon search & selector for playerA and playerB
    if (isPlayerSlot) {
      const searchInput = document.getElementById(`${key}-search-input`) as HTMLInputElement;
      const searchDropdown = document.getElementById(`${key}-search-dropdown`);
      const clearBtn = document.getElementById(`${key}-clear-pokemon`);

      let currentMatches: PokemonSpeedData[] = [];

      // Search input handler (debounced to reduce work during fast typing)
      const handleSearchInput = debounce((query: string) => {
        if (!query.trim()) {
          currentMatches = [];
          searchDropdown?.classList.add('hidden');
          return;
        }

        const isDouble = battleStore.get().isDoubleBattle;
        currentMatches = searchPokemon(allPokemon, query, isDouble, 6);

        if (currentMatches.length > 0 && searchDropdown) {
          const locale = getLocale();
          const isEn = locale === 'en';
          searchDropdown.innerHTML = currentMatches.map(p => {
            const primaryName = isEn ? p.nameEn : p.nameZh;
            const secondaryName = isEn ? p.nameZh : p.nameEn;
            return `
              <div class="slot-search-item p-2 hover:bg-white/10 cursor-pointer flex items-center justify-between gap-2 transition-colors" 
                   data-form-id="${escapeHtml(p.formId)}">
                <div class="flex items-center gap-2 min-w-0">
                  <img src="${sanitizeUrl(p.sprite, DEFAULT_SUBSTITUTE_SPRITE)}" class="w-7 h-7 object-contain flex-shrink-0" alt="${escapeHtml(primaryName)}" />
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold text-gray-200 truncate">${escapeHtml(primaryName)}</span>
                    <span class="text-[10px] text-gray-400 truncate">${escapeHtml(secondaryName)}</span>
                  </div>
                </div>
                <span class="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                  ${t().common.searchSpeedLabel} ${p.baseSpeed}
                </span>
              </div>
            `;
          }).join('');
          searchDropdown.classList.remove('hidden');
        } else if (searchDropdown) {
          searchDropdown.innerHTML = `<div class="p-2.5 text-xs text-gray-500 text-center">${escapeHtml(t().common.searchNoResults)}</div>`;
          searchDropdown.classList.remove('hidden');
        }
      }, 150);

      searchInput?.addEventListener('input', (e) => {
        handleSearchInput((e.target as HTMLInputElement).value);
      });

      // Handle Enter key on drawer search input
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (currentMatches.length > 0) {
            e.preventDefault();
            const top = currentMatches[0];
            battleStore.set(state => {
              (state.slots[key as 'playerA' | 'playerB'] as SlotState).pokemon = top;
            });
            searchDropdown?.classList.add('hidden');
            if (searchInput) searchInput.value = '';
          }
        }
      });

      // Item selection from dropdown
      searchDropdown?.addEventListener('click', (e) => {
        const item = (e.target as HTMLElement).closest('.slot-search-item') as HTMLElement;
        if (item) {
          const formId = item.getAttribute('data-form-id');
          const found = allPokemon.find(p => p.formId === formId);
          if (found) {
            battleStore.set(state => {
              state.slots[key].pokemon = found;
              state.slots[key].baseSpeed = found.baseSpeed;
            });
            searchDropdown.classList.add('hidden');
            if (searchInput) searchInput.value = '';
          }
        }
      });

      // Clear button
      clearBtn?.addEventListener('click', () => {
        battleStore.set(state => {
          state.slots[key].pokemon = null;
          state.slots[key].baseSpeed = undefined;
        });
        setTimeout(() => searchInput?.focus(), 50);
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput?.contains(e.target as Node) && !searchDropdown?.contains(e.target as Node)) {
          searchDropdown?.classList.add('hidden');
        }
      });
    }

    // EVs slider
    const evsInput = document.getElementById(`${key}-evs`) as HTMLInputElement;
    const evsVal = document.getElementById(`${key}-evs-val`)!;
    evsInput.addEventListener('input', (e) => {
      const rawVal = parseInt((e.target as HTMLInputElement).value, 10);
      const val = clamp(rawVal, 0, 32, 32);
      const actualEv = val === 32 ? 252 : (val === 0 ? 0 : val * 8 - 4);
      evsVal.textContent = `${val} (${actualEv} EV)`;
      battleStore.set(state => state.slots[key].evs = val);
    });

    // Nature buttons
    const natureBtns = document.querySelectorAll(`.${key}-nature`);
    natureBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const val = parseFloat(target.dataset.val!);
        const validNatures: Array<1.1 | 1.0 | 0.9> = [1.1, 1.0, 0.9];
        const safeNature = validNatures.includes(val as any) ? (val as 1.1 | 1.0 | 0.9) : 1.0;
        natureBtns.forEach(b => b.removeAttribute('data-active'));
        target.setAttribute('data-active', 'true');
        battleStore.set(state => state.slots[key].nature = safeNature);
      });
    });
    // Default nature: 1.1 (first button)
    (natureBtns[0] as HTMLButtonElement)?.setAttribute('data-active', 'true');

    // Stages slider
    const stagesInput = document.getElementById(`${key}-stages`) as HTMLInputElement;
    const stagesVal = document.getElementById(`${key}-stages-val`)!;
    stagesInput.addEventListener('input', (e) => {
      const rawVal = parseInt((e.target as HTMLInputElement).value, 10);
      const val = clamp(rawVal, -6, 6, 0);
      stagesVal.textContent = val > 0 ? `+${val}` : `${val}`;
      battleStore.set(state => state.slots[key].stages = val);
    });

    // Boolean modifiers (Tailwind, Scarf, Ability Boost, Paralysis)
    const modifierCheckboxes: Array<{ id: string; prop: 'isTailwind' | 'isScarf' | 'isAbilityBoost' | 'isParalyzed' }> = [
      { id: 'tailwind', prop: 'isTailwind' },
      { id: 'scarf', prop: 'isScarf' },
      { id: 'ability', prop: 'isAbilityBoost' },
      { id: 'para', prop: 'isParalyzed' }
    ];
    modifierCheckboxes.forEach(({ id, prop }) => {
      const input = document.getElementById(`${key}-${id}`) as HTMLInputElement | null;
      input?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        battleStore.set(state => {
          state.slots[key][prop] = checked;
          if (prop === 'isAbilityBoost') {
            state.slots[key].abilityMultiplier = checked ? 2.0 : 1.0;
          }
        });
      });
    });
  });

  // Sync state to UI (mode changes, initial values)
  const updateDrawerState = () => {
    const state = battleStore.get();
    const isDouble = state.isDoubleBattle;
    const locale = getLocale();
    const currentDict = t(locale);

    // Toggle player B visibility based on mode
    const playerBSection = document.getElementById('playerB-section');
    if (playerBSection) {
      if (isDouble) {
        playerBSection.classList.remove('hidden');
      } else {
        playerBSection.classList.add('hidden');
      }
    }

    // Update drawer layout class & mode badge
    const modeBadge = document.getElementById('drawer-mode-badge');
    if (drawer) {
      if (isDouble) {
        drawer.classList.remove('drawer-single');
        drawer.classList.add('drawer-double');
      } else {
        drawer.classList.remove('drawer-double');
        drawer.classList.add('drawer-single');
      }
    }
    if (modeBadge) {
      if (isDouble) {
        modeBadge.textContent = locale === 'en' ? 'Doubles (3 Slots)' : '雙打 3 基準';
        modeBadge.className = "text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30";
      } else {
        modeBadge.textContent = locale === 'en' ? 'Singles (2 Slots)' : '單打 2 基準';
        modeBadge.className = "text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
      }
    }
    updateDrawerBounds();

    // Helper to update player pokemon card & real speed badge
    const updatePlayerSlotCard = (slotKey: 'playerA' | 'playerB', slot: SlotState) => {
      const unselected = document.getElementById(`${slotKey}-pokemon-unselected`);
      const selected = document.getElementById(`${slotKey}-pokemon-selected`);
      const badge = document.getElementById(`${slotKey}-speed-badge`);
      const img = document.getElementById(`${slotKey}-selected-img`) as HTMLImageElement | null;

      if (slot.pokemon) {
        unselected?.classList.add('hidden');
        selected?.classList.remove('hidden');
        selected?.classList.add('flex');

        const isEn = locale === 'en';
        const primaryName = isEn ? slot.pokemon.nameEn : slot.pokemon.nameZh;
        const secondaryName = isEn ? slot.pokemon.nameZh : slot.pokemon.nameEn;

        if (img) img.src = slot.pokemon.sprite || DEFAULT_SUBSTITUTE_SPRITE;
        const nameZh = document.getElementById(`${slotKey}-selected-name-zh`);
        if (nameZh) nameZh.textContent = primaryName;
        const nameEn = document.getElementById(`${slotKey}-selected-name-en`);
        if (nameEn) nameEn.textContent = secondaryName;
        const base = document.getElementById(`${slotKey}-selected-base`);
        if (base) base.textContent = `${currentDict.common.searchSpeedLabel} ${slot.pokemon.baseSpeed}`;

        if (badge) {
          const speed = calcFinalSpeed(slot.pokemon.baseSpeed, slot);
          badge.textContent = currentDict.drawer.realSpeedBadge(speed);
        }
      } else {
        unselected?.classList.remove('hidden');
        selected?.classList.add('hidden');
        selected?.classList.remove('flex');
        if (img) img.src = DEFAULT_SUBSTITUTE_SPRITE;
        if (badge) badge.textContent = currentDict.drawer.realSpeedBadge('--');
      }
    };

    updatePlayerSlotCard('playerA', state.slots.playerA);
    updatePlayerSlotCard('playerB', state.slots.playerB);
  };

  // Function to update all text elements in drawer when locale changes
  const updateDrawerTranslations = (_locale: SupportedLocale, dict: TranslationSchema) => {
    const titleText = document.getElementById('drawer-title-text');
    if (titleText) titleText.textContent = dict.drawer.title;

    const closeText = document.getElementById('close-drawer-text');
    if (closeText) closeText.textContent = dict.drawer.close;

    slotConfigs.forEach(cfg => {
      const { key, isPlayerSlot } = cfg;
      const slotTitle = document.getElementById(`${key}-slot-title`);
      if (slotTitle) slotTitle.textContent = getSlotTitle(key, dict);

      if (!isPlayerSlot) {
        const benchmarkBadge = document.getElementById(`${key}-benchmark-badge`);
        if (benchmarkBadge) benchmarkBadge.textContent = dict.drawer.speedBenchmarkBadge;
      } else {
        const pLabel = document.getElementById(`${key}-pokemon-label`);
        if (pLabel) pLabel.textContent = dict.drawer.selectedPokemon;

        const sHint = document.getElementById(`${key}-search-hint`);
        if (sHint) sHint.textContent = dict.drawer.searchHint;

        const uTitle = document.getElementById(`${key}-unselected-title`);
        if (uTitle) uTitle.textContent = dict.drawer.notSelected;

        const uDesc = document.getElementById(`${key}-unselected-desc`);
        if (uDesc) uDesc.textContent = dict.drawer.clickToSearchHint;

        const sInput = document.getElementById(`${key}-search-input`) as HTMLInputElement;
        if (sInput) sInput.placeholder = dict.drawer.searchPokemonPlaceholder;

        const clearText = document.getElementById(`${key}-clear-pokemon-text`);
        if (clearText) clearText.textContent = dict.drawer.clearSelection;
      }

      const evsLabel = document.getElementById(`${key}-evs-label`);
      if (evsLabel) evsLabel.textContent = dict.drawer.evs;

      const natureLabel = document.getElementById(`${key}-nature-label`);
      if (natureLabel) natureLabel.textContent = dict.drawer.nature;

      const btn11 = document.getElementById(`${key}-nature-btn-11`);
      if (btn11) btn11.textContent = dict.drawer.naturePositive;
      const btn10 = document.getElementById(`${key}-nature-btn-10`);
      if (btn10) btn10.textContent = dict.drawer.natureNeutral;
      const btn09 = document.getElementById(`${key}-nature-btn-09`);
      if (btn09) btn09.textContent = dict.drawer.natureNegative;

      const stagesLabel = document.getElementById(`${key}-stages-label`);
      if (stagesLabel) stagesLabel.textContent = dict.drawer.stages;

      const twText = document.getElementById(`${key}-tailwind-text`);
      if (twText) twText.innerHTML = `${Icons.tailwind} ${dict.drawer.tailwind}`;

      const scText = document.getElementById(`${key}-scarf-text`);
      if (scText) scText.innerHTML = `${Icons.scarf} ${dict.drawer.choiceScarf}`;

      const abText = document.getElementById(`${key}-ability-text`);
      if (abText) abText.innerHTML = `${Icons.abilityBoost} ${dict.drawer.speedAbility}`;

      const paText = document.getElementById(`${key}-para-text`);
      if (paText) paText.innerHTML = `${Icons.paralysis} ${dict.drawer.paralysis}`;
    });

    updateDrawerState();
  };

  subscribeLocale((locale, dict) => {
    updateDrawerTranslations(locale, dict);
  });

  battleStore.subscribe(updateDrawerState);
  updateDrawerState(); // initial sync
  updateDrawerBounds();
}

export function updateDrawerBounds() {
  const drawer = document.getElementById('settings-drawer');
  if (!drawer) return;

  const dynamicCol = document.querySelector('.speed-table-header .col-dynamic') as HTMLElement | null;
  if (dynamicCol && window.innerWidth >= 640) {
    const dynamicRect = dynamicCol.getBoundingClientRect();
    const availableWidth = Math.floor(window.innerWidth - dynamicRect.right);
    drawer.style.width = `${Math.max(280, availableWidth)}px`;
    drawer.style.maxWidth = `${Math.max(280, availableWidth)}px`;
  } else {
    drawer.style.width = '';
    drawer.style.maxWidth = '';
  }
}
