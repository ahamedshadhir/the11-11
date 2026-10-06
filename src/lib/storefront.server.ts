import { randomUUID } from "node:crypto";
import { isAdminEmail } from "@/lib/admin";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/catalog";
import { getSql } from "@/lib/db";
import {
  mergePages,
  type BulkResult,
  type ProductInput,
  type StorePages,
  type StoreUser,
  type StorefrontPayload,
} from "@/lib/storefront-types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  category_id: string;
  price: number | string;
  compare_at: number | string;
  stock: number | string;
  rating: number | string;
  reviews: number | string;
};

function num(value: number | string, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    imageHero: row.image,
    categoryId: row.category_id,
    price: Math.round(num(row.price)),
    compareAt: Math.round(num(row.compare_at, num(row.price))),
    stock: Math.max(0, Math.round(num(row.stock, 24))),
    rating: Math.min(5, Math.max(0, num(row.rating, 4.5))),
    reviews: Math.max(0, Math.round(num(row.reviews, 0))),
  };
}

export function mergeCatalog(custom: Product[], hidden: string[]): Product[] {
  const hide = new Set(hidden);
  const overrides = new Map(custom.map((p) => [p.id, p]));
  const out: Product[] = [];
  for (const product of PRODUCTS) {
    if (hide.has(product.id)) continue;
    const next = overrides.get(product.id);
    out.push(next ?? product);
    overrides.delete(product.id);
  }
  for (const product of overrides.values()) {
    if (!hide.has(product.id)) out.push(product);
  }
  return out;
}

async function profile(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string | null; name: string | null }>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  return rows[0] ?? { email: null, name: null };
}

export async function assertAdmin(userId: string) {
  const who = await profile(userId);
  if (isAdminEmail(who.email)) return who;
  const sql = await getSql();
  const roles = await sql<{ role: string }>`
    select role from store_roles where user_id = ${userId} limit 1
  `;
  if (roles[0]?.role === "admin") return who;
  throw new Error("Forbidden");
}

export async function adminAccessFor(userId: string) {
  try {
    const who = await assertAdmin(userId);
    return { ok: true as const, email: who.email ?? "", name: who.name ?? "" };
  } catch {
    const who = await profile(userId);
    return { ok: false as const, email: who.email ?? "", name: who.name ?? "" };
  }
}

async function readRows() {
  const sql = await getSql();
  const products = await sql<ProductRow>`
    select id, slug, name, description, image, category_id, price, compare_at, stock, rating, reviews
    from store_products
    order by created_at desc
  `;
  const hidden = await sql<{ id: string }>`select id from store_hidden_products`;
  const settings = await sql<{ pages: unknown }>`
    select pages from store_settings where id = 'main' limit 1
  `;
  let pagesRaw: unknown = settings[0]?.pages ?? {};
  if (typeof pagesRaw === "string") {
    try {
      pagesRaw = JSON.parse(pagesRaw);
    } catch {
      pagesRaw = {};
    }
  }
  return {
    custom: products.map(asProduct),
    hidden: hidden.map((row) => row.id),
    pages: mergePages(pagesRaw),
  };
}

export async function loadStorefront(): Promise<StorefrontPayload> {
  const data = await readRows();
  return { products: mergeCatalog(data.custom, data.hidden), pages: data.pages };
}

export async function loadCatalogProducts() {
  const data = await loadStorefront();
  return data.products;
}

function cleanImage(raw: string) {
  const image = raw.trim();
  if (
    image.startsWith("/") &&
    !image.startsWith("//") &&
    !image.includes("..") &&
    !image.includes("\\") &&
    image.length <= 500
  ) {
    return image;
  }
  if (!/^https?:\/\//i.test(image)) return "";
  if (image.length > 2000) return "";
  try {
    const url = new URL(image);
    return url.toString();
  } catch {
    return "";
  }
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "product";
}

function categoryId(raw: string) {
  const value = raw.trim().toLowerCase();
  if (!value) return "";
  const hit = CATEGORIES.find(
    (c) =>
      c.id === value ||
      c.name.toLowerCase() === value ||
      c.nameAr === raw.trim() ||
      c.name.toLowerCase().includes(value) ||
      value.includes(c.id),
  );
  return hit?.id ?? "";
}

function money(raw: string) {
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

function normalizeInput(input: ProductInput, id?: string, reviews = 0): Product {
  const name = input.name.trim().slice(0, 140);
  const image = cleanImage(input.image);
  const category = categoryId(input.categoryId) || (CATEGORIES.some((c) => c.id === input.categoryId) ? input.categoryId : "");
  if (name.length < 2) throw new Error("Product name is required");
  if (!image) throw new Error("Image must be a site path or an https link");
  if (!category) {
    throw new Error(`Pick a department: ${CATEGORIES.map((c) => c.name).join(", ")}`);
  }
  const price = Math.round(Number(input.price));
  if (!Number.isFinite(price) || price < 1) throw new Error("Price must be at least 1 QAR");
  const stock = Math.max(0, Math.min(9999, Math.round(Number(input.stock) || 0)));
  const rating = Math.min(5, Math.max(0, Number(input.rating) || 4.5));
  const compareAt = Math.max(price, Math.round(Number(input.compareAt) || Math.round(price * 1.18)));
  const slug = slugify(name);
  return {
    id: id || `c-${slug}`,
    slug,
    name,
    description: input.description.trim().slice(0, 800),
    image,
    imageHero: image,
    categoryId: category,
    price,
    compareAt,
    stock,
    rating,
    reviews,
  };
}

async function uniqueSlug(slug: string, id: string) {
  const sql = await getSql();
  let next = slug;
  for (let i = 2; i < 40; i += 1) {
    const rows = await sql<{ id: string }>`select id from store_products where slug = ${next} limit 1`;
    if (!rows[0] || rows[0].id === id) return next;
    next = `${slug}-${i}`;
  }
  return `${slug}-${randomUUID().slice(0, 6)}`;
}

async function writeProduct(product: Product, updating: boolean) {
  const sql = await getSql();
  const slug = await uniqueSlug(product.slug, product.id);
  const saved = { ...product, slug };
  if (updating) {
    await sql`
      update store_products set
        slug = ${saved.slug},
        name = ${saved.name},
        description = ${saved.description},
        image = ${saved.image},
        category_id = ${saved.categoryId},
        price = ${saved.price},
        compare_at = ${saved.compareAt},
        stock = ${saved.stock},
        rating = ${saved.rating},
        reviews = ${saved.reviews}
      where id = ${saved.id}
    `;
  } else {
    await sql`
      insert into store_products
        (id, slug, name, description, image, category_id, price, compare_at, stock, rating, reviews)
      values (
        ${saved.id}, ${saved.slug}, ${saved.name}, ${saved.description}, ${saved.image},
        ${saved.categoryId}, ${saved.price}, ${saved.compareAt}, ${saved.stock}, ${saved.rating}, ${saved.reviews}
      )
    `;
  }
  await sql`delete from store_hidden_products where id = ${saved.id}`;
  return saved;
}

export async function saveProductForAdmin(userId: string, input: ProductInput) {
  await assertAdmin(userId);
  const catalog = PRODUCTS.find((p) => p.id === input.id);
  const sql = await getSql();
  const existing = input.id
    ? await sql<{ id: string }>`select id from store_products where id = ${input.id} limit 1`
    : [];
  const id = input.id || `c-${slugify(input.name)}-${randomUUID().slice(0, 4)}`;
  const product = normalizeInput(
    { ...input, categoryId: input.categoryId || catalog?.categoryId || "" },
    id,
    catalog?.reviews ?? 0,
  );
  const already =
    existing[0] ||
    (catalog
      ? (await sql<{ id: string }>`select id from store_products where id = ${product.id} limit 1`)[0]
      : undefined);
  return writeProduct(product, Boolean(already));
}

export async function removeProductForAdmin(userId: string, id: string) {
  await assertAdmin(userId);
  const sql = await getSql();
  const catalog = PRODUCTS.some((p) => p.id === id);
  await sql`delete from store_products where id = ${id}`;
  if (catalog) {
    await sql`
      insert into store_hidden_products (id) values (${id})
      on conflict (id) do nothing
    `;
  }
  return { ok: true };
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (quoted) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((line) => line.some((part) => part.trim()));
}

const HEADER_ALIAS: Record<string, string> = {
  name: "name",
  product: "name",
  title: "name",
  description: "description",
  details: "description",
  category: "category",
  department: "category",
  category_id: "category",
  price: "price",
  qar: "price",
  compare_at: "compare_at",
  compare: "compare_at",
  was: "compare_at",
  stock: "stock",
  qty: "stock",
  quantity: "stock",
  rating: "rating",
  image: "image",
  image_url: "image",
  photo: "image",
  picture: "image",
  action: "action",
};

export async function importProductsForAdmin(userId: string, csv: string): Promise<BulkResult> {
  await assertAdmin(userId);
  if (csv.length > 500_000) throw new Error("File is too large");
  const table = parseCsv(csv);
  if (table.length < 2) throw new Error("The file needs a header row and at least one product");
  const headers = table[0].map((h) => HEADER_ALIAS[h.trim().toLowerCase().replace(/\s+/g, "_")] ?? "");
  if (!headers.includes("name") || !headers.includes("image")) {
    throw new Error("Template must include name and image columns");
  }
  const result: BulkResult = { added: 0, updated: 0, removed: 0, skipped: [] };
  const live = await readRows();
  const known = mergeCatalog(live.custom, live.hidden);

  for (let i = 1; i < Math.min(table.length, 501); i += 1) {
    const cells = table[i];
    const record: Record<string, string> = {};
    headers.forEach((key, index) => {
      if (key) record[key] = (cells[index] ?? "").trim();
    });
    const action = (record.action || "add").toLowerCase();
    try {
      if (action === "remove" || action === "delete") {
        const name = record.name.toLowerCase();
        const hit =
          known.find((p) => p.name.toLowerCase() === name || p.slug === slugify(record.name)) ??
          live.custom.find((p) => p.name.toLowerCase() === name);
        if (!hit) throw new Error("No matching product to remove");
        await removeProductForAdmin(userId, hit.id);
        result.removed += 1;
        continue;
      }
      const category = categoryId(record.category || "");
      const price = money(record.price || "");
      const image = cleanImage(record.image || "");
      if (!record.name) throw new Error("Missing name");
      if (!image) throw new Error("Image must be a site path or an https link");
      if (!category) throw new Error(`Unknown department “${record.category || ""}”`);
      if (!price) throw new Error("Price must be a number in QAR");
      const slug = slugify(record.name);
      const existing =
        live.custom.find((p) => p.slug === slug || p.name.toLowerCase() === record.name.toLowerCase()) ??
        known.find((p) => p.name.toLowerCase() === record.name.toLowerCase());
      const input: ProductInput = {
        id: existing?.id,
        name: record.name,
        description: record.description || existing?.description || "",
        categoryId: category,
        price,
        compareAt: money(record.compare_at || "") || Math.round(price * 1.18),
        stock: record.stock ? Math.round(Number(record.stock)) : existing?.stock || 24,
        rating: record.rating ? Number(record.rating) : existing?.rating || 4.5,
        image,
      };
      const saved = await saveProductForAdmin(userId, input);
      if (existing) result.updated += 1;
      else result.added += 1;
      const idx = live.custom.findIndex((p) => p.id === saved.id);
      if (idx >= 0) live.custom[idx] = saved;
      else live.custom.unshift(saved);
    } catch (err) {
      result.skipped.push({ row: i + 1, reason: err instanceof Error ? err.message : "Could not read this row" });
    }
  }
  return result;
}

export async function savePagesForAdmin(userId: string, pages: StorePages) {
  await assertAdmin(userId);
  const next = mergePages(pages);
  const sql = await getSql();
  const json = JSON.stringify(next);
  await sql`
    insert into store_settings (id, pages)
    values ('main', ${json}::jsonb)
    on conflict (id) do update set pages = excluded.pages, updated_at = now()
  `;
  return next;
}

export async function listUsersForAdmin(userId: string): Promise<StoreUser[]> {
  await assertAdmin(userId);
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    email: string;
    created_at: string | Date;
    role: string | null;
    orders: number | string;
  }>`
    select u.id, u.name, u.email, u."createdAt" as created_at, r.role,
      (select count(*) from store_orders o where o.user_id = u.id) as orders
    from "user" u
    left join store_roles r on r.user_id = u.id
    order by u."createdAt" desc
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    role: row.role === "admin" || isAdminEmail(row.email) ? "admin" : "customer",
    orders: Math.round(num(row.orders)),
    locked: isAdminEmail(row.email),
  }));
}

export async function setUserRoleForAdmin(userId: string, targetId: string, role: "admin" | "customer") {
  await assertAdmin(userId);
  const sql = await getSql();
  const rows = await sql<{ email: string }>`select email from "user" where id = ${targetId} limit 1`;
  if (!rows[0]) throw new Error("Account not found");
  if (isAdminEmail(rows[0].email)) throw new Error("The store owner stays an admin");
  const next = role === "admin" ? "admin" : "customer";
  await sql`
    insert into store_roles (user_id, role)
    values (${targetId}, ${next})
    on conflict (user_id) do update set role = excluded.role, updated_at = now()
  `;
  return { ok: true };
}
