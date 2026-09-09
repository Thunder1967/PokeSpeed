import { DEFAULT_SUBSTITUTE_SPRITE } from '../types/pokemon';

/**
 * Initializes global image error delegation in capture phase.
 * Replaces broken images with DEFAULT_SUBSTITUTE_SPRITE without requiring
 * inline `onerror="..."` handlers in HTML, enabling strict Content Security Policies.
 */
export function initImageFallback(root: EventTarget = window) {
  root.addEventListener(
    'error',
    (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLImageElement) {
        if (target.src !== DEFAULT_SUBSTITUTE_SPRITE) {
          target.src = DEFAULT_SUBSTITUTE_SPRITE;
        }
      }
    },
    true // Capture phase is required because image load errors do not bubble
  );
}
