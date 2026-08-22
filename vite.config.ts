import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { VitePWA } from "vite-plugin-pwa";

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    manifest: {
      name: "The Cognitarium Hub",
      short_name: "Cognitarium Hub",
      description: "The Cognitarium Hub is an adaptive JEE and Board preparation platform with mastery tracking, focused practice, AI coaching, and spaced revision.",
      theme_color: "#7b463c",
      background_color: "#fdfbf7",
      display: "standalone",
      scope: "/",
      start_url: "/",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/manus-storage/cognitarium-hub-logo_2e4f180f.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/manus-storage/cognitarium-hub-logo_2e4f180f.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/manus-storage/cognitarium-hub-logo_2e4f180f.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "maskable",
        },
        {
          src: "/manus-storage/cognitarium-hub-logo_2e4f180f.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
      categories: ["education", "productivity"],
      screenshots: [
        {
          src: "/screenshot-1.png",
          sizes: "540x720",
          type: "image/png",
          form_factor: "narrow",
        },
        {
          src: "/screenshot-2.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}"],
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.manus\.im\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
