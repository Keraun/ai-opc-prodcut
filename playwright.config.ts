import { defineConfig } from "playwright"

export default defineConfig({
  use: {
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
})
