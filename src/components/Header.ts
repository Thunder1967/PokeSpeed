import { battleStore } from '../store/battleState';
import { AppConfig } from '../config/appConfig';
import { getFormatData } from '../data/formats';
import { PokemonSpeedData } from '../types/pokemon';
import { focusAndHighlightPokemon } from './SpeedTable';
import { searchPokemon, getAllPokemon, renderHeaderSearchItem } from '../utils/pokemonSearch';
import { escapeHtml } from '../utils/security';
import { getLocale, setLocale, t, subscribeLocale, SupportedLocale } from '../i18n';
import { toggleSettingsDrawer } from './Drawer';

function renderSeasonOptions(locale: SupportedLocale, activeId: string): string {
  return AppConfig.season.availableSeasons
    .map(s => {
      const label = locale === 'zh-TW' ? s.nameZh : s.nameEn;
      const selected = s.id === activeId ? 'selected' : '';
      return `<option value="${escapeHtml(s.id)}" class="bg-slate-900 text-white" ${selected}>${escapeHtml(label)}</option>`;
    })
    .join('');
}

export function renderHeader(container: HTMLElement) {
  const currentLang = getLocale();
  const dict = t(currentLang);
  const currentFormat = battleStore.get().activeFormat;

  const html = `
    <header class="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-2.5 px-3 sm:px-4 gap-3 md:gap-4">
      <div class="flex items-center gap-4 w-full md:w-auto justify-between">
        <a href="#/" id="logo-link" class="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 select-none cursor-pointer hover:opacity-90 transition-opacity" title="PokéSpeed">
          PokéSpeed
        </a>
        <div class="flex md:hidden items-center gap-1.5">
          <!-- Mobile Season Selector -->
          <div class="relative flex items-center bg-black/40 border border-white/10 rounded-lg px-2 py-1 transition-colors shadow-sm cursor-pointer">
            <svg class="text-amber-400 flex-shrink-0 mr-1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
              <path d="M6 5v8a6 6 0 0 0 12 0V5" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <select id="season-select-m" aria-label="${escapeHtml(dict.common.seasonAria)}" class="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer appearance-none pl-0.5 pr-3.5 z-10 max-w-[120px] truncate">
              ${renderSeasonOptions(currentLang, currentFormat)}
            </select>
            <svg class="w-2.5 h-2.5 text-gray-400 pointer-events-none absolute right-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <!-- Mobile Mode Toggle -->
          <div class="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button id="btn-mode-single-m" class="px-2.5 py-1 rounded text-xs font-bold bg-white/10 text-white shadow transition-colors">${dict.common.singleBattle}</button>
            <button id="btn-mode-double-m" class="px-2.5 py-1 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors">${dict.common.doubleBattle}</button>
          </div>
        </div>
      </div>
      
      <div class="relative w-full md:w-72">
        <input type="text" id="search-input" maxlength="50" placeholder="${dict.common.searchPlaceholder}" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors">
        <div id="search-results" class="absolute top-full left-0 w-full mt-1 bg-surface border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto hidden z-50"></div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <!-- Desktop Season Selector -->
        <div class="hidden md:flex relative items-center bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors shadow-sm cursor-pointer group flex-shrink-0">
          <svg class="text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0 mr-1.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
            <path d="M6 5v8a6 6 0 0 0 12 0V5" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          <select id="season-select" aria-label="${escapeHtml(dict.common.seasonAria)}" class="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer appearance-none pl-0.5 pr-4 z-10">
            ${renderSeasonOptions(currentLang, currentFormat)}
          </select>
          <svg class="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <!-- Desktop Battle Mode Toggle -->
        <div class="hidden md:flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button id="btn-mode-single" class="px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors">${dict.common.singleBattle}</button>
          <button id="btn-mode-double" class="px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors">${dict.common.doubleBattle}</button>
        </div>
        
        <div class="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <!-- About Button -->
          <button id="open-about-btn" class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors shadow-sm cursor-pointer active:scale-95 flex-shrink-0" title="${dict.common.about}">
            <svg class="text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span id="open-about-btn-text">${dict.common.about}</span>
          </button>

          <!-- Language Selector -->
          <div class="relative flex items-center bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-lg px-2 sm:px-2.5 py-2 transition-colors shadow-sm cursor-pointer group flex-shrink-0">
            <svg class="text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <select id="lang-select" aria-label="Language Select" class="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer appearance-none pl-1.5 pr-3.5 z-10">
              <option value="zh-TW" class="bg-slate-900 text-white" ${currentLang === 'zh-TW' ? 'selected' : ''}>繁體中文</option>
              <option value="en" class="bg-slate-900 text-white" ${currentLang === 'en' ? 'selected' : ''}>English</option>
            </select>
            <svg class="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Battle Settings Button -->
          <button id="open-settings-btn" class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 active:scale-95 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span id="open-settings-btn-text">${dict.common.battleSettings}</span>
          </button>
        </div>
      </div>
    </header>
  `;
  container.innerHTML = html;

  const openAboutBtn = document.getElementById('open-about-btn');
  openAboutBtn?.addEventListener('click', () => {
    window.location.hash = '#/about';
  });

  const logoLink = document.getElementById('logo-link');
  logoLink?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/';
  });

  const ensureTableView = () => {
    if (window.location.hash === '#/about') {
      window.location.hash = '#/';
    }
  };

  const openSettingsBtn = document.getElementById('open-settings-btn')!;
  openSettingsBtn.addEventListener('click', () => {
    ensureTableView();
    toggleSettingsDrawer();
  });

  const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
  langSelect.addEventListener('change', (e) => {
    const newLocale = (e.target as HTMLSelectElement).value as SupportedLocale;
    setLocale(newLocale);
  });

  const btnSingle = document.getElementById('btn-mode-single')!;
  const btnDouble = document.getElementById('btn-mode-double')!;
  const btnSingleM = document.getElementById('btn-mode-single-m');
  const btnDoubleM = document.getElementById('btn-mode-double-m');

  const setBattleMode = (isDouble: boolean) => {
    ensureTableView();
    battleStore.set(state => state.isDoubleBattle = isDouble);
  };

  btnSingle.addEventListener('click', () => setBattleMode(false));
  btnSingleM?.addEventListener('click', () => setBattleMode(false));
  btnDouble.addEventListener('click', () => setBattleMode(true));
  btnDoubleM?.addEventListener('click', () => setBattleMode(true));

  // Update UI on state change
  const updateModeButtons = (isDouble: boolean) => {
    const activeClass = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
    const inactiveClass = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
    btnSingle.className = isDouble ? inactiveClass : activeClass;
    btnDouble.className = isDouble ? activeClass : inactiveClass;
    if (btnSingleM) btnSingleM.className = isDouble ? inactiveClass : activeClass;
    if (btnDoubleM) btnDoubleM.className = isDouble ? activeClass : inactiveClass;
  };

  // Season Select Event Listeners
  const seasonSelect = document.getElementById('season-select') as HTMLSelectElement | null;
  const seasonSelectM = document.getElementById('season-select-m') as HTMLSelectElement | null;

  const onSeasonChange = (newFormatId: string) => {
    ensureTableView();
    battleStore.set(state => {
      state.activeFormat = newFormatId;
    });
  };

  seasonSelect?.addEventListener('change', (e) => {
    onSeasonChange((e.target as HTMLSelectElement).value);
  });
  seasonSelectM?.addEventListener('change', (e) => {
    onSeasonChange((e.target as HTMLSelectElement).value);
  });

  // Search Logic
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results')!;
  
  // Flatten data for search based on active format
  let currentFormatId = battleStore.get().activeFormat;
  let allPokemon = getAllPokemon(getFormatData(currentFormatId));
  let currentMatches: PokemonSpeedData[] = [];

  const renderSearchResults = () => {
    const locale = getLocale();
    const currentDict = t(locale);

    if (currentMatches.length > 0) {
      searchResults.innerHTML = currentMatches
        .map(p => renderHeaderSearchItem(p, locale))
        .join('');
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = `<div class="p-3 text-sm text-gray-500 text-center">${escapeHtml(currentDict.common.searchNoResults)}</div>`;
      searchResults.classList.remove('hidden');
    }
  };

  // Update UI on battleStore state change
  battleStore.subscribe(state => {
    updateModeButtons(state.isDoubleBattle);
    if (state.activeFormat !== currentFormatId) {
      currentFormatId = state.activeFormat;
      if (seasonSelect && seasonSelect.value !== currentFormatId) {
        seasonSelect.value = currentFormatId;
      }
      if (seasonSelectM && seasonSelectM.value !== currentFormatId) {
        seasonSelectM.value = currentFormatId;
      }
      allPokemon = getAllPokemon(getFormatData(currentFormatId));
      if (searchInput && searchInput.value.trim()) {
        currentMatches = searchPokemon(allPokemon, searchInput.value.trim(), state.isDoubleBattle, 6);
        renderSearchResults();
      }
    }
  });

  searchInput.addEventListener('input', (e) => {
    const term = (e.target as HTMLInputElement).value;
    if (!term.trim()) {
      currentMatches = [];
      searchResults.classList.add('hidden');
      return;
    }

    const isDouble = battleStore.get().isDoubleBattle;
    currentMatches = searchPokemon(allPokemon, term, isDouble, 6);
    renderSearchResults();
  });

  // Handle Enter key on search input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (currentMatches.length > 0) {
        e.preventDefault();
        ensureTableView();
        const top = currentMatches[0];
        focusAndHighlightPokemon(top.formId, top.baseSpeed.toString());
        searchResults.classList.add('hidden');
        searchInput.value = '';
        searchInput.blur();
      }
    }
  });

  // Handle click on search item
  searchResults.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.search-item') as HTMLElement;
    if (item) {
      ensureTableView();
      const base = item.getAttribute('data-base');
      const formId = item.getAttribute('data-form-id');
      if (base && formId) {
        focusAndHighlightPokemon(formId, base);
      }
      searchResults.classList.add('hidden');
      searchInput.value = '';
      searchInput.blur();
    }
  });

  // Close search when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
      searchResults.classList.add('hidden');
    }
  });

  // Subscribe to locale changes for reactive header updates
  subscribeLocale((newLocale, newDict) => {
    if (langSelect && langSelect.value !== newLocale) {
      langSelect.value = newLocale;
    }
    if (seasonSelect) {
      seasonSelect.innerHTML = renderSeasonOptions(newLocale, currentFormatId);
    }
    if (seasonSelectM) {
      seasonSelectM.innerHTML = renderSeasonOptions(newLocale, currentFormatId);
    }
    if (searchInput) {
      searchInput.placeholder = newDict.common.searchPlaceholder;
    }
    if (btnSingle) btnSingle.textContent = newDict.common.singleBattle;
    if (btnDouble) btnDouble.textContent = newDict.common.doubleBattle;
    if (btnSingleM) btnSingleM.textContent = newDict.common.singleBattle;
    if (btnDoubleM) btnDoubleM.textContent = newDict.common.doubleBattle;
    
    const settingsText = document.getElementById('open-settings-btn-text');
    if (settingsText) settingsText.textContent = newDict.common.battleSettings;

    const aboutText = document.getElementById('open-about-btn-text');
    if (aboutText) aboutText.textContent = newDict.common.about;
    if (openAboutBtn) openAboutBtn.title = newDict.common.about;

    if (!searchResults.classList.contains('hidden') && currentMatches.length > 0) {
      renderSearchResults();
    }
  });

  // Dynamic header height measurement for persistent sticky coordination
  const updateHeaderHeight = () => {
    const height = container.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty('--header-height', `${height}px`);
      document.documentElement.style.setProperty('--table-header-top', `${height}px`);
    }
  };

  // Observe container size changes (e.g. responsive wrap, window resize, content changes)
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      updateHeaderHeight();
    });
    ro.observe(container);
  }

  // Initial measurement
  updateHeaderHeight();
}
