import { Minus, Plus } from "lucide-react";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex h-11 items-center rounded-md border border-line bg-card">
      <button
        type="button"
        className="grid size-11 place-items-center text-wine"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        className="grid size-11 place-items-center text-wine"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
