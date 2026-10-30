import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vinext()],
  optimizeDeps: {
    // lucide-react is imported from both server and client components, so the
    // RSC plugin sees it in two dependency graphs and warns that it is
    // "inconsistently optimized". Excluding it keeps one module instance per
    // graph and keeps the dev log clean; measured cold-compile time is the same.
    exclude: ["lucide-react"],
  },
});
