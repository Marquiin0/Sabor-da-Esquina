import { $$ } from '../utils/dom';

export class ScrollAnimator {
  private observer: IntersectionObserver | null = null;

  init(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              (entry.target as HTMLElement).classList.add('revealed');
            });
            this.observer!.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    // Observe existing elements
    $$<HTMLElement>('[data-animate]').forEach((el) => this.observer!.observe(el));

    // Watch for dynamically added [data-animate] elements
    const mutation = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.hasAttribute('data-animate') && !node.classList.contains('revealed')) {
            this.observer!.observe(node);
          }
          node.querySelectorAll<HTMLElement>('[data-animate]:not(.revealed)').forEach((el) => {
            this.observer!.observe(el);
          });
        }
      }
    });

    mutation.observe(document.body, { childList: true, subtree: true });
  }
}
