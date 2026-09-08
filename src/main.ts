import './styles/main.css';
import { renderSpeedTable } from './components/SpeedTable';
import championMB from './data/formats/champion-m-b.json';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen p-4 flex flex-col items-center gap-6">
    <h1 class="text-3xl md:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mt-4">
      PokéSpeed Champion
    </h1>
    <div id="speed-table-mount" class="w-full"></div>
  </div>
`;

renderSpeedTable(
  document.getElementById('speed-table-mount')!,
  championMB as any,
  'single'
);
