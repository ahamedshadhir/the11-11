import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { PRODUCTS, type Product } from "./catalog";
import type { Lang } from "./i18n";

export type CartLine = { id: string; qty: number };
export type PayMethod = "cod" | "skipcash";
export type OrderStatus = "pending" | "paid" | "placed" | "failed" | "canceled";
export type Order = {
  id: string;
  at: number;
  name: string;
  phone: string;
  email?: string;
  area: string;
  address: string;
  pay: PayMethod;
  status: OrderStatus;
  total: number;
  lines: { id: string; name: string; qty: number; price: number }[];
  skipcashId?: string;
  payUrl?: string;
};

export type FlashSale = {
  title: string;
  discount: number;
  active: boolean;
  productIds: string[];
  endsAt: number;
};

type Store = {
  lang: Lang;
  area: string;
  cart: CartLine[];
  wish: string[];
  orders: Order[];
  flash: FlashSale;
  setLang: (lang: Lang) => void;
  setArea: (area: string) => void;
  add: (id: string, qty?: number, maxStock?: number) => void;
  setQty: (id: string, qty: number, maxStock?: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  toggleWish: (id: string) => void;
  rememberOrder: (order: Order) => void;
  setFlash: (flash: FlashSale) => void;
};

export const defaultFlash: FlashSale = {
  title: "Today's deals",
  discount: 0,
  active: false,
  productIds: [],
  endsAt: Date.UTC(2026, 11, 31, 17, 0, 0),
};

export function normalizeOrder(raw: Partial<Order> & { id: string }): Order {
  const pay: PayMethod = raw.pay === "skipcash" ? "skipcash" : "cod";
  const status: OrderStatus =
    raw.status === "pending" ||
    raw.status === "paid" ||
    raw.status === "placed" ||
    raw.status === "failed" ||
    raw.status === "canceled"
      ? raw.status
      : pay === "skipcash"
        ? "paid"
        : "placed";
  return {
    id: raw.id,
    at: Number(raw.at) || Date.now(),
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email ? String(raw.email) : undefined,
    area: String(raw.area ?? ""),
    address: String(raw.address ?? ""),
    pay,
    status,
    total: Number(raw.total) || 0,
    lines: Array.isArray(raw.lines) ? raw.lines : [],
    skipcashId: raw.skipcashId ? String(raw.skipcashId) : undefined,
    payUrl: raw.payUrl ? String(raw.payUrl) : undefined,
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      lang: "en",
      area: "Doha",
      cart: [],
      wish: [],
      orders: [],
      flash: defaultFlash,
      setLang: (lang) => set({ lang }),
      setArea: (area) => set({ area }),
      add: (id, qty = 1, maxStock?: number) => {
        const listed = PRODUCTS.find((p) => p.id === id);
        const cap = Math.max(0, Math.floor(maxStock ?? listed?.stock ?? 99));
        if (cap <= 0) return;
        const n = Math.max(1, Math.floor(qty));
        const cart = [...get().cart];
        const i = cart.findIndex((l) => l.id === id);
        const current = i >= 0 ? cart[i].qty : 0;
        const next = Math.min(cap, current + n);
        if (next === current) return;
        if (i >= 0) cart[i] = { ...cart[i], qty: next };
        else cart.push({ id, qty: next });
        set({ cart });
      },
      setQty: (id, qty, maxStock?: number) => {
        const listed = PRODUCTS.find((p) => p.id === id);
        const cap = Math.max(0, Math.floor(maxStock ?? listed?.stock ?? 99));
        const next = Math.min(cap, Math.floor(qty));
        set({
          cart: get()
            .cart.map((l) => (l.id === id ? { ...l, qty: next } : l))
            .filter((l) => l.qty > 0),
        });
      },
      remove: (id) => set({ cart: get().cart.filter((l) => l.id !== id) }),
      clearCart: () => set({ cart: [] }),
      toggleWish: (id) => {
        const wish = get().wish.includes(id)
          ? get().wish.filter((x) => x !== id)
          : [...get().wish, id];
        set({ wish });
      },
      rememberOrder: (order) => {
        const next = normalizeOrder(order);
        set({ orders: [next, ...get().orders.filter((o) => o.id !== next.id)] });
      },
      setFlash: (flash) => set({ flash }),
    }),
    {
      name: "t1111-market",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return {
          ...current,
          ...p,
          flash: { ...defaultFlash, ...(p.flash ?? {}) },
          cart: Array.isArray(p.cart) ? p.cart : current.cart,
          wish: Array.isArray(p.wish) ? p.wish : current.wish,
          orders: Array.isArray(p.orders) ? p.orders.map((o) => normalizeOrder(o)) : current.orders,
        };
      },
    },
  ),
);

export function flashLive(flash: FlashSale) {
  return flash.active && flash.endsAt > Date.now();
}

export function salePrice(p: Product, flash: FlashSale) {
  if (flashLive(flash) && flash.productIds.includes(p.id)) {
    return Math.round(p.price * (1 - flash.discount / 100));
  }
  return p.price;
}

export function cartCount(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.qty, 0);
}

export function cartTotal(cart: CartLine[], flash: FlashSale, products: Product[] = PRODUCTS) {
  return cart.reduce((n, l) => {
    const p = products.find((x) => x.id === l.id);
    if (!p) return n;
    return n + salePrice(p, flash) * l.qty;
  }, 0);
}

export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const persist = useStore.persist;
    if (!persist) {
      setReady(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setReady(true));
    if (persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}
