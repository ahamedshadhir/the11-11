import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { COPY, statusCopy } from "@/lib/i18n";
import { listOrders } from "@/lib/orders";
import { useStore, type Order } from "@/lib/store";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const lang = useStore((s) => s.lang);
  const local = useStore((s) => s.orders);
  const t = COPY[lang];
  const [remote, setRemote] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    void listOrders()
      .then(setRemote)
      .catch(() => setRemote([]));
  }, [user]);

  const orders = useMemo(() => {
    const map = new Map<string, Order>();
    for (const o of [...remote, ...local]) map.set(o.id, o);
    return [...map.values()].sort((a, b) => b.at - a.at);
  }, [remote, local]);

  if (isPending) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="h-8 w-40 animate-pulse rounded-md bg-line" />
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-line" />
        </div>
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <Shell>
      <div className="store-wrap max-w-3xl py-12">
        <h1 className="page-title">{t.account}</h1>
        <section className="panel mt-8 p-6 sm:p-8">
          <p className="kicker">{t.profile}</p>
          <p className="mt-3 font-display text-2xl text-wine">{user.displayName ?? t.account}</p>
          <p className="text-sm text-muted">{user.primaryEmail}</p>
          <div className="mt-5">
            <UserButton />
          </div>
        </section>
        <div className="mt-12 flex items-end justify-between">
          <h2 className="font-display text-2xl font-medium text-wine">{t.orders}</h2>
          <Link to="/wishlist" className="text-sm text-muted hover:text-wine">
            {t.wishlist}
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="panel mt-4 px-6 py-16 text-center">
            <p className="text-muted">{t.noOrders}</p>
            <Button asChild className="mt-4">
              <Link to="/shop">{t.shop}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">#{o.id}</p>
                  <p className="text-sm text-muted">{new Date(o.at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-sm">
                  {o.pay === "cod" ? t.cod : t.skipcash} · {statusCopy(o.status, t)} · {o.area}
                </p>
                <ul className="mt-2 text-sm text-muted">
                  {o.lines.map((l) => (
                    <li key={l.id}>
                      {l.name} × {l.qty}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold">{qar(o.total)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}
