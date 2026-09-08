import { battleStore } from '../store/battleState';
import { Icons } from '../assets/icons';
import { calcBaseSpeedLv50 } from '../utils/speedCalc';
import { SlotState } from '../types/pokemon';

function calcRealSpeed(slot: SlotState, baseSpeed: number): number {
  let speed = calcBaseSpeedLv50(baseSpeed, slot.evs, slot.nature);
  if (slot.stages > 0) speed = Math.floor(speed * ((2 + slot.stages) / 2));
  if (slot.stages < 0) speed = Math.floor(speed * (2 / (2 - slot.stages)));
  if (slot.isTailwind) speed = Math.floor(speed * 2);
  if (slot.isScarf) speed = Math.floor(speed * 1.5);
  if (slot.isAbilityBoost) speed = Math.floor(speed * slot.abilityMultiplier);
  if (slot.isParalyzed) speed = Math.floor(speed * 0.5);
  return speed;
}

interface SlotUIConfig {
  key: 'enemy' | 'playerA' | 'playerB';
  title: string;
  theme: {
    title: string;
    border: string;
    accent: string;
    activeNature: string;
    badge: string;
  };
  hasBaseSpeed: boolean;
  defaultBaseSpeed?: number;
}

const slotConfigs: SlotUIConfig[] = [
  {
    key: 'enemy',
    title: '敵方基準設定',
    theme: {
      title: 'text-red-400',
      border: 'border-red-500/30',
      accent: 'accent-red-500',
      activeNature: 'data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20',
      badge: 'bg-red-500/20 text-red-300'
    },
    hasBaseSpeed: false
  },
  {
    key: 'playerA',
    title: '我方 A (綠)',
    theme: {
      title: 'text-emerald-400',
      border: 'border-emerald-500/30',
      accent: 'accent-emerald-500',
      activeNature: 'data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-300'
    },
    hasBaseSpeed: true,
    defaultBaseSpeed: 100
  },
  {
    key: 'playerB',
    title: '我方 B (紫)',
    theme: {
      title: 'text-purple-400',
      border: 'border-purple-500/30',
      accent: 'accent-purple-500',
      activeNature: 'data-[active=true]:border-purple-500 data-[active=true]:bg-purple-500/20',
      badge: 'bg-purple-500/20 text-purple-300'
    },
    hasBaseSpeed: true,
    defaultBaseSpeed: 100
  }
];

function renderSlotHTML(cfg: SlotUIConfig): string {
  const { key, title, theme, hasBaseSpeed, defaultBaseSpeed } = cfg;
  return `
    <div id="${key}-section" class="space-y-4 ${key === 'playerB' ? 'hidden' : ''}">
      <div class="flex justify-between items-center border-b ${theme.border} pb-2">
        <h3 class="text-lg font-bold ${theme.title}">${title}</h3>
        ${hasBaseSpeed ? `<span id="${key}-speed-badge" class="text-xs px-2 py-0.5 rounded font-mono font-bold ${theme.badge}">實數: --</span>` : ''}
      </div>
      
      ${hasBaseSpeed ? `
      <div>
        <label class="block text-sm text-gray-400 mb-1">我方種族值</label>
        <input type="number" id="${key}-base" value="${defaultBaseSpeed || 100}" min="1" max="255" class="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30">
      </div>
      ` : ''}

      <div>
        <div class="flex justify-between text-sm text-gray-400 mb-1">
          <span>努力值 (0-32)</span>
          <span class="font-mono text-xs text-gray-300" id="${key}-evs-val">32 (252 EV)</span>
        </div>
        <input type="range" id="${key}-evs" min="0" max="32" value="32" class="w-full ${theme.accent}">
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-1">性格修正</label>
        <div class="flex gap-2">
          <button class="${key}-nature flex-1 py-1 text-xs rounded border border-transparent ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors" data-val="1.1">加速 (+10%)</button>
          <button class="${key}-nature flex-1 py-1 text-xs rounded border border-transparent ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors" data-val="1.0">無關 (0%)</button>
          <button class="${key}-nature flex-1 py-1 text-xs rounded border border-transparent ${theme.activeNature} bg-white/5 hover:bg-white/10 transition-colors" data-val="0.9">減速 (-10%)</button>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm text-gray-400 mb-1">
          <span>能力階級 (-6 ~ +6)</span>
          <span class="font-mono text-xs text-gray-300" id="${key}-stages-val">0</span>
        </div>
        <input type="range" id="${key}-stages" min="-6" max="6" value="0" class="w-full ${theme.accent}">
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 select-none">
          <input type="checkbox" id="${key}-tailwind" class="${theme.accent}">
          ${Icons.tailwind} 順風
        </label>
        <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 select-none">
          <input type="checkbox" id="${key}-scarf" class="${theme.accent}">
          ${Icons.scarf} 圍巾
        </label>
        <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 select-none">
          <input type="checkbox" id="${key}-ability" class="${theme.accent}">
          ${Icons.abilityBoost} 特性(x2)
        </label>
        <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 select-none">
          <input type="checkbox" id="${key}-para" class="${theme.accent}">
          麻痺
        </label>
      </div>
    </div>
  `;
}

export function renderDrawer(container: HTMLElement) {
  const html = `
    <div id="settings-drawer" class="fixed top-0 right-0 h-full w-84 max-w-[90vw] glass shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col">
      <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <h2 class="text-xl font-bold tracking-wide">對戰設定</h2>
        <button id="close-drawer" class="text-gray-400 hover:text-white p-2 text-lg">✕</button>
      </div>
      
      <div class="flex-grow overflow-y-auto p-4 space-y-6">
        ${slotConfigs.map(renderSlotHTML).join('')}
      </div>
    </div>
    
    <div id="drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>
  `;

  container.innerHTML = html;

  const drawer = document.getElementById('settings-drawer')!;
  const backdrop = document.getElementById('drawer-backdrop')!;
  const closeBtn = document.getElementById('close-drawer')!;

  function closeDrawer() {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }

  function openDrawer() {
    backdrop.classList.remove('hidden');
    void backdrop.offsetWidth; // flush layout
    backdrop.classList.remove('opacity-0');
    drawer.classList.remove('translate-x-full');
  }

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  (window as any).openSettingsDrawer = openDrawer;

  // Setup bindings for each slot
  slotConfigs.forEach(cfg => {
    const { key, hasBaseSpeed } = cfg;

    // Base speed input
    if (hasBaseSpeed) {
      const baseInput = document.getElementById(`${key}-base`) as HTMLInputElement;
      baseInput?.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val)) {
          battleStore.set(state => state.slots[key].baseSpeed = val);
        }
      });
    }

    // EVs slider
    const evsInput = document.getElementById(`${key}-evs`) as HTMLInputElement;
    const evsVal = document.getElementById(`${key}-evs-val`)!;
    evsInput.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      const actualEv = val === 32 ? 252 : (val === 0 ? 0 : val * 8 - 4);
      evsVal.textContent = `${val} (${actualEv} EV)`;
      battleStore.set(state => state.slots[key].evs = val);
    });

    // Nature buttons
    const natureBtns = document.querySelectorAll(`.${key}-nature`);
    natureBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const val = parseFloat(target.dataset.val!);
        natureBtns.forEach(b => b.removeAttribute('data-active'));
        target.setAttribute('data-active', 'true');
        battleStore.set(state => state.slots[key].nature = val as any);
      });
    });
    // Default nature: 1.1 (first button)
    (natureBtns[0] as HTMLButtonElement)?.setAttribute('data-active', 'true');

    // Stages slider
    const stagesInput = document.getElementById(`${key}-stages`) as HTMLInputElement;
    const stagesVal = document.getElementById(`${key}-stages-val`)!;
    stagesInput.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      stagesVal.textContent = (val > 0 ? '+' : '') + val.toString();
      battleStore.set(state => state.slots[key].stages = val);
    });

    // Tailwind
    const tailwindInput = document.getElementById(`${key}-tailwind`) as HTMLInputElement;
    tailwindInput.addEventListener('change', (e) => {
      battleStore.set(state => state.slots[key].isTailwind = (e.target as HTMLInputElement).checked);
    });

    // Scarf
    const scarfInput = document.getElementById(`${key}-scarf`) as HTMLInputElement;
    scarfInput.addEventListener('change', (e) => {
      battleStore.set(state => state.slots[key].isScarf = (e.target as HTMLInputElement).checked);
    });

    // Ability Boost
    const abilityInput = document.getElementById(`${key}-ability`) as HTMLInputElement;
    abilityInput.addEventListener('change', (e) => {
      battleStore.set(state => {
        state.slots[key].isAbilityBoost = (e.target as HTMLInputElement).checked;
        state.slots[key].abilityMultiplier = 2.0;
      });
    });

    // Paralysis
    const paraInput = document.getElementById(`${key}-para`) as HTMLInputElement;
    paraInput.addEventListener('change', (e) => {
      battleStore.set(state => state.slots[key].isParalyzed = (e.target as HTMLInputElement).checked);
    });
  });

  // Update speed badges & toggle Player B visibility
  const updateDrawerState = () => {
    const state = battleStore.get();

    // Toggle player B
    const pBSection = document.getElementById('playerB-section')!;
    if (state.isDoubleBattle) {
      pBSection.classList.remove('hidden');
    } else {
      pBSection.classList.add('hidden');
    }

    // Update real speed badges
    const badgeA = document.getElementById('playerA-speed-badge');
    if (badgeA) {
      const speedA = calcRealSpeed(state.slots.playerA, state.slots.playerA.baseSpeed ?? 100);
      badgeA.textContent = `實數: ${speedA}`;
    }

    const badgeB = document.getElementById('playerB-speed-badge');
    if (badgeB) {
      const speedB = calcRealSpeed(state.slots.playerB, state.slots.playerB.baseSpeed ?? 100);
      badgeB.textContent = `實數: ${speedB}`;
    }
  };

  battleStore.subscribe(updateDrawerState);
  updateDrawerState(); // initial sync
}
