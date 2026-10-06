import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const { pages } = useStorefront();
  const body = (lang === "ar" ? pages.privacyBodyAr : pages.privacyBody).split(/\n\n+/);
  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-16">
        <h1 className="page-title">{t.privacy}</h1>
        {body.map((para) => (
          <p key={para.slice(0, 32)} className="mt-4 text-muted">
            {para}
          </p>
        ))}
      </article>
    </Shell>
  );
}
