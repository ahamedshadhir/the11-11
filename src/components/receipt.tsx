import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { COPY, statusCopy, type Lang } from "@/lib/i18n";
import type { Order } from "@/lib/store";
import { qar } from "@/lib/utils";

export function formatReceiptDate(at: number, lang: Lang) {
  return new Date(at).toLocaleString(lang === "ar" ? "ar-QA" : "en-QA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function receiptPayLine(order: Order, t: (typeof COPY)["en"]) {
  if (order.pay === "cod") return `${t.cod} · ${t.dueOnDelivery}`;
  if (order.status === "paid") return `${t.skipcash} · ${t.receiptPaid}`;
  if (order.status === "pending") return `${t.skipcash} · ${t.paymentPending}`;
  if (order.status === "canceled") return `${t.skipcash} · ${t.paymentCanceled}`;
  if (order.status === "failed") return `${t.skipcash} · ${t.statusFailed}`;
  return `${t.skipcash} · ${statusCopy(order.status, t)}`;
}

export function ReceiptPaper({ order, lang }: { order: Order; lang: Lang }) {
  const t = COPY[lang];

  return (
    <article className="receipt-sheet panel mx-auto w-full max-w-2xl p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <Logo to="/" compact className="items-start" />
          <p className="mt-3 text-xs text-muted">{t.packedIn}</p>
        </div>
        <div className={lang === "ar" ? "text-start" : "text-end"}>
          <p className="kicker">{t.receipt}</p>
          <p className="mt-1 font-mono text-sm font-semibold text-wine">#{order.id}</p>
          <p className="mt-1 text-xs text-muted">{formatReceiptDate(order.at, lang)}</p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="kicker">{t.billTo}</p>
          <p className="mt-1 font-medium">{order.name}</p>
          {order.email ? <p className="text-sm text-muted">{order.email}</p> : null}
          <p className="text-sm text-muted" dir="ltr">
            {order.phone}
          </p>
        </div>
        <div>
          <p className="kicker">{t.shipTo}</p>
          <p className="mt-1 font-medium">{order.area}</p>
          <p className="text-sm text-muted">{order.address}</p>
        </div>
      </div>

      <table className="mt-6 w-full text-start text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <th className="py-2 text-start font-medium">{t.item}</th>
            <th className="py-2 text-start font-medium">{t.qty}</th>
            <th className="py-2 text-start font-medium">{t.unitPrice}</th>
            <th className="py-2 text-end font-medium">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => (
            <tr key={l.id} className="border-b border-line last:border-0">
              <td className="py-2.5">{l.name}</td>
              <td className="py-2.5">{l.qty}</td>
              <td className="py-2.5">{qar(l.price)}</td>
              <td className="py-2.5 text-end font-medium">{qar(l.price * l.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-5 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t.subtotal}</dt>
          <dd>{qar(order.total)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t.delivery}</dt>
          <dd>{t.free}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-semibold text-wine">
          <dt>{t.total}</dt>
          <dd>{qar(order.total)}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-md bg-cream px-3 py-2 text-sm">
        {t.payment}: {receiptPayLine(order, t)}
      </p>
      <p className="mt-3 text-xs text-muted">{t.vatNote}</p>
      <p className="mt-1 text-xs text-muted">{t.returnsNote}</p>
    </article>
  );
}

export function ReceiptActions({ orderId, lang }: { orderId: string; lang: Lang }) {
  const t = COPY[lang];
  return (
    <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
      <Button type="button" onClick={() => window.print()}>
        <Printer className="size-4" />
        {t.printReceipt}
      </Button>
      <Button asChild variant="outline">
        <Link to="/receipt/$id" params={{ id: orderId }}>
          {t.viewReceipt}
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to="/account">{t.orders}</Link>
      </Button>
    </div>
  );
}
