import { HERO_IMAGE, type Product } from "@/lib/catalog";

export type FaqItem = { q: string; a: string; qAr: string; aAr: string };

export type StorePages = {
  bannerEn: string;
  bannerAr: string;
  homeTitle: string;
  homeTitleAr: string;
  homeText: string;
  homeTextAr: string;
  heroImage: string;
  heroSlug: string;
  heroCaption: string;
  aboutTitle: string;
  aboutTitleAr: string;
  aboutBody: string;
  aboutBodyAr: string;
  contactBlurb: string;
  contactBlurbAr: string;
  contactEmail: string;
  deliveryNote: string;
  deliveryNoteAr: string;
  codEnabled: boolean;
  skipcashEnabled: boolean;
  privacyBody: string;
  privacyBodyAr: string;
  termsBody: string;
  termsBodyAr: string;
  faq: FaqItem[];
};

export type ProductInput = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  compareAt: number;
  stock: number;
  rating: number;
  image: string;
};

export type BulkResult = {
  added: number;
  updated: number;
  removed: number;
  skipped: { row: number; reason: string }[];
};

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: "admin" | "customer";
  orders: number;
  locked: boolean;
};

export type StorefrontPayload = {
  products: Product[];
  pages: StorePages;
};

export const PRODUCT_TEMPLATE = `name,description,category,price,compare_at,stock,rating,image,action
Sample Desk Lamp,Warm light for a Doha apartment,home,249,299,20,4.5,https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp,add
Linen Throw,Soft throw for the sofa,home,189,220,15,4.4,https://cdn.dummyjson.com/product-images/home-decoration/wooden-bathroom-sink-with-mirror/thumbnail.webp,add
`;

export const DEFAULT_PAGES: StorePages = {
  bannerEn: "up to 50% off on selected items",
  bannerAr: "حتى 50% على منتجات مختارة",
  homeTitle: "Huge saving on your favourite products!",
  homeTitleAr: "توفير كبير على منتجاتك المفضلة",
  homeText: "Your one-stop destination for quality products at unbeatable prices.",
  homeTextAr: "وجهتك للمنتجات الجيدة بأسعار أوضح.",
  heroImage: HERO_IMAGE,
  heroSlug: "ultra-slim-gaming-laptop",
  heroCaption: "Ultra Slim Gaming Laptop",
  aboutTitle: "Our Story",
  aboutTitleAr: "قصتنا",
  aboutBody:
    "11-11 is your one-stop destination for quality products at unbeatable prices. Free delivery on orders over QAR 50, secure payment, and a 14-day return window.",
  aboutBodyAr:
    "11-11 وجهتك للمنتجات الجيدة بأسعار أوضح. توصيل مجاني للطلبات فوق 50 ريالاً، دفع آمن، وإرجاع خلال 14 يوماً.",
  contactBlurb: "Doha, Qatar",
  contactBlurbAr: "الدوحة، قطر",
  contactEmail: "support@1111.qa",
  deliveryNote: "Most Doha orders arrive the next day. Cash on delivery and SkipCash.",
  deliveryNoteAr: "معظم طلبات الدوحة تصل في اليوم التالي. الدفع عند الاستلام أو سكيبكاش.",
  codEnabled: true,
  skipcashEnabled: true,
  privacyBody:
    "We keep order details (name, phone, address) to deliver in Qatar. We do not sell your data. Signing in stores orders against your account only.\n\nWe never store card numbers or CVC codes. SkipCash processes the payment on its own page. Cart and wishlist stay on your device.",
  privacyBodyAr:
    "نحتفظ ببيانات الطلب (الاسم، الهاتف، العنوان) لإتمام التوصيل داخل قطر. لا نبيع بياناتك. تسجيل الدخول يحفظ الطلبات في حسابك فقط.\n\nلا نخزّن أرقام البطاقات أو رموز الأمان. سكيبكاش يعالج الدفع على صفحته. السلة والمفضلة تُحفظ على جهازك.",
  termsBody:
    "Prices are in Qatari Riyal. Orders are subject to stock. Unused items can be returned within 30 days. SkipCash is a licensed payment gateway; every order is saved to the database before you pay. Cash on delivery is available across Qatar.",
  termsBodyAr:
    "الأسعار بالريال القطري. الطلبات تخضع للتوفر. الإرجاع خلال 30 يوماً للمنتجات غير المستخدمة. سكيبكاش بوابة دفع مرخّصة؛ يُحفظ الطلب في قاعدة البيانات قبل الدفع. الدفع عند الاستلام متاح في قطر.",
  faq: [
    {
      q: "How long does delivery take?",
      a: "Most Doha orders arrive the next day. Al Wakrah, Al Rayyan, Lusail and Al Khor usually take 1–3 days.",
      qAr: "كم يستغرق التوصيل؟",
      aAr: "معظم طلبات الدوحة تصل في اليوم التالي. الوكرة والريان ولوسيل والخور عادة خلال 1–3 أيام.",
    },
    {
      q: "What is the return window?",
      a: "30 days from delivery for unused items in original packaging. Fashion with hygiene seals cannot be returned once opened.",
      qAr: "ما مدة الإرجاع؟",
      aAr: "30 يوماً من التسليم للمنتجات غير المستخدمة في تغليفها الأصلي.",
    },
    {
      q: "Do you accept cash on delivery?",
      a: "Yes. Cash on delivery is available across Qatar. SkipCash is the prepaid option at checkout.",
      qAr: "هل تقبلون الدفع عند الاستلام؟",
      aAr: "نعم، كاش عند الاستلام في قطر. سكيبكاش هو خيار الدفع المسبق.",
    },
    {
      q: "Are product photos the actual items?",
      a: "Yes. Every listing uses a matching studio packshot of that product on white — the name and the picture are the same piece.",
      qAr: "هل صور المنتجات مطابقة؟",
      aAr: "نعم. كل منتج يظهر بصورة استوديو مطابقة على خلفية بيضاء.",
    },
    {
      q: "How does SkipCash work?",
      a: "Sign in, place the order, and we save it immediately. You then pay on SkipCash. Card numbers are never stored. Cash on delivery skips the card step.",
      qAr: "كيف يعمل سكيبكاش؟",
      aAr: "سجّل الدخول وأكّد الطلب فيُحفظ فوراً، ثم ادفع عبر سكيبكاش. لا نحتفظ بأرقام البطاقات. الدفع عند الاستلام يتجاوز خطوة البطاقة.",
    },
    {
      q: "How do flash sales work?",
      a: "When a sale is live, the banner, countdown and strikethrough price apply only to the selected SKUs until the clock runs out.",
      qAr: "كيف يعمل العرض الخاطف؟",
      aAr: "عند تفعيله يظهر الشريط والعداد والسعر المشطوب على المنتجات المختارة حتى انتهاء الوقت.",
    },
  ],
};

export function mergePages(raw: unknown): StorePages {
  const base = { ...DEFAULT_PAGES, faq: DEFAULT_PAGES.faq.map((item) => ({ ...item })) };
  if (!raw || typeof raw !== "object") return base;
  const src = raw as Partial<StorePages>;
  for (const key of Object.keys(base) as (keyof StorePages)[]) {
    if (key === "faq") continue;
    if (key === "codEnabled" || key === "skipcashEnabled") {
      if (typeof src[key] === "boolean") base[key] = src[key];
      continue;
    }
    const value = src[key];
    if (typeof value === "string") base[key] = value;
  }
  if (Array.isArray(src.faq) && src.faq.length) {
    base.faq = src.faq
      .filter((item) => item && typeof item.q === "string" && typeof item.a === "string")
      .slice(0, 24)
      .map((item) => ({
        q: String(item.q),
        a: String(item.a),
        qAr: String(item.qAr || item.q),
        aAr: String(item.aAr || item.a),
      }));
  }
  return base;
}

