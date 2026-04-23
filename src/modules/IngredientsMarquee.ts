import { $ } from '../utils/dom';

export class IngredientsMarquee {
  init(): void {
    const track = $<HTMLElement>('#ingredients-track');
    if (!track) return;

    const originals = Array.from(track.children) as HTMLElement[];
    if (originals.length === 0) return;

    originals.forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }
}
