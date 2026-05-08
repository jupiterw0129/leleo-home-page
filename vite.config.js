import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'brotli', ext: '.br', threshold: 1024, deleteOriginFile: false }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024, deleteOriginFile: false }),
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        return deps.filter(dep => !dep.includes('vuetify') || dep.endsWith('.css'))
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue')) return 'vue'
          if (id.includes('node_modules/vuetify')) return 'vuetify'
          if (id.includes('node_modules/chart.js')) return 'chartjs'
          if (id.includes('node_modules/typeit')) return 'typeit'
          if (id.includes('node_modules')) return 'vendor'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames(assetInfo) {
          if (assetInfo.name?.endsWith('.css')) return 'css/[name]-[hash].css'
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name ?? '')) return 'img/[name]-[hash][extname]'
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name ?? '')) return 'fonts/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
})
