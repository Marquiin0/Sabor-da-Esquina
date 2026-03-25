import { $$ } from '../utils/dom';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export class Counter {
  private duration = 2500;

  init(): void {
    const elements = $$<HTMLElement>('[data-counter]');
    if (elements.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => {
        el.textContent = el.dataset.counter || '0';
      });
      return;
    }

    // Set initial display to the target value (invisible via opacity from data-animate)
    // so the layout is stable before animation starts
    elements.forEach((el) => {
      const target = el.dataset.counter || '0';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      // Reserve space with the final value but show "0"
      el.style.minWidth = `${target.length}ch`;
      el.textContent = decimals > 0 ? '0,0' : '0';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animate(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  private animate(el: HTMLElement): void {
    const target = parseFloat(el.dataset.counter || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.duration, 1);
      const current = easeOutExpo(progress) * target;

      el.textContent = decimals > 0
        ? current.toFixed(decimals).replace('.', ',')
        : Math.floor(current).toString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure exact final value
        el.textContent = decimals > 0
          ? target.toFixed(decimals).replace('.', ',')
          : target.toString();
      }
    };

    requestAnimationFrame(step);
  }
}
