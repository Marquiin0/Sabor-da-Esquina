import { $ } from '../utils/dom';
import { UserState } from '../data/UserState';

export class UserMenu {
  private isOpen = false;
  private dropdown: HTMLElement | null = null;
  private trigger: HTMLElement | null = null;

  init(): void {
    const area = $('#user-area');
    if (!area) return;

    if (!UserState.isLoggedIn()) return;

    const user = UserState.get()!;
    const initials = UserState.getInitials();
    const firstName = UserState.getFirstName();

    // Replace login link with user menu
    area.innerHTML = `
      <div class="user-menu">
        <button class="user-menu__trigger" id="user-trigger" aria-expanded="false" aria-haspopup="true">
          <div class="user-menu__avatar">${initials}</div>
          <span class="user-menu__name">${firstName}</span>
          <svg class="user-menu__arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="user-menu__dropdown" id="user-dropdown">
          <div class="user-menu__header">
            <div class="user-menu__avatar user-menu__avatar--lg">${initials}</div>
            <div class="user-menu__info">
              <span class="user-menu__fullname">${user.name}</span>
              <span class="user-menu__email">${user.email}</span>
            </div>
          </div>
          <div class="user-menu__divider"></div>
          <button class="user-menu__item" data-action="account">
            <span class="user-menu__item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span>Minha Conta</span>
            <svg class="user-menu__item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="user-menu__item" data-action="orders">
            <span class="user-menu__item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            <span>Meus Pedidos</span>
            <svg class="user-menu__item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="user-menu__item" data-action="coupons">
            <span class="user-menu__item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </span>
            <span>Meus Cupons</span>
            <svg class="user-menu__item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="user-menu__item" data-action="addresses">
            <span class="user-menu__item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span>Endereços</span>
            <svg class="user-menu__item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="user-menu__item" data-action="data">
            <span class="user-menu__item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </span>
            <span>Meus Dados</span>
            <svg class="user-menu__item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div class="user-menu__divider"></div>
          <button class="user-menu__item user-menu__item--logout" data-action="logout">
            <span class="user-menu__item-icon user-menu__item-icon--logout">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    `;

    this.trigger = $('#user-trigger');
    this.dropdown = $('#user-dropdown');

    this.bindEvents();
  }

  private bindEvents(): void {
    const menu = this.trigger?.closest('.user-menu');

    // Hover to open on desktop
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

    menu?.addEventListener('mouseenter', () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      this.open();
    });

    menu?.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => this.close(), 200);
    });

    // Click also works (for accessibility / mobile)
    this.trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !menu?.contains(e.target as Node)) {
        this.close();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Menu item actions
    this.dropdown?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.user-menu__item');
      if (!item) return;

      const action = item.dataset.action;
      const base = import.meta.env.BASE_URL;

      switch (action) {
        case 'logout':
          UserState.logout();
          window.location.reload();
          break;
        case 'account':
          window.location.href = `${base}account.html#dashboard`;
          break;
        case 'orders':
          window.location.href = `${base}account.html#orders`;
          break;
        case 'coupons':
          window.location.href = `${base}account.html#coupons`;
          break;
        case 'addresses':
          window.location.href = `${base}account.html#addresses`;
          break;
        case 'data':
          window.location.href = `${base}account.html#profile`;
          break;
      }
    });
  }

  private toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  private open(): void {
    this.isOpen = true;
    this.dropdown?.classList.add('user-menu__dropdown--open');
    this.trigger?.setAttribute('aria-expanded', 'true');
  }

  private close(): void {
    this.isOpen = false;
    this.dropdown?.classList.remove('user-menu__dropdown--open');
    this.trigger?.setAttribute('aria-expanded', 'false');
  }

}
