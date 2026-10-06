import { useEffect, type ReactNode } from "react";
import { reloadStorefront } from "@/lib/storefront";

export function StorefrontProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void reloadStorefront();
  }, []);
  return children;
}
