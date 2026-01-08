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
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: false, // Continue to disable mangling for maximum stability
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
