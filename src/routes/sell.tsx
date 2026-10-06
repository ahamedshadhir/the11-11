import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/sell")({
  component: () => (
    <InfoPage
      title="Become a Seller"
      titleAr="كن بائعاً"
      body="Sell on 11-11 in Qatar. Write to support with your trade name, category and contact number. We review applications before a shop goes live."
      bodyAr="بع على 11-11 في قطر. أرسل الاسم التجاري والفئة ورقم التواصل وسنراجع الطلب قبل فتح المتجر."
    />
  ),
});
