import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/faq")({ component: Faq });

const QA = {
  en: [
    {
      q: "How long does delivery take?",
      a: "Most Doha orders arrive the next day. Al Wakrah, Al Rayyan, Lusail and Al Khor usually take 1–3 days.",
    },
    {
      q: "What is the return window?",
      a: "30 days from delivery for unused items in original packaging. Fashion with hygiene seals cannot be returned once opened.",
    },
    {
      q: "Do you accept cash on delivery?",
      a: "Yes. Cash on delivery is available across Qatar. SkipCash is the prepaid option at checkout.",
    },
    {
      q: "Are product photos the actual items?",
      a: "Yes. Every listing uses a matching studio packshot of that product on white — the name and the picture are the same piece.",
    },
    {
      q: "How does SkipCash work?",
      a: "Sign in, place the order, and we save it immediately. You then pay on SkipCash (or the in-store card page if SkipCash keys are not on this environment). Card numbers are never stored. Cash on delivery skips the card step.",
    },
    {
      q: "How do flash sales work?",
      a: "When a sale is live, the banner, countdown and strikethrough price apply only to the selected SKUs until the clock runs out.",
    },
  ],
  ar: [
    {
      q: "كم يستغرق التوصيل؟",
      a: "معظم طلبات الدوحة تصل في اليوم التالي. الوكرة والريان ولوسيل والخور عادة خلال 1–3 أيام.",
    },
    {
      q: "ما مدة الإرجاع؟",
      a: "30 يوماً من التسليم للمنتجات غير المستخدمة في تغليفها الأصلي.",
    },
    {
      q: "هل تقبلون الدفع عند الاستلام؟",
      a: "نعم، كاش عند الاستلام في قطر. سكيبكاش هو خيار الدفع المسبق.",
    },
    {
      q: "هل صور المنتجات مطابقة؟",
      a: "نعم. كل منتج يظهر بصورة استوديو مطابقة على خلفية بيضاء.",
    },
    {
      q: "كيف يعمل سكيبكاش؟",
      a: "سجّل الدخول وأكّد الطلب فيُحفظ فوراً، ثم ادفع عبر سكيبكاش. لا نحتفظ بأرقام البطاقات. الدفع عند الاستلام يتجاوز خطوة البطاقة.",
    },
    {
      q: "كيف يعمل العرض الخاطف؟",
      a: "عند تفعيله يظهر الشريط والعداد والسعر المشطوب على المنتجات المختارة حتى انتهاء الوقت.",
    },
  ],
};

function Faq() {
  const lang = useStore((s) => s.lang);
  const { pages } = useStorefront();
  const t = COPY[lang];
  const items = pages.faq.map((item) => (lang === "ar" ? { q: item.qAr, a: item.aAr } : { q: item.q, a: item.a }));
  return (
    <Shell>
      <div className="store-wrap max-w-2xl py-16">
        <h1 className="page-title">{t.faq}</h1>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-gold" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Shell>
  );
}
