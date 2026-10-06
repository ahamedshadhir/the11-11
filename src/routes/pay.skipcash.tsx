import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { confirmHostedPay, getOrder, settleSkipCash } from "@/lib/orders";
import { useHydrated, useStore, type Order } from "@/lib/store";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/pay/skipcash")({
  validateSearch: (s: Record<string, unknown>) => {
    const id = typeof s.id === "string" ? s.id : "";
    const paymentId =
      typeof s.paymentId === "string"
        ? s.paymentId
        : typeof s.PaymentId === "string"
          ? s.PaymentId
          : "";
    return paymentId ? { id, paymentId } : { id };
  },
  component: SkipCashPay,
});

function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function validExpiry(value: string) {
  const m = value.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp >= now;
}

function SkipCashPay() {
  const { id, paymentId } = Route.useSearch();
  const lang = useStore((s) => s.lang);
  const local = useStore((s) => s.orders);
  const rememberOrder = useStore((s) => s.rememberOrder);
  const t = COPY[lang];
  const ready = useHydrated();
  const nav = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [settling, setSettling] = useState(true);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    async function load() {
      try {
        const remote = await getOrder({ data: id });
        if (cancelled) return;
        const found = remote ?? local.find((o) => o.id === id) ?? null;
        if (!found) {
          setOrder(null);
          setSettling(false);
          return;
        }
        if (found.status === "paid" || found.status === "placed") {
          rememberOrder(found);
          await nav({ to: "/thanks", search: { id: found.id } });
          return;
        }
        if (found.skipcashId || paymentId) {
          const settled = await settleSkipCash({
            data: { orderId: found.id, paymentId: paymentId || undefined },
          });
          if (cancelled) return;
          rememberOrder(settled);
          if (settled.status === "paid") {
            await nav({ to: "/thanks", search: { id: settled.id } });
            return;
          }
          setOrder(settled);
        } else {
          setOrder(found);
        }
      } catch {
        if (!cancelled) setOrder(local.find((o) => o.id === id) ?? null);
      } finally {
        if (!cancelled) setSettling(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, paymentId, user]);

  if (isPending || !ready) {
    return (
      <Shell>
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="h-80 animate-pulse rounded-xl bg-line" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        search={{ next: id ? `/pay/skipcash?id=${encodeURIComponent(id)}` : "/checkout" }}
      />
    );
  }

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (!order || busy) return;
    const pan = number.replace(/\s/g, "");
    if (!luhn(pan) || !validExpiry(expiry) || !/^\d{3,4}$/.test(cvc) || cardName.trim().length < 2) {
      toast.error(t.invalidCard);
      return;
    }
    setBusy(true);
    try {
      const paid = await confirmHostedPay({ data: order.id });
      rememberOrder(paid);
      await nav({ to: "/thanks", search: { id: paid.id } });
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error && err.message ? err.message : t.paymentFailed);
    }
  }

  async function retrySkip() {
    if (!order?.payUrl) return;
    window.location.assign(order.payUrl);
  }

  return (
    <Shell>
      <div className="store-wrap max-w-md py-12">
        <p className="kicker">SkipCash</p>
        <h1 className="page-title mt-3 text-[clamp(1.75rem,1.2rem+1.5vw,2.5rem)]">{t.completePayment}</h1>
        {settling ? (
          <p className="mt-6 text-sm text-muted">{t.processing}</p>
        ) : !order ? (
          <div className="panel mt-8 p-6">
            <p className="text-sm text-muted">{t.noReceipt}</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/checkout">{t.backToCheckout}</Link>
            </Button>
          </div>
        ) : (
          <div className="panel mt-8 p-6">
            <p className="font-mono text-sm text-wine">#{order.id}</p>
            <p className="mt-1 text-lg font-semibold">{qar(order.total)}</p>
            <p className="mt-1 text-sm text-muted">{t.paySecure}</p>

            {order.skipcashId ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm">{t.paymentPending}</p>
                {order.payUrl ? (
                  <Button className="w-full" type="button" onClick={() => void retrySkip()}>
                    {t.retryPay}
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/account">{t.orders}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={onPay} className="mt-6 grid gap-3" autoComplete="off">
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Lock className="size-4 text-wine" />
                  {t.hostedPayNote}
                </p>
                <label className="text-sm">
                  {t.cardName}
                  <input
                    required
                    className="field mt-1"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    autoComplete="cc-name"
                  />
                </label>
                <label className="text-sm">
                  {t.cardNumber}
                  <span className="relative mt-1 block">
                    <CreditCard className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="field ps-10"
                      placeholder="4001 9192 5753 7193"
                      value={number}
                      onChange={(e) =>
                        setNumber(
                          e.target.value
                            .replace(/[^\d]/g, "")
                            .slice(0, 19)
                            .replace(/(\d{4})/g, "$1 ")
                            .trim(),
                        )
                      }
                    />
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    {t.cardExpiry}
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="field mt-1"
                      placeholder="12/27"
                      value={expiry}
                      onChange={(e) => {
                        const d = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                        setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                      }}
                    />
                  </label>
                  <label className="text-sm">
                    {t.cardCvc}
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      className="field mt-1"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted">{t.testCardHint}</p>
                <Button className="mt-2 w-full" type="submit" disabled={busy}>
                  {busy ? t.processing : `${t.payNow} · ${qar(order.total)}`}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
