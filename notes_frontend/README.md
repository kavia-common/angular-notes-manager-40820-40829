# Angular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Development server

Use a single CSR dev server to avoid SSR/CSR conflicts:

```bash
npm run preview
# or
npm start
```

This starts on http://localhost:3000. The app auto-reloads on changes.

## CI notes

- Watchers and tests are disabled by default in CI scripts:
  - `npm run ci:prepare`
  - `npm run ci:build`
  - `npm run ci:serve`
- Ensure a stable lockfile is present to avoid Vite re-optimization loops.

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
