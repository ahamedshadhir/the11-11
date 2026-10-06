import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/cookies")({
  component: () => (
    <InfoPage
      title="Cookie Policy"
      titleAr="ملفات الارتباط"
      body="We use cookies to keep your cart, language and sign-in working. You can refuse non-essential cookies. Order data is stored in the database, not in advertising cookies."
      bodyAr="نستخدم ملفات الارتباط لإبقاء السلة واللغة وتسجيل الدخول. بيانات الطلب تُحفظ في قاعدة البيانات."
    />
  ),
});
