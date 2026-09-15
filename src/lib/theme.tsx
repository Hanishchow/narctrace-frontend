import { useEffect, type ReactNode } from "react";

// NarcTrace is dark-mode only — no light theme, no toggle.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <>{children}</>;
}
