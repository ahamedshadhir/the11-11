import { useEffect, useState } from "react";
import { COPY } from "@/lib/i18n";
import { useStore } from "@/lib/store";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ endsAt }: { endsAt: number }) {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang];
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? 0 : Math.max(0, endsAt - now);
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const pending = now === null;

  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-2 text-wine" aria-live="polite">
      {d > 0 ? (
        <>
          <Unit n={pending ? "--" : String(d)} label={t.days} />
          <Colon />
        </>
      ) : null}
      <Unit n={pending ? "--" : pad(h)} label={t.hours} />
      <Colon />
      <Unit n={pending ? "--" : pad(m)} label={t.minutes} />
      <Colon />
      <Unit n={pending ? "--" : pad(s)} label={t.seconds} />
    </div>
  );
}

function Colon() {
  return <span className="mb-4 font-display text-2xl leading-none text-gold">:</span>;
}

function Unit({ n, label }: { n: string; label: string }) {
  return (
    <div className="min-w-12">
      <span className="block font-display text-4xl leading-none tabular-nums">{n}</span>
      <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted">{label}</span>
    </div>
  );
}
