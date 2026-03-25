export interface Coupon {
  code: string;
  type: 'percent' | 'freeShipping';
  value: number;
  label: string;
  description: string;
  maxUses: number;
  icon: string;
  expiry: string;
}

const USAGE_KEY = 'sabor_coupon_usage';

export const COUPONS: Coupon[] = [
  {
    code: 'PRIMEIRA30',
    type: 'percent',
    value: 30,
    label: '30% de desconto',
    description: 'Válido apenas na primeira compra',
    maxUses: 1,
    icon: '🔥',
    expiry: '30/04/2026',
  },
  {
    code: 'SABOR10',
    type: 'percent',
    value: 10,
    label: '10% de desconto',
    description: 'Válido para até 5 pedidos',
    maxUses: 5,
    icon: '💰',
    expiry: '15/05/2026',
  },
  {
    code: 'FRETEGRATIS',
    type: 'freeShipping',
    value: 0,
    label: 'Frete grátis',
    description: 'Válido para até 3 pedidos',
    maxUses: 3,
    icon: '🚀',
    expiry: '20/04/2026',
  },
];

export class CouponState {
  private static getUsage(): Record<string, number> {
    try {
      const data = localStorage.getItem(USAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveUsage(usage: Record<string, number>): void {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }

  static getTimesUsed(code: string): number {
    return this.getUsage()[code] || 0;
  }

  static getRemainingUses(code: string): number {
    const coupon = COUPONS.find((c) => c.code === code);
    if (!coupon) return 0;
    return Math.max(0, coupon.maxUses - this.getTimesUsed(code));
  }

  static isAvailable(code: string): boolean {
    return this.getRemainingUses(code) > 0;
  }

  static markUsed(code: string): void {
    const usage = this.getUsage();
    usage[code] = (usage[code] || 0) + 1;
    this.saveUsage(usage);
  }

  static getAvailableCoupons(): (Coupon & { remaining: number; used: number })[] {
    return COUPONS.map((c) => ({
      ...c,
      remaining: this.getRemainingUses(c.code),
      used: this.getTimesUsed(c.code),
    }));
  }

  static getActiveCoupons(): (Coupon & { remaining: number; used: number })[] {
    return this.getAvailableCoupons().filter((c) => c.remaining > 0);
  }
}
