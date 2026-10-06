import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Shell } from "@/components/layout";
import { QtyStepper } from "@/components/qty-stepper";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { cartCount, cartTotal, salePrice, useHydrated, useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const lang = useStore((s) => s.lang);
  const cart = useStore((s) => s.cart);
  const flash = useStore((s) => s.flash);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const { products } = useStorefront();
  const t = COPY[lang];
  const ready = useHydrated();
  const total = cartTotal(cart, flash, products);
  const count = cartCount(cart);

  return (
    <Shell>
      <div className="store-wrap py-10">
        <h1 className="page-title">{t.cart}</h1>
        {!ready ? (
          <div className="mt-8 h-40 animate-pulse rounded-lg bg-line" />
        ) : cart.length === 0 ? (
          <div className="panel mt-8 px-6 py-20 text-center">
            <ShoppingCart className="mx-auto size-8 text-wine" strokeWidth={1.5} />
            <p className="mt-4 text-muted">{t.emptyCart}</p>
            <Button asChild className="mt-6">
              <Link to="/shop">{t.shop}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_280px]">
            <ul className="panel divide-y divide-line">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.id);
                if (!p) return null;
                const price = salePrice(p, flash);
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="packshot size-24 border border-line p-2">
                      <img src={p.image} alt="" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="font-medium text-fg hover:text-wine">
                        {p.name}
                      </Link>
                      <p className="mt-1 text-sm tabular-nums text-wine">{qar(price)}</p>
                      <p className="text-xs text-muted">{t.inStock}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, n)} max={p.stock} />
                        <button type="button" className="text-sm text-muted hover:text-wine" onClick={() => remove(l.id)}>
                          {t.remove}
                        </button>
                      </div>
                    </div>
                    <p className="w-28 text-end font-medium tabular-nums">{qar(price * l.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <aside className="panel p-5">
              <p className="text-sm text-muted">
                {t.subtotal} ({count})
              </p>
              <p className="mt-1 font-display text-3xl tabular-nums text-wine">{qar(total)}</p>
              <p className="mt-3 text-sm text-muted">{t.deliveryNote}</p>
              <Button asChild className="mt-5 w-full">
                <Link to="/checkout">{t.checkout}</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </Shell>
  );
}
