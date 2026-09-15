import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold " +
    "transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 " +
    "min-h-[var(--tap-min)] px-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80",
        secondary: "border border-border bg-transparent text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        accent: "bg-accent-strong text-accent-strong-foreground hover:opacity-90 active:opacity-80",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      block: false,
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, block, className, ...rest }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, block }), className)} {...rest} />
    );
  },
);
Button.displayName = "Button";
