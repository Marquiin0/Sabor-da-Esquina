export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon: string;
  paymentMethod: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingMethod: string;
  orderNumber: string;
  estimatedTime: string;
}

const CART_KEY = 'sabor_cart';
const ORDER_KEY = 'sabor_order';
const HISTORY_KEY = 'sabor_orders';

export class CartState {
  static getItems(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static setItems(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  static addItem(item: Omit<CartItem, 'quantity'>): void {
    const items = this.getItems();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.setItems(items);
  }

  static removeItem(id: string): void {
    const items = this.getItems().filter((i) => i.id !== id);
    this.setItems(items);
  }

  static updateQty(id: string, delta: number): void {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.setItems(items.filter((i) => i.id !== id));
    } else {
      this.setItems(items);
    }
  }

  static getTotal(): number {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  static getCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  static clear(): void {
    localStorage.removeItem(CART_KEY);
  }

  // ─── Order Data ───

  static saveOrder(order: OrderData): void {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }

  static getOrder(): OrderData | null {
    try {
      const data = localStorage.getItem(ORDER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static clearOrder(): void {
    localStorage.removeItem(ORDER_KEY);
  }

  // ─── Order History ───

  static saveOrderToHistory(order: OrderData): void {
    const history = this.getOrderHistory();
    history.unshift({ ...order, date: new Date().toISOString() } as OrderData & { date: string });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  }

  static getOrderHistory(): (OrderData & { date?: string })[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
