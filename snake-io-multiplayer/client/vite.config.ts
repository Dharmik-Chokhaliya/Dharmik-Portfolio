import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/snake-io-multiplayer/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Snake.io Multiplayer',
        short_name: 'Snake.io',
        description: 'Multiplayer snake game - eat, grow, survive!',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },

});
