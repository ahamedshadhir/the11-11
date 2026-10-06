import { randomUUID } from "node:crypto";
import { assertAdmin, loadCatalogProducts } from "@/lib/storefront.server";
import { getSql } from "@/lib/db";
import {
  createSkipCashPayment,
  getSkipCashPayment,
  normalizePhone,
  parseSkipCashWebhook,
  publicOrigin,
  skipcashReady,
  splitName,
  statusFromSkipCash,
  verifySkipCashWebhook,
} from "@/lib/skipcash.server";
import {
  defaultFlash,
  normalizeOrder,
  salePrice,
  type Order,
  type OrderStatus,
  type PayMethod,
} from "@/lib/store";

export type CheckoutInput = {
  name: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  pay: PayMethod;
  lines: { id: string; qty: number }[];
};

export type CheckoutResult = {
  order: Order;
  mode: "cod" | "hosted" | "skipcash";
  payUrl: string | null;
  warning?: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  payload: unknown;
  status: string;
  pay: string;
  skipcash_id: string | null;
};

function newOrderId() {
  return `11${Date.now().toString(36)}${randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

async function reprice(lines: { id: string; qty: number }[]) {
  const products = await loadCatalogProducts();
  const out: Order["lines"] = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.id);
    if (!product) throw new Error("An item in your cart is no longer available");
    const qty = Math.floor(Number(line.qty) || 0);
    if (product.stock <= 0 || qty < 1) throw new Error(`${product.name} is out of stock`);
    if (qty > product.stock) throw new Error(`Only ${product.stock} left of ${product.name}`);
    out.push({
      id: product.id,
      name: product.name,
      qty,
      price: salePrice(product, defaultFlash),
    });
  }
  return out;
}

async function takeStock(lines: Order["lines"]) {
  const sql = await getSql();
  const rows = await sql.query<{ id: string }>(
    `update store_products as p
     set stock = p.stock - v.qty
     from unnest($1::text[], $2::int[]) as v(id, qty)
     where p.id = v.id
       and (
         select count(*)::int
         from unnest($1::text[], $2::int[]) as c(id, qty)
         join store_products s on s.id = c.id
         where s.stock >= c.qty
       ) = $3
     returning p.id`,
    [lines.map((line) => line.id), lines.map((line) => line.qty), lines.length],
  );
  if (rows.length !== lines.length) throw new Error("Not enough stock for one of these items");
}

async function restoreStock(lines: Order["lines"]) {
  const sql = await getSql();
  await sql.query(
    `update store_products as p
     set stock = p.stock + v.qty
     from unnest($1::text[], $2::int[]) as v(id, qty)
     where p.id = v.id`,
    [lines.map((line) => line.id), lines.map((line) => line.qty)],
  );
}

function parsePayload(payload: unknown): Order {
  const raw = typeof payload === "string" ? JSON.parse(payload) : payload;
  return normalizeOrder(raw as Order);
}

function fromRow(row: OrderRow): Order {
  const order = parsePayload(row.payload);
  const pay: PayMethod = row.pay === "skipcash" || order.pay === "skipcash" ? "skipcash" : "cod";
  const status = (row.status as OrderStatus) || order.status;
  return normalizeOrder({
    ...order,
    pay,
    status,
    skipcashId: row.skipcash_id || order.skipcashId,
  });
}

function validateCheckout(raw: CheckoutInput): CheckoutInput {
  const name = String(raw.name || "").trim();
  const phone = String(raw.phone || "").trim();
  const email = String(raw.email || "").trim();
  const area = String(raw.area || "Doha").trim();
  const address = String(raw.address || "").trim();
  const pay: PayMethod = raw.pay === "skipcash" ? "skipcash" : "cod";
  const lines = Array.isArray(raw.lines)
    ? raw.lines.map((l) => ({
        id: String(l.id || ""),
        qty: Math.max(1, Math.min(99, Math.floor(Number(l.qty) || 1))),
      }))
    : [];
  if (name.length < 2) throw new Error("Name is required");
  if (phone.replace(/\D/g, "").length < 8) throw new Error("A valid phone number is required");
  if (address.length < 4) throw new Error("Delivery address is required");
  if (!lines.length) throw new Error("Your cart is empty");
  return { name, phone, email, area, address, pay, lines };
}

async function userProfile(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string | null; name: string | null }>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  return rows[0] ?? { email: null, name: null };
}

async function insertOrder(userId: string, order: Order) {
  const sql = await getSql();
  await sql`
    insert into store_orders (id, user_id, payload, status, pay, skipcash_id)
    values (
      ${order.id},
      ${userId},
      ${JSON.stringify(order)},
      ${order.status},
      ${order.pay},
      ${order.skipcashId ?? null}
    )
  `;
}

async function updateOwned(userId: string, order: Order) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update store_orders
    set payload = ${JSON.stringify(order)},
        status = ${order.status},
        pay = ${order.pay},
        skipcash_id = coalesce(${order.skipcashId ?? null}, skipcash_id)
    where id = ${order.id} and user_id = ${userId}
    returning id
  `;
  if (!rows[0]) throw new Error("Order not found");
}

async function loadOwned(userId: string, id: string) {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, user_id, payload, status, pay, skipcash_id
    from store_orders
    where id = ${id} and user_id = ${userId}
    limit 1
  `;
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function checkoutOrderForUser(userId: string, raw: CheckoutInput): Promise<CheckoutResult> {
  const data = validateCheckout(raw);
  const lines = await reprice(data.lines);
  if (!lines.length) throw new Error("Your cart is empty");
  const profile = await userProfile(userId);
  const phone = normalizePhone(data.phone) || data.phone;
  const email =
    data.email ||
    profile.email ||
    `${phone.replace(/\D/g, "").slice(-11)}@1111.qa`;
  const total = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const order: Order = {
    id: newOrderId(),
    at: Date.now(),
    name: data.name,
    phone,
    email,
    area: data.area,
    address: data.address,
    pay: data.pay,
    status: data.pay === "skipcash" ? "pending" : "placed",
    total,
    lines,
  };

  await takeStock(lines);
  try {
    await insertOrder(userId, order);
  } catch (err) {
    await restoreStock(lines);
    throw err;
  }

  if (data.pay !== "skipcash") {
    return { order, mode: "cod", payUrl: null };
  }

  if (!skipcashReady()) {
    return { order, mode: "hosted", payUrl: null };
  }

  try {
    const names = splitName(order.name);
    const origin = publicOrigin();
    const payment = await createSkipCashPayment({
      amount: total,
      firstName: names.firstName,
      lastName: names.lastName,
      phone,
      email,
      street: order.address,
      city: order.area || "Doha",
      transactionId: order.id,
      returnUrl: `${origin}/pay/skipcash?id=${encodeURIComponent(order.id)}`,
      webhookUrl: `${origin}/api/skipcash/webhook`,
    });
    const next: Order = {
      ...order,
      skipcashId: payment.id,
      payUrl: payment.payUrl,
    };
    await updateOwned(userId, next);
    return { order: next, mode: "skipcash", payUrl: payment.payUrl };
  } catch (err) {
    const warning = err instanceof Error ? err.message : "SkipCash could not start this payment";
    return { order, mode: "hosted", payUrl: null, warning };
  }
}

export async function listOrdersForUser(userId: string) {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, user_id, payload, status, pay, skipcash_id
    from store_orders
    where user_id = ${userId}
    order by created_at desc
  `;
  return rows.map(fromRow);
}

export async function getOrderForUser(userId: string, id: string) {
  return loadOwned(userId, id);
}

export async function listOrdersForAdmin(userId: string) {
  await assertAdmin(userId);
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, user_id, payload, status, pay, skipcash_id
    from store_orders
    order by created_at desc
  `;
  return rows.map(fromRow);
}

async function applyStatus(userId: string, order: Order, status: OrderStatus, skipcashId?: string) {
  if (order.status === "paid") return order;
  const next: Order = {
    ...order,
    status,
    skipcashId: skipcashId || order.skipcashId,
  };
  await updateOwned(userId, next);
  return next;
}

export async function settleSkipCashForUser(
  userId: string,
  orderId: string,
  paymentId?: string,
): Promise<Order> {
  const order = await loadOwned(userId, orderId);
  if (!order) throw new Error("Order not found");
  if (order.pay !== "skipcash") return order;
  if (order.status === "paid") return order;

  const id = paymentId || order.skipcashId;
  if (!id) return order;

  const payment = await getSkipCashPayment(id);
  if (!payment) return order;
  const mapped = statusFromSkipCash(payment.statusId);
  if (mapped === "pending") return { ...order, skipcashId: payment.id, payUrl: payment.payUrl || order.payUrl };
  return applyStatus(userId, order, mapped, payment.id);
}

export async function confirmHostedPayForUser(userId: string, orderId: string): Promise<Order> {
  const order = await loadOwned(userId, orderId);
  if (!order) throw new Error("Order not found");
  if (order.pay !== "skipcash") throw new Error("This order is not a SkipCash payment");
  if (order.skipcashId) throw new Error("Complete this payment on SkipCash");
  if (order.status === "paid") return order;
  if (order.status !== "pending") throw new Error("This order can no longer be paid");
  return applyStatus(userId, order, "paid");
}

export async function applySkipCashWebhook(raw: Record<string, unknown>, authorization: string) {
  const nested =
    raw.resultObj && typeof raw.resultObj === "object" ? { ...raw, ...(raw.resultObj as Record<string, unknown>) } : raw;
  if (!verifySkipCashWebhook(nested, authorization)) return false;
  const event = parseSkipCashWebhook(nested);
  if (!event.paymentId && !event.transactionId) return false;
  const mapped = statusFromSkipCash(event.statusId);
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, user_id, payload, status, pay, skipcash_id
    from store_orders
    where (${event.paymentId || null}::text is not null and skipcash_id = ${event.paymentId || null})
       or (${event.transactionId || null}::text is not null and id = ${event.transactionId || null})
    limit 1
  `;
  if (!rows[0]) return true;
  const order = fromRow(rows[0]);
  if (order.status === "paid") return true;
  if (mapped === "pending") {
    if (event.paymentId && !order.skipcashId) {
      const next = { ...order, skipcashId: event.paymentId };
      await sql`
        update store_orders
        set payload = ${JSON.stringify(next)}, skipcash_id = ${event.paymentId}
        where id = ${order.id}
      `;
    }
    return true;
  }
  const next: Order = {
    ...order,
    status: mapped,
    skipcashId: event.paymentId || order.skipcashId,
  };
  await sql`
    update store_orders
    set payload = ${JSON.stringify(next)},
        status = ${next.status},
        skipcash_id = coalesce(${next.skipcashId ?? null}, skipcash_id)
    where id = ${order.id}
  `;
  return true;
}
