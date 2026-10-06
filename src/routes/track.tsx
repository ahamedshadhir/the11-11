import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { listOrders } from "@/lib/orders";
import { useStore, type Order } from "@/lib/store";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/track")({ component: Track });

function Track() {
  const lang = useStore((s) => s.lang);
  const local = useStore((s) => s.orders);
  const { user } = useCurrentUserState();
  const nav = useNavigate();
  const ar = lang === "ar";
  const [remote, setRemote] = useState<Order[]>([]);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!user) return;
    void listOrders()
      .then(setRemote)
      .catch(() => setRemote([]));
  }, [user]);

  const orders = useMemo(() => {
    const map = new Map<string, Order>();
    for (const order of [...remote, ...local]) map.set(order.id, order);
    return [...map.values()].sort((a, b) => b.at - a.at);
  }, [remote, local]);

  function lookup(e: FormEvent) {
    e.preventDefault();
    const id = code.trim();
    if (!id) return;
    void nav({ to: "/receipt/$id", params: { id } });
  }

  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-12">
        <h1 className="text-3xl font-semibold text-ink">{ar ? "تتبع الطلب" : "Track Order"}</h1>
        <p className="mt-3 text-muted">
          {ar
            ? "أدخل رقم الطلب، أو راجع الطلبات المرتبطة بهذا الحساب."
            : "Enter an order number, or review the orders on this account."}
        </p>
        <form onSubmit={lookup} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={ar ? "رقم الطلب" : "Order number"}
            className="field"
            aria-label={ar ? "رقم الطلب" : "Order number"}
          />
          <Button type="submit" className="sm:w-auto">
            {ar ? "تتبع" : "Track"}
          </Button>
        </form>
        {!user ? (
          <p className="mt-4 text-sm text-muted">
            <Link to="/login" search={{ next: "/track" }} className="font-medium text-wine">
              {ar ? "سجّل الدخول" : "Sign in"}
            </Link>{" "}
            {ar ? "لرؤية طلبات حسابك." : "to see orders saved to your account."}
          </p>
        ) : null}
        <ul className="mt-8 space-y-3">
          {orders.length === 0 ? (
            <li className="text-muted">{ar ? "لا توجد طلبات بعد." : "No orders yet."}</li>
          ) : (
            orders.map((o) => (
              <li key={o.id} className="rounded-lg border border-line p-4">
                <Link to="/receipt/$id" params={{ id: o.id }} className="font-medium text-wine">
                  {o.id}
                </Link>
                <p className="text-sm text-muted">
                  {o.status} · {qar(o.total)}
                </p>
              </li>
            ))
          )}
        </ul>
      </article>
    </Shell>
  );
}