/**
 * Cloudflare Forge Configuration for Howest Resto
 * Generates client SDKs and OpenAPI documentation directly from docs/openapi.yaml.
 */

export default {
  // Source OpenAPI 3.0.3 specification
  spec: "./docs/openapi.yaml",

  // Generation output targets
  targets: [
    {
      type: "sdk",
      language: "python",
      outDir: "./packages/howest-resto-py",
      options: {
        packageName: "howest_resto",
        repository: "https://github.com/MauroDruwel/howest-resto-py",
      },
    },
    {
      type: "sdk",
      language: "typescript",
      outDir: "./packages/howest-resto-ts",
      options: {
        packageName: "@maurodruwel/howest-resto",
        repository: "https://github.com/MauroDruwel/howest-resto-ts",
      },
    },
  ],
};
