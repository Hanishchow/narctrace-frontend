import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server MUST run on 5173 (port sync contract, PRD §3).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
