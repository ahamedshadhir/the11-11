import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/catalog";
import { COPY } from "@/lib/i18n";
import { importCatalogCsv, reloadStorefront, removeCatalogProduct, saveCatalogProduct } from "@/lib/storefront";
import { PRODUCT_TEMPLATE, type ProductInput } from "@/lib/storefront-types";
import { useStore } from "@/lib/store";
import { qar } from "@/lib/utils";

const empty = (): ProductInput => ({
  name: "",
  description: "",
  categoryId: "home",
  price: 99,
  compareAt: 0,
  stock: 24,
  rating: 4.5,
  image: "",
});

export function AdminProducts({ products }: { products: Product[] }) {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<ProductInput>(empty());
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState("");
  const catalogIds = useMemo(() => new Set(PRODUCTS.map((p) => p.id)), []);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
  }, [products, q]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveCatalogProduct({ data: draft });
      await reloadStorefront();
      setDraft(empty());
      toast.success(t.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string) {
    if (!window.confirm(t.removeProduct)) return;
    try {
      await removeCatalogProduct({ data: id });
      await reloadStorefront();
      toast.success(t.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  }

  function downloadTemplate() {
    const blob = new Blob([PRODUCT_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "11-11-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File) {
    setBusy(true);
    setReport("");
    try {
      const text = await file.text();
      const result = await importCatalogCsv({ data: text });
      await reloadStorefront();
      const skipped = result.skipped.slice(0, 6).map((row) => `Row ${row.row}: ${row.reason}`).join(" · ");
      setReport(
        `${t.addedN} ${result.added} · ${t.updatedN} ${result.updated} · ${t.removedN} ${result.removed} · ${t.skippedN} ${result.skipped.length}${skipped ? ` — ${skipped}` : ""}`,
      );
      toast.success(t.standardized);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="page-title text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.products}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t.bulkHelp}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={downloadTemplate}>
          {t.downloadTemplate}
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-wine px-4 text-sm font-medium text-cream">
          {busy ? "…" : t.uploadCsv}
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onFile(file);
            }}
          />
        </label>
      </div>
      {report ? <p className="mt-3 text-sm text-wine">{report}</p> : null}

      <form onSubmit={onSave} className="panel mt-6 grid gap-3 p-5 md:grid-cols-2">
        <p className="font-display text-xl text-wine md:col-span-2">{draft.id ? t.edit : t.newProduct}</p>
        <label className="text-sm">
          {t.productName}
          <input required className="field mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label className="text-sm">
          {t.categories}
          <select className="field mt-1" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ar" ? c.nameAr : c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          {t.description}
          <textarea className="field mt-1 min-h-20" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </label>
        <label className="text-sm">
          {t.price}
          <input required type="number" min={1} className="field mt-1" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          {t.stock}
          <input type="number" min={0} className="field mt-1" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
        </label>
        <label className="text-sm md:col-span-2">
          {t.imageUrl}
          <input required type="url" className="field mt-1" placeholder="https://" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        </label>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button type="submit" disabled={busy}>
            {draft.id ? t.save : t.addProduct}
          </Button>
          {draft.id ? (
            <Button type="button" variant="outline" onClick={() => setDraft(empty())}>
              {t.cancel}
            </Button>
          ) : null}
        </div>
      </form>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="field mt-6 max-w-sm" />
      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-start text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t.products}</th>
              <th className="px-4 py-3 font-medium">{t.categories}</th>
              <th className="px-4 py-3 font-medium">{t.price}</th>
              <th className="px-4 py-3 font-medium">{t.stock}</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <img src={p.image} alt="" className="size-10 object-contain" />
                    <span>
                      <span className="block font-medium">{p.name}</span>
                      <span className="text-xs text-muted">{catalogIds.has(p.id) ? t.sourceCatalog : t.sourceCustom}</span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">{CATEGORIES.find((c) => c.id === p.categoryId)?.name}</td>
                <td className="px-4 py-3 tabular-nums">{qar(p.price)}</td>
                <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                <td className="px-4 py-3 text-end">
                  <button
                    type="button"
                    className="min-h-11 px-2 text-wine hover:underline"
                    onClick={() =>
                      setDraft({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        categoryId: p.categoryId,
                        price: p.price,
                        compareAt: p.compareAt,
                        stock: p.stock,
                        rating: p.rating,
                        image: p.image,
                      })
                    }
                  >
                    {t.edit}
                  </button>
                  <button type="button" className="min-h-11 px-2 text-muted hover:text-wine" onClick={() => void onRemove(p.id)}>
                    {t.remove}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
