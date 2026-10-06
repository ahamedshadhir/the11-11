import { Shell } from "@/components/layout";
import { useStore } from "@/lib/store";

export function InfoPage({
  title,
  titleAr,
  body,
  bodyAr,
}: {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
}) {
  const lang = useStore((s) => s.lang);
  const ar = lang === "ar";
  return (
    <Shell>
      <article className="store-wrap max-w-2xl py-12">
        <h1 className="text-3xl font-semibold text-ink">{ar ? titleAr : title}</h1>
        <p className="mt-4 text-muted">{ar ? bodyAr : body}</p>
      </article>
    </Shell>
  );
}
