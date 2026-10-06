import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { QtyStepper } from "@/components/qty-stepper";
import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { flashLive, salePrice, useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";
import { qar } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { products, ready } = useStorefront();
  const p = products.find((item) => item.slug === slug || item.id === slug);
  const lang = useStore((s) => s.lang);
  const flash = useStore((s) => s.flash);
  const area = useStore((s) => s.area);
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const toggleWish = useStore((s) => s.toggleWish);
  const wish = useStore((s) => s.wish);
  const t = COPY[lang];
  const nav = useNavigate();
  const [qty, setQty] = useState(1);

  if (!p && !ready) {
    return (
      <Shell>
        <div className="store-wrap py-16">
          <div className="panel h-64 animate-pulse bg-line/40" />
        </div>
      </Shell>
    );
  }
  if (!p) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-muted">{t.noItems}</p>
          <Button asChild className="mt-6">
            <Link to="/shop">{t.shop}</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const product = p;
  const price = salePrice(product, flash);
  const onSale = flashLive(flash) && price < product.price;
  const related = products.filter((x) => x.categoryId === product.categoryId && x.id !== product.id).slice(0, 4);

  function addBag() {
    const inBag = cart.find((line) => line.id === product.id)?.qty ?? 0;
    const room = product.stock - inBag;
    if (room <= 0) return;
    add(product.id, Math.min(qty, room), product.stock);
    toast.success(t.added);
  }

  return (
    <Shell>
      <div className="store-wrap py-10">
        <p className="text-sm text-muted">
          <Link to="/" className="hover:text-wine">
            {t.home}
          </Link>
          <span className="px-2 text-line">/</span>
          <Link to="/shop" search={{ category: product.categoryId }} className="hover:text-wine">
            {t.shop}
          </Link>
          <span className="px-2 text-line">/</span>
          {product.name}
        </p>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
          <div className="panel p-8 sm:p-12">
            <div className="packshot mx-auto aspect-square max-h-[32rem]">
              <img src={product.imageHero} alt={product.name} width={900} height={900} decoding="async" />
            </div>
          </div>
          <div className="lg:pt-4">
            <p className="kicker">{t.soldBy}</p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-wine">{product.name}</h1>
            <div className="mt-3">
              <Stars value={product.rating} count={product.reviews} />
            </div>
            <p className="mt-6 font-sans text-3xl font-semibold tabular-nums text-ink">
              {qar(onSale ? price : product.price)}
              {(onSale && price < product.price) || product.compareAt > product.price ? (
                <s className="ms-3 text-lg font-normal text-muted">
                  {qar(onSale && price < product.price ? product.price : product.compareAt)}
                </s>
              ) : null}
            </p>
            <p className="mt-5 max-w-prose text-muted">{product.description}</p>
            <p className="mt-5 text-sm text-fg">
              {product.stock > 0 ? (
                <>
                  {t.inStock} · {product.stock} {t.left}
                </>
              ) : (
                t.soldOut
              )}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Truck className="size-4" strokeWidth={1.5} />
              {t.deliverTo} {area}. {t.nextDay}.
            </p>
            <div className="mt-8">
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:max-w-sm">
              <Button className="w-full" type="button" onClick={addBag} disabled={product.stock <= 0}>
                {product.stock <= 0 ? t.soldOut : t.addToCart}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  addBag();
                  void nav({ to: "/checkout" });
                }}
              >
                {t.buyNow}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => toggleWish(product.id)}>
                <Heart className="size-4" fill={wish.includes(product.id) ? "currentColor" : "none"} />
                {t.wishlist}
              </Button>
            </div>
          </div>
        </div>
        {related.length ? (
          <div className="mt-16 border-t border-line pt-10">
            <h2 className="font-display text-3xl font-medium text-wine">{t.related}</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
