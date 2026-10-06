import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ReceiptPaper } from "@/components/receipt";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { getOrder } from "@/lib/orders";
import { useHydrated, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/receipt/$id")({
  component: ReceiptPage,
});

function ReceiptPage() {
  const { id } = Route.useParams();
  const lang = useStore((s) => s.lang);
  const local = useStore((s) => s.orders);
  const t = COPY[lang];
  const ready = useHydrated();
  const { user } = useCurrentUserState();
  const [remote, setRemote] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    void getOrder({ data: id })
      .then(setRemote)
      .catch(() => setRemote(null));
  }, [id, user]);

  const order = local.find((o) => o.id === id) ?? remote;

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-fg" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <div className="no-print mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-wine">11-11 · {t.receipt}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => window.print()} disabled={!order}>
            <Printer className="size-4" />
            {t.printReceipt}
          </Button>
          <Button asChild variant="outline">
            <Link to="/account">{t.orders}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/shop">{t.continue}</Link>
          </Button>
        </div>
      </div>

      {!ready ? (
        <div className="mx-auto max-w-2xl">
          <div className="h-96 animate-pulse rounded-xl bg-line" />
        </div>
      ) : order ? (
        <ReceiptPaper order={order} lang={lang} />
      ) : (
        <div className="mx-auto max-w-md rounded-xl bg-card p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-wine">{t.receipt}</h1>
          <p className="mt-3 text-sm text-muted">{t.noReceipt}</p>
          <Button asChild className="mt-6">
            <Link to="/account">{t.orders}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
