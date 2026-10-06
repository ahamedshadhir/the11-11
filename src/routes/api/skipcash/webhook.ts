import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/skipcash/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const authorization = request.headers.get("authorization") ?? "";
        const { applySkipCashWebhook } = await import("@/lib/order-persist.server");
        const ok = await applySkipCashWebhook(raw, authorization);
        return Response.json({ ok }, { status: ok ? 200 : 401 });
      },
      GET: async () => Response.json({ ok: true }),
    },
  },
});
