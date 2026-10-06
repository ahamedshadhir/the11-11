import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";
import { flashLive, salePrice, useStore } from "@/lib/store";
import { qar } from "@/lib/utils";
import { Stars } from "./stars";
import { Button } from "@/components/ui/button";

export function ProductCard({ p }: { p: Product }) {
  const lang = useStore((s) => s.lang);
  const flash = useStore((s) => s.flash);
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const wish = useStore((s) => s.wish);
  const toggleWish = useStore((s) => s.toggleWish);
  const t = COPY[lang];
  const price = salePrice(p, flash);
  const onSale = flashLive(flash) && price < p.price;
  const loved = wish.includes(p.id);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
          <span className="packshot aspect-[4/3] rounded-lg border border-line bg-card p-3 transition-colors duration-200 group-hover:border-wine/40">
            <img src={p.image} alt={p.name} width={400} height={300} loading="lazy" decoding="async" />
          </span>
        </Link>
        {p.stock <= 0 ? (
          <span className="absolute start-3 top-3 rounded bg-ink px-2 py-1 text-[11px] font-semibold text-cream">
            Out of stock
          </span>
        ) : p.compareAt > p.price ? (
          <span className="absolute start-3 top-3 rounded bg-wine px-2 py-1 text-[11px] font-semibold text-cream">
            −{Math.round((1 - p.price / p.compareAt) * 100)}%
          </span>
        ) : null}
        <button
          type="button"
          aria-label={t.wishlist}
          aria-pressed={loved}
          onClick={() => toggleWish(p.id)}
          className="absolute end-2 top-2 grid size-11 place-items-center rounded-full bg-white/95 text-muted shadow-sm hover:text-wine"
        >
          <Heart className="size-4" strokeWidth={1.5} fill={loved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-medium leading-snug text-fg">
          <Link to="/product/$slug" params={{ slug: p.slug }} className="hover:text-wine">
            {p.name}
          </Link>
        </h3>
        <Stars value={p.rating} count={p.reviews} />
        <p className="mt-1 text-base font-semibold tabular-nums text-ink">
          {qar(onSale ? price : p.price)}
          {(onSale ? price < p.price : p.compareAt > p.price) ? (
            <s className="ms-2 text-sm font-normal text-muted">{qar(onSale ? p.price : p.compareAt)}</s>
          ) : null}
        </p>
        <Button
          type="button"
          className="mt-3 w-full"
          onClick={() => {
            const inBag = cart.find((line) => line.id === p.id)?.qty ?? 0;
            if (p.stock <= 0 || inBag >= p.stock) return;
            add(p.id, 1, p.stock);
            toast.success(t.added);
          }}
          disabled={p.stock <= 0 || (cart.find((line) => line.id === p.id)?.qty ?? 0) >= p.stock}
        >
          {p.stock <= 0 ? t.soldOut : t.addToCart}
        </Button>
      </div>
    </article>
  );
}
