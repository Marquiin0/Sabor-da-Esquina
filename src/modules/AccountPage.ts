import { $ } from '../utils/dom';
import { UserState } from '../data/UserState';
import { CartState } from '../data/CartState';
import type { Address } from '../data/UserState';

export class AccountPage {
  private content: HTMLElement | null = null;

  init(): void {
    if (!UserState.isLoggedIn()) {
      const base = import.meta.env.BASE_URL;
      window.location.href = `${base}login.html`;
      return;
    }

    this.content = $('#acc-content');
    const user = UserState.get()!;

    // Greeting
    const greeting = $('#acc-greeting');
    if (greeting) greeting.textContent = `Olá, ${UserState.getFirstName()}!`;

    // Sidebar user
    const sidebarUser = $('#acc-sidebar-user');
    if (sidebarUser) {
      sidebarUser.innerHTML = `
        <div class="acc__sidebar-avatar">${UserState.getInitials()}</div>
        <div class="acc__sidebar-info">
          <span class="acc__sidebar-name">${user.name}</span>
          <span class="acc__sidebar-email">${user.email}</span>
        </div>
      `;
    }

    // Tab navigation
    this.bindTabs();

    // Check URL hash
    const hash = window.location.hash.slice(1);
    if (hash && ['dashboard', 'orders', 'coupons', 'addresses', 'profile'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('dashboard');
    }
  }

  private bindTabs(): void {
    document.querySelectorAll<HTMLElement>('.acc__nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab) return;

        if (tab === 'logout') {
          UserState.logout();
          const base = import.meta.env.BASE_URL;
          window.location.href = `${base}index.html`;
          return;
        }

        this.switchTab(tab);
      });
    });
  }

  private switchTab(tab: string): void {
    window.location.hash = tab;

    // Update active nav
    document.querySelectorAll('.acc__nav-item').forEach((btn) => {
      btn.classList.toggle('acc__nav-item--active', (btn as HTMLElement).dataset.tab === tab);
    });

    // Render content
    if (!this.content) return;
    switch (tab) {
      case 'dashboard': this.renderDashboard(); break;
      case 'orders': this.renderOrders(); break;
      case 'coupons': this.renderCoupons(); break;
      case 'addresses': this.renderAddresses(); break;
      case 'profile': this.renderProfile(); break;
    }
  }

  // ─── Dashboard ───

  private renderDashboard(): void {
    const user = UserState.get()!;
    const orders = CartState.getOrderHistory().slice(0, 3);
    const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

    this.content!.innerHTML = `
      <div class="acc__section acc__section--animate">
        <div class="acc__welcome">
          <h1 class="acc__welcome-title">Olá, ${UserState.getFirstName()}!</h1>
          <p class="acc__welcome-text">Bem-vindo(a) à sua área do cliente. Aqui você pode gerenciar seus pedidos, endereços e dados pessoais.</p>
        </div>

        <div class="acc__quick-cards">
          <button class="acc__quick-card" data-tab="orders">
            <div class="acc__quick-icon acc__quick-icon--orders">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <span class="acc__quick-label">Meus Pedidos</span>
              <span class="acc__quick-action">Ver histórico</span>
            </div>
          </button>
          <button class="acc__quick-card" data-tab="addresses">
            <div class="acc__quick-icon acc__quick-icon--addresses">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <span class="acc__quick-label">Endereços</span>
              <span class="acc__quick-action">Gerenciar</span>
            </div>
          </button>
          <button class="acc__quick-card" data-tab="profile">
            <div class="acc__quick-icon acc__quick-icon--profile">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <span class="acc__quick-label">Meus Dados</span>
              <span class="acc__quick-action">Editar perfil</span>
            </div>
          </button>
        </div>

        ${orders.length > 0 ? `
          <div class="acc__card">
            <div class="acc__card-header">
              <h2 class="acc__card-title">Pedidos Recentes</h2>
              <button class="acc__card-link" data-tab="orders">Ver todos</button>
            </div>
            ${orders.map((o) => `
              <div class="acc__order-row">
                <div>
                  <span class="acc__order-number">Pedido #${o.orderNumber}</span>
                  <span class="acc__order-date">${o.date ? new Date(o.date).toLocaleDateString('pt-BR') : ''}</span>
                  <span class="acc__order-items">${o.items.length} item(ns)</span>
                </div>
                <div class="acc__order-right">
                  <span class="acc__order-badge">Confirmado</span>
                  <span class="acc__order-total">${fmt(o.total)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="acc__card">
          <div class="acc__card-header">
            <h2 class="acc__card-title">Informações da Conta</h2>
          </div>
          <div class="acc__info-grid">
            <div class="acc__info-item">
              <span class="acc__info-label">Nome</span>
              <span class="acc__info-value">${user.name}</span>
            </div>
            <div class="acc__info-item">
              <span class="acc__info-label">E-mail</span>
              <span class="acc__info-value">${user.email}</span>
            </div>
            <div class="acc__info-item">
              <span class="acc__info-label">Telefone</span>
              <span class="acc__info-value">${user.phone || 'Não informado'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Quick card clicks
    this.content!.querySelectorAll<HTMLElement>('[data-tab]').forEach((el) => {
      el.addEventListener('click', () => {
        const tab = el.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  }

  // ─── Orders ───

  private renderOrders(): void {
    const orders = CartState.getOrderHistory();
    const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
    const base = import.meta.env.BASE_URL;
    const resolveImg = (src: string) => src.startsWith('/') ? base + src.slice(1) : src;

    this.content!.innerHTML = `
      <div class="acc__section acc__section--animate">
        <h1 class="acc__page-title">Meus Pedidos</h1>
        ${orders.length === 0 ? `
          <div class="acc__empty">
            <span class="acc__empty-icon">📦</span>
            <h3 class="acc__empty-title">Nenhum pedido ainda</h3>
            <p class="acc__empty-text">Seus pedidos aparecerão aqui. Que tal fazer o primeiro?</p>
            <a href="${base}index.html#menu" class="btn btn--primary btn--lg">Ver Cardápio</a>
          </div>
        ` : orders.map((o) => `
          <div class="acc__card acc__order-card">
            <div class="acc__order-header">
              <div class="acc__order-meta">
                <div><span class="acc__order-meta-label">PEDIDO</span><span class="acc__order-meta-value">#${o.orderNumber}</span></div>
                <div><span class="acc__order-meta-label">DATA</span><span class="acc__order-meta-value">${o.date ? new Date(o.date).toLocaleDateString('pt-BR') : ''}</span></div>
                <div><span class="acc__order-meta-label">TOTAL</span><span class="acc__order-meta-value">${fmt(o.total)}</span></div>
              </div>
              <span class="acc__order-badge">Confirmado</span>
            </div>
            <div class="acc__order-items-list">
              ${o.items.map((item) => `
                <div class="acc__order-item">
                  <img src="${resolveImg(item.image)}" alt="${item.name}" width="48" height="48" />
                  <div>
                    <span class="acc__order-item-name">${item.name}</span>
                    <span class="acc__order-item-qty">Qtd: ${item.quantity}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="acc__order-actions">
              <a href="${base}tracking.html" class="acc__order-action">📍 Rastrear pedido</a>
              <span class="acc__order-action acc__order-action--details" data-order="${o.orderNumber}">Ver detalhes</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─── Coupons ───

  private renderCoupons(): void {
    const coupons = [
      { code: 'PRIMEIRA30', name: '30% de desconto', desc: 'Válido para primeira compra', icon: '🔥', expiry: '31/12/2026' },
      { code: 'SABOR10', name: '10% de desconto', desc: 'Válido para todos os pedidos', icon: '💰', expiry: '31/12/2026' },
      { code: 'FRETEGRATIS', name: 'Frete grátis', desc: 'Entrega sem custo adicional', icon: '🚀', expiry: '31/12/2026' },
    ];

    this.content!.innerHTML = `
      <div class="acc__section acc__section--animate">
        <h1 class="acc__page-title">Meus Cupons</h1>
        <p class="acc__page-subtitle">Cupons disponíveis para usar nas suas compras</p>
        <div class="acc__coupons-grid">
          ${coupons.map((c) => `
            <div class="acc__coupon-card">
              <div class="acc__coupon-left">
                <span class="acc__coupon-icon">${c.icon}</span>
              </div>
              <div class="acc__coupon-info">
                <span class="acc__coupon-name">${c.name}</span>
                <span class="acc__coupon-desc">${c.desc}</span>
                <div class="acc__coupon-footer">
                  <span class="acc__coupon-code">${c.code}</span>
                  <span class="acc__coupon-expiry">Válido até ${c.expiry}</span>
                </div>
              </div>
              <button class="acc__coupon-copy" data-code="${c.code}">Copiar</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.content!.querySelectorAll<HTMLElement>('.acc__coupon-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code || '';
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = '✓ Copiado!';
          setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
        });
      });
    });
  }

  // ─── Addresses ───

  private renderAddresses(): void {
    const addrs = UserState.getAddresses();

    this.content!.innerHTML = `
      <div class="acc__section acc__section--animate">
        <div class="acc__page-header">
          <h1 class="acc__page-title">Meus Endereços</h1>
          <button class="btn btn--primary btn--sm" id="add-address-btn">+ Novo Endereço</button>
        </div>
        <div id="address-form-area"></div>
        <div id="address-list">
          ${addrs.length === 0 ? `
            <div class="acc__empty">
              <span class="acc__empty-icon">📍</span>
              <h3 class="acc__empty-title">Nenhum endereço salvo</h3>
              <p class="acc__empty-text">Adicione um endereço para facilitar suas entregas.</p>
            </div>
          ` : addrs.map((a) => `
            <div class="acc__card acc__address-card ${a.isDefault ? 'acc__address-card--default' : ''}">
              <div class="acc__address-header">
                <span class="acc__address-label">${a.label}</span>
                ${a.isDefault ? '<span class="acc__address-badge">Principal</span>' : ''}
              </div>
              <p class="acc__address-text">${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}<br>${a.neighborhood} - ${a.city}/${a.state}<br>CEP: ${a.cep}</p>
              <div class="acc__address-actions">
                ${!a.isDefault ? `<button class="acc__address-action" data-default="${a.id}">Definir como principal</button>` : ''}
                <button class="acc__address-action acc__address-action--delete" data-remove="${a.id}">Excluir</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add address button
    $('#add-address-btn')?.addEventListener('click', () => this.showAddressForm());

    // Actions
    this.content!.querySelectorAll<HTMLElement>('[data-default]').forEach((btn) => {
      btn.addEventListener('click', () => {
        UserState.setDefaultAddress(btn.dataset.default!);
        this.renderAddresses();
        this.showToast('Endereço principal atualizado');
      });
    });

    this.content!.querySelectorAll<HTMLElement>('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        UserState.removeAddress(btn.dataset.remove!);
        this.renderAddresses();
        this.showToast('Endereço removido');
      });
    });
  }

  private showAddressForm(): void {
    const area = $('#address-form-area');
    if (!area) return;

    area.innerHTML = `
      <div class="acc__card acc__address-form">
        <h3 class="acc__card-title">Novo Endereço</h3>
        <form id="new-address-form" class="acc__form" novalidate>
          <div class="acc__form-row">
            <div class="acc__form-group acc__form-group--sm">
              <label>Apelido</label>
              <input type="text" id="addr-label" placeholder="Ex: Casa, Trabalho" required />
            </div>
            <div class="acc__form-group acc__form-group--sm">
              <label>CEP</label>
              <input type="text" id="addr-cep" placeholder="00000-000" required maxlength="9" />
            </div>
          </div>
          <div class="acc__form-group">
            <label>Rua</label>
            <input type="text" id="addr-street" placeholder="Rua, Avenida..." required />
          </div>
          <div class="acc__form-row">
            <div class="acc__form-group acc__form-group--sm">
              <label>Número</label>
              <input type="text" id="addr-number" required />
            </div>
            <div class="acc__form-group">
              <label>Complemento</label>
              <input type="text" id="addr-complement" placeholder="Apto, Bloco..." />
            </div>
          </div>
          <div class="acc__form-group">
            <label>Bairro</label>
            <input type="text" id="addr-neighborhood" required />
          </div>
          <div class="acc__form-row">
            <div class="acc__form-group">
              <label>Cidade</label>
              <input type="text" id="addr-city" required />
            </div>
            <div class="acc__form-group acc__form-group--sm">
              <label>UF</label>
              <input type="text" id="addr-state" maxlength="2" required />
            </div>
          </div>
          <div class="acc__form-actions">
            <button type="button" class="btn btn--outline btn--sm" id="cancel-address">Cancelar</button>
            <button type="submit" class="btn btn--primary btn--sm">Salvar Endereço</button>
          </div>
        </form>
      </div>
    `;

    // CEP auto-fill
    const cepInput = $<HTMLInputElement>('#addr-cep');
    cepInput?.addEventListener('input', () => {
      let digits = cepInput.value.replace(/\D/g, '');
      if (digits.length > 8) digits = digits.slice(0, 8);
      cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;

      if (digits.length === 8) {
        fetch(`https://viacep.com.br/ws/${digits}/json/`)
          .then((r) => r.json())
          .then((data) => {
            if (data.erro) return;
            const set = (id: string, val: string) => { const el = $<HTMLInputElement>(`#${id}`); if (el && val) el.value = val; };
            set('addr-street', data.logradouro);
            set('addr-neighborhood', data.bairro);
            set('addr-city', data.localidade);
            set('addr-state', data.uf);
            $<HTMLInputElement>('#addr-number')?.focus();
          })
          .catch(() => {});
      }
    });

    // Cancel
    $('#cancel-address')?.addEventListener('click', () => { area.innerHTML = ''; });

    // Submit
    $<HTMLFormElement>('#new-address-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const addr: Address = {
        id: Date.now().toString(),
        label: $<HTMLInputElement>('#addr-label')?.value || 'Casa',
        cep: $<HTMLInputElement>('#addr-cep')?.value || '',
        street: $<HTMLInputElement>('#addr-street')?.value || '',
        number: $<HTMLInputElement>('#addr-number')?.value || '',
        complement: $<HTMLInputElement>('#addr-complement')?.value || '',
        neighborhood: $<HTMLInputElement>('#addr-neighborhood')?.value || '',
        city: $<HTMLInputElement>('#addr-city')?.value || '',
        state: $<HTMLInputElement>('#addr-state')?.value || '',
        isDefault: UserState.getAddresses().length === 0,
      };
      UserState.saveAddress(addr);
      this.renderAddresses();
      this.showToast('Endereço salvo com sucesso!');
    });
  }

  // ─── Profile ───

  private renderProfile(): void {
    const user = UserState.get()!;

    this.content!.innerHTML = `
      <div class="acc__section acc__section--animate">
        <h1 class="acc__page-title">Meus Dados</h1>

        <div class="acc__card">
          <div class="acc__card-header">
            <h2 class="acc__card-title">Informações Pessoais</h2>
            <button class="acc__card-link" id="edit-profile-btn">Editar</button>
          </div>
          <div id="profile-display">
            <div class="acc__info-grid">
              <div class="acc__info-item">
                <span class="acc__info-label">Nome</span>
                <span class="acc__info-value">${user.name}</span>
              </div>
              <div class="acc__info-item">
                <span class="acc__info-label">E-mail</span>
                <span class="acc__info-value">${user.email}</span>
              </div>
              <div class="acc__info-item">
                <span class="acc__info-label">Telefone</span>
                <span class="acc__info-value">${user.phone || 'Não informado'}</span>
              </div>
            </div>
          </div>
          <form id="profile-edit" class="acc__form" style="display:none" novalidate>
            <div class="acc__form-group">
              <label>Nome completo</label>
              <input type="text" id="edit-name" value="${user.name}" required />
            </div>
            <div class="acc__form-group">
              <label>E-mail</label>
              <input type="email" id="edit-email" value="${user.email}" required />
            </div>
            <div class="acc__form-group">
              <label>Telefone</label>
              <input type="tel" id="edit-phone" value="${user.phone || ''}" />
            </div>
            <div class="acc__form-actions">
              <button type="button" class="btn btn--outline btn--sm" id="cancel-edit">Cancelar</button>
              <button type="submit" class="btn btn--primary btn--sm">Salvar Alterações</button>
            </div>
          </form>
        </div>

        <div class="acc__card">
          <div class="acc__card-header">
            <h2 class="acc__card-title">Segurança</h2>
            <button class="acc__card-link" id="change-pw-btn">Alterar senha</button>
          </div>
          <p class="acc__card-text">Para sua segurança, recomendamos alterar sua senha periodicamente.</p>
        </div>
      </div>
    `;

    // Edit toggle
    const display = $('#profile-display');
    const editForm = $<HTMLFormElement>('#profile-edit');

    // Phone mask
    const phoneInput = $<HTMLInputElement>('#edit-phone');
    phoneInput?.addEventListener('input', () => this.applyPhoneMask(phoneInput));

    $('#edit-profile-btn')?.addEventListener('click', () => {
      if (display) display.style.display = 'none';
      if (editForm) editForm.style.display = '';
    });

    $('#cancel-edit')?.addEventListener('click', () => {
      if (display) display.style.display = '';
      if (editForm) editForm.style.display = 'none';
    });

    editForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        name: $<HTMLInputElement>('#edit-name')?.value || user.name,
        email: $<HTMLInputElement>('#edit-email')?.value || user.email,
        phone: $<HTMLInputElement>('#edit-phone')?.value || '',
      };
      UserState.save(updated);
      UserState.register(updated);
      this.renderProfile();
      this.showToast('Dados atualizados com sucesso!');

      // Update sidebar
      const greeting = $('#acc-greeting');
      if (greeting) greeting.textContent = `Olá, ${updated.name.split(' ')[0]}!`;
    });

    $('#change-pw-btn')?.addEventListener('click', () => {
      this.showToast('Funcionalidade de alterar senha em breve!');
    });
  }

  // ─── Phone Mask ───

  private applyPhoneMask(input: HTMLInputElement): void {
    let digits = input.value.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length <= 2) {
      input.value = digits.length ? `(${digits}` : '';
    } else if (digits.length <= 7) {
      input.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      input.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
  }

  // ─── Toast ───

  private showToast(message: string): void {
    const toast = $('#cart-toast');
    const text = $('#cart-toast-text');
    if (!toast || !text) return;

    text.textContent = message;
    toast.classList.add('cart-toast--visible');
    setTimeout(() => toast.classList.remove('cart-toast--visible'), 3000);
  }
}
