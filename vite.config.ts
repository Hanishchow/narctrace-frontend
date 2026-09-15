import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server MUST run on 5173 (port sync contract, PRD §3).
// The production build is served from a GitHub Pages *project* site at
// /narctrace-frontend/, so assets must resolve under that base. Dev stays at "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/narctrace-frontend/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
}));
