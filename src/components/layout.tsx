import { Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Heart, MapPin, Search, ShoppingCart, ChevronDown, User } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isAdminEmail } from "@/lib/admin";
import { CATEGORIES, QATAR_AREAS } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";
import { cartCount, flashLive, useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";
import { Logo } from "./logo";

export function Shell({ children }: { children: ReactNode }) {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const area = useStore((s) => s.area);
  const setArea = useStore((s) => s.setArea);
  const cart = useStore((s) => s.cart);
  const flash = useStore((s) => s.flash);
  const wish = useStore((s) => s.wish);
  const t = COPY[lang];
  const nav = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const live = flashLive(flash);
  const { products, pages } = useStorefront();
  const count = ready ? cartCount(cart) : 0;
  const wishCount = ready ? wish.length : 0;
  const firstName = user?.displayName?.split(" ")[0];

  useEffect(() => {
    const unsub = useStore.persist?.onFinishHydration?.(() => setReady(true));
    if (useStore.persist?.hasHydrated?.()) setReady(true);
    return () => unsub?.();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return products.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)).slice(0, 6);
  }, [q, products]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(false);
    void nav({ to: "/shop", search: { q: q.trim() || undefined } });
  }

  const searchField = (id: string) => (
    <form onSubmit={onSearch} className="relative min-w-0 flex-1">
      <div className="search-combo">
        <input
          id={id}
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={t.search}
          autoComplete="off"
        />
        <button type="submit" aria-label={t.go}>
          <Search className="size-4" />
        </button>
      </div>
      {open && suggestions.length > 0 ? (
        <ul className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-lg border border-line bg-card text-fg shadow-pop">
          {suggestions.map((p) => (
            <li key={p.id}>
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-cream"
                onMouseDown={(e) => e.preventDefault()}
              >
                <img src={p.image} alt="" className="size-10 object-contain" />
                <span className="text-sm">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );

  return (
    <div className="min-h-screen bg-bg text-fg" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      {pages.bannerEn || pages.bannerAr ? (
        <Link to="/shop" className="no-print block bg-wine py-2 text-center text-xs font-medium tracking-wide text-cream">
          {lang === "ar" ? pages.bannerAr || pages.bannerEn : pages.bannerEn || pages.bannerAr}
        </Link>
      ) : live ? (
        <Link
          to="/shop"
          search={{ flash: true }}
          className="no-print block bg-wine py-2 text-center text-xs font-medium tracking-wide text-cream"
        >
          {t.live} · {flash.title} — {flash.discount}% {lang === "ar" ? "خصم" : "off"}
        </Link>
      ) : null}

      <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-sm">
        <div className="store-wrap flex items-center gap-3 py-3">
          <Logo compact className="shrink-0" />

          <div className="hidden min-w-0 flex-1 md:block">{searchField("q-desk")}</div>

          <div className="ms-auto flex items-center gap-0.5 text-sm">
            <label className="relative hidden h-11 w-max shrink-0 cursor-pointer items-center gap-1 px-2 text-muted lg:flex">
              <MapPin className="size-3.5 shrink-0 text-wine" />
              <span className="font-medium text-fg">{area}</span>
              <ChevronDown className="size-3.5 shrink-0" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={t.deliverTo}
              >
                {QATAR_AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>

            <div className="flex h-11 items-center gap-1 px-2 text-xs font-semibold" role="group" aria-label="Language">
              <button type="button" onClick={() => setLang("en")} className={lang === "en" ? "text-wine" : "text-muted"}>
                EN
              </button>
              <span className="text-line">/</span>
              <button type="button" onClick={() => setLang("ar")} className={lang === "ar" ? "text-wine" : "text-muted"}>
                AR
              </button>
            </div>

            <Link
              to={user ? "/account" : "/login"}
              className="grid size-11 place-items-center text-fg hover:text-wine sm:hidden"
              aria-label={user ? t.account : t.helloSignIn}
            >
              <User className="size-5" strokeWidth={1.5} />
            </Link>
            <Link
              to={user ? "/account" : "/login"}
              className="hidden h-11 items-center px-2 font-medium text-fg hover:text-wine sm:flex"
            >
              {isPending ? "…" : user ? (firstName ?? t.account) : t.helloSignIn}
            </Link>

            {isPending ? null : user && isAdminEmail(user.primaryEmail) ? (
              <Link to="/admin" search={{ section: "overview" }} className="hidden h-11 items-center px-2 text-xs font-semibold tracking-wide text-gold lg:flex">
                {t.admin}
              </Link>
            ) : null}

            <Link to="/wishlist" className="relative grid size-11 place-items-center text-fg hover:text-wine" aria-label={t.wishlist}>
              <Heart className="size-5" strokeWidth={1.5} />
              {wishCount > 0 ? <Badge n={wishCount} /> : null}
            </Link>

            <Link to="/cart" className="relative grid size-11 place-items-center text-fg hover:text-wine" aria-label={t.cart}>
              <ShoppingCart className="size-5" strokeWidth={1.5} />
              {count > 0 ? <Badge n={count} /> : null}
            </Link>
          </div>
        </div>

        <div className="store-wrap pb-3 md:hidden">{searchField("q-mobile")}</div>

        <nav className="border-t border-line">
          <div className="store-wrap flex gap-1 overflow-x-auto">
            <Link to="/shop" className="nav-link font-medium text-fg">
              {t.all}
            </Link>
            {live ? (
              <Link to="/shop" search={{ flash: true }} className="nav-link font-medium text-wine">
                {t.flash}
              </Link>
            ) : null}
            {CATEGORIES.map((c) => (
              <Link key={c.id} to="/shop" search={{ category: c.id }} className="nav-link">
                {lang === "ar" ? c.nameAr : c.name}
              </Link>
            ))}
            <Link to="/faq" className="nav-link ms-auto hidden lg:inline-flex">
              {t.service}
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="no-print bg-ink text-cream">
        <div className="store-wrap grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Logo invert />
            <p className="mt-4 max-w-[28ch] text-sm text-cream/70">
              {lang === "ar"
                ? "وجهتك للمنتجات الجيدة بأسعار أوضح."
                : "Your one-stop destination for quality products at unbeatable prices."}
            </p>
          </div>
          <FooterCol title={lang === "ar" ? "من نحن" : "About Us"}>
            <Link to="/about">{lang === "ar" ? "قصتنا" : "Our Story"}</Link>
            <Link to="/blog">{lang === "ar" ? "المدونة" : "Blog"}</Link>
            <Link to="/sell" className="font-semibold text-gold">{lang === "ar" ? "كن بائعاً" : "Become a Seller"}</Link>
          </FooterCol>
          <FooterCol title={lang === "ar" ? "خدمة العملاء" : "Customer Service"}>
            <Link to="/contact">{lang === "ar" ? "اتصل بنا" : "Contact Us"}</Link>
            <Link to="/track">{lang === "ar" ? "تتبع الطلب" : "Track Order"}</Link>
            <Link to="/returns">{lang === "ar" ? "الإرجاع" : "Returns"}</Link>
            <Link to="/shipping">{lang === "ar" ? "الشحن" : "Shipping Info"}</Link>
            <Link to="/faq">FAQ</Link>
          </FooterCol>
          <FooterCol title={t.categories}>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link key={c.id} to="/shop" search={{ category: c.id }}>
                {lang === "ar" ? c.nameAr : c.name}
              </Link>
            ))}
          </FooterCol>
          <FooterCol title={lang === "ar" ? "قانوني" : "Legal"}>
            <Link to="/privacy">{t.privacy}</Link>
            <Link to="/terms">{t.terms}</Link>
            <Link to="/cookies">{lang === "ar" ? "ملفات الارتباط" : "Cookie Policy"}</Link>
            <Link to="/accessibility">{lang === "ar" ? "إمكانية الوصول" : "Accessibility"}</Link>
          </FooterCol>
        </div>
        <div className="border-t border-white/20">
          <p className="store-wrap py-4 text-center text-sm text-cream/70">
            © {new Date().getFullYear()} 11-11 | {lang === "ar" ? "جميع الحقوق محفوظة" : "All Rights Reserved."}
          </p>
        </div>
      </footer>
      <CookieNote />
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute end-1 top-1 grid min-w-4 place-items-center rounded-full bg-wine px-1 text-[10px] font-semibold text-cream">
      {n}
    </span>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-sm text-cream/75">
      <p className="mb-2 text-sm font-semibold text-cream">{title}</p>
      <div className="flex flex-col gap-2 [&_a]:hover:text-cream">{children}</div>
    </div>
  );
}

function CookieNote() {
  const lang = useStore((s) => s.lang);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(window.localStorage.getItem("t1111-cookies") === "1");
  }, []);
  if (ok) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card px-4 py-3 text-sm text-fg shadow-pop">
      <div className="store-wrap flex flex-wrap items-center justify-between gap-3">
        <p>
          {lang === "ar" ? (
            <>
              نستخدم ملفات الارتباط. راجع <Link to="/privacy" className="text-wine underline">سياسة الخصوصية</Link>.
            </>
          ) : (
            <>
              We use cookies. See our <Link to="/privacy" className="text-wine underline">Privacy Policy</Link>.
            </>
          )}
        </p>
        <button
          type="button"
          className="h-11 rounded-md bg-wine px-4 font-medium text-cream"
          onClick={() => {
            window.localStorage.setItem("t1111-cookies", "1");
            setOk(true);
          }}
        >
          {lang === "ar" ? "موافق" : "Agree"}
        </button>
      </div>
    </div>
  );
}
