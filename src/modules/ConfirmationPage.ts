import { $ } from '../utils/dom';
import { CartState } from '../data/CartState';

export class ConfirmationPage {
  init(): void {
    const order = CartState.getOrder();
    if (!order) {
      const base = import.meta.env.BASE_URL;
      window.location.href = `${base}index.html`;
      return;
    }

    this.renderOrder(order);
    this.bindTracking();
    this.launchConfetti();
  }

  private renderOrder(order: ReturnType<typeof CartState.getOrder>): void {
    if (!order) return;

    const el = (id: string) => document.getElementById(id);

    const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

    // Order number
    const numEl = el('order-number');
    if (numEl) numEl.textContent = `#${order.orderNumber}`;

    // Time
    const timeEl = el('order-time');
    if (timeEl) timeEl.textContent = order.estimatedTime;

    // Payment
    const payEl = el('order-payment');
    if (payEl) {
      const labels: Record<string, string> = { pix: 'Pix', credito: 'Cartão de Crédito', debito: 'Cartão de Débito' };
      payEl.textContent = labels[order.paymentMethod] || order.paymentMethod;
    }

    // Total
    const totalEl = el('order-total');
    if (totalEl) totalEl.textContent = fmt(order.total);

    // Items
    const itemsEl = el('order-items');
    if (itemsEl && order.items.length > 0) {
      itemsEl.innerHTML = `
        <h3 class="confirm__section-title">Itens do pedido</h3>
        ${order.items.map((item) => `
          <div class="confirm__item">
            <span class="confirm__item-qty">${item.quantity}x</span>
            <span class="confirm__item-name">${item.name}</span>
            <span class="confirm__item-price">${fmt(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        ${order.discount > 0 ? `<div class="confirm__item confirm__item--discount"><span>Desconto</span><span>- ${fmt(order.discount)}</span></div>` : ''}
        ${order.shipping > 0 ? `<div class="confirm__item"><span>Frete</span><span>${fmt(order.shipping)}</span></div>` : ''}
      `;
    }

    // Address
    const addrEl = el('order-address');
    if (addrEl && order.address.street) {
      addrEl.innerHTML = `
        <h3 class="confirm__section-title">Endereço de entrega</h3>
        <p class="confirm__address-text">
          ${order.address.street}, ${order.address.number}${order.address.complement ? ` - ${order.address.complement}` : ''}<br>
          ${order.address.neighborhood} - ${order.address.city}/${order.address.state}<br>
          CEP: ${order.address.cep}
        </p>
      `;
    }
  }

  private bindTracking(): void {
    $('#track-order')?.addEventListener('click', () => {
      const base = import.meta.env.BASE_URL;
      window.location.href = `${base}tracking.html`;
    });
  }

  // ─── Confetti ───

  private launchConfetti(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = $<HTMLCanvasElement>('#confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF6B35', '#F5C518', '#E55A2B', '#FF8F66', '#FFE066', '#FFFFFF', '#4CAF50'];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; color: string; rotation: number;
      rotSpeed: number; gravity: number; opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.1 + Math.random() * 0.1,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 240; // ~4 seconds at 60fps

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vx *= 0.99;

        if (frame > maxFrames * 0.7) {
          p.opacity -= 0.02;
        }

        if (p.opacity <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
      }
    };

    requestAnimationFrame(animate);
  }
}
