import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        /**
         * The lazy 3D bundle used to be one ~950KB chunk, so a patch bump to
         * any one package in it invalidated the whole thing in every visitor's
         * cache. `three` is by far the largest and most stable piece, so it
         * gets its own chunk; the rest (react-three/*, postprocessing, gsap)
         * stays together and still only loads behind the lazy `Cluster`
         * import.
         *
         * Only `three` is pulled out on purpose. Grouping react-three/* as
         * well made Rollup fold react-dom + Vite's preload-helper into that
         * chunk, which made the entry statically depend on it and
         * modulepreload the entire 3D stack on first paint. After any change
         * here, check that `dist/index.html` still has no `modulepreload` for
         * `three` and that the entry chunk stays ~156KB.
         */
        manualChunks(id) {
          if (id.includes("/node_modules/three/")) return "three";
        },
      },
    },
  },
});
