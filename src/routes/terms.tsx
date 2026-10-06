import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const { pages } = useStorefront();
  const body = lang === "ar" ? pages.termsBodyAr : pages.termsBody;
  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-16">
        <h1 className="page-title">{t.terms}</h1>
        <p className="mt-4 text-muted">{body}</p>
      </article>
    </Shell>
  );
}
