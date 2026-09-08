import { battleStore } from '../store/battleState';

export function renderHeader(container: HTMLElement) {
  const html = `
    <header class="w-full max-w-7xl mx-auto flex justify-between items-center p-4 bg-surface rounded-xl border border-white/10 shadow-lg mt-4 mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          PokéSpeed
        </h1>
        <div class="hidden md:flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button id="btn-mode-single" class="px-3 py-1 rounded text-sm font-bold bg-white/10 text-white shadow transition-colors">單打</button>
          <button id="btn-mode-double" class="px-3 py-1 rounded text-sm font-bold text-gray-400 hover:text-white transition-colors">雙打</button>
        </div>
      </div>
      <div class="flex items-center gap-4">
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
}
