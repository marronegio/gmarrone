import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const PANEL_PAGE = "painel/index.html";

// The repo is public, so the panel's production URL comes from PAINEL_SLUG and never
// lives in the source. Without a slug the page stays out of the build altogether.
function hidePanel(slug) {
  return {
    name: "hide-panel",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const page = bundle[PANEL_PAGE];
      delete bundle[PANEL_PAGE];
      if (slug) this.emitFile({ type: "asset", fileName: `${slug}/index.html`, source: page.source });
      else this.warn("PAINEL_SLUG is not set: the panel page was left out of this build.");
    },
  };
}

// Relative base so the build works when deployed at the FTP root.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), hidePanel(loadEnv(mode, process.cwd(), "").PAINEL_SLUG)],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        painel: fileURLToPath(new URL(PANEL_PAGE, import.meta.url)),
        proposta: fileURLToPath(new URL("proposta/index.html", import.meta.url)),
      },
    },
  },
}));
