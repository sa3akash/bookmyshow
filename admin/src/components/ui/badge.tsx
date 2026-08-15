import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-xs font-bold",
        secondary: "border-transparent bg-secondary text-secondary-foreground font-semibold",
        destructive: "border-transparent bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold",
        outline: "text-foreground border-border/80 bg-background/50 font-semibold",
        success: "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold",
        warning: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold",
        info: "border-transparent bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
