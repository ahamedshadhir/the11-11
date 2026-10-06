import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] min-h-11 px-4",
  {
    variants: {
      variant: {
        primary: "bg-wine text-cream hover:bg-ink",
        gold: "bg-gold text-wine hover:brightness-95",
        outline: "border border-wine text-wine bg-transparent hover:bg-wine hover:text-cream",
        ghost: "text-wine hover:bg-line",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  className,
  variant,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
