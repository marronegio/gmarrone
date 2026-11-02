import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works when deployed at the FTP root.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        painel: fileURLToPath(new URL("painel/index.html", import.meta.url)),
        proposta: fileURLToPath(new URL("proposta/index.html", import.meta.url)),
      },
    },
  },
});
