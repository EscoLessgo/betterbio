import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['three'], // CRITICAL: Forces a single instance of Three.js across all libraries
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist',
    minify: false, // Disabled to resolve Three.js 'bt is undefined' errors caused by mangling
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
