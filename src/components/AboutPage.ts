import { aboutInfo, InfoBlock } from '../data/aboutInfo';
import { getLocale, t, subscribeLocale } from '../i18n';
import { escapeHtml, sanitizeUrl } from '../utils/security';

/**
 * Parses markdown-style links [text](url) and bold **text** securely.
 */
export function parseMarkdownContent(raw: string): string {
  if (!raw) return '';

  // 1. First split by lines or handle paragraphs
  const lines = raw.split('\n');

  return lines.map(line => {
    if (!line.trim()) {
      return '<div class="h-2"></div>';
    }

    // Escape HTML first to prevent XSS
    let escaped = escapeHtml(line);

    // Replace **bold** with <strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

    // Replace [label](url) with secure external anchor
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      const safeUrl = sanitizeUrl(url, '#');
      const isExternal = safeUrl.startsWith('http://') || safeUrl.startsWith('https://');
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const extIcon = isExternal ? ' ↗' : '';
      return `<a href="${safeUrl}"${targetAttr} class="text-blue-400 hover:text-blue-300 underline font-medium underline-offset-2 transition-colors">${text}${extIcon}</a>`;
    });

    return `<p class="leading-relaxed text-sm text-gray-300">${escaped}</p>`;
  }).join('');
}

function renderBlockCard(block: InfoBlock): string {
  const safeTitle = block.title ? escapeHtml(block.title) : '';
  const safeTag = block.tag ? escapeHtml(block.tag) : '';
  const safeDate = block.date ? escapeHtml(block.date) : '';
  const blockIdAttr = block.id ? ` id="info-block-${escapeHtml(block.id)}"` : '';
  const parsedBody = parseMarkdownContent(block.content);

  return `
    <article${blockIdAttr} class="bg-surface rounded-xl border border-white/10 p-5 sm:p-6 shadow-xl backdrop-blur-sm flex flex-col gap-3 transition-all hover:border-white/20 hover:shadow-2xl">
      <div class="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          ${safeTitle}
        </h3>
        <div class="flex items-center gap-2">
          ${safeTag ? `<span class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/15 text-blue-300 border border-blue-500/25">${safeTag}</span>` : ''}
          ${safeDate ? `<span class="text-xs text-gray-500 font-mono">${safeDate}</span>` : ''}
        </div>
      </div>
      <div class="space-y-2 mt-1">
        ${parsedBody}
      </div>
    </article>
  `;
}

export function renderAboutPage(container: HTMLElement): () => void {
  const render = () => {
    const locale = getLocale();
    const dict = t(locale);
    const blocks: InfoBlock[] = aboutInfo[locale] || aboutInfo['zh-TW'];

    container.innerHTML = `
      <section class="w-full max-w-4xl mx-auto flex flex-col gap-6 py-2 px-1 animate-fadeIn">
        <!-- Navigation & Header Bar -->
        <div class="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-white/10">
          <button id="btn-back-to-table" class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer group">
            <svg class="w-4 h-4 text-gray-400 group-hover:-translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>${dict.common.backToTable}</span>
          </button>

          <div class="flex items-center gap-2 text-right">
            <div class="flex flex-col items-end">
              <h2 class="text-lg sm:text-xl font-bold text-white tracking-wide">
                ${dict.common.aboutTitle}
              </h2>
              <span class="text-xs text-gray-400 font-medium">
                ${dict.common.aboutSubtitle}
              </span>
            </div>
          </div>
        </div>

        <!-- Bulletin Board Stack: | [ text ] | -->
        <div id="about-blocks-container" class="flex flex-col gap-4">
          ${blocks.map(renderBlockCard).join('')}
        </div>
      </section>
    `;

    const backBtn = container.querySelector('#btn-back-to-table');
    backBtn?.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  };

  render();

  // Listen to locale changes for real-time translation
  const unsubscribeLocale = subscribeLocale(() => {
    render();
  });

  return () => {
    unsubscribeLocale();
  };
}
