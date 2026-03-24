import { $$ } from '../utils/dom';

export class ScrollAnimator {
  init(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = $$<HTMLElement>('[data-animate]');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Use RAF to batch class additions into a single frame
            requestAnimationFrame(() => {
              (entry.target as HTMLElement).classList.add('revealed');
            });
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }
}
