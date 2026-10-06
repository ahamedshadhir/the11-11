import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isAdminEmail } from "@/lib/admin";
import { AdminShell, type AdminTab } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { adminAccess } from "@/lib/storefront";
import { useStore } from "@/lib/store";

export function useAdminAccess() {
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<"pending" | "yes" | "no">("pending");

  useEffect(() => {
    if (isPending || !user) return;
    if (isAdminEmail(user.primaryEmail)) {
      setGate("yes");
      return;
    }
    let cancelled = false;
    void adminAccess()
      .then((access) => {
        if (!cancelled) setGate(access.ok ? "yes" : "no");
      })
      .catch(() => {
        if (!cancelled) setGate("no");
      });
    return () => {
      cancelled = true;
    };
  }, [user, isPending]);

  const allowed = Boolean(user && (isAdminEmail(user.primaryEmail) || gate === "yes"));
  const checking = isPending || Boolean(user && gate === "pending" && !isAdminEmail(user.primaryEmail));
  return { user, allowed, checking };
}

export function AdminFrame({ tab, children }: { tab: AdminTab; children: ReactNode }) {
  const { user, allowed, checking } = useAdminAccess();
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];

  if (checking) {
    return (
      <AdminShell tab={tab}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="panel h-28 animate-pulse bg-line/40" />
          ))}
        </div>
      </AdminShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!allowed) {
    return (
      <AdminShell tab={tab} userLabel={user.primaryEmail ?? undefined}>
        <div className="mx-auto max-w-lg py-16">
          <p className="kicker">{t.console}</p>
          <h1 className="page-title mt-3 text-[clamp(1.75rem,1.2rem+1vw,2.25rem)]">{t.admin}</h1>
          <p className="mt-4 text-muted">{t.notAdmin}</p>
          <p className="mt-2 text-sm text-muted">
            {user.primaryEmail} · admin@1111.local
          </p>
          <Button asChild className="mt-6">
            <Link to="/login">{t.login}</Link>
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell tab={tab} userLabel={user.displayName ?? user.primaryEmail ?? undefined}>
      {children}
    </AdminShell>
  );
}
