import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";
import { flashLive, useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";
import { useMemo, useState } from "react";

export type ShopSearch = { q?: string; category?: string; flash?: boolean };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    q: typeof s.q === "string" && s.q.length ? s.q : undefined,
    category: typeof s.category === "string" && s.category.length ? s.category : undefined,
    flash: s.flash === true || s.flash === "true" ? true : undefined,
  }),
  component: Shop,
});

function Shop() {
  const { q, category, flash: flashOnly } = Route.useSearch();
  const lang = useStore((s) => s.lang);
  const flash = useStore((s) => s.flash);
  const t = COPY[lang];
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const { products } = useStorefront();
  const live = flashLive(flash);

  const items = useMemo(() => {
    const needle = (q ?? "").trim().toLowerCase();
    let list = products;
    if (needle) {
      list = list.filter((p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle));
    } else if (category) {
      list = list.filter((p) => p.categoryId === category);
    }
    if (flashOnly && live) list = list.filter((p) => flash.productIds.includes(p.id));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, q, category, flashOnly, live, flash.productIds, sort]);

  const heading =
    flashOnly && live
      ? flash.title
      : q
        ? q
        : category
          ? (lang === "ar"
              ? CATEGORIES.find((c) => c.id === category)?.nameAr
              : CATEGORIES.find((c) => c.id === category)?.name) ?? t.shop
          : t.shop;

  return (
    <Shell>
      <div className="store-wrap grid gap-10 py-10 lg:grid-cols-[200px_1fr]">
        <aside>
          <p className="kicker">{t.categories}</p>
          <ul className="mt-4 space-y-1 text-sm">
            {live ? (
              <li>
                <Link
                  to="/shop"
                  search={{ flash: true }}
                  className={`flex min-h-11 items-center ${flashOnly ? "font-medium text-wine" : "text-muted hover:text-wine"}`}
                >
                  {t.flash}
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                to="/shop"
                className={`flex min-h-11 items-center ${!category && !flashOnly && !q ? "font-medium text-wine" : "text-muted hover:text-wine"}`}
              >
                {t.all}
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to="/shop"
                  search={{ category: c.id }}
                  className={`flex min-h-11 items-center ${category === c.id ? "font-medium text-wine" : "text-muted hover:text-wine"}`}
                >
                  {lang === "ar" ? c.nameAr : c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <h1 className="page-title text-[clamp(1.75rem,1.2rem+1.5vw,2.5rem)]">{heading}</h1>
              <p className="mt-2 text-sm text-muted">
                {items.length} {t.results}
              </p>
            </div>
            <label className="text-sm text-muted">
              {t.sort}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="ms-2 h-11 rounded-md border border-line bg-card px-3 text-fg"
              >
                <option value="featured">{t.featured}</option>
                <option value="low">{t.low}</option>
                <option value="high">{t.high}</option>
              </select>
            </label>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          {items.length === 0 ? <p className="mt-10 text-muted">{t.noItems}</p> : null}
        </div>
      </div>
    </Shell>
  );
}
