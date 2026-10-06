import { Star } from "lucide-react";

export function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-gold">
      <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className="size-3.5"
            fill={i < rounded ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs text-muted">
        {value.toFixed(1)}
        {typeof count === "number" ? ` · ${count}` : null}
      </span>
    </span>
  );
}
