import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/accessibility")({
  component: () => (
    <InfoPage
      title="Accessibility"
      titleAr="إمكانية الوصول"
      body="Pages use readable type, labelled search, and controls that work with a keyboard. If something blocks you, write to support and we will fix it."
      bodyAr="الصفحات تستخدم نصاً واضحاً وبحثاً معنوناً وعناصر تعمل بلوحة المفاتيح."
    />
  ),
});
