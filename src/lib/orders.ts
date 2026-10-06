import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { normalizeOrder, type Order, type PayMethod } from "@/lib/store";

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

export const checkoutOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: CheckoutInput) => input)
  .handler(async ({ context, data }) => {
    const { checkoutOrderForUser } = await import("./order-persist.server");
    return checkoutOrderForUser(context.userId, data);
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listOrdersForUser } = await import("./order-persist.server");
    return listOrdersForUser(context.userId);
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    const { getOrderForUser } = await import("./order-persist.server");
    const order = await getOrderForUser(context.userId, data);
    return order ? normalizeOrder(order) : null;
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listOrdersForAdmin } = await import("./order-persist.server");
    return listOrdersForAdmin(context.userId);
  });

export const settleSkipCash = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: string; paymentId?: string }) => input)
  .handler(async ({ context, data }) => {
    const { settleSkipCashForUser } = await import("./order-persist.server");
    return settleSkipCashForUser(context.userId, data.orderId, data.paymentId);
  });

export const confirmHostedPay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((orderId: string) => orderId)
  .handler(async ({ context, data }) => {
    const { confirmHostedPayForUser } = await import("./order-persist.server");
    return confirmHostedPayForUser(context.userId, data);
  });
