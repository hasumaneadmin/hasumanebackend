// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    nitro: {
      // Use Node.js HTTP server preset instead of Cloudflare Workers (default)
      // so the output can be run with: node dist/server/index.mjs
      preset: "node-server",
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/recharts")) return "charts";
            if (id.includes("node_modules/react") || id.includes("node_modules/@tanstack")) {
              return "framework";
            }
            if (id.includes("node_modules")) return "vendor";
          },
        },
      },
    },
    server: {
      allowedHosts: true,
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  },
});
