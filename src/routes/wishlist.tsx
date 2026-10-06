import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Shell } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { useHydrated, useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/wishlist")({ component: Wishlist });

function Wishlist() {
  const lang = useStore((s) => s.lang);
  const wish = useStore((s) => s.wish);
  const t = COPY[lang];
  const { products } = useStorefront();
  const ready = useHydrated();
  const items = products.filter((p) => wish.includes(p.id));

  return (
    <Shell>
      <div className="store-wrap py-12">
        <h1 className="page-title">{t.wishlist}</h1>
        {!ready ? (
          <div className="mt-8 h-40 animate-pulse rounded-lg bg-line" />
        ) : items.length === 0 ? (
          <div className="panel mt-10 px-6 py-20 text-center">
            <Heart className="mx-auto size-8 text-wine" strokeWidth={1.5} />
            <p className="mt-4 text-muted">{t.emptyWish}</p>
            <Button asChild className="mt-6">
              <Link to="/shop">{t.shop}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
