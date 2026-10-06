import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { BEST_SELLER_IDS, CATEGORIES, HERO_IMAGE, RECOMMENDED_IDS, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/")({ component: Home });

function pick(products: Product[], ids: string[]) {
  return ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

function Home() {
  const lang = useStore((s) => s.lang);
  const { products } = useStorefront();
  const ar = lang === "ar";
  const best = pick(products, BEST_SELLER_IDS);
  const recommended = pick(products, RECOMMENDED_IDS);
  const laptops = products.filter((p) => p.categoryId === "computers");
  const deals = products.filter((p) => p.compareAt > p.price);

  return (
    <Shell>
      <section className="bg-wine text-cream">
        <div className="store-wrap grid items-center gap-8 py-10 md:grid-cols-2 md:py-14">
          <div>
            <h1 className="mt-0 max-w-xl font-sans text-4xl font-semibold leading-tight md:text-5xl">
              {ar ? "توفير كبير على منتجاتك المفضلة" : "Huge saving on your favourite products!"}
            </h1>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-11 w-fit items-center rounded-md bg-cream px-5 text-sm font-semibold text-wine"
            >
              {ar ? "تسوق الآن" : "Shop Now"}
            </Link>
          </div>
          <img
            src={HERO_IMAGE}
            alt={ar ? "عرض موسمي" : "Get 50% off on your new ride"}
            className="mx-auto max-h-72 w-full object-contain md:max-h-80"
          />
        </div>
      </section>

      <section className="store-wrap py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{ar ? "تسوق حسب الفئة" : "Shop by Category"}</h2>
            <p className="mt-1 text-sm text-muted">{ar ? "تصفح مجموعة واسعة من المنتجات" : "Browse through our wide range of products"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id }}
              className="flex flex-col items-center rounded-xl bg-cream p-3 text-center hover:ring-1 hover:ring-wine"
            >
              <span className="grid h-24 w-full place-items-center">
                <img src={c.image} alt="" className="max-h-24 object-contain" />
              </span>
              <span className="mt-2 text-sm font-medium text-ink">{ar ? c.nameAr : c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title={ar ? "الأكثر مبيعاً" : "Best Seller"} products={best} />
      <ProductRow title={ar ? "موصى به لك" : "Recommended For You"} products={recommended} />
      <ProductRow title={ar ? "عروض الحواسيب" : "Deals on Computer & Laptop"} products={laptops} category="computers" />
      <ProductRow title={ar ? "عروض اليوم" : "Today's Deals on products"} products={deals} />

      <section className="py-10">
        <div className="store-wrap">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-ink">{ar ? "لماذا تتسوق معنا" : "Why Shop With Us"}</h2>
            <p className="mt-1 text-sm text-muted">{ar ? "خدمات أوضح، وتوصيل أسرع" : "Experience the difference with our premium services"}</p>
          </div>
          <div className="grid gap-4 rounded-xl bg-cream p-6 sm:grid-cols-2 lg:grid-cols-5">
            <Why title={ar ? "توصيل مجاني" : "Free Delivery"} text={ar ? "للطلبات فوق 50 ر.ق" : "On orders over QAR 50"} />
            <Why title={ar ? "دفع آمن" : "Secure Payment"} text={ar ? "معاملات محمية" : "100% secure transactions"} />
            <Why title={ar ? "إرجاع سهل" : "Easy Returns"} text={ar ? "خلال 14 يوماً" : "14-day return policy"} />
            <Why title={ar ? "دعم 24/7" : "24/7 Support"} text={ar ? "خدمة عملاء مخصصة" : "Dedicated customer service"} />
            <Why title={ar ? "أفضل الأسعار" : "Best Prices"} text={ar ? "ضمان مطابقة السعر" : "Price match guarantee"} />
          </div>
        </div>
      </section>
    </Shell>
  );
}

function ProductRow({
  title,
  products,
  category,
}: {
  title: string;
  products: Product[];
  category?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="store-wrap pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <Link to="/shop" search={category ? { category } : {}} className="text-sm font-medium text-wine">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={`${title}-${p.id}`} p={p} />
        ))}
      </div>
    </section>
  );
}

function Why({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}
