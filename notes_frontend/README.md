# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Development server

Use a single CSR dev server to avoid SSR/CSR conflicts:

```bash
npm run preview
# or
npm start
```

For a more stable startup in CI or ephemeral preview environments (pre-warm dependency optimization), use:

```bash
npm run start:stable
```

This starts on http://localhost:3000 (binds to 0.0.0.0). The app auto-reloads on changes.

Readiness/healthcheck:
- Once the dev server is ready, a static healthcheck is available at: http://localhost:3000/healthz.txt (returns "ok").
- Angular CLI dev server logs are started with verbose output to ensure readiness lines are printed.

## CI notes

- Watchers and tests are disabled by default in CI scripts:
  - `npm run ci:prepare`
  - `npm run ci:build`
  - `npm run ci:serve` (uses start:stable to avoid re-optimization loops)
- Ensure a stable lockfile is present to avoid Vite re-optimization loops.
- Do not run SSR (`serve:ssr:angular`) concurrently with the CSR dev server.

## Building

```bash
npm run build
```

Artifacts are output to `dist/`.

## Tests

```bash
CI=true npm test -- --watch=false
```

## Additional Resources

See the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
