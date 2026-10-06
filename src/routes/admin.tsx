import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminProducts } from "@/components/admin-products";
import { AdminFrame, useAdminAccess } from "@/components/admin-frame";
import { type AdminSection } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { COPY, statusCopy } from "@/lib/i18n";
import { listAllOrders } from "@/lib/orders";
import { useStorefront } from "@/lib/storefront";
import { useStore, type FlashSale, type Order } from "@/lib/store";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): { section: AdminSection } => {
    if (s.section === "products" || s.section === "orders" || s.section === "flash") return { section: s.section };
    return { section: "overview" };
  },
  component: Admin,
});

function Admin() {
  const { section } = Route.useSearch();
  const { allowed } = useAdminAccess();
  const lang = useStore((s) => s.lang);
  const flash = useStore((s) => s.flash);
  const setFlash = useStore((s) => s.setFlash);
  const localOrders = useStore((s) => s.orders);
  const { products } = useStorefront();
  const t = COPY[lang];
  const [draft, setDraft] = useState<FlashSale>(flash);
  const [remote, setRemote] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    setDraft(flash);
  }, [flash]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    void listAllOrders()
      .then((rows) => {
        if (!cancelled) {
          setRemote(rows);
          setOrdersError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setOrdersError(err instanceof Error ? err.message : "Could not load orders");
      });
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const orders = remote.length ? remote : localOrders;

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = {
      ...draft,
      discount: Math.min(80, Math.max(5, Number(draft.discount) || 20)),
      endsAt: new Date(draft.endsAt).valueOf() || Date.now() + 3_600_000,
    };
    setFlash(next);
    setDraft(next);
    toast.success(t.saved);
  }

  function toggleProduct(id: string) {
    const productIds = draft.productIds.includes(id)
      ? draft.productIds.filter((x) => x !== id)
      : [...draft.productIds, id];
    setDraft({ ...draft, productIds });
  }

  return (
    <AdminFrame tab={section}>
      {section === "overview" ? <AdminDashboard orders={orders} products={products} /> : null}
      {ordersError && section === "overview" ? <p className="mt-4 text-sm text-wine">{ordersError}</p> : null}

      {section === "flash" ? (
        <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="panel p-5">
            <h1 className="font-display text-2xl font-medium text-wine">{t.flash}</h1>
            <label className="mt-4 block text-sm">
              {t.title}
              <input
                className="field mt-1"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="mt-3 block text-sm">
              {t.discount}
              <input
                type="number"
                min={5}
                max={80}
                className="field mt-1"
                value={draft.discount}
                onChange={(e) => setDraft({ ...draft, discount: Number(e.target.value) })}
              />
            </label>
            <label className="mt-3 block text-sm">
              {t.ends}
              <input
                type="datetime-local"
                className="field mt-1"
                value={toLocal(draft.endsAt)}
                onChange={(e) => setDraft({ ...draft, endsAt: new Date(e.target.value).getTime() })}
              />
            </label>
            <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              {t.active}
            </label>
            <Button className="mt-4 w-full" type="submit">
              {t.save}
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted">
              {t.select} · {draft.productIds.length}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const on = draft.productIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`panel p-3 text-start ${on ? "ring-2 ring-wine" : ""}`}
                  >
                    <span className="packshot h-24">
                      <img src={p.image} alt="" />
                    </span>
                    <span className="mt-2 block text-xs font-medium">{p.name}</span>
                    <span className="text-xs text-muted">{qar(p.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      ) : null}

      {section === "products" ? <AdminProducts products={products} /> : null}

      {section === "orders" ? (
        <div>
          <h1 className="page-title text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.orders}</h1>
          <div className="mt-6 space-y-3">
            {orders.length === 0 ? <p className="panel px-5 py-10 text-muted">{ordersError || t.noOrders}</p> : null}
            {orders.map((o) => (
              <article key={o.id} className="panel p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">#{o.id}</p>
                  <p className="text-sm text-muted">{new Date(o.at).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm">
                  {o.name} · {o.phone} · {o.area} · {statusCopy(o.status, t)}
                </p>
                <p className="text-sm text-muted">{o.address}</p>
                <p className="mt-2 text-sm">
                  {o.pay === "cod" ? t.cod : t.skipcash} · {qar(o.total)}
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Link
                    to="/receipt/$id"
                    params={{ id: o.id }}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-wine hover:underline"
                  >
                    {t.viewReceipt}
                  </Link>
                  {o.pay === "skipcash" && o.status === "pending" ? (
                    <Link
                      to="/pay/skipcash"
                      search={{ id: o.id }}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-wine"
                    >
                      {t.completePayment}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </AdminFrame>
  );
}

function toLocal(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
