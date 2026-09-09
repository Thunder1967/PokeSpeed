import { PinDividerItem, DEFAULT_SUBSTITUTE_SPRITE } from '../utils/pinDividerCalc';

function renderSlotDetailHTML(
  pokemon: { nameZh: string; nameEn: string; sprite: string; baseSpeed: number },
  slot: any,
  speed: number,
  isEmerald: boolean
): string {
  const actualEv = slot.evs === 32 ? 252 : (slot.evs === 0 ? 0 : slot.evs * 8 - 4);
  const natureText = slot.nature === 1.1 ? '加速 (+10%)' : (slot.nature === 0.9 ? '減速 (-10%)' : '無關 (0%)');
  const stageText = slot.stages !== 0 ? `階級: ${slot.stages > 0 ? '+' : ''}${slot.stages}` : null;

  const buffs: string[] = [];
  if (slot.isTailwind) buffs.push('順風 🌪️');
  if (slot.isScarf) buffs.push('圍巾 🧣');
  if (slot.isAbilityBoost) buffs.push('特性(2x) ⚡');
  if (slot.isParalyzed) buffs.push('麻痺 🟡');
  const buffStr = buffs.length > 0 ? buffs.join(' ') : '常規狀態';

  const badgeColor = isEmerald 
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
    : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  const roleTitle = isEmerald ? '我方 A (綠)' : '我方 B (紫)';

  return `
    <div class="flex items-center gap-2.5 pb-2 border-b border-white/10 mb-2">
      <img src="${pokemon.sprite || DEFAULT_SUBSTITUTE_SPRITE}" class="w-10 h-10 object-contain p-0.5 rounded-lg bg-black/50 border border-white/10 filter drop-shadow flex-shrink-0" 
           onerror="if (this.src !== '${DEFAULT_SUBSTITUTE_SPRITE}') { this.src = '${DEFAULT_SUBSTITUTE_SPRITE}'; } else { this.onerror = null; }" />
      <div class="flex flex-col flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1.5">
          <span class="font-bold text-sm text-white truncate">${pokemon.nameZh}</span>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded border ${badgeColor} whitespace-nowrap">
            實數: ${speed}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-gray-400 gap-2">
          <span class="truncate">${pokemon.nameEn}</span>
          <span class="font-mono text-gray-400 whitespace-nowrap">速度 ${pokemon.baseSpeed}</span>
        </div>
      </div>
    </div>
    
    <div class="space-y-1.5 text-xs">
      <div class="flex justify-between items-center text-gray-300">
        <span class="text-gray-400 font-medium">配置位置</span>
        <span class="font-semibold ${isEmerald ? 'text-emerald-400' : 'text-purple-400'}">${roleTitle}</span>
      </div>
      <div class="flex justify-between items-center text-gray-300">
        <span class="text-gray-400 font-medium">努力值 (0-32)</span>
        <span class="font-mono font-bold text-gray-200">${actualEv} (${slot.evs})</span>
      </div>
      <div class="flex justify-between items-center text-gray-300">
        <span class="text-gray-400 font-medium">性格修正</span>
        <span class="font-medium ${slot.nature === 1.1 ? 'text-red-400 font-bold' : slot.nature === 0.9 ? 'text-blue-400 font-bold' : 'text-gray-300'}">${natureText}</span>
      </div>
      ${stageText ? `
      <div class="flex justify-between items-center text-gray-300">
        <span class="text-gray-400 font-medium">能力階級</span>
        <span class="font-mono font-bold ${slot.stages > 0 ? 'text-emerald-400' : 'text-red-400'}">${slot.stages > 0 ? '+' : ''}${slot.stages}</span>
      </div>` : ''}
      <div class="flex justify-between items-center text-gray-300 pt-1 border-t border-white/5">
        <span class="text-gray-400 font-medium">戰場狀態</span>
        <span class="text-[11px] text-amber-300 font-medium">${buffStr}</span>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML string for a Pokemon Avatar PinDivider element.
 */
export function createPinDividerHTML(item: PinDividerItem): string {
  if (item.isMerged) {
    return `
      <div class="speed-pin-divider pin-merged" data-pin="merged">
        <div class="divider-line line-merged"></div>
        <div class="col-base divider-cell"></div>
        <div class="col-sprites-container divider-cell"></div>
        <div class="col-dynamic divider-cell">
          <div class="pin-badge badge-merged group" tabindex="0">
            <div class="flex items-center -space-x-2.5 hover:space-x-1 transition-all">
              <img src="${item.pokemonA.sprite || DEFAULT_SUBSTITUTE_SPRITE}" alt="${item.pokemonA.nameZh}"
                   class="pin-avatar-img w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain p-0.5 bg-black/80 border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] ring-2 ring-emerald-500/40 filter drop-shadow z-10"
                   onerror="if (this.src !== '${DEFAULT_SUBSTITUTE_SPRITE}') { this.src = '${DEFAULT_SUBSTITUTE_SPRITE}'; } else { this.onerror = null; }" />
              <img src="${item.pokemonB.sprite || DEFAULT_SUBSTITUTE_SPRITE}" alt="${item.pokemonB.nameZh}"
                   class="pin-avatar-img w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain p-0.5 bg-black/80 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] ring-2 ring-purple-500/40 filter drop-shadow z-20"
                   onerror="if (this.src !== '${DEFAULT_SUBSTITUTE_SPRITE}') { this.src = '${DEFAULT_SUBSTITUTE_SPRITE}'; } else { this.onerror = null; }" />
            </div>
            <div class="pin-tooltip pin-tooltip-merged">
              <div class="text-xs font-bold text-amber-300 pb-1.5 mb-2 border-b border-amber-500/30 flex items-center justify-between">
                <span>📌 我方雙打同速分水嶺</span>
                <span class="font-mono text-amber-200">實數: ${item.speed}</span>
              </div>
              ${renderSlotDetailHTML(item.pokemonA, item.slotStateA, item.speed, true)}
              <div class="border-t border-white/10 my-2.5"></div>
              ${renderSlotDetailHTML(item.pokemonB, item.slotStateB, item.speed, false)}
            </div>
          </div>
        </div>
        <div class="col-benchmarks-container divider-cell"></div>
      </div>
    `;
  }

  const isEmerald = item.color === 'emerald';
  const colorClass = isEmerald ? 'pin-emerald' : 'pin-violet';
  const lineClass = isEmerald ? 'line-emerald' : 'line-violet';
  const badgeClass = isEmerald ? 'badge-emerald' : 'badge-violet';

  return `
    <div class="speed-pin-divider ${colorClass}" data-pin="${item.slotKey}">
      <div class="divider-line ${lineClass}"></div>
      <div class="col-base divider-cell"></div>
      <div class="col-sprites-container divider-cell"></div>
      <div class="col-dynamic divider-cell">
        <div class="pin-badge ${badgeClass} group" tabindex="0">
          <img src="${item.pokemon.sprite || DEFAULT_SUBSTITUTE_SPRITE}" alt="${item.pokemon.nameZh}"
               class="pin-avatar-img w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain p-0.5 bg-black/80 ${isEmerald ? 'border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] ring-2 ring-emerald-500/40' : 'border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)] ring-2 ring-purple-500/40'} filter drop-shadow cursor-pointer transition-transform hover:scale-115"
               onerror="if (this.src !== '${DEFAULT_SUBSTITUTE_SPRITE}') { this.src = '${DEFAULT_SUBSTITUTE_SPRITE}'; } else { this.onerror = null; }" />
          <div class="pin-tooltip">
            ${renderSlotDetailHTML(item.pokemon, item.slotState, item.speed, isEmerald)}
          </div>
        </div>
      </div>
      <div class="col-benchmarks-container divider-cell"></div>
    </div>
  `;
}

let activeBadge: HTMLElement | null = null;
let floatingTooltip: HTMLElement | null = null;

export function initPinTooltipManager() {
  if (typeof document === 'undefined') return;

  function ensureFloatingTooltip(): HTMLElement {
    let el = document.getElementById('floating-pin-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'floating-pin-tooltip';
      el.className = 'floating-pin-tooltip';
      document.body.appendChild(el);
    }
    return el;
  }

  function showTooltipForBadge(badge: HTMLElement) {
    const template = badge.querySelector('.pin-tooltip');
    if (!template) return;

    floatingTooltip = ensureFloatingTooltip();
    activeBadge = badge;
    floatingTooltip.innerHTML = template.innerHTML;

    if (badge.classList.contains('badge-merged')) {
      floatingTooltip.classList.add('pin-tooltip-merged');
    } else {
      floatingTooltip.classList.remove('pin-tooltip-merged');
    }

    floatingTooltip.classList.add('is-visible');
    updatePosition();
  }

  function hideTooltip() {
    activeBadge = null;
    if (floatingTooltip) {
      floatingTooltip.classList.remove('is-visible');
    }
  }

  function updatePosition() {
    if (!activeBadge || !floatingTooltip) return;
    const rect = activeBadge.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideTooltip();
      return;
    }

    const tipRect = floatingTooltip.getBoundingClientRect();
    const badgeCenter = rect.left + rect.width / 2;
    let left = badgeCenter - tipRect.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));

    const arrowOffset = Math.max(16, Math.min(badgeCenter - left, tipRect.width - 16));
    floatingTooltip.style.setProperty('--arrow-left', `${arrowOffset}px`);

    let top = rect.top - tipRect.height - 12;
    if (top < 10) {
      top = rect.bottom + 12;
      floatingTooltip.classList.add('tooltip-bottom');
    } else {
      floatingTooltip.classList.remove('tooltip-bottom');
    }

    floatingTooltip.style.left = `${left}px`;
    floatingTooltip.style.top = `${top}px`;
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement | null;
    const badge = target?.closest('.pin-badge') as HTMLElement | null;
    if (badge) {
      showTooltipForBadge(badge);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement | null;
    const badge = target?.closest('.pin-badge') as HTMLElement | null;
    if (badge && activeBadge === badge) {
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
      if (!badge.contains(related)) {
        hideTooltip();
      }
    }
  });

  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null;
    const badge = target?.closest('.pin-badge') as HTMLElement | null;
    if (badge) {
      showTooltipForBadge(badge);
    }
  });

  document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLElement | null;
    const badge = target?.closest('.pin-badge') as HTMLElement | null;
    if (badge && activeBadge === badge) {
      hideTooltip();
    }
  });

  window.addEventListener('scroll', () => {
    if (activeBadge) updatePosition();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (activeBadge) updatePosition();
  }, { passive: true });
}

// Auto-init in browser environment
if (typeof window !== 'undefined') {
  initPinTooltipManager();
}

