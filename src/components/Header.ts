import { battleStore } from '../store/battleState';
import championMB from '../data/formats/champion-m-b.json';
import { SpeedTableData, PokemonSpeedData, DEFAULT_SUBSTITUTE_SPRITE } from '../types/pokemon';
import { focusAndHighlightPokemon } from './SpeedTable';
import { searchPokemon } from '../utils/pokemonSearch';

export function renderHeader(container: HTMLElement) {
  const html = `
    <header class="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 bg-surface rounded-xl border border-white/10 shadow-lg mt-4 mb-6 gap-4">
      <div class="flex items-center gap-4 w-full md:w-auto justify-between">
        <h1 class="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          PokéSpeed
        </h1>
        <div class="flex md:hidden gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button id="btn-mode-single-m" class="px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors">單打</button>
          <button id="btn-mode-double-m" class="px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors">雙打</button>
        </div>
      </div>
      
      <div class="relative w-full md:w-72">
        <input type="text" id="search-input" placeholder="搜尋 中文 / 英文 / 速度種族..." class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors">
        <div id="search-results" class="absolute top-full left-0 w-full mt-1 bg-surface border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto hidden z-50"></div>
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto justify-between">
        <div class="hidden md:flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button id="btn-mode-single" class="px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors">單打</button>
          <button id="btn-mode-double" class="px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors">雙打</button>
        </div>
        <button id="open-settings-btn" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          對戰設定
        </button>
      </div>
    </header>
  `;
  container.innerHTML = html;

  document.getElementById('open-settings-btn')!.addEventListener('click', () => {
    if ((window as any).toggleSettingsDrawer) {
      (window as any).toggleSettingsDrawer();
    } else if ((window as any).openSettingsDrawer) {
      (window as any).openSettingsDrawer();
    }
  });

  const btnSingle = document.getElementById('btn-mode-single')!;
  const btnDouble = document.getElementById('btn-mode-double')!;
  const btnSingleM = document.getElementById('btn-mode-single-m');
  const btnDoubleM = document.getElementById('btn-mode-double-m');

  btnSingle.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = false);
  });

  btnDouble.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = true);
  });

  btnSingleM?.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = false);
  });

  btnDoubleM?.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = true);
  });

  // Update UI on state change
  battleStore.subscribe(state => {
    if (state.isDoubleBattle) {
      btnSingle.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
      btnDouble.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
      if (btnSingleM) btnSingleM.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
      if (btnDoubleM) btnDoubleM.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
    } else {
      btnSingle.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
      btnDouble.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
      if (btnSingleM) btnSingleM.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
      if (btnDoubleM) btnDoubleM.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
    }
  });

  // Search Logic
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results')!;
  
  // Flatten data for search
  const allPokemon: PokemonSpeedData[] = [];
  const data = championMB as any as SpeedTableData;
  Object.keys(data).forEach(base => {
    data[Number(base)].forEach(p => {
      allPokemon.push(p);
    });
  });

  let currentMatches: PokemonSpeedData[] = [];

  searchInput.addEventListener('input', (e) => {
    const term = (e.target as HTMLInputElement).value;
    if (!term.trim()) {
      currentMatches = [];
      searchResults.classList.add('hidden');
      return;
    }

    const isDouble = battleStore.get().isDoubleBattle;
    currentMatches = searchPokemon(allPokemon, term, isDouble, 6);

    if (currentMatches.length > 0) {
      searchResults.innerHTML = currentMatches.map(p => `
        <div class="search-item p-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0" 
             data-base="${p.baseSpeed}" data-form-id="${p.formId}">
          <img src="${p.sprite || DEFAULT_SUBSTITUTE_SPRITE}" class="w-8 h-8 object-contain" 
               onerror="if (this.src !== '${DEFAULT_SUBSTITUTE_SPRITE}') { this.src = '${DEFAULT_SUBSTITUTE_SPRITE}'; } else { this.onerror = null; }">
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-gray-200">${p.nameZh}</span>
            <span class="text-xs text-gray-500">${p.nameEn} (速度: ${p.baseSpeed} | 雙打: #${p.usageRankDouble} | 單打: #${p.usageRankSingle})</span>
          </div>
        </div>
      `).join('');
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = `<div class="p-3 text-sm text-gray-500 text-center">無符合結果</div>`;
      searchResults.classList.remove('hidden');
    }
  });

  // Handle Enter key on search input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (currentMatches.length > 0) {
        e.preventDefault();
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

  // Hide on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
      searchResults.classList.add('hidden');
    }
  });
}
