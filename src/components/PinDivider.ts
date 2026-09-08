import { Icons } from '../assets/icons';
import { PinDividerItem } from '../utils/pinDividerCalc';

/**
 * Creates the HTML string for a PinDivider element.
 */
export function createPinDividerHTML(item: PinDividerItem): string {
  if (item.isMerged) {
    return `
      <div class="speed-pin-divider pin-merged" data-pin="merged">
        <div class="divider-line line-merged"></div>
        <div class="col-base divider-cell"></div>
        <div class="col-sprites-container divider-cell"></div>
        <div class="col-dynamic divider-cell">
          <div class="pin-badge badge-merged group">
            <span class="pin-icon">${Icons.pin}</span>
            <span class="pin-label">我方 A & B: ${item.speed}</span>
            <div class="pin-tooltip">
              <div class="tooltip-header text-amber-300 font-bold border-b border-white/10 pb-1 mb-1">📌 我方雙打同速錨點</div>
              <div class="text-xs text-emerald-300 font-semibold mb-1">${item.tooltipA}</div>
              <div class="border-t border-white/5 my-1"></div>
              <div class="text-xs text-purple-300 font-semibold">${item.tooltipB}</div>
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
  const headerColor = isEmerald ? 'text-emerald-300' : 'text-purple-300';

  return `
    <div class="speed-pin-divider ${colorClass}" data-pin="${item.slotKey}">
      <div class="divider-line ${lineClass}"></div>
      <div class="col-base divider-cell"></div>
      <div class="col-sprites-container divider-cell"></div>
      <div class="col-dynamic divider-cell">
        <div class="pin-badge ${badgeClass} group">
          <span class="pin-icon">${Icons.pin}</span>
          <span class="pin-label">${item.label}: ${item.speed}</span>
          <div class="pin-tooltip">
            <div class="tooltip-header ${headerColor} font-bold border-b border-white/10 pb-1 mb-1">📌 ${item.label} 速度分水嶺</div>
            <div class="text-xs text-gray-200 whitespace-pre-line leading-relaxed">${item.tooltip}</div>
          </div>
        </div>
      </div>
      <div class="col-benchmarks-container divider-cell"></div>
    </div>
  `;
}
