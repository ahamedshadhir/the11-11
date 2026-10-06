import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/shipping")({
  component: () => (
    <InfoPage
      title="Shipping Info"
      titleAr="الشحن"
      body="Free delivery on orders over QAR 50. Most Doha orders arrive the next day. Al Wakrah, Al Rayyan, Lusail and Al Khor usually take 1–3 days."
      bodyAr="توصيل مجاني للطلبات فوق 50 ريالاً قطرياً. معظم طلبات الدوحة تصل في اليوم التالي."
    />
  ),
});
