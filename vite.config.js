import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        dead_code: true,
        unused: true,
      },
      mangle: false, // NUCLEAR OPTION: Turn off mangling to stop variable renaming crashes
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
