import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

export const Route = createFileRoute("/blog")({
  component: () => (
    <InfoPage
      title="Blog"
      titleAr="المدونة"
      body="Guides for phones, laptops and everyday fashion in Qatar will land here. For now, shop the live catalogue — prices are in QAR."
      bodyAr="مقالات عن الهواتف والحواسيب والأزياء في قطر ستظهر هنا. الأسعار بالريال القطري."
    />
  ),
});
