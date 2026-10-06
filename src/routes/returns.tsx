import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/returns")({
  component: () => (
    <InfoPage
      title="Returns"
      titleAr="الإرجاع"
      body="Easy returns within 14 days of delivery for unused items in original packaging. Contact support with your order number and we will arrange collection in Qatar."
      bodyAr="إرجاع سهل خلال 14 يوماً من التسليم للمنتجات غير المستخدمة في تغليفها الأصلي."
    />
  ),
});
