import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { loadStorefront } from "@/lib/storefront.server";

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const store = await loadStorefront();
        return Response.json({
          currency: "QAR",
          categories: CATEGORIES,
          products: store.products.length ? store.products : PRODUCTS,
        });
      },
    },
  },
});
