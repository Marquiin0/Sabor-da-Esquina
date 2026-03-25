import { $ } from '../utils/dom';
import { CartState } from '../data/CartState';

interface Coupon {
  code: string;
  type: 'percent' | 'freeShipping';
  value: number;
  label: string;
}

const COUPONS: Coupon[] = [
  { code: 'PRIMEIRA30', type: 'percent', value: 30, label: '30% de desconto' },
  { code: 'SABOR10', type: 'percent', value: 10, label: '10% de desconto' },
  { code: 'FRETEGRATIS', type: 'freeShipping', value: 0, label: 'Frete grátis' },
];

const SHIPPING: Record<string, number> = {
  padrao: 5.90,
  expressa: 12.90,
  retirada: 0,
};

const SHIPPING_TIMES: Record<string, string> = {
  padrao: '30-45 min',
  expressa: '15-25 min',
  retirada: '20-30 min',
};

export class PaymentPage {
  private currentStep = 1;
  private shippingCost = 5.90;
  private shippingMethod = 'padrao';
  private discount = 0;
  private appliedCoupon = '';
  private paymentMethod = '';
  private paymentConfirmed = false;
  private pixInterval: ReturnType<typeof setInterval> | null = null;

  init(): void {
    const items = CartState.getItems();
    if (items.length === 0) {
      const base = import.meta.env.BASE_URL;
      window.location.href = `${base}index.html#menu`;
      return;
    }

    this.renderSummary();
    this.bindSteps();
    this.bindShipping();
    this.bindCouponDrawer();
    this.bindPaymentMethods();
    this.bindMasks();
    this.bindBackButtons();
  }

  // ─── Summary ───

  private renderSummary(): void {
    const container = $('#summary-items');
    if (!container) return;

    const items = CartState.getItems();
    const base = import.meta.env.BASE_URL;
    const resolveImg = (src: string) => src.startsWith('/') ? base + src.slice(1) : src;

    container.innerHTML = items.map((item) => `
      <div class="pay__summary-item">
        <img src="${resolveImg(item.image)}" alt="${item.name}" width="48" height="48" />
        <div class="pay__summary-item-info">
          <span class="pay__summary-item-name">${item.name}</span>
          <span class="pay__summary-item-qty">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</span>
        </div>
        <span class="pay__summary-item-total">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('');

    this.updateTotals();
  }

  private updateTotals(): void {
    const subtotal = CartState.getTotal();
    const discountAmount = this.appliedCoupon
      ? COUPONS.find((c) => c.code === this.appliedCoupon)?.type === 'freeShipping'
        ? 0
        : subtotal * (this.discount / 100)
      : 0;

    const shipping = this.appliedCoupon === 'FRETEGRATIS' ? 0 : this.shippingCost;
    const total = subtotal - discountAmount + shipping;

    const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

    const sub = $('#summary-subtotal');
    if (sub) sub.textContent = fmt(subtotal);

    const ship = $('#summary-shipping');
    if (ship) ship.textContent = shipping === 0 ? 'Grátis' : fmt(shipping);

    const discRow = $('#summary-discount-row');
    const discEl = $('#summary-discount');
    if (discRow && discEl) {
      if (discountAmount > 0) {
        discRow.removeAttribute('hidden');
        discEl.textContent = `- ${fmt(discountAmount)}`;
      } else if (this.appliedCoupon === 'FRETEGRATIS') {
        discRow.removeAttribute('hidden');
        discEl.textContent = 'Frete grátis';
      } else {
        discRow.setAttribute('hidden', '');
      }
    }

    const totalEl = $('#summary-total');
    if (totalEl) totalEl.textContent = fmt(total);
  }

  // ─── Steps ───

  private bindSteps(): void {
    const forms = ['step-1', 'step-2', 'step-3'];

    forms.forEach((formId) => {
      const form = $<HTMLFormElement>(`#${formId}`);
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.validateForm(form)) return;

        if (formId === 'step-3') {
          this.finishOrder();
        } else {
          this.goToStep(this.currentStep + 1);
        }
      });
    });
  }

  private goToStep(step: number): void {
    document.querySelectorAll('.pay__form').forEach((f) => f.classList.add('pay__form--hidden'));
    $(`#step-${step}`)?.classList.remove('pay__form--hidden');

    document.querySelectorAll('.pay__step').forEach((s) => {
      const sStep = Number((s as HTMLElement).dataset.step);
      s.classList.toggle('pay__step--active', sStep <= step);
      s.classList.toggle('pay__step--completed', sStep < step);
    });

    document.querySelectorAll('.pay__step-line').forEach((line, i) => {
      line.classList.toggle('pay__step-line--active', i < step - 1);
    });

    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private bindBackButtons(): void {
    document.querySelectorAll<HTMLElement>('.pay__back-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const back = Number(btn.dataset.back);
        if (back) this.goToStep(back);
      });
    });
  }

  // ─── Shipping ───

  private bindShipping(): void {
    document.querySelectorAll<HTMLInputElement>('input[name="shipping"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        this.shippingMethod = radio.value;
        this.shippingCost = SHIPPING[radio.value] || 0;
        this.updateTotals();
      });
    });
  }

  // ─── Coupon Drawer ───

  private bindCouponDrawer(): void {
    const trigger = $('#coupon-trigger');
    const drawer = $('#coupon-drawer');
    const backdrop = $('#coupon-backdrop');
    const closeBtn = $('#coupon-close');
    const applyBtn = $('#coupon-apply');
    const addBtn = $('#coupon-add-btn');
    const codeInput = $<HTMLInputElement>('#coupon-code-input');
    const feedback = $('#coupon-drawer-feedback');

    const openDrawer = () => {
      drawer?.classList.add('coupon-drawer--open');
      backdrop?.classList.add('coupon-backdrop--visible');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer?.classList.remove('coupon-drawer--open');
      backdrop?.classList.remove('coupon-backdrop--visible');
      document.body.style.overflow = '';
    };

    trigger?.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    // Add code manually
    addBtn?.addEventListener('click', () => {
      if (!codeInput || !feedback) return;
      const code = codeInput.value.trim().toUpperCase();
      const coupon = COUPONS.find((c) => c.code === code);

      if (!code) {
        feedback.textContent = 'Digite um código';
        feedback.className = 'coupon-drawer__feedback coupon-drawer__feedback--error';
        return;
      }

      if (!coupon) {
        feedback.textContent = 'Cupom inválido';
        feedback.className = 'coupon-drawer__feedback coupon-drawer__feedback--error';
        return;
      }

      // Select the matching radio
      const radio = document.querySelector<HTMLInputElement>(`input[name="coupon-select"][value="${coupon.code}"]`);
      if (radio) radio.checked = true;
      feedback.textContent = `✓ Cupom "${coupon.code}" encontrado!`;
      feedback.className = 'coupon-drawer__feedback coupon-drawer__feedback--success';
    });

    // Apply selected coupon
    applyBtn?.addEventListener('click', () => {
      const selected = document.querySelector<HTMLInputElement>('input[name="coupon-select"]:checked');
      if (!selected) return;

      const code = selected.value;
      const coupon = COUPONS.find((c) => c.code === code);

      this.appliedCoupon = code;
      this.discount = coupon?.value || 0;

      const triggerSub = $('#coupon-trigger-sub');
      const triggerEl = $('#coupon-trigger');
      if (triggerSub) {
        if (coupon) {
          triggerSub.textContent = `✓ ${coupon.label} aplicado`;
          triggerEl?.classList.add('pay__coupon-trigger--applied');
        } else {
          triggerSub.textContent = 'Cupons disponíveis';
          triggerEl?.classList.remove('pay__coupon-trigger--applied');
        }
      }

      this.updateTotals();
      closeDrawer();
    });
  }

  // ─── Payment Methods ───

  private bindPaymentMethods(): void {
    const methodsContainer = $('#payment-methods');
    const confirmContainer = $('#method-confirm');
    const selectedInfo = $('#method-selected-info');

    document.querySelectorAll<HTMLElement>('.pay__method').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.paymentConfirmed) return;

        const method = btn.dataset.method;
        if (!method) return;

        this.paymentMethod = method;

        document.querySelectorAll('.pay__method').forEach((b) => b.classList.remove('pay__method--active'));
        btn.classList.add('pay__method--active');

        // Confirm: hide methods, show selected, show content
        this.paymentConfirmed = true;
        if (methodsContainer) methodsContainer.style.display = 'none';
        if (confirmContainer) confirmContainer.removeAttribute('hidden');

        const labels: Record<string, string> = { pix: '📱 Pix', credito: '💳 Cartão de Crédito', debito: '💳 Cartão de Débito' };
        if (selectedInfo) {
          selectedInfo.innerHTML = `
            <span>${labels[method] || method}</span>
            <button type="button" class="pay__method-change" id="change-method">Alterar</button>
          `;

          // Bind change button
          $('#change-method')?.addEventListener('click', () => {
            this.paymentConfirmed = false;
            this.paymentMethod = '';
            if (methodsContainer) methodsContainer.style.display = '';
            if (confirmContainer) confirmContainer.setAttribute('hidden', '');
            document.querySelectorAll('.pay__method').forEach((b) => b.classList.remove('pay__method--active'));
            document.querySelectorAll('.pay__method-content').forEach((c) => c.classList.add('pay__method-content--hidden'));
            if (this.pixInterval) {
              clearInterval(this.pixInterval);
              this.pixInterval = null;
            }
          });
        }

        // Show content
        document.querySelectorAll('.pay__method-content').forEach((c) => c.classList.add('pay__method-content--hidden'));
        $(`#method-${method}`)?.classList.remove('pay__method-content--hidden');

        // Start pix timer only when pix is confirmed
        if (method === 'pix') this.startPixTimer();
      });
    });
  }

  // ─── Pix Timer ───

  private startPixTimer(): void {
    let seconds = 15 * 60;
    const timerEl = $('#pix-timer');
    if (!timerEl) return;

    this.pixInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        if (this.pixInterval) clearInterval(this.pixInterval);
        timerEl.textContent = '00:00';
        return;
      }
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Copy pix code
    $('#copy-pix')?.addEventListener('click', () => {
      const input = $<HTMLInputElement>('.pay__pix-input');
      if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
          const btn = $('#copy-pix');
          if (btn) {
            btn.textContent = '✓ Copiado!';
            setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
          }
        });
      }
    });
  }

  // ─── Masks ───

  private bindMasks(): void {
    // Phone
    $<HTMLInputElement>('#pay-phone')?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      let digits = input.value.replace(/\D/g, '');
      if (digits.length > 11) digits = digits.slice(0, 11);
      if (digits.length <= 2) input.value = digits.length ? `(${digits}` : '';
      else if (digits.length <= 7) input.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      else input.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    });

    // CPF
    $<HTMLInputElement>('#pay-cpf')?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      let digits = input.value.replace(/\D/g, '');
      if (digits.length > 11) digits = digits.slice(0, 11);
      if (digits.length <= 3) input.value = digits;
      else if (digits.length <= 6) input.value = `${digits.slice(0, 3)}.${digits.slice(3)}`;
      else if (digits.length <= 9) input.value = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      else input.value = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    });

    // CEP + auto-fill via ViaCEP
    const cepInput = $<HTMLInputElement>('#pay-cep');
    cepInput?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      let digits = input.value.replace(/\D/g, '');
      if (digits.length > 8) digits = digits.slice(0, 8);
      input.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;

      if (digits.length === 8) this.fetchCep(digits);
    });

    // Card numbers
    const maskCard = (id: string) => {
      $<HTMLInputElement>(`#${id}`)?.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        let digits = input.value.replace(/\D/g, '');
        if (digits.length > 16) digits = digits.slice(0, 16);
        input.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
    };
    maskCard('card-number');
    maskCard('debit-number');

    // Expiry
    const maskExpiry = (id: string) => {
      $<HTMLInputElement>(`#${id}`)?.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        let digits = input.value.replace(/\D/g, '');
        if (digits.length > 4) digits = digits.slice(0, 4);
        input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      });
    };
    maskExpiry('card-expiry');
    maskExpiry('debit-expiry');
  }

  // ─── CEP Auto-fill ───

  private async fetchCep(cep: string): Promise<void> {
    const street = $<HTMLInputElement>('#pay-street');
    const neighborhood = $<HTMLInputElement>('#pay-neighborhood');
    const city = $<HTMLInputElement>('#pay-city');
    const state = $<HTMLInputElement>('#pay-state');
    const cepInput = $<HTMLInputElement>('#pay-cep');
    const feedback = cepInput?.closest('.form__group')?.querySelector('.form__feedback');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        if (feedback) feedback.textContent = 'CEP não encontrado';
        cepInput?.classList.add('form__input--error');
        return;
      }

      if (feedback) feedback.textContent = '';
      cepInput?.classList.remove('form__input--error');
      cepInput?.classList.add('form__input--valid');

      if (street && data.logradouro) street.value = data.logradouro;
      if (neighborhood && data.bairro) neighborhood.value = data.bairro;
      if (city && data.localidade) city.value = data.localidade;
      if (state && data.uf) state.value = data.uf;

      // Trigger label float on filled fields
      [street, neighborhood, city, state].forEach((input) => {
        if (input && input.value) {
          input.classList.add('form__input--valid');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Focus on number field
      $<HTMLInputElement>('#pay-number')?.focus();
    } catch {
      if (feedback) feedback.textContent = 'Erro ao buscar CEP';
    }
  }

  // ─── Validation ───

  private validateForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll<HTMLInputElement>('.form__input');
    let valid = true;

    inputs.forEach((input) => {
      // Skip hidden method inputs
      const content = input.closest('.pay__method-content');
      if (content && content.classList.contains('pay__method-content--hidden')) return;

      if (!input.required) return;
      const value = input.value.trim();
      let error = '';

      if (!value) error = 'Campo obrigatório';
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'E-mail inválido';
      else if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) error = 'Telefone inválido';
      else if (input.id === 'pay-cpf' && value.replace(/\D/g, '').length < 11) error = 'CPF inválido';
      else if (input.id === 'pay-cep' && value.replace(/\D/g, '').length < 8) error = 'CEP inválido';

      const feedback = input.closest('.form__group')?.querySelector('.form__feedback');
      if (error) {
        input.classList.add('form__input--error');
        input.classList.remove('form__input--valid');
        if (feedback) feedback.textContent = error;
        valid = false;
      } else {
        input.classList.remove('form__input--error');
        input.classList.add('form__input--valid');
        if (feedback) feedback.textContent = '';
      }
    });

    return valid;
  }

  // ─── Finish Order ───

  private finishOrder(): void {
    const btn = $<HTMLButtonElement>('#finish-order');
    if (btn) {
      btn.classList.add('pay__finish--loading');
      btn.disabled = true;
    }

    const subtotal = CartState.getTotal();
    const coupon = COUPONS.find((c) => c.code === this.appliedCoupon);
    const discountAmount = coupon?.type === 'percent' ? subtotal * (coupon.value / 100) : 0;
    const shipping = this.appliedCoupon === 'FRETEGRATIS' ? 0 : this.shippingCost;
    const total = subtotal - discountAmount + shipping;

    const orderNumber = `SE-${String(Math.floor(100000 + Math.random() * 900000))}`;

    CartState.saveOrder({
      items: CartState.getItems(),
      subtotal,
      shipping,
      discount: discountAmount,
      total,
      coupon: this.appliedCoupon,
      paymentMethod: this.paymentMethod,
      customer: {
        name: ($<HTMLInputElement>('#pay-name')?.value || ''),
        email: ($<HTMLInputElement>('#pay-email')?.value || ''),
        phone: ($<HTMLInputElement>('#pay-phone')?.value || ''),
        cpf: ($<HTMLInputElement>('#pay-cpf')?.value || ''),
      },
      address: {
        cep: ($<HTMLInputElement>('#pay-cep')?.value || ''),
        street: ($<HTMLInputElement>('#pay-street')?.value || ''),
        number: ($<HTMLInputElement>('#pay-number')?.value || ''),
        complement: ($<HTMLInputElement>('#pay-complement')?.value || ''),
        neighborhood: ($<HTMLInputElement>('#pay-neighborhood')?.value || ''),
        city: ($<HTMLInputElement>('#pay-city')?.value || ''),
        state: ($<HTMLInputElement>('#pay-state')?.value || ''),
      },
      shippingMethod: this.shippingMethod,
      orderNumber,
      estimatedTime: SHIPPING_TIMES[this.shippingMethod] || '30-45 min',
    });

    setTimeout(() => {
      CartState.clear();
      const base = import.meta.env.BASE_URL;
      window.location.href = `${base}confirmation.html`;
    }, 2000);
  }
}
