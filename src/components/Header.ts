import { battleStore } from '../store/battleState';
import championMB from '../data/formats/champion-m-b.json';
import { SpeedTableData } from '../types/pokemon';

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
      
      <div class="relative w-full md:w-64">
        <input type="text" id="search-input" placeholder="搜尋寶可夢..." class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors">
        <div id="search-results" class="absolute top-full left-0 w-full mt-1 bg-surface border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto hidden z-50"></div>
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto justify-between">
        <div class="hidden md:flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button id="btn-mode-single" class="px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors">單打</button>
          <button id="btn-mode-double" class="px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors">雙打</button>
        </div>
        <button id="open-settings-btn" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20">
          ⚙️ 設定
        </button>
      </div>
    </header>
  `;
  container.innerHTML = html;

  document.getElementById('open-settings-btn')!.addEventListener('click', () => {
    if ((window as any).openSettingsDrawer) {
      (window as any).openSettingsDrawer();
    }
  });

  const btnSingle = document.getElementById('btn-mode-single')!;
  const btnDouble = document.getElementById('btn-mode-double')!;

  btnSingle.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = false);
  });

  btnDouble.addEventListener('click', () => {
    battleStore.set(state => state.isDoubleBattle = true);
  });

  // Update UI on state change
  battleStore.subscribe(state => {
    if (state.isDoubleBattle) {
      btnSingle.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
      btnDouble.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
    } else {
      btnSingle.className = "px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors";
      btnDouble.className = "px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors";
    }
  });

  // Search Logic
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results')!;
  
  // Flatten data for search
  const allPokemon: any[] = [];
  const data = championMB as any as SpeedTableData;
  Object.keys(data).forEach(base => {
    data[Number(base)].forEach(p => {
      allPokemon.push({
        ...p,
        baseSpeed: base
      });
    });
  });

  searchInput.addEventListener('input', (e) => {
    const term = (e.target as HTMLInputElement).value.trim().toLowerCase();
    if (!term) {
      searchResults.classList.add('hidden');
      return;
    }

    const matches = allPokemon.filter(p => 
      p.nameZh.includes(term) || p.nameEn.toLowerCase().includes(term)
    ).slice(0, 5); // show top 5

    if (matches.length > 0) {
      searchResults.innerHTML = matches.map(p => `
        <div class="search-item p-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0" data-base="${p.baseSpeed}">
          <img src="${p.sprite}" class="w-8 h-8 object-contain">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-200">${p.nameZh}</span>
            <span class="text-xs text-gray-500">${p.nameEn} (Base: ${p.baseSpeed})</span>
          </div>
        </div>
      `).join('');
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = `<div class="p-3 text-sm text-gray-500 text-center">無符合結果</div>`;
      searchResults.classList.remove('hidden');
    }
  });

  // Handle click on search item
  searchResults.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.search-item');
    if (item) {
      const base = item.getAttribute('data-base');
      if (base) {
        const row = document.querySelector(`.speed-table-row[data-base="${base}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (!row.classList.contains('is-pinned')) {
            row.classList.add('is-pinned');
          }
        }
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
