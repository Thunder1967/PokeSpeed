import { SpeedTableData, PokemonSpeedData } from '../types/pokemon';
import { calcBaseSpeedLv50 } from '../utils/speedCalc';
import '../styles/table.css';

export function renderSpeedTable(
  container: HTMLElement,
  data: SpeedTableData,
  mode: 'single' | 'double'
) {
  // Sort base speeds descending
  const baseSpeeds = Object.keys(data)
    .map(Number)
    .sort((a, b) => b - a);

  let html = `
    <div class="speed-table-container">
      <div class="speed-table-header">
        <div class="col-base">種族</div>
        <div class="col-sprites-container">寶可夢</div>
        <div class="col-dynamic">動態實數</div>
        <div class="col-benchmarks-container">
          <div class="col-benchmarks">
            <div class="benchmark-cell header">極速(32+)</div>
            <div class="benchmark-cell header">準速(32)</div>
            <div class="benchmark-cell header">無速(0)</div>
            <div class="benchmark-cell header">慢速(0-)</div>
            <div class="benchmark-cell header">M 🧣</div>
            <div class="benchmark-cell header">N 🧣</div>
            <div class="benchmark-cell header">M -1</div>
            <div class="benchmark-cell header">N -1</div>
          </div>
        </div>
      </div>
  `;

  for (const base of baseSpeeds) {
    let pokemons = data[base];
    
    // Sort by usage rank
    pokemons.sort((a, b) => 
      mode === 'single' ? a.usageRankSingle - b.usageRankSingle : a.usageRankDouble - b.usageRankDouble
    );

    const displayCount = Math.min(10, pokemons.length);
    const displayed = pokemons.slice(0, displayCount);
    const hiddenCount = pokemons.length - displayCount;

    // Calculate benchmarks
    const max = calcBaseSpeedLv50(base, 32, 1.1);
    const neu = calcBaseSpeedLv50(base, 32, 1.0);
    const zero = calcBaseSpeedLv50(base, 0, 1.0);
    const neg = calcBaseSpeedLv50(base, 0, 0.9);
    const mScarf = Math.floor(max * 1.5);
    const nScarf = Math.floor(neu * 1.5);
    const mMinus1 = Math.floor(max * (2/3));
    const nMinus1 = Math.floor(neu * (2/3));

    html += `
      <div class="speed-table-row" data-base="${base}">
        <div class="col-base">${base}</div>
        <div class="col-sprites-container">
          <div class="col-sprites">
            ${displayed.map(p => `<img src="${p.sprite}" alt="${p.nameZh}" title="${p.nameZh}" class="sprite-img" />`).join('')}
            ${hiddenCount > 0 ? `<div class="more-btn">+${hiddenCount} 更多</div>` : ''}
          </div>
        </div>
        <div class="col-dynamic" id="dynamic-${base}">--</div>
        <div class="col-benchmarks-container">
          <div class="col-benchmarks">
            <div class="benchmark-cell font-bold text-gray-200">${max}</div>
            <div class="benchmark-cell">${neu}</div>
            <div class="benchmark-cell">${zero}</div>
            <div class="benchmark-cell">${neg}</div>
            <div class="benchmark-cell text-purple-400">${mScarf}</div>
            <div class="benchmark-cell text-purple-400">${nScarf}</div>
            <div class="benchmark-cell text-orange-400">${mMinus1}</div>
            <div class="benchmark-cell text-orange-400">${nMinus1}</div>
          </div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}
