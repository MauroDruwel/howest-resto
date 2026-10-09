/**
 * Cloudflare Forge Configuration
 * Generates client SDKs and OpenAPI endpoints for Howest Resto API
 */

export default {
  // Source OpenAPI specification
  spec: "./docs/openapi.yaml",

  // Output targets
  targets: [
    {
      type: "sdk",
      language: "typescript",
      outDir: "./packages/sdk-ts",
      options: {
        packageName: "@maurodruwel/howest-resto-api",
      },
    },
    {
      type: "sdk",
      language: "python",
      outDir: "./packages/sdk-py",
      options: {
        packageName: "howest_resto_api",
      },
    },
  ],
};
