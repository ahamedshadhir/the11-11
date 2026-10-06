import { Link } from "@tanstack/react-router";
import { COPY, statusCopy } from "@/lib/i18n";
import type { Product } from "@/lib/catalog";
import type { Order } from "@/lib/store";
import { useStore } from "@/lib/store";
import { qar } from "@/lib/utils";

export function AdminDashboard({ orders, products }: { orders: Order[]; products: Product[] }) {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const paid = orders.filter((o) => o.status === "paid" || o.status === "placed");
  const revenue = paid.reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const average = paid.length ? Math.round(revenue / paid.length) : 0;
  const days = lastDays(7);
  const maxBar = Math.max(1, ...days.map((day) => dayTotal(orders, day)));
  const counts = ["paid", "placed", "pending", "failed", "canceled"].map((status) => ({
    status,
    n: orders.filter((o) => o.status === status).length,
  }));
  const top = topProducts(orders, products);

  function exportReport() {
    const header = "id,date,customer,area,status,payment,total";
    const lines = orders.map((o) =>
      [o.id, new Date(o.at).toISOString(), csv(o.name), csv(o.area), o.status, o.pay, o.total].join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "11-11-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="page-title text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.dashboard}</h1>
        <button type="button" onClick={exportReport} className="min-h-11 text-sm font-medium text-wine hover:underline">
          {t.exportReport}
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/users" className="panel p-5 hover:border-wine">
          <p className="kicker">{t.users}</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-wine">{t.userManagement}</h2>
          <p className="mt-2 text-sm text-muted">{t.userManagementHelp}</p>
        </Link>
        <Link to="/admin/platform" className="panel p-5 hover:border-wine">
          <p className="kicker">{t.pages}</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-wine">{t.platformManagement}</h2>
          <p className="mt-2 text-sm text-muted">{t.platformManagementHelp}</p>
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t.revenue} value={qar(revenue)} />
        <Stat label={t.orders} value={String(orders.length)} />
        <Stat label={t.averageOrder} value={qar(average)} />
        <Stat label={t.pendingPay} value={String(pending)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <h2 className="font-display text-2xl font-medium text-wine">{t.last7}</h2>
          <div className="mt-6 flex h-36 items-end gap-2">
            {days.map((day) => {
              const total = dayTotal(orders, day);
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end">
                    <div
                      className="w-full rounded-t bg-wine"
                      style={{ height: `${Math.max(6, (total / maxBar) * 100)}%` }}
                      title={qar(total)}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted">{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="font-display text-2xl font-medium text-wine">{t.reports}</h2>
          <ul className="mt-4 space-y-3">
            {counts.map((row) => (
              <li key={row.status} className="flex items-center justify-between text-sm">
                <span>{statusCopy(row.status, t)}</span>
                <span className="tabular-nums text-wine">{row.n}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-line pt-3 text-sm">
              <span>{t.catalog}</span>
              <span className="tabular-nums text-wine">{products.length}</span>
            </li>
          </ul>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-display text-2xl font-medium text-wine">{t.topProducts}</h2>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t.noOrders}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {top.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate">{row.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {row.qty} · {qar(row.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel p-5">
          <h2 className="font-display text-2xl font-medium text-wine">{t.orders}</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t.noOrders}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-medium">#{o.id.slice(0, 10)}</span>
                    <span className="mt-0.5 block text-muted">
                      {o.name} · {statusCopy(o.status, t)}
                    </span>
                  </span>
                  <span className="tabular-nums text-wine">{qar(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <p className="kicker">{label}</p>
      <p className="mt-3 font-display text-3xl tabular-nums text-wine">{value}</p>
    </div>
  );
}

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function dayKey(ms: number) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function lastDays(n: number) {
  const out: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(dayKey(start.getTime() - i * 86_400_000));
  }
  return out;
}

function dayTotal(orders: Order[], day: string) {
  return orders
    .filter((o) => (o.status === "paid" || o.status === "placed") && dayKey(o.at) === day)
    .reduce((n, o) => n + o.total, 0);
}

function topProducts(orders: Order[], products: Product[]) {
  const map = new Map<string, { id: string; name: string; qty: number; total: number }>();
  for (const order of orders) {
    if (order.status === "failed" || order.status === "canceled") continue;
    for (const line of order.lines) {
      const row = map.get(line.id) ?? { id: line.id, name: line.name, qty: 0, total: 0 };
      row.qty += line.qty;
      row.total += line.qty * line.price;
      map.set(line.id, row);
    }
  }
  return [...map.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((row) => ({ ...row, name: products.find((p) => p.id === row.id)?.name ?? row.name }));
}
