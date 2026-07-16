import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Component tests render real components, which import through the "@/" alias tsconfig
    // defines for the app. Tests that only read source as text never needed it resolved.
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    // Node stays the default: most tests exercise pure functions or read source. The few that
    // render components opt into jsdom per-file with a `// @vitest-environment jsdom` docblock.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
