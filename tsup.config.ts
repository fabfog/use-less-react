import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    classes: "src/classes/index.ts",
    client: "src/client/index.ts",
  },
  format: ["esm"], // solo ESM, più compatibile con Next
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  external: ["react"],
  esbuildOptions(options) {
    options.platform = "browser";
    options.define = {
      "process.env.NODE_ENV": '"production"',
    };
  },
});
