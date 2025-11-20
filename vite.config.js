import { defineConfig } from "vite";

export default defineConfig({
    base: "/github-game-off-2025/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1600,
    },
});
