import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WhatsAppBubble',
      formats: ['iife'],
      fileName: () => 'whatsapp-bubble.iife.js'
    },
    rollupOptions: {
      output: {
        // Ensure all code is bundled into a single file
        inlineDynamicImports: true,
      }
    },
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
      }
    }
  }
});
