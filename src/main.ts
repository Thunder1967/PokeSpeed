import './styles/main.css';
import { renderHeader } from './components/Header';
import { renderSpeedTable } from './components/SpeedTable';
import { renderDrawer, updateDrawerBounds } from './components/Drawer';
import { battleStore } from './store/battleState';
import { SpeedTableData } from './types/pokemon';
import championMB from './data/formats/champion-m-b.json';
import { initImageFallback } from './utils/imageFallback';
import { t, getLocale, subscribeLocale } from './i18n';

initImageFallback();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen p-4 flex flex-col items-center gap-4">
    <div id="header-mount" class="w-full"></div>
    <div id="speed-table-mount" class="w-full"></div>
  </div>
  <div id="drawer-mount"></div>
`;

let cleanupTable: () => void;
let currentMode = battleStore.get().isDoubleBattle;

function updateTable(isDouble: boolean) {
  if (cleanupTable) cleanupTable();
  cleanupTable = renderSpeedTable(
    document.getElementById('speed-table-mount')!,
    championMB as unknown as SpeedTableData,
    isDouble ? 'double' : 'single'
  );
  updateDrawerBounds();
}

function applyLocale() {
  const meta = t().meta;
  document.title = meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', meta.description);
  }
  document.documentElement.lang = getLocale();

  renderHeader(document.getElementById('header-mount')!);
  updateTable(battleStore.get().isDoubleBattle);
  renderDrawer(document.getElementById('drawer-mount')!);
}

// Initial full render with detected locale
applyLocale();

// Listen for mode changes (single / double)
battleStore.subscribe(state => {
  if (state.isDoubleBattle !== currentMode) {
    currentMode = state.isDoubleBattle;
    updateTable(currentMode);
  }
});

// Listen for locale changes (zh-TW <-> en)
subscribeLocale(() => {
  applyLocale();
});
