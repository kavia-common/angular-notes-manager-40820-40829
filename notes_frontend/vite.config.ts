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
    // Avoid frequent restarts by debouncing file change events
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 50
      }
    }
  },
});
