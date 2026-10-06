import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { reloadStorefront, saveStorePages, useStorefront } from "@/lib/storefront";
import type { StorePages } from "@/lib/storefront-types";
import { useStore } from "@/lib/store";

const SECTIONS = ["store", "home", "about", "faq", "contact", "privacy", "terms"] as const;

export function AdminPages() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const { pages } = useStorefront();
  const [draft, setDraft] = useState<StorePages>(pages);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("store");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(pages);
  }, [pages]);

  function set<K extends keyof StorePages>(key: K, value: StorePages[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveStorePages({ data: draft });
      await reloadStorefront();
      toast.success(t.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const labels: Record<(typeof SECTIONS)[number], string> = {
    store: t.storeSettings,
    home: t.pageHome,
    about: t.pageAbout,
    faq: t.pageFaq,
    contact: t.pageContact,
    privacy: t.pagePrivacy,
    terms: t.pageTerms,
  };

  return (
    <form onSubmit={onSave}>
      <h1 className="page-title text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.platformManagement}</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">{t.platformManagementHelp}</p>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm ${section === id ? "border-wine font-medium text-wine" : "border-transparent text-muted"}`}
          >
            {labels[id]}
          </button>
        ))}
      </div>
      <div className="panel mt-4 grid gap-3 p-5">
        {section === "store" ? (
          <>
            <Field label={`${t.pageBanner} EN`} value={draft.bannerEn} onChange={(v) => set("bannerEn", v)} />
            <Field label={`${t.pageBanner} AR`} value={draft.bannerAr} onChange={(v) => set("bannerAr", v)} />
            <Field label={t.email} value={draft.contactEmail} onChange={(v) => set("contactEmail", v)} />
            <Area label={`${t.deliveryNoteLabel} EN`} value={draft.deliveryNote} onChange={(v) => set("deliveryNote", v)} />
            <Area label={`${t.deliveryNoteLabel} AR`} value={draft.deliveryNoteAr} onChange={(v) => set("deliveryNoteAr", v)} />
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" checked={draft.codEnabled} onChange={(e) => set("codEnabled", e.target.checked)} />
              {t.cod}
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.skipcashEnabled}
                onChange={(e) => set("skipcashEnabled", e.target.checked)}
              />
              {t.skipcash}
            </label>
          </>
        ) : null}
        {section === "home" ? (
          <>
            <Field label={`${t.heroTitleLabel} EN`} value={draft.homeTitle} onChange={(v) => set("homeTitle", v)} />
            <Field label={`${t.heroTitleLabel} AR`} value={draft.homeTitleAr} onChange={(v) => set("homeTitleAr", v)} />
            <Area label="EN" value={draft.homeText} onChange={(v) => set("homeText", v)} />
            <Area label="AR" value={draft.homeTextAr} onChange={(v) => set("homeTextAr", v)} />
            <Field label={t.imageUrl} value={draft.heroImage} onChange={(v) => set("heroImage", v)} />
            <Field label={t.heroCaption} value={draft.heroCaption} onChange={(v) => set("heroCaption", v)} />
            <Field label="Slug" value={draft.heroSlug} onChange={(v) => set("heroSlug", v)} />
          </>
        ) : null}
        {section === "about" ? (
          <>
            <Field label="EN" value={draft.aboutTitle} onChange={(v) => set("aboutTitle", v)} />
            <Field label="AR" value={draft.aboutTitleAr} onChange={(v) => set("aboutTitleAr", v)} />
            <Area label="EN" value={draft.aboutBody} onChange={(v) => set("aboutBody", v)} />
            <Area label="AR" value={draft.aboutBodyAr} onChange={(v) => set("aboutBodyAr", v)} />
          </>
        ) : null}
        {section === "contact" ? (
          <>
            <Field label="EN" value={draft.contactBlurb} onChange={(v) => set("contactBlurb", v)} />
            <Field label="AR" value={draft.contactBlurbAr} onChange={(v) => set("contactBlurbAr", v)} />
            <Field label={t.email} value={draft.contactEmail} onChange={(v) => set("contactEmail", v)} />
          </>
        ) : null}
        {section === "privacy" ? (
          <>
            <Area label="EN" value={draft.privacyBody} onChange={(v) => set("privacyBody", v)} />
            <Area label="AR" value={draft.privacyBodyAr} onChange={(v) => set("privacyBodyAr", v)} />
          </>
        ) : null}
        {section === "terms" ? (
          <>
            <Area label="EN" value={draft.termsBody} onChange={(v) => set("termsBody", v)} />
            <Area label="AR" value={draft.termsBodyAr} onChange={(v) => set("termsBodyAr", v)} />
          </>
        ) : null}
        {section === "faq" ? (
          <div className="space-y-4">
            {draft.faq.map((item, index) => (
              <div key={index} className="grid gap-2 border-b border-line pb-4">
                <Field label="Q EN" value={item.q} onChange={(v) => patchFaq(index, { q: v })} />
                <Area label="A EN" value={item.a} onChange={(v) => patchFaq(index, { a: v })} />
                <Field label="Q AR" value={item.qAr} onChange={(v) => patchFaq(index, { qAr: v })} />
                <Area label="A AR" value={item.aAr} onChange={(v) => patchFaq(index, { aAr: v })} />
                <button type="button" className="w-fit text-sm text-muted hover:text-wine" onClick={() => set("faq", draft.faq.filter((_, i) => i !== index))}>
                  {t.remove}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-medium text-wine"
              onClick={() => set("faq", [...draft.faq, { q: "", a: "", qAr: "", aAr: "" }])}
            >
              {t.addProduct}
            </button>
          </div>
        ) : null}
        <Button type="submit" disabled={busy} className="w-fit">
          {busy ? "…" : t.savePages}
        </Button>
      </div>
    </form>
  );

  function patchFaq(index: number, patch: Partial<StorePages["faq"][number]>) {
    set(
      "faq",
      draft.faq.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea className="field mt-1 min-h-28" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
