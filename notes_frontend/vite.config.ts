import { defineConfig } from 'vite';

// Vite builder is used internally by Angular CLI v19. We provide a local cache and
// stable optimizeDeps to avoid re-optimization loops during hot reloads.
export default defineConfig({
  cacheDir: '.vite-cache',
  optimizeDeps: {
    // Keep dependency list stable to minimize re-optimizations on lockfile changes.
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/platform-browser',
      '@angular/router',
      'rxjs'
    ]
  },
  server: {
    // Ensure consistent host/port (Angular dev-server proxies through Vite under the hood).
    host: '0.0.0.0',
    port: 3000,
    // Avoid frequent restarts by debouncing file change events
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 50
      }
    }
  },
  // Quietly keep dependency pre-bundling stable
  logLevel: 'info',
});
