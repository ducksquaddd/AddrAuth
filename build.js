import esbuild from "esbuild";

const baseConfig = {
  entryPoints: ["src/index.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["node14"],
  external: ["crypto", "buffer", "jsonwebtoken"], // Add 'buffer' and 'jsonwebtoken' here
  platform: "node", // Set this for both builds
};

// Build ESM version
esbuild
  .build({
    ...baseConfig,
    format: "esm",
    outfile: "dist/index.esm.js",
  })
  .catch((error) => {
    console.error("ESM build failed:", error);
    process.exit(1);
  });

// Build CJS version
esbuild
  .build({
    ...baseConfig,
    format: "cjs",
    outfile: "dist/index.cjs.js",
  })
  .catch((error) => {
    console.error("CJS build failed:", error);
    process.exit(1);
  });
