import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (from default 500KB)
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional, comment out for smaller builds)
    // sourcemap: true,
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  // Server configuration
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: true, // Auto-open browser
    cors: true,
  },
  // Preview server configuration
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: true,
  },
})
