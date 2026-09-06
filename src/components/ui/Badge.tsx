import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-brand/10 text-brand border border-brand/20",
        easy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        medium: "bg-amber-50 text-amber-700 border border-amber-200",
        hard: "bg-red-50 text-red-700 border border-red-200",
        secondary: "bg-canvas-surface text-dsa-muted border border-dsa-border",
        outline: "border border-dsa-border text-dsa-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
