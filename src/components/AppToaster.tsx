import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
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
