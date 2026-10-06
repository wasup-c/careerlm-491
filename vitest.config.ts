import {
  fileURLToPath,
} from "node:url";

import {
  defineConfig,
} from "vitest/config";

const isCi =
  process.env.CI === "true";

const isGitHubActions =
  process.env.GITHUB_ACTIONS ===
  "true";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL(
          "./src",
          import.meta.url
        )
      ),
    },
  },

  test: {
    environment:
      "jsdom",

    setupFiles: [
      "./vitest.setup.ts",
    ],

    reporters:
      isGitHubActions
        ? [
            "default",

            [
              "junit",
              {
                outputFile:
                  "./test-results/junit.xml",

                suiteName:
                  "CareerLM automated tests",
              },
            ],

            "github-actions",
          ]
        : isCi
          ? [
              "default",

              [
                "junit",
                {
                  outputFile:
                    "./test-results/junit.xml",

                  suiteName:
                    "CareerLM automated tests",
                },
              ],
            ]
          : [
              "default",
            ],

    coverage: {
      provider:
        "v8",

      reportsDirectory:
        "./coverage",

      reporter: [
        "text",
        "html",
        "json-summary",
      ],

      include: [
        "src/**/*.{ts,tsx}",
      ],

      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/**/*.d.ts",
      ],
    },
  },
});