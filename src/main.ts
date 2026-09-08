import './styles/main.css';
import { renderHeader } from './components/Header';
import { renderSpeedTable } from './components/SpeedTable';
import { renderDrawer } from './components/Drawer';
import championMB from './data/formats/champion-m-b.json';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen p-4 flex flex-col items-center gap-4">
    <div id="header-mount" class="w-full"></div>
    <div id="speed-table-mount" class="w-full"></div>
  </div>
  <div id="drawer-mount"></div>
`;

renderHeader(document.getElementById('header-mount')!);

renderSpeedTable(
  document.getElementById('speed-table-mount')!,
  championMB as any,
  'single'
);

renderDrawer(document.getElementById('drawer-mount')!);
