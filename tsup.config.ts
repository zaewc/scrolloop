import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ["react", "react-dom"],
  noExternal: ["@scrolloop/core", "@scrolloop/shared"],
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".cjs",
    };
  },
});
