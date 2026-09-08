import { battleStore } from '../store/battleState';
import { Icons } from '../assets/icons';

export function renderDrawer(container: HTMLElement) {
  let html = `
    <div id="settings-drawer" class="fixed top-0 right-0 h-full w-80 max-w-[90vw] glass shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col">
      <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <h2 class="text-xl font-bold">對戰設定</h2>
        <button id="close-drawer" class="text-gray-400 hover:text-white p-2">✕</button>
      </div>
      
      <div class="flex-grow overflow-y-auto p-4 space-y-6">
        <!-- Enemy Settings -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-red-400 border-b border-red-500/30 pb-2">敵方基準設定</h3>
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">努力值 (0-32)</label>
            <input type="range" id="enemy-evs" min="0" max="32" value="32" class="w-full accent-red-500">
            <div class="text-right text-xs" id="enemy-evs-val">32</div>
          </div>

          <div class="flex gap-2">
            <button class="enemy-nature flex-1 py-1 bg-white/10 rounded border border-transparent data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20" data-val="1.1">加速 (+10%)</button>
            <button class="enemy-nature flex-1 py-1 bg-white/10 rounded border border-transparent data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20" data-val="1.0">無關</button>
            <button class="enemy-nature flex-1 py-1 bg-white/10 rounded border border-transparent data-[active=true]:border-red-500 data-[active=true]:bg-red-500/20" data-val="0.9">減速 (-10%)</button>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1">能力階級 (-6 ~ +6)</label>
            <input type="range" id="enemy-stages" min="-6" max="6" value="0" class="w-full accent-red-500">
            <div class="text-right text-xs" id="enemy-stages-val">0</div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">
              <input type="checkbox" id="enemy-tailwind" class="accent-red-500">
              ${Icons.tailwind} 順風
            </label>
            <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">
              <input type="checkbox" id="enemy-scarf" class="accent-red-500">
              ${Icons.scarf} 圍巾
            </label>
            <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">
              <input type="checkbox" id="enemy-ability" class="accent-red-500">
              ${Icons.abilityBoost} 特性(x2)
            </label>
            <label class="flex items-center gap-2 text-sm bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">
              <input type="checkbox" id="enemy-para" class="accent-red-500">
              ${Icons.paralysis} 麻痺
            </label>
          </div>
        </div>

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
    // flush layout
    void backdrop.offsetWidth;
    backdrop.classList.remove('opacity-0');
    drawer.classList.remove('translate-x-full');
  }

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Expose open drawer to window for easy access from header
  (window as any).openSettingsDrawer = openDrawer;

  // Bind enemy settings
  const eEvs = document.getElementById('enemy-evs') as HTMLInputElement;
  const eEvsVal = document.getElementById('enemy-evs-val')!;
  eEvs.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    eEvsVal.textContent = val.toString();
    battleStore.set(state => state.slots.enemy.evs = val);
  });

  const eStages = document.getElementById('enemy-stages') as HTMLInputElement;
  const eStagesVal = document.getElementById('enemy-stages-val')!;
  eStages.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    eStagesVal.textContent = (val > 0 ? '+' : '') + val.toString();
    battleStore.set(state => state.slots.enemy.stages = val);
  });

  const eNatures = document.querySelectorAll('.enemy-nature');
  eNatures.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const val = parseFloat(target.dataset.val!);
      eNatures.forEach(b => b.removeAttribute('data-active'));
      target.setAttribute('data-active', 'true');
      battleStore.set(state => state.slots.enemy.nature = val as any);
    });
  });
  // init nature
  (eNatures[0] as HTMLButtonElement).setAttribute('data-active', 'true');

  const eTailwind = document.getElementById('enemy-tailwind') as HTMLInputElement;
  eTailwind.addEventListener('change', (e) => {
    battleStore.set(state => state.slots.enemy.isTailwind = (e.target as HTMLInputElement).checked);
  });

  const eScarf = document.getElementById('enemy-scarf') as HTMLInputElement;
  eScarf.addEventListener('change', (e) => {
    battleStore.set(state => state.slots.enemy.isScarf = (e.target as HTMLInputElement).checked);
  });

  const eAbility = document.getElementById('enemy-ability') as HTMLInputElement;
  eAbility.addEventListener('change', (e) => {
    battleStore.set(state => {
      state.slots.enemy.isAbilityBoost = (e.target as HTMLInputElement).checked;
      state.slots.enemy.abilityMultiplier = 2.0;
    });
  });

  const ePara = document.getElementById('enemy-para') as HTMLInputElement;
  ePara.addEventListener('change', (e) => {
    battleStore.set(state => state.slots.enemy.isParalyzed = (e.target as HTMLInputElement).checked);
  });
}
