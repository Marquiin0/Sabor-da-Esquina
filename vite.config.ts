import { resolve } from 'path';
import type { UserConfig } from 'vite';

export default {
  base: '/Landing-Page/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssMinify: 'lightningcss',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        product: resolve(__dirname, 'product.html'),
        payment: resolve(__dirname, 'payment.html'),
        confirmation: resolve(__dirname, 'confirmation.html'),
        tracking: resolve(__dirname, 'tracking.html'),
        account: resolve(__dirname, 'account.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
    reportCompressedSize: true,
  },
  server: {
    open: true,
  },
  css: {
    transformer: 'lightningcss',
  },
} satisfies UserConfig;
