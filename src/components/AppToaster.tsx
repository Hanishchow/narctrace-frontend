import { Toaster } from "sonner";
import { useTheme } from "../lib/theme";

export function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
