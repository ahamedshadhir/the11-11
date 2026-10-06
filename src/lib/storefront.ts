import { createServerFn } from "@tanstack/react-start";
import { useSyncExternalStore } from "react";
import { authMiddleware } from "@/lib/auth/middleware";
import { PRODUCTS, type Product } from "@/lib/catalog";
import {
  DEFAULT_PAGES,
  type BulkResult,
  type ProductInput,
  type StorePages,
  type StoreUser,
  type StorefrontPayload,
} from "@/lib/storefront-types";

export const getStorefront = createServerFn({ method: "GET" }).handler(async () => {
  const { loadStorefront } = await import("./storefront.server");
  return loadStorefront();
});

export const adminAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { adminAccessFor } = await import("./storefront.server");
    return adminAccessFor(context.userId);
  });

export const saveCatalogProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProductInput) => input)
  .handler(async ({ context, data }) => {
    const { saveProductForAdmin } = await import("./storefront.server");
    return saveProductForAdmin(context.userId, data);
  });

export const removeCatalogProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    const { removeProductForAdmin } = await import("./storefront.server");
    return removeProductForAdmin(context.userId, data);
  });

export const importCatalogCsv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((csv: string) => csv)
  .handler(async ({ context, data }) => {
    const { importProductsForAdmin } = await import("./storefront.server");
    return importProductsForAdmin(context.userId, data);
  });

export const saveStorePages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((pages: StorePages) => pages)
  .handler(async ({ context, data }) => {
    const { savePagesForAdmin } = await import("./storefront.server");
    return savePagesForAdmin(context.userId, data);
  });

export const listStoreUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listUsersForAdmin } = await import("./storefront.server");
    return listUsersForAdmin(context.userId);
  });

export const setStoreRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; role: "admin" | "customer" }) => input)
  .handler(async ({ context, data }) => {
    const { setUserRoleForAdmin } = await import("./storefront.server");
    return setUserRoleForAdmin(context.userId, data.userId, data.role);
  });

type Snap = { ready: boolean; products: Product[]; pages: StorePages };
let snap: Snap = { ready: false, products: PRODUCTS, pages: DEFAULT_PAGES };
const listeners = new Set<() => void>();

function emit(next: Snap) {
  snap = next;
  listeners.forEach((listener) => listener());
}

export function reloadStorefront() {
  return getStorefront()
    .then((data: StorefrontPayload) => {
      emit({ ready: true, products: data.products, pages: data.pages });
      return data;
    })
    .catch(() => {
      emit({ ...snap, ready: true });
      return null;
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStorefront() {
  const state = useSyncExternalStore(subscribe, () => snap, () => snap);
  return state;
}

export type { BulkResult, ProductInput, StorePages, StoreUser };
