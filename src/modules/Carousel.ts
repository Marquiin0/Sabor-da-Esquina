import { $, $$, createElement } from '../utils/dom';

export class Carousel {
  private track: HTMLElement | null = null;
  private slides: HTMLElement[] = [];
  private dotsContainer: HTMLElement | null = null;
  private currentIndex = 0;
  private autoplayId: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchEndX = 0;

  init(): void {
    this.track = $('#testimonials-track');
    this.dotsContainer = $('#testimonials-dots');

    if (!this.track || !this.dotsContainer) return;

    this.slides = $$('.testimonials__slide', this.track);
    if (this.slides.length === 0) return;

    this.createDots();
    this.bindArrows();
    this.bindTouch();
    this.bindHover();
    this.startAutoplay();

    // Recalculate dots on resize (visible count changes)
    window.addEventListener('resize', () => this.onResize());
  }

  private get visibleCount(): number {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  private get maxIndex(): number {
    return Math.max(0, this.slides.length - this.visibleCount);
  }

  private createDots(): void {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    const totalDots = this.maxIndex + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = createElement('button', {
        className: `testimonials__dot${i === 0 ? ' testimonials__dot--active' : ''}`,
        'aria-label': `Ir para depoimento ${i + 1}`,
      });
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  private bindArrows(): void {
    const prevBtn = $('.testimonials__arrow--prev');
    const nextBtn = $('.testimonials__arrow--next');

    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());
  }

  private bindTouch(): void {
    if (!this.track) return;

    this.track.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }

  private bindHover(): void {
    const carousel = $('.testimonials__carousel');
    carousel?.addEventListener('mouseenter', () => this.stopAutoplay());
    carousel?.addEventListener('mouseleave', () => this.startAutoplay());
    carousel?.addEventListener('focusin', () => this.stopAutoplay());
    carousel?.addEventListener('focusout', () => this.startAutoplay());
  }

  private prev(): void {
    const index = this.currentIndex === 0 ? this.maxIndex : this.currentIndex - 1;
    this.goTo(index);
  }

  private next(): void {
    const index = this.currentIndex >= this.maxIndex ? 0 : this.currentIndex + 1;
    this.goTo(index);
  }

  private goTo(index: number): void {
    this.currentIndex = Math.min(index, this.maxIndex);
    const slideWidth = 100 / this.visibleCount;

    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}%)`;
    }

    // Update dots
    const dots = $$('.testimonials__dot', this.dotsContainer!);
    dots.forEach((dot, i) => {
      dot.classList.toggle('testimonials__dot--active', i === this.currentIndex);
    });
  }

  private onResize(): void {
    this.createDots();
    if (this.currentIndex > this.maxIndex) {
      this.goTo(this.maxIndex);
    } else {
      this.goTo(this.currentIndex);
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayId = setInterval(() => this.next(), 4000);
  }

  private stopAutoplay(): void {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  destroy(): void {
    this.stopAutoplay();
  }
}
