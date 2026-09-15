import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block = false,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = ["btn", `btn--${variant}`, block ? "btn--block" : "", className]
    .filter(Boolean)
    .join(" ");
  return <button className={cls} {...rest} />;
}
