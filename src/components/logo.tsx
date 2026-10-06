import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
  invert = false,
}: {
  className?: string;
  to?: string;
  invert?: boolean;
  compact?: boolean;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-center", className)} aria-label="11-11">
      <img
        src={invert ? "/media/white-logo.png" : "/media/logo.png"}
        alt="11-11"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}