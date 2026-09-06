import { cn } from "@/lib/utils";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "inset" | "flat";
}

export function Surface({ className, variant = "default", ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        variant === "default" && "bg-white border border-dsa-border/70 shadow-card",
        variant === "raised" && "bg-white shadow-soft border border-white/80",
        variant === "inset" && "bg-canvas-surface shadow-inset border border-dsa-border/40",
        variant === "flat" && "bg-canvas-surface border border-dsa-border/60",
        className
      )}
      {...props}
    />
  );
}
