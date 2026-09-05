import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "RideLink",
        short_name: "RideLink",
        description: "Smart Shared Auto Platform",
        theme_color: "#16a34a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/desktop-screenshot.png",
            sizes: "2938x1666",
            type: "image/png",
            form_factor: "wide",
            label: "RideLink Desktop Dashboard",
          },
          {
            src: "/mobile-screenshot.png",
            sizes: "682x1498",
            type: "image/png",
            form_factor: "narrow",
            label: "RideLink Mobile Dashboard",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target:
          "http://127.0.0.1:7001" ||
          "https://ridelink-backend-g0pb.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
