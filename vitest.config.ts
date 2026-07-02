import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Sem @vitejs/plugin-react: o transform padrão do Vitest (oxc no v4)
  // já compila TSX com runtime automático de JSX; o plugin causava
  // conflito de peer deps do Babel com o pacote shadcn.
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
