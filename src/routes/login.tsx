import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } from "@/lib/admin";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";

function safeNext(raw: unknown) {
  if (typeof raw !== "string") return "";
  const next = raw.trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "";
  if (next.includes("://") || next.includes("\\")) return "";
  return next.slice(0, 200);
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => {
    const next = safeNext(s.next);
    return next ? { next } : {};
  },
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const [mode, setMode] = useState<"in" | "up">("in");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);

  function dest(nextEmail: string) {
    if (next) return next;
    return isAdmin(nextEmail) ? "/admin" : "/";
  }

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const nextEmail = String(fd.get("email") || "").trim();
    const nextPassword = String(fd.get("password") || "");
    const name = String(fd.get("name") || ADMIN_NAME);
    const callbackURL = dest(nextEmail);
    try {
      if (mode === "up") {
        const r = await authClient.signUp.email({
          email: nextEmail,
          password: nextPassword,
          name,
          callbackURL,
        });
        if (r.error) throw new Error(r.error.message);
      } else {
        const r = await authClient.signIn.email({
          email: nextEmail,
          password: nextPassword,
          callbackURL,
        });
        if (r.error) {
          if (isAdmin(nextEmail) && nextPassword === ADMIN_PASSWORD) {
            const created = await authClient.signUp.email({
              email: nextEmail,
              password: nextPassword,
              name: ADMIN_NAME,
              callbackURL,
            });
            if (created.error && !alreadyExists(created.error.message ?? "")) {
              throw new Error(created.error.message ?? "Could not sign in");
            }
            const again = await authClient.signIn.email({
              email: nextEmail,
              password: nextPassword,
              callbackURL,
            });
            if (again.error) throw new Error(again.error.message);
          } else {
            throw new Error(r.error.message);
          }
        }
      }
      window.location.href = callbackURL;
    } catch (ex) {
      setBusy(false);
      setErr(ex instanceof Error ? ex.message : "Could not sign in");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-16" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="panel w-full max-w-md p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 text-center font-display text-3xl font-medium text-wine">
          {mode === "in" ? t.login : t.create}
        </h1>
        <p className="mt-2 text-center text-xs text-muted">
          Admin · {ADMIN_EMAIL} · {ADMIN_PASSWORD}
        </p>
        {authEnabled ? (
          <div className="mt-6 space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: next || "/" })}
                className="h-11 w-full rounded-md border border-line text-sm font-medium hover:bg-cream"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Sign-in is disabled.</p>
        )}
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
        <form onSubmit={onEmail} className="grid gap-3">
          {mode === "up" ? (
            <input name="name" placeholder={t.name} defaultValue={ADMIN_NAME} className="field" />
          ) : null}
          <input
            required
            name="email"
            type="text"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            className="field"
          />
          <input
            required
            name="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            className="field"
          />
          {err ? <p className="text-sm text-wine">{err}</p> : null}
          <Button type="submit" disabled={busy}>
            {mode === "in" ? t.login : t.create}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-muted"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? t.create : t.login}
        </button>
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-wine">
            {t.continue}
          </Link>
        </p>
      </div>
    </main>
  );
}

function isAdmin(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

function alreadyExists(message: string) {
  const s = message.toLowerCase();
  return s.includes("already") || s.includes("exists") || s.includes("registered");
}
