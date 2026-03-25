import { $ } from '../utils/dom';
import { CartState } from '../data/CartState';

export class TrackingPage {
  init(): void {
    const order = CartState.getOrder();
    if (!order) {
      // Show a generic tracking state
      this.showGenericState();
      return;
    }

    this.renderOrder(order);
    this.simulateProgress();
  }

  private showGenericState(): void {
    const numEl = document.getElementById('track-number');
    if (numEl) numEl.textContent = '#SE-' + String(Math.floor(100000 + Math.random() * 900000));
  }

  private renderOrder(order: NonNullable<ReturnType<typeof CartState.getOrder>>): void {
    const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

    const el = (id: string) => document.getElementById(id);

    const numEl = el('track-number');
    if (numEl) numEl.textContent = `#${order.orderNumber}`;

    const etaEl = el('track-eta');
    if (etaEl) etaEl.textContent = order.estimatedTime;

    const totalEl = el('track-total');
    if (totalEl) totalEl.textContent = fmt(order.total);

    // Items
    const itemsEl = el('track-items');
    if (itemsEl) {
      itemsEl.innerHTML = order.items.map((item) => `
        <div class="tracking__summary-item">
          <span class="tracking__summary-item-qty">${item.quantity}x</span>
          <span class="tracking__summary-item-name">${item.name}</span>
          <span class="tracking__summary-item-price">${fmt(item.price * item.quantity)}</span>
        </div>
      `).join('');
    }

    // Payment
    const payEl = el('track-payment');
    if (payEl) {
      const labels: Record<string, string> = { pix: '📱 Pix', credito: '💳 Crédito', debito: '💳 Débito' };
      payEl.innerHTML = `
        <div class="tracking__info-row">
          <span class="tracking__info-label">Pagamento</span>
          <span class="tracking__info-value">${labels[order.paymentMethod] || order.paymentMethod}</span>
        </div>
      `;
    }

    // Address
    const addrEl = el('track-address');
    if (addrEl && order.address.street) {
      addrEl.innerHTML = `
        <div class="tracking__info-row">
          <span class="tracking__info-label">Entrega</span>
          <span class="tracking__info-value">${order.address.street}, ${order.address.number} - ${order.address.neighborhood}</span>
        </div>
      `;
    }

    // Time for step 1
    const step1Time = el('step1-time');
    if (step1Time) {
      const now = new Date();
      step1Time.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  private simulateProgress(): void {
    const bar = $<HTMLElement>('#track-progress-bar');
    if (!bar) return;

    // Animate progress bar to 35% (preparing state)
    setTimeout(() => {
      bar.style.width = '35%';
    }, 500);
  }
}
