import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works when deployed at the FTP root.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
