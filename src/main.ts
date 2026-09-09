import './styles/main.css';
import { renderHeader } from './components/Header';
import { renderSpeedTable } from './components/SpeedTable';
import { renderDrawer, updateDrawerBounds } from './components/Drawer';
import championMB from './data/formats/champion-m-b.json';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen p-4 flex flex-col items-center gap-4">
    <div id="header-mount" class="w-full"></div>
    <div id="speed-table-mount" class="w-full"></div>
  </div>
  <div id="drawer-mount"></div>
`;

import { battleStore } from './store/battleState';

let cleanupTable: () => void;
let currentMode = false; // false = single, true = double

function updateTable(isDouble: boolean) {
  if (cleanupTable) cleanupTable();
  cleanupTable = renderSpeedTable(
    document.getElementById('speed-table-mount')!,
    championMB as any,
    isDouble ? 'double' : 'single'
  );
  updateDrawerBounds();
}

// Initial render
updateTable(battleStore.get().isDoubleBattle);

// Listen for mode changes
battleStore.subscribe(state => {
  if (state.isDoubleBattle !== currentMode) {
    currentMode = state.isDoubleBattle;
    updateTable(currentMode);
  }
});

renderHeader(document.getElementById('header-mount')!);
renderDrawer(document.getElementById('drawer-mount')!);
