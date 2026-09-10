import './styles/main.css';
import { renderHeader } from './components/Header';
import { renderSpeedTable } from './components/SpeedTable';
import { renderAboutPage } from './components/AboutPage';
import { renderDrawer, updateDrawerBounds } from './components/Drawer';
import { battleStore } from './store/battleState';
import { getFormatData } from './data/formats';
import { initImageFallback } from './utils/imageFallback';
import { subscribeLocale } from './i18n';

initImageFallback();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen flex flex-col items-center">
    <div id="header-mount" class="w-full sticky top-0 z-40"></div>
    <div class="w-full max-w-7xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center gap-4">
      <div id="speed-table-mount" class="w-full"></div>
      <div id="about-mount" class="w-full hidden"></div>
    </div>
  </div>
  <div id="drawer-mount"></div>
`;

let cleanupTable: (() => void) | undefined;
let cleanupAbout: (() => void) | null = null;
let currentFormat = battleStore.get().activeFormat;
let currentMode = battleStore.get().isDoubleBattle; // false = single, true = double

const tableMount = document.getElementById('speed-table-mount')!;
const aboutMount = document.getElementById('about-mount')!;

function updateTable(formatId: string, isDouble: boolean) {
  if (cleanupTable) cleanupTable();
  const formatData = getFormatData(formatId);
  cleanupTable = renderSpeedTable(
    tableMount,
    formatData,
    isDouble ? 'double' : 'single'
  );
  updateDrawerBounds();
}

function handleRoute() {
  const isAbout = window.location.hash === '#/about';
  if (isAbout) {
    tableMount.style.display = 'none';
    aboutMount.style.display = 'block';
    if (!cleanupAbout) {
      cleanupAbout = renderAboutPage(aboutMount);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    aboutMount.style.display = 'none';
    tableMount.style.display = 'block';
    if (cleanupAbout) {
      cleanupAbout();
      cleanupAbout = null;
      aboutMount.innerHTML = '';
    }
    updateDrawerBounds();
  }
}

// Initial table render
updateTable(currentFormat, currentMode);

// Render header & battle settings drawer
renderHeader(document.getElementById('header-mount')!);
renderDrawer(document.getElementById('drawer-mount')!);

// Hash routing
window.addEventListener('hashchange', handleRoute);
handleRoute();

// Listen for mode or season changes
battleStore.subscribe(state => {
  if (state.isDoubleBattle !== currentMode || state.activeFormat !== currentFormat) {
    currentMode = state.isDoubleBattle;
    currentFormat = state.activeFormat;
    updateTable(currentFormat, currentMode);
  }
});

// Listen for locale changes to re-render table with new language
subscribeLocale(() => {
  const state = battleStore.get();
  updateTable(state.activeFormat, state.isDoubleBattle);
});
