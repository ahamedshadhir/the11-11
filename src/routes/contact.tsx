import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useStorefront } from "@/lib/storefront";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const { pages } = useStorefront();
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    toast.success(t.sent);
    e.currentTarget.reset();
  }

  return (
    <Shell>
      <div className="store-wrap grid max-w-4xl items-start gap-12 py-16 lg:grid-cols-2">
        <div>
          <p className="kicker">11-11</p>
          <h1 className="page-title mt-3">{t.contact}</h1>
          <p className="mt-4 text-muted">
            {lang === "ar" ? pages.contactBlurbAr : pages.contactBlurb} · {pages.contactEmail}
          </p>
          <p className="mt-2 text-sm text-muted">{t.deliveryNote}</p>
        </div>
        <form onSubmit={onSubmit} className="panel p-6 sm:p-8">
          <label className="text-sm">
            {t.name}
            <input required name="name" className="field mt-1" />
          </label>
          <label className="mt-3 block text-sm">
            {t.email}
            <input required type="email" name="email" className="field mt-1" />
          </label>
          <label className="mt-3 block text-sm">
            {t.message}
            <textarea required name="message" rows={5} className="field mt-1" />
          </label>
          <Button className="mt-4 w-full" type="submit">
            {sent ? t.sent : t.send}
          </Button>
        </form>
      </div>
    </Shell>
  );
}
