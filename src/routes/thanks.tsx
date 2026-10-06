import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/layout";
import { ReceiptActions, ReceiptPaper } from "@/components/receipt";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { COPY } from "@/lib/i18n";
import { getOrder } from "@/lib/orders";
import { useHydrated, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/thanks")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : "",
  }),
  component: Thanks,
});

function Thanks() {
  const { id } = Route.useSearch();
  const lang = useStore((s) => s.lang);
  const orders = useStore((s) => s.orders);
  const rememberOrder = useStore((s) => s.rememberOrder);
  const t = COPY[lang];
  const ready = useHydrated();
  const { user } = useCurrentUserState();
  const [remote, setRemote] = useState<Order | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    void getOrder({ data: id })
      .then((order) => {
        setRemote(order);
        if (order) rememberOrder(order);
      })
      .catch(() => setRemote(null));
  }, [id, user]);

  const order = (id ? orders.find((o) => o.id === id) : undefined) ?? remote ?? orders[0];
  const heading =
    order?.status === "pending"
      ? t.orderAwaitingPay
      : order?.status === "failed" || order?.status === "canceled"
        ? t.paymentFailed
        : t.orderOk;

  return (
    <Shell>
      <div className="store-wrap max-w-2xl py-12">
        <p className="no-print kicker text-center">11-11</p>
        <h1 className="page-title no-print mt-3 text-center">{heading}</h1>
        <p className="no-print mx-auto mt-3 max-w-md text-center text-sm text-muted">{t.receiptNote}</p>
        {!ready ? (
          <div className="mt-8 h-96 animate-pulse rounded-xl bg-line" />
        ) : order ? (
          <>
            {order.status === "pending" && order.pay === "skipcash" ? (
              <div className="no-print mt-6 text-center">
                <Button asChild>
                  <Link to="/pay/skipcash" search={{ id: order.id }}>
                    {t.completePayment}
                  </Link>
                </Button>
              </div>
            ) : null}
            <div className="mt-8">
              <ReceiptPaper order={order} lang={lang} />
            </div>
            <ReceiptActions orderId={order.id} lang={lang} />
          </>
        ) : (
          <div className="panel mt-8 p-8 text-center">
            <p className="text-muted">{t.noReceipt}</p>
            <Button asChild className="mt-4">
              <Link to="/shop">{t.continue}</Link>
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}
