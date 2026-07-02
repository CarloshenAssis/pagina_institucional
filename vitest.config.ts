import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Sem @vitejs/plugin-react: o esbuild do Vitest já transforma TSX
  // (runtime automático de JSX via tsconfig); o plugin causava conflito
  // de peer deps do Babel com o pacote shadcn.
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
