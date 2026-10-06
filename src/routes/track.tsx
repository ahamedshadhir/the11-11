import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/track")({ component: Track });

function Track() {
  const lang = useStore((s) => s.lang);
  const orders = useStore((s) => s.orders);
  const ar = lang === "ar";
  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-12">
        <h1 className="text-3xl font-semibold text-ink">{ar ? "تتبع الطلب" : "Track Order"}</h1>
        <p className="mt-3 text-muted">
          {ar
            ? "الطلبات المحفوظة على هذا الجهاز تظهر هنا. بعد تسجيل الدخول تُحفظ أيضاً في الحساب."
            : "Orders placed on this device are listed here. Signed-in orders are also saved to your account."}
        </p>
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
                  {o.status} · QAR {o.total}
                </p>
              </li>
            ))
          )}
        </ul>
      </article>
    </Shell>
  );
}
