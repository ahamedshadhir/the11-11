import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  const lang = useStore((s) => s.lang);
  const { pages } = useStorefront();
  const ar = lang === "ar";
  const title = ar ? pages.aboutTitleAr : pages.aboutTitle;
  const body = (ar ? pages.aboutBodyAr : pages.aboutBody).split(/\n\n+/);
  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-16">
        <p className="kicker">11:11</p>
        <h1 className="page-title mt-4">{title}</h1>
        {body.map((para) => (
          <p key={para.slice(0, 24)} className="mt-6 text-muted">
            {para}
          </p>
        ))}
        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          <Fact k={ar ? "المقر" : "Based"} v={ar ? "الدوحة، قطر" : "Doha, Qatar"} />
          <Fact k={ar ? "التوصيل" : "Delivery"} v={ar ? "1–3 أيام" : "1–3 days"} />
          <Fact k={ar ? "الدفع" : "Pay"} v="COD · SkipCash" />
        </dl>
      </article>
    </Shell>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="kicker">{k}</dt>
      <dd className="mt-2 font-display text-xl text-wine">{v}</dd>
    </div>
  );
}
